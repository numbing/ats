import { useAuthStore } from '~~/stores/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  const publicRoutes = new Set(['/login', '/register'])
  if (publicRoutes.has(to.path)) return

  const auth = useAuthStore()
  if (!auth.user) {
    try { await auth.fetchMe() } catch {}
  }
  if (!auth.user) return navigateTo('/login')
})
