<!-- app/pages/index.vue -->
<template>
  <v-container class="py-12 text-center">
    <h1 class="text-h4 mb-4">Welcome to ATS</h1>

    <p class="text-body-1 mb-8">
      This is your home page — built with
      <strong>Nuxt 4 + Vuetify 3 + Pinia + MongoDB</strong>.
    </p>

    <div class="d-flex justify-center gap-4">
      <v-btn
        color="primary"
        component="NuxtLink"
        to="/login"
      >
        Login
      </v-btn>

      <v-btn
        color="secondary"
        component="NuxtLink"
        to="/register"
      >
        Register
      </v-btn>
    </div>
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Home'
})
</script>
