<script setup>
import { computed, provide, useId } from 'vue'
import ShellHeader from '../Components/ShellHeader.vue'
import ShellSidebar from '../Components/ShellSidebar.vue'
import { useSidebar } from '../composables/useSidebar.js'
import { useWorkspaceNavigation, workspaceFilterKey } from '../composables/useWorkspaceNavigation.js'
import fa from '../lang/fa.js'

const props = defineProps({
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
  navigation: {
    type: Object,
    required: true,
  },
})

const sidebarId = useId()
const contentId = useId()
const { isOpen, toggle } = useSidebar(() => props.sidebarShown)
const { query, scope, visibleTeams, isFiltered, sidebarTeams, toggleTeam } = useWorkspaceNavigation(() => props.navigation)

const contextTitle = computed(() => props.navigation.teams.find((team) => team.id === props.navigation.current.teamId)?.name)

provide(workspaceFilterKey, { visibleTeams, isFiltered })
</script>

<template>
  <div lang="fa" dir="rtl" class="flex min-h-dvh flex-col text-start shell:h-dvh">
    <a
      :href="`#${contentId}`"
      class="sr-only rounded-control bg-popup p-2 focus:not-sr-only focus:absolute focus:start-4 focus:top-2 focus:z-popup"
    >
      {{ fa.shell.skipToContent }}
    </a>

    <ShellHeader
      :home-url="homeUrl"
      :viewer-name="viewer.name"
      :context-title="contextTitle"
      :sidebar-id="sidebarId"
      :sidebar-open="isOpen"
      @toggle-sidebar="toggle"
    />

    <div class="flex min-h-0 flex-1 flex-col shell:flex-row">
      <ShellSidebar
        v-show="isOpen"
        :id="sidebarId"
        v-model:query="query"
        v-model:scope="scope"
        :home-url="homeUrl"
        :current="navigation.current"
        :teams="sidebarTeams"
        :can-filter="navigation.teams.length > 0"
        :is-filtered="isFiltered"
        @toggle-team="toggleTeam"
      />

      <main
        :id="contentId"
        tabindex="-1"
        class="min-w-0 flex-1 shell:overflow-y-auto"
        scroll-region
      >
        <slot />
      </main>
    </div>
  </div>
</template>
