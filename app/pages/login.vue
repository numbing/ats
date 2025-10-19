<template>
  <v-container class="py-12">
    <v-row justify="center"><v-col cols="12" md="6" lg="4">
      <v-card class="pa-6" elevation="2">
        <v-card-title class="text-h5">Login</v-card-title>
        <v-form @submit.prevent="onSubmit">
          <v-text-field v-model="email" label="Email" type="email" required />
          <v-text-field v-model="password" label="Password" type="password" required />
          <v-btn :loading="auth.loading" type="submit" color="primary" block class="mt-4">Login</v-btn>
          <v-alert v-if="auth.error" type="error" class="mt-4" variant="tonal">{{ auth.error }}</v-alert>
          <div class="mt-4 text-center"><NuxtLink to="/register">No account? Register</NuxtLink></div>
        </v-form>
      </v-card>
    </v-col></v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '~~/stores/auth'
const auth = useAuthStore()
const email = ref(''); const password = ref('')
async function onSubmit() {
  await auth.login({ email: email.value, password: password.value })
  if (auth.isAuthenticated) navigateTo('/')
}
</script>
