import { defineStore } from 'pinia'

type User = { _id: string; email: string; name?: string } | null

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User,
    loading: false,
    initialized: false,   // 👈 add this
    error: ''
  }),
  getters: {
    isAuthenticated: (s) => !!s.user
  },
  actions: {
    async fetchMe() {
      this.loading = true
      try {
        // On server render, forward the incoming request cookies to /api/auth/me
        const headers = process.server ? useRequestHeaders(['cookie']) : undefined
        const { user } = await $fetch<{ user: User }>('/api/auth/me', {
          headers,
          credentials: 'include' // needed on client so the cookie is sent
        })
        this.user = user
        this.error = ''
      } catch (e: any) {
        this.user = null
        this.error = e?.data?.message || 'Failed to fetch session'
      } finally {
        this.loading = false
                this.initialized = true     // 👈 mark ready whether success or not

      }
    },

    async register(payload: { email: string; password: string; name?: string }) {
      this.loading = true
      try {
        const { user } = await $fetch<{ user: User }>('/api/auth/register', {
          method: 'POST',
          body: payload,
          credentials: 'include'
        })
        this.user = user
        this.error = ''
      } catch (e: any) {
        this.user = null
        this.error = e?.data?.message || 'Registration failed'
      } finally {
        this.loading = false
      }
    },

    async login(payload: { email: string; password: string }) {
      this.loading = true
      try {
        const { user } = await $fetch<{ user: User }>('/api/auth/login', {
          method: 'POST',
          body: payload,
          credentials: 'include'
        })
        this.user = user
        this.error = ''
      } catch (e: any) {
        this.user = null
        this.error = e?.data?.message || 'Login failed'
      } finally {
        this.loading = false
      }
    },

    async logout() {
      try {
        await $fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
      } finally {
        this.user = null
      }
    }
  }
})
