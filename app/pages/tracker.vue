<!-- pages/tracker.vue -->
<template>
  <v-container class="py-10">
    <div class="d-flex align-center justify-space-between mb-6">
      <h1 class="text-h5">My Applications</h1>
      <v-chip label variant="tonal">
        Total: <strong class="ml-1">{{ filteredItems.length }}</strong>
      </v-chip>
    </div>

    <!-- Add form -->
    <v-form @submit.prevent="onAdd" class="d-flex flex-wrap ga-3 mb-6">
      <v-text-field v-model="company" label="Company" required class="flex-grow-1" />
      <v-text-field v-model="notes" label="Notes (optional)" class="flex-grow-1" />
      <v-btn type="submit" color="primary" :loading="jobs.loading">Add</v-btn>
    </v-form>

    <!-- Tools -->
    <div class="d-flex flex-wrap ga-3 mb-4">
      <v-text-field
        v-model="query"
        label="Search company"
        prepend-inner-icon="mdi-magnify"
        hide-details
        density="comfortable"
        class="flex-grow-1"
        @keyup.enter="query = query.trim()"
      />
      <v-btn color="primary" variant="tonal" @click="query = query.trim()">
        Search
      </v-btn>
      <v-btn variant="text" :disabled="!query" @click="clearSearch">
        Clear
      </v-btn>
    </div>

    <!-- List -->
    <v-data-table
      :items="filteredItems"
      :headers="headers"
      item-key="_id"
      :loading="jobs.loading"
      density="comfortable"
      hover
    >
      <template #item._row="{ index }">
        <v-chip label variant="tonal">{{ index + 1 }}</v-chip>
      </template>

      <template #item.appliedAt="{ item }">
        <div v-if="editId === item._id" class="d-flex align-center">
          <v-menu v-model="dateMenu" :close-on-content-click="false">
            <template #activator="{ props }">
              <v-text-field
                v-bind="props"
                v-model="editDateDisplay"
                density="compact"
                hide-details
                readonly
                style="max-width: 160px"
              />
            </template>
            <v-date-picker v-model="editAppliedAt" @update:model-value="updateDateDisplay" />
          </v-menu>
        </div>
        <div v-else>{{ formatDate(item.appliedAt) }}</div>
      </template>

      <template #item.company="{ item }">
        <div v-if="editId === item._id">
          <v-text-field v-model="editCompany" density="compact" hide-details />
        </div>
        <div v-else>{{ item.company }}</div>
      </template>

      <template #item.notes="{ item }">
        <div v-if="editId === item._id">
          <v-text-field v-model="editNotes" density="compact" hide-details />
        </div>
        <div v-else class="text-medium-emphasis">{{ item.notes }}</div>
      </template>

      <template #item.actions="{ item }">
        <div v-if="editId === item._id" class="d-flex ga-1">
          <v-btn size="small" variant="tonal" color="primary" @click="saveEdit(item._id)">Save</v-btn>
          <v-btn size="small" variant="text" @click="cancelEdit">Cancel</v-btn>
        </div>
        <div v-else class="d-flex ga-1">
          <v-btn size="small" variant="text" @click="startEdit(item)">Edit</v-btn>
          <v-btn
            size="small"
            variant="text"
            color="error"
            icon="mdi-close"
            @click="confirmDelete(item)"
          />
        </div>
      </template>

      <template #no-data>
        <div class="text-medium-emphasis py-8 text-center w-100">
          {{ query ? 'No companies match your search' : 'No applications yet. Add your first one above.' }}
        </div>
      </template>
    </v-data-table>

    <v-alert v-if="jobs.error" type="error" variant="tonal" class="mt-4">
      {{ jobs.error }}
    </v-alert>

    <!-- Delete confirm dialog -->
    <v-dialog v-model="deleteDialog" max-width="420">
      <v-card>
        <v-card-title class="text-h6">Delete application</v-card-title>
        <v-card-text>
          Are you sure you want to delete
          <strong>{{ toDelete?.company }}</strong>?
          This cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" :disabled="deleteLoading" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn
            variant="tonal"
            color="error"
            :loading="deleteLoading"
            :disabled="deleteLoading"
            @click="doDelete"
          >
            <template v-if="!deleteLoading">Delete</template>
            <template v-else>
              <v-progress-circular indeterminate size="16" width="2" />
            </template>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :timeout="2000">
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useJobsStore } from '~~/stores/jobs'
import { useAuthStore } from '~~/stores/auth'

