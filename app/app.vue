<!-- app.vue -->
<template>
  <v-app>
    <v-app-bar flat>
      <v-app-bar-title class="cursor-pointer" @click="$router.push('/')">ATS</v-app-bar-title>

      <v-spacer />

      <!-- main nav -->
      <v-btn variant="text" to="/">Home</v-btn>
            <v-btn variant="text" component="NuxtLink" to="/tracker">Tracker</v-btn>

      <v-btn variant="text" href="https://nuxt.com" target="_blank" rel="noopener">Nuxt</v-btn>

      <v-divider class="mx-2" vertical />

      <!-- theme toggle -->
      <v-btn icon @click="toggleTheme" :aria-label="`Switch to ${isDark ? 'light' : 'dark'} mode`">
        <v-icon>mdi-theme-light-dark</v-icon>
      </v-btn>

      <!-- auth actions -->
      <template v-if="auth.isAuthenticated">
        <v-chip class="mx-2" variant="tonal" label>
          <v-icon start>mdi-account</v-icon>
          {{ auth.user?.name || auth.user?.email }}
        </v-chip>
        <v-btn variant="text" @click="auth.logout()">Logout</v-btn>
      </template>
      <template v-else>
        <v-btn variant="text" to="/login">Login</v-btn>
        <v-btn variant="text" to="/register">Register</v-btn>
      </template>
    </v-app-bar>

    <NuxtLoadingIndicator />

    <v-main>
      <v-container class="py-8">
        <NuxtPage />
      </v-container>
    </v-main>

    <v-footer app class="text-medium-emphasis">
      <v-container>
        <small>© {{ year }} ATS - Built with Nuxt 4 + Vuetify 3</small>
      </v-container>
    </v-footer>
  </v-app>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from 'vuetify'
import { useAuthStore } from '~~/stores/auth'

const auth = useAuthStore()

const year = new Date().getFullYear()

// dark mode toggle
const theme = useTheme()
const isDark = computed(() => theme.global.current.value.dark === true)
function toggleTheme() {
  theme.global.name.value = isDark.value ? 'light' : 'dark'
}
</script>

<style scoped>
.cursor-pointer { cursor: pointer; }
</style>
