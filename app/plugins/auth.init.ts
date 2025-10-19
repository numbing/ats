// app/plugins/auth.init.ts
import { useAuthStore } from '~~/stores/auth'

export default defineNuxtPlugin(async () => {
  const auth = useAuthStore()
  if (!auth.initialized) {
    try { await auth.fetchMe() } catch {}
  }
})
