// nuxt.config.ts
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: ['@pinia/nuxt', 'vuetify-nuxt-module'],
  css: [
    'vuetify/styles',
    '@mdi/font/css/materialdesignicons.css'
  ],
  typescript: { strict: true },
  runtimeConfig: {
    mongoUri: process.env.MONGO_URI || '',
    jwtSecret: process.env.JWT_SECRET || '',
    public: {}
  },
  nitro: {
    compatibilityDate: '2025-10-19'
  }
})
