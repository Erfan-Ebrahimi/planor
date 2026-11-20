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
  archivedCard: { type: Object, default: null },
})

const heading = computed(() => ({
  'unavailable-team': fa.workspace.unavailableTeam,
  'unavailable-board': fa.workspace.unavailableBoard,
  'unavailable-card': fa.workspace.unavailableCard,
  'archived-card': fa.archive.archivedCard,
  'not-found': fa.workspace.notFound,
})[props.navigation.current.view])
</script>

<template>
  <Head :title="fa.workspace.documentTitle(heading)" />

  <section class="grid gap-3 p-5">
    <h1 class="text-heading font-bold">{{ heading }}</h1>
    <template v-if="archivedCard">
      <p><bdi dir="auto">{{ archivedCard.title }}</bdi></p>
      <Link :href="archivedCard.archiveUrl" class="inline-flex w-fit items-center gap-2 rounded-control text-body text-accent hover:underline">
        <AppIcon name="archive" class="size-4" />{{ fa.archive.open }}
      </Link>
    </template>
    <Link :href="homeUrl" class="inline-flex w-fit items-center gap-2 rounded-control text-body text-accent hover:underline">
      <AppIcon name="back" class="size-4 shrink-0" />
      {{ fa.workspace.backToOverview }}
    </Link>
  </section>
</template>
