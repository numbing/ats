import { useAuthStore } from '~~/stores/auth'
export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore()
  if (!auth.user) await auth.fetchMe()
  if (!auth.isAuthenticated && to.path !== '/login' && to.path !== '/register') {
    return navigateTo('/login')
  }
})
