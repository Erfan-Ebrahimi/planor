<script setup>
import { computed } from 'vue'
import AppIcon from '../../Components/AppIcon.vue'
import WorkspaceLayout from '../../Layouts/WorkspaceLayout.vue'
import fa from '../../lang/fa.js'
import { Head, Link } from '../../lib/inertia.js'

defineOptions({ name: 'WorkspaceBoard', layout: WorkspaceLayout })

const props = defineProps({
  navigation: { type: Object, required: true },
})

const team = computed(() => props.navigation.teams.find((team) => team.id === props.navigation.current.teamId))
const board = computed(() => team.value.boards.find((board) => board.id === props.navigation.current.boardId))
</script>

<template>
  <Head :title="fa.workspace.documentTitle(board.name)" />

  <header class="flex min-h-toolbar flex-wrap items-center justify-between gap-2 border-b border-subtle bg-detail-header py-2.5 ps-5 pe-5">
    <div class="grid min-w-0 gap-1">
      <nav :aria-label="fa.workspace.workspacePath">
        <Link :href="team.url" class="inline-flex max-w-full items-center gap-2 rounded-control text-body text-accent hover:underline">
          <AppIcon name="back" class="size-4 shrink-0" />
          <bdi dir="auto" class="min-w-0 truncate">{{ team.name }}</bdi>
        </Link>
      </nav>
      <h1 class="text-shell-title font-bold [overflow-wrap:anywhere]"><bdi dir="auto">{{ board.name }}</bdi></h1>
    </div>
    <p class="flex flex-wrap gap-3 text-body text-secondary">
      <span>{{ fa.workspace.cardCount(board.cardCount) }}</span>
      <span>{{ fa.workspace.taskCount(board.taskCount) }}</span>
    </p>
  </header>
</template>
