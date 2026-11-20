<script setup>
import { computed, inject } from 'vue'
import AppIcon from '../../Components/AppIcon.vue'
import WorkspaceTiles from '../../Components/WorkspaceTiles.vue'
import WorkspaceLayout from '../../Layouts/WorkspaceLayout.vue'
import { workspaceFilterKey } from '../../composables/useWorkspaceNavigation.js'
import fa from '../../lang/fa.js'
import { Head, Link } from '../../lib/inertia.js'

defineOptions({ name: 'WorkspaceTeam', layout: WorkspaceLayout })

const props = defineProps({
  homeUrl: { type: String, required: true },
  navigation: { type: Object, required: true },
})

const { isFiltered, visibleTeams } = inject(workspaceFilterKey)
const team = computed(() => props.navigation.teams.find((team) => team.id === props.navigation.current.teamId))
const boards = computed(() => visibleTeams.value.find((item) => item.id === team.value.id)?.boards || [])
</script>

<template>
  <Head :title="fa.workspace.documentTitle(team.name)" />

  <section aria-labelledby="team-heading" class="grid gap-5 p-5">
    <header class="grid gap-2 border-b border-subtle pb-3">
      <Link :href="homeUrl" class="inline-flex w-fit items-center gap-2 rounded-control text-body text-accent hover:underline">
        <AppIcon name="back" class="size-4 shrink-0" />
        {{ fa.workspace.backToOverview }}
      </Link>
      <h1 id="team-heading" class="text-heading font-bold [overflow-wrap:anywhere]"><bdi dir="auto">{{ team.name }}</bdi></h1>
      <p aria-live="polite" class="text-body text-secondary">
        {{ isFiltered ? fa.workspace.boardResults(boards.length, team.boards.length) : fa.workspace.boardCount(team.boards.length) }}
      </p>
    </header>

    <WorkspaceTiles v-if="boards.length" :items="boards" icon="board">
      <template #detail="{ item }">
        <span>{{ fa.workspace.cardCount(item.cardCount) }}</span>
        <span>{{ fa.workspace.taskCount(item.taskCount) }}</span>
      </template>
    </WorkspaceTiles>
    <p v-else class="rounded-tile border border-subtle bg-detail p-5 text-secondary">
      {{ isFiltered && team.boards.length ? fa.workspace.noSearchResults : fa.workspace.noBoards }}
    </p>
  </section>
</template>
