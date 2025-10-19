// nuxt.config.ts
import { defineNuxtConfig } from 'nuxt/config'

declare const process: any

export default defineNuxtConfig({
  modules: ['@pinia/nuxt', 'vuetify-nuxt-module'],
  css: ['vuetify/styles', '@mdi/font/css/materialdesignicons.css'],
  typescript: { strict: true },

  runtimeConfig: {
    // server only
    mongoUri: process.env.MONGO_URI || '',
    jwtSecret: process.env.JWT_SECRET || '',
    // public is exposed to client if needed
    public: {}
  }
})
