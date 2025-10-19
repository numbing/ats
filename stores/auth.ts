import { defineStore } from 'pinia'

type User = { _id: string; email: string; name?: string } | null

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User,
    loading: false as boolean,
    error: '' as string
  }),
  getters: {
    isAuthenticated: (s) => !!s.user
  },
  actions: {
    async fetchMe() {
      this.loading = true
      try {
        const { user } = await $fetch('/api/auth/me')
        this.user = user
        this.error = ''
      } catch (e: any) {
        this.error = e?.data?.message || 'Failed to fetch session'
        this.user = null
      } finally {
        this.loading = false
      }
    },
    async register(payload: { email: string; password: string; name?: string }) {
      this.loading = true
      try {
        const { user } = await $fetch('/api/auth/register', { method: 'POST', body: payload })
        this.user = user
        this.error = ''
      } catch (e: any) {
        this.error = e?.data?.message || 'Registration failed'
        this.user = null
      } finally {
        this.loading = false
      }
    },
    async login(payload: { email: string; password: string }) {
      this.loading = true
      try {
        const { user } = await $fetch('/api/auth/login', { method: 'POST', body: payload })
        this.user = user
        this.error = ''
      } catch (e: any) {
        this.error = e?.data?.message || 'Login failed'
        this.user = null
      } finally {
        this.loading = false
      }
    },
    async logout() {
      await $fetch('/api/auth/logout', { method: 'POST' })
      this.user = null
    }
  }
})
