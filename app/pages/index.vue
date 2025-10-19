<!-- pages/index.vue -->
<template>
  <v-container class="py-12">
    <!-- Hero -->
    <v-sheet rounded="xl" class="pa-8 mb-8" variant="tonal">
      <div class="d-flex flex-column flex-md-row align-center justify-space-between gap-6">
        <div class="text-center text-md-left">
          <h1 class="text-h4 text-md-h3 mb-2">Track your job applications with ease</h1>
          <p class="text-body-1 text-medium-emphasis mb-4">
            Nuxt 4 + Vuetify 3 + Pinia + MongoDB. Clean UI, fast workflow, and a tracker you will actually use.
          </p>

          <div class="d-flex flex-wrap justify-center justify-md-start ga-3">
            <v-btn
              v-if="auth.isAuthenticated"
              color="primary"
              size="large"
              prepend-icon="mdi-view-list"
              component="NuxtLink"
              to="/tracker"
            >
              Open Tracker
            </v-btn>
            <v-btn
              v-else
              color="primary"
              size="large"
              prepend-icon="mdi-login"
              component="NuxtLink"
              to="/login"
            >
              Login
            </v-btn>

            <v-btn
              v-if="!auth.isAuthenticated"
              color="secondary"
              size="large"
              variant="tonal"
              prepend-icon="mdi-account-plus"
              component="NuxtLink"
              to="/register"
            >
              Create account
            </v-btn>

            <v-btn
              v-if="auth.isAuthenticated"
              color="secondary"
              size="large"
              variant="tonal"
              prepend-icon="mdi-plus-circle"
              component="NuxtLink"
              to="/tracker"
            >
              Add a new application
            </v-btn>
          </div>
        </div>

        <v-divider class="d-none d-md-block mx-4" vertical />

        <!-- Quick stats -->
        <v-card class="w-100 w-md-auto" elevation="0" variant="outlined" rounded="xl">
          <v-card-text class="d-flex flex-column ga-4">
            <div class="d-flex align-center justify-space-between">
              <span class="text-medium-emphasis">Total tracked</span>
              <v-chip size="large" color="primary" variant="flat">{{ totalCount }}</v-chip>
            </div>
            <div class="d-flex align-center justify-space-between">
              <span class="text-medium-emphasis">Newest application</span>
              <span class="font-medium">{{ newestDateLabel }}</span>
            </div>
            <div class="d-flex align-center justify-space-between">
              <span class="text-medium-emphasis">Unique companies</span>
              <span class="font-medium">{{ uniqueCompanies }}</span>
            </div>
          </v-card-text>
        </v-card>
      </div>
    </v-sheet>

    <!-- Recent applications -->
    <v-card v-if="auth.isAuthenticated" rounded="xl" class="mb-12">
      <v-card-title class="d-flex align-center justify-space-between">
        <span class="text-h6">Recent applications</span>
        <v-btn variant="text" color="primary" component="NuxtLink" to="/tracker" prepend-icon="mdi-open-in-new">
          Open tracker
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-card-text>
        <v-skeleton-loader
          v-if="jobs.loading"
          type="table"
          :loading="jobs.loading"
        />
        <template v-else>
          <v-alert
            v-if="recentItems.length === 0"
            type="info"
            variant="tonal"
            class="mb-2"
          >
            No applications yet. Head to the tracker to add your first one.
          </v-alert>

          <v-table v-else density="comfortable">
            <thead>
              <tr>
                <th class="text-left" style="width:64px">#</th>
                <th class="text-left">Company</th>
                <th class="text-left" style="width:160px">Applied</th>
                <th class="text-left">Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(job, i) in recentItems" :key="job._id">
                <td class="text-medium-emphasis">{{ i + 1 }}</td>
                <td>{{ job.company }}</td>
                <td>{{ formatDate(job.appliedAt) }}</td>
                <td class="text-medium-emphasis">{{ job.notes || '-' }}</td>
              </tr>
            </tbody>
          </v-table>
        </template>
      </v-card-text>
    </v-card>

    <!-- Features grid -->
    <v-row class="mt-10" align="stretch" justify="center" dense>
      <v-col cols="12" md="4">
        <v-card rounded="xl" variant="tonal" class="h-100">
          <v-card-text>
            <div class="d-flex align-start ga-3">
              <v-avatar color="primary" size="40">
                <v-icon>mdi-magnify</v-icon>
              </v-avatar>
              <div>
                <h3 class="text-subtitle-1 mb-1">Fast search</h3>
                <p class="text-body-2 text-medium-emphasis">
                  Query the backend by company name and filter on the client for notes.
                  Type and find results quickly.
                </p>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card rounded="xl" variant="tonal" class="h-100">
          <v-card-text>
            <div class="d-flex align-start ga-3">
              <v-avatar color="primary" size="40">
                <v-icon>mdi-calendar</v-icon>
              </v-avatar>
              <div>
                <h3 class="text-subtitle-1 mb-1">Clean timeline</h3>
                <p class="text-body-2 text-medium-emphasis">
                  Dates are shown in German format so your recent applications are always
                  clear at a glance.
                </p>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card rounded="xl" variant="tonal" class="h-100">
          <v-card-text>
            <div class="d-flex align-start ga-3">
              <v-avatar color="primary" size="40">
                <v-icon>mdi-lock-check</v-icon>
              </v-avatar>
              <div>
                <h3 class="text-subtitle-1 mb-1">Simple and safe</h3>
                <p class="text-body-2 text-medium-emphasis">
                  Auth protected routes and per-user data isolation.
                  Your tracker is private and stays organized.
                </p>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useJobsStore } from '~~/stores/jobs'
import { useAuthStore } from '~~/stores/auth'

definePageMeta({ title: 'Home' })

const jobs = useJobsStore()
const auth = useAuthStore()

onMounted(async () => {
  if (auth.isAuthenticated && jobs.items.length === 0) {
    await jobs.fetchAll()
  }
})

const toTime = (d: string | Date) => new Date(d).getTime() || 0

const sortedAll = computed(() =>
  [...jobs.items].sort((a, b) => toTime(b.appliedAt) - toTime(a.appliedAt))
)

const recentItems = computed(() => sortedAll.value.slice(0, 5))
const totalCount = computed(() => jobs.items.length)

const uniqueCompanies = computed(() => {
  const set = new Set(jobs.items.map(j => j.company.trim().toLowerCase()))
  return set.size
})

const newestDateLabel = computed(() => {
  if (sortedAll.value.length === 0) return '-'
  return formatDate(sortedAll.value[0].appliedAt)
})

function formatDate(d: string | Date) {
  const dt = new Date(d)
  return dt.toLocaleDateString('de-DE')
}
</script>