definePageMeta({ middleware: 'auth', title: 'Tracker' })

const jobs = useJobsStore()
const auth = useAuthStore()

// Table headers
const headers = [
  { title: '#', key: '_row', width: 80, sortable: false },
  { title: 'Company', key: 'company', minWidth: 240 },
  { title: 'Notes', key: 'notes', minWidth: 240 },
  { title: 'Applied', key: 'appliedAt', width: 160 },
  { title: 'Actions', key: 'actions', width: 160, sortable: false }
]

// Add form
const company = ref('')
const notes = ref('')

// Edit state
const editId = ref<string | null>(null)
const editCompany = ref('')
const editNotes = ref('')
const dateMenu = ref(false)
const editAppliedAt = ref<Date | null>(null)
const editDateDisplay = ref('')

// Search (frontend-only)
const query = ref('')

// Delete confirm
const deleteDialog = ref(false)
const toDelete = ref<any | null>(null)
const deleteLoading = ref(false) // local loading state for delete button

// Snackbar
const snackbar = ref({ show: false, text: '' })

// Frontend-only filter by company and sort by newest
const filteredItems = computed(() => {
  const q = query.value.trim().toLowerCase()
  const base = jobs.items
  const filtered = q
    ? base.filter(j => j.company.toLowerCase().includes(q))
    : base
  const toTime = (d: string | Date) => new Date(d).getTime() || 0
  return [...filtered].sort((a, b) => toTime(b.appliedAt) - toTime(a.appliedAt))
})

function formatDate(d: string | Date) {
  const dt = new Date(d)
  return dt.toLocaleDateString('de-DE')
}

async function onAdd() {
  if (!company.value.trim()) return
  await jobs.create({ company: company.value.trim(), notes: notes.value.trim() })
  snackbar.value = { show: true, text: 'Application added' }
  company.value = ''
  notes.value = ''
}

function startEdit(item: any) {
  editId.value = item._id
  editCompany.value = item.company
  editNotes.value = item.notes || ''
  editAppliedAt.value = new Date(item.appliedAt)
  updateDateDisplay()
}

function cancelEdit() {
  editId.value = null
  editCompany.value = ''
  editNotes.value = ''
  editAppliedAt.value = null
  editDateDisplay.value = ''
}

function updateDateDisplay() {
  if (!editAppliedAt.value) {
    editDateDisplay.value = ''
    return
  }
  editDateDisplay.value = editAppliedAt.value.toLocaleDateString('de-DE')
}

async function saveEdit(id: string) {
  await jobs.update(id, {
    company: editCompany.value,
    notes: editNotes.value,
    appliedAt: editAppliedAt.value ?? undefined
  })
  snackbar.value = { show: true, text: 'Changes saved' }
  cancelEdit()
}

function confirmDelete(item: any) {
  toDelete.value = item
  deleteDialog.value = true
}

async function doDelete() {
  if (!toDelete.value || deleteLoading.value) return
  deleteLoading.value = true
  try {
    await jobs.remove(toDelete.value._id)
    snackbar.value = { show: true, text: 'Application deleted' }
    toDelete.value = null
    deleteDialog.value = false
  } catch (e) {
    snackbar.value = { show: true, text: 'Delete failed' }
  } finally {
    deleteLoading.value = false
  }
}

// Clear search
function clearSearch() {
  query.value = ''
}

onMounted(async () => {
  if (!auth.user && (auth as any).fetchMe) await (auth as any).fetchMe()
  await jobs.fetchAll()
})
</script>
