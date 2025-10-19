/* eslint-disable no-console */
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const MONGO_URI = process.env.MONGO_URI
if (!MONGO_URI) {
  console.error('❌ MONGO_URI missing in .env')
  process.exit(1)
}

// --- Minimal Job schema (no number) ---
const JobSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    company: { type: String, required: true, trim: true },
    notes: { type: String, default: '' },
    appliedAt: { type: Date, required: true, default: () => new Date() }
  },
  { timestamps: true }
)
const Job = mongoose.models.Job || mongoose.model('Job', JobSchema)

// ---------- helpers ----------

const HEADERS = new Set([
  'companies',
  'company',
  'company name',
  'date',
  'dates',
  'status',
  'notes',
  'notes/feedback',
  'numbers',
  'number',
])

const STATUS = new Set([
  'no answer',
  'applied',
  'rejected',
  'interview',
  'follow up sent',
  'follow-up sent',
  'callback',
])

const isDigits = (s: string) => /^\d+$/.test(s)

// Allow: "Jul 11, 2025", "Jul 11 2025", "20.10.2025", "2025-10-20"
const MONTHS = '(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*'
const reMonthEn = new RegExp(`^${MONTHS}\\s+\\d{1,2}(,\\s*|\\s+)\\d{4}$`, 'i')
const reISO = /^\d{4}-\d{2}-\d{2}$/
const reDE = /^\d{1,2}\.\d{1,2}\.\d{4}$/

function isDateLike(s: string) {
  const t = s.trim()
  if (reMonthEn.test(t)) return true
  if (reISO.test(t)) return true
  if (reDE.test(t)) return true
  return false
}

function parseDate(s: string): Date | null {
  const t = s.trim()
  if (reDE.test(t)) {
    // DD.MM.YYYY -> Date
    const [dd, mm, yyyy] = t.split('.').map(Number)
    return new Date(yyyy, mm - 1, dd)
  }
  // Let JS parse the rest ("Jul 11, 2025", "Jul 11 2025", "2025-10-20")
  const d = new Date(t)
  return Number.isNaN(+d) ? null : d
}

function clean(s: string) {
  return s.replace(/\uFEFF/g, '').trim()
}

// Parse: any line that is NOT header/status/number/date is treated as company.
// Then we look forward for the next date; optional "status" line may appear;
// optional notes may follow.
function parseJobs(raw: string, debug = false) {
  const lines = raw.split('\n').map(x => clean(x)).filter(l => l.length > 0)
  const out: Array<{ company: string; appliedAt: Date; notes?: string }> = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const low = line.toLowerCase()

    if (HEADERS.has(low) || STATUS.has(low) || isDigits(line) || isDateLike(line)) continue

    const company = line

    // Find next date forward
    let j = i + 1
    let dateLine: string | null = null
    while (j < lines.length) {
      const l = lines[j]
      if (isDateLike(l)) { dateLine = l; break }
      j++
    }
    if (!dateLine) {
      if (debug) console.warn(`⚠️ No date found after company="${company}" — skipping`)
      continue
    }
    const dt = parseDate(dateLine)
    if (!dt) {
      if (debug) console.warn(`⚠️ Unparsable date "${dateLine}" for company="${company}" — skipping`)
      continue
    }

    // Optional status then optional notes
    let k = j + 1
    if (k < lines.length && STATUS.has(lines[k].toLowerCase())) k++
    let notes = ''
    if (
      k < lines.length &&
      !HEADERS.has(lines[k].toLowerCase()) &&
      !STATUS.has(lines[k].toLowerCase()) &&
      !isDigits(lines[k]) &&
      !isDateLike(lines[k])
    ) {
      notes = lines[k]
    }

    out.push({ company, appliedAt: dt, notes })
    // Advance i closer to where we got to (optional)
    i = j
  }

  if (debug) {
    console.log(`🧪 Debug: parsed ${out.length} entries. Sample:`)
    console.log(out.slice(0, 10))
  }
  return out
}

// ---------- main ----------

async function main() {
  const args = process.argv.slice(2)
  const fileIdx = args.indexOf('--file')
  const userIdx = args.indexOf('--user')
  const debug = args.includes('--debug')

  if (fileIdx === -1 || userIdx === -1) {
    console.error('Usage: ts-node scripts/import-jobs.ts --file "<path>" --user "<userId>" [--debug]')
    process.exit(1)
  }

  const filePath = args[fileIdx + 1]
  const userId = args[userIdx + 1]
  if (!filePath || !userId) {
    console.error('Missing --file or --user.')
    process.exit(1)
  }

  const full = path.resolve(process.cwd(), filePath)
  const raw = await fs.readFile(full, 'utf8')

  const entries = parseJobs(raw, debug)
  if (!entries.length) {
    console.error('❌ No entries parsed — check file formatting.')
    // Print a tiny preview to help you inspect
    const preview = raw.split('\n').slice(0, 50).map((l, i) => `${(i+1).toString().padStart(3)}: ${l}`).join('\n')
    console.error('First 50 lines:\n' + preview)
    process.exit(1)
  }

  await mongoose.connect(MONGO_URI)
  console.log('✅ Connected to MongoDB')

  const ops = entries.map(e => ({
    updateOne: {
      filter: { userId, company: e.company, appliedAt: e.appliedAt },
      update: { $setOnInsert: { userId, company: e.company, appliedAt: e.appliedAt }, $set: { notes: e.notes || '' } },
      upsert: true
    }
  }))

  const res = await Job.bulkWrite(ops, { ordered: false })
  // Nice summary
  const upserts = (res.upsertedCount ?? 0)
  const matched = (res.matchedCount ?? 0)
  const modified = (res.modifiedCount ?? 0)
  console.log(`🎯 Summary: added ${upserts} new, updated ${modified}, matched ${matched} existing.`)

  await mongoose.disconnect()
  console.log('🔌 Disconnected')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
