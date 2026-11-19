<script setup>
import WorkspaceLayout from '../../Layouts/WorkspaceLayout.vue'
import fa from '../../lang/fa.js'
import { Head } from '../../lib/inertia.js'

defineOptions({ name: 'WorkspaceOverview' })

defineProps({
  homeUrl: {
    type: String,
    required: true,
  },
  viewer: {
    type: Object,
    required: true,
  },
  sidebarShown: {
    type: Boolean,
    default: true,
  },
})
</script>

<template>
  <Head :title="fa.overview.documentTitle" />

  <WorkspaceLayout
    :home-url="homeUrl"
    :viewer-name="viewer.name"
    :sidebar-shown="sidebarShown"
    overview-current
  >
    <section class="p-5">
      <div class="rounded-panel border border-subtle bg-detail p-5 shadow-card">
        <h1 class="text-heading font-bold">
          {{ fa.overview.heading }}
        </h1>
        <p class="mt-2 text-body text-secondary">
          {{ fa.overview.description }}
        </p>
      </div>
    </section>
  </WorkspaceLayout>
</template>
