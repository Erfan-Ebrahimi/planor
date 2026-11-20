<script setup>
import { computed } from 'vue'
import AppIcon from '../../Components/AppIcon.vue'
import WorkspaceLayout from '../../Layouts/WorkspaceLayout.vue'
import fa from '../../lang/fa.js'
import { Head, Link } from '../../lib/inertia.js'

defineOptions({ name: 'WorkspaceUnavailable', layout: WorkspaceLayout })

const props = defineProps({
  homeUrl: { type: String, required: true },
  navigation: { type: Object, required: true },
})

const heading = computed(() => props.navigation.current.view === 'unavailable-team'
  ? fa.workspace.unavailableTeam
  : fa.workspace.unavailableBoard)
</script>

<template>
  <Head :title="fa.workspace.documentTitle(heading)" />

  <section class="grid gap-3 p-5">
    <h1 class="text-heading font-bold">{{ heading }}</h1>
    <Link :href="homeUrl" class="inline-flex w-fit items-center gap-2 rounded-control text-body text-accent hover:underline">
      <AppIcon name="back" class="size-4 shrink-0" />
      {{ fa.workspace.backToOverview }}
    </Link>
  </section>
</template>
