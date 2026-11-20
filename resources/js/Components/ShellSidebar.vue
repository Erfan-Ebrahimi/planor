<script setup>
import { computed, useTemplateRef } from 'vue'
import fa from '../lang/fa.js'
import { Link } from '../lib/inertia.js'
import AppIcon from './AppIcon.vue'

defineProps({
  homeUrl: { type: String, required: true },
  current: { type: Object, required: true },
  teams: { type: Array, required: true },
  canFilter: Boolean,
  isFiltered: Boolean,
})

defineEmits(['toggle-team'])

const query = defineModel('query', { type: String, required: true })
const scope = defineModel('scope', { type: String, required: true })
const field = useTemplateRef('field')
const scopes = [
  { id: 'teams', label: fa.workspace.teamScope },
  { id: 'boards', label: fa.workspace.boardScope },
]
const searchLabel = computed(() => scope.value === 'teams' ? fa.workspace.searchTeams : fa.workspace.searchBoards)

function setScope(value) {
  scope.value = value
  field.value?.focus()
}

function clearSearch() {
  query.value = ''
  field.value?.focus()
}

function handleEscape(event) {
  if (!event.isComposing && query.value) clearSearch()
}
</script>

<template>
  <aside class="shrink-0 border-b border-subtle bg-sidebar p-2 shell:w-sidebar shell:overflow-y-auto shell:border-b-0 shell:border-e shell:p-3 shell:shadow-sidebar">
    <nav :aria-label="fa.shell.navigation" class="grid gap-3">
      <Link
        :href="homeUrl"
        :aria-current="current.view === 'overview' ? 'page' : undefined"
        class="flex min-h-control items-center gap-2 rounded-control border-s-2 ps-2.5 pe-2.5 text-start text-body"
        :class="current.view === 'overview'
          ? 'border-accent bg-sidebar-selected font-bold text-primary'
          : 'border-transparent text-secondary hover:bg-sidebar-item hover:text-primary'"
      >
        <AppIcon name="overview" class="size-icon shrink-0" />
        <span>{{ fa.overview.title }}</span>
      </Link>

      <div v-if="canFilter" role="search" :aria-label="searchLabel" class="grid gap-2">
        <div class="flex min-h-control items-center gap-1 rounded-control border border-border bg-input focus-within:border-accent">
          <AppIcon name="search" class="ms-2 size-4 shrink-0 text-muted" />
          <input
            ref="field"
            v-model="query"
            type="text"
            :aria-label="searchLabel"
            :placeholder="searchLabel"
            class="min-w-0 flex-1 rounded-control bg-transparent py-2 ps-1 pe-2 text-start"
            @keydown.esc="handleEscape"
          />
          <button
            v-if="query"
            type="button"
            :aria-label="fa.workspace.clearSearch"
            class="grid min-h-mark min-w-mark shrink-0 place-items-center rounded-control text-secondary hover:bg-sidebar-item"
            @click="clearSearch"
          >
            <AppIcon name="close" class="size-4" />
          </button>
        </div>
        <div role="group" :aria-label="fa.workspace.filterScope" class="grid grid-cols-2 gap-1 rounded-control border border-subtle bg-sidebar-item p-1">
          <button
            v-for="option in scopes"
            :key="option.id"
            type="button"
            :aria-pressed="scope === option.id"
            class="min-h-mark rounded-control ps-2 pe-2 text-body"
            :class="scope === option.id ? 'bg-sidebar-selected font-bold text-primary' : 'text-secondary hover:bg-sidebar'"
            @click="setScope(option.id)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <ul v-if="teams.length" class="grid gap-1">
        <li v-for="team in teams" :key="team.id" class="min-w-0">
          <div
            class="flex min-w-0 items-stretch rounded-control border-s-2"
            :class="current.teamId === team.id ? 'border-accent bg-sidebar-selected' : 'border-transparent bg-sidebar-item'"
          >
            <Link
              :href="team.url"
              :aria-current="current.teamId === team.id && current.view === 'team' ? 'page' : undefined"
              class="flex min-h-control min-w-0 flex-1 items-center gap-2 rounded-control ps-2.5 pe-1 text-start font-bold hover:bg-card-hover"
            >
              <AppIcon name="team" class="size-4 shrink-0 text-accent" />
              <bdi dir="auto" :title="team.name" class="truncate">{{ team.name }}</bdi>
            </Link>
            <button
              v-if="team.canToggle"
              type="button"
              :aria-expanded="team.expanded"
              :aria-controls="`sidebar-boards-${team.id}`"
              :aria-label="team.expanded ? fa.workspace.collapseTeam(team.name) : fa.workspace.expandTeam(team.name)"
              class="grid min-w-control shrink-0 place-items-center rounded-control text-secondary hover:bg-card-hover"
              @click="$emit('toggle-team', team.id)"
            >
              <AppIcon name="chevron" class="size-4" :class="{ '-rotate-90': team.expanded }" />
            </button>
          </div>
          <ul
            v-if="team.boards.length"
            v-show="team.expanded"
            :id="`sidebar-boards-${team.id}`"
            class="ms-3 mt-1 grid gap-1 border-s border-subtle ps-2"
          >
            <li v-for="board in team.boards" :key="board.id" class="min-w-0">
              <Link
                :href="board.url"
                :aria-current="current.boardId === board.id ? 'page' : undefined"
                class="flex min-h-mark min-w-0 items-center gap-2 rounded-control border-s-2 ps-2 pe-1 text-start"
                :class="current.boardId === board.id
                  ? 'border-accent bg-sidebar-selected font-bold text-primary'
                  : 'border-transparent text-secondary hover:bg-sidebar-item hover:text-primary'"
              >
                <AppIcon name="board" class="size-4 shrink-0" />
                <bdi dir="auto" :title="board.name" class="truncate">{{ board.name }}</bdi>
              </Link>
            </li>
          </ul>
        </li>
      </ul>
      <p v-else-if="isFiltered" class="ps-2 pe-2 text-body text-secondary">{{ fa.workspace.noSearchResults }}</p>
    </nav>
  </aside>
</template>
