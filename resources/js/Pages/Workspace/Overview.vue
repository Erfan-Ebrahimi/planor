<script setup>
import { computed, inject } from 'vue'
import WorkspaceTiles from '../../Components/WorkspaceTiles.vue'
import WorkspaceLayout from '../../Layouts/WorkspaceLayout.vue'
import { workspaceFilterKey } from '../../composables/useWorkspaceNavigation.js'
import fa from '../../lang/fa.js'
import { Head } from '../../lib/inertia.js'

defineOptions({ name: 'WorkspaceOverview', layout: WorkspaceLayout })

const props = defineProps({
  navigation: { type: Object, required: true },
})

const { visibleTeams, isFiltered } = inject(workspaceFilterKey)
const totalTeams = computed(() => props.navigation.teams.length)
const totalBoards = computed(() => props.navigation.teams.reduce((count, team) => count + team.boards.length, 0))
const visibleBoards = computed(() => visibleTeams.value.reduce((count, team) => count + team.boards.length, 0))
</script>

<template>
  <Head :title="fa.overview.documentTitle" />

  <section aria-labelledby="teams-heading" class="grid gap-5 p-5">
    <header class="grid gap-2 border-b border-subtle pb-3">
      <h1 id="teams-heading" class="text-heading font-bold">{{ fa.overview.heading }}</h1>
      <p aria-live="polite" class="flex flex-wrap gap-3 text-body text-secondary">
        <span>{{ isFiltered ? fa.workspace.teamResults(visibleTeams.length, totalTeams) : fa.workspace.teamCount(totalTeams) }}</span>
        <span>{{ isFiltered ? fa.workspace.boardResults(visibleBoards, totalBoards) : fa.workspace.boardCount(totalBoards) }}</span>
      </p>
    </header>

    <WorkspaceTiles v-if="visibleTeams.length" :items="visibleTeams" icon="team">
      <template #detail="{ item }">{{ fa.workspace.boardCount(item.boards.length) }}</template>
    </WorkspaceTiles>
    <p v-else class="rounded-tile border border-subtle bg-detail p-5 text-secondary">
      {{ isFiltered ? fa.workspace.noSearchResults : fa.workspace.noTeams }}
    </p>
  </section>
</template>
