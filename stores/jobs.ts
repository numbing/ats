import { defineStore } from 'pinia'

export interface Job {
  _id: string
  company: string
  notes?: string
  appliedAt: string | Date
  number: number
  createdAt?: string
  updatedAt?: string
}

export const useJobsStore = defineStore('jobs', {
  state: () => ({
    items: [] as Job[],
    loading: false as boolean,
    error: '' as string
  }),

  actions: {
    async fetchAll() {
      this.loading = true
      try {
        const { jobs } = await $fetch<{ jobs: Job[] }>('/api/jobs')
        this.items = jobs
        this.error = ''
      } catch (e: any) {
        this.error = e?.data?.message || 'Failed to load jobs'
      } finally {
        this.loading = false
      }
    },

    async create(payload: { company: string; notes?: string }) {
      const { job } = await $fetch<{ job: Job }>('/api/jobs', {
        method: 'POST',
        body: payload
      })
      this.items.unshift(job)
    },

    async update(id: string, patch: Partial<Pick<Job, 'company' | 'notes' | 'appliedAt'>>) {
      const { job } = await $fetch<{ job: Job }>(`/api/jobs/${id}`, {
        method: 'PATCH',
        body: patch
      })
      const i = this.items.findIndex(j => j._id === id)
      if (i !== -1) this.items[i] = job
    },

    async remove(id: string) {
      await $fetch(`/api/jobs/${id}`, { method: 'DELETE' })
      this.items = this.items.filter(j => j._id !== id)
    }
  }
})
