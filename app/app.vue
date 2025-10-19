<!-- app.vue -->
<template>
  <v-app>
    <v-app-bar flat>
      <v-app-bar-title>ATS</v-app-bar-title>

      <v-spacer />

      <v-btn variant="text" to="/">Home</v-btn>
      <v-btn variant="text" to="/about">About</v-btn>
      <v-btn variant="text" href="https://nuxt.com" target="_blank" rel="noopener">Nuxt</v-btn>
    </v-app-bar>

    <v-main>
      <NuxtPage />
    </v-main>

    <v-footer app class="text-medium-emphasis">
      <v-container>
        <small>© {{ new Date().getFullYear() }} ATS — Built with Nuxt 4 + Vuetify 3</small>
      </v-container>
    </v-footer>
  </v-app>
</template>
