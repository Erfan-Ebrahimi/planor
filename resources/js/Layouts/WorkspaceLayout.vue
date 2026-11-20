<script setup>
import { computed, provide, ref, useId, watch } from 'vue'
import AppIcon from '../Components/AppIcon.vue'
import NotificationFeed from '../Components/NotificationFeed.vue'
import ShellHeader from '../Components/ShellHeader.vue'
import ShellSidebar from '../Components/ShellSidebar.vue'
import WorkspaceDialog from '../Components/WorkspaceDialog.vue'
import { notificationActionsKey, useNotificationActions } from '../composables/useNotificationActions.js'
import { useSidebar } from '../composables/useSidebar.js'
import { useWorkspaceNavigation, workspaceFilterKey } from '../composables/useWorkspaceNavigation.js'
import { useWorkspaceNavigationStatus } from '../composables/useWorkspaceNavigationStatus.js'
import fa from '../lang/fa.js'
import { Link, usePage } from '../lib/inertia.js'

defineOptions({ inheritAttrs: false })

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
  notifications: { type: Object, default: null },
  storageWarning: { type: String, default: '' },
})

const sidebarId = useId()
const contentId = useId()
const { isOpen, toggle } = useSidebar(() => props.sidebarShown)
const { query, scope, visibleTeams, isFiltered, sidebarTeams, toggleTeam } = useWorkspaceNavigation(() => props.navigation)

const contextTitle = computed(() => props.navigation.teams.find((team) => team.id === props.navigation.current.teamId)?.name)
const page = usePage()
const notificationOpen = ref(false)
const actions = useNotificationActions(() => props.notifications)
const { busy, error, failed, mark, retry } = actions
const { pending: loadingPage, failed: failedPage, retry: retryPage } = useWorkspaceNavigationStatus()
watch(() => page.url, () => { notificationOpen.value = false })

provide(workspaceFilterKey, { visibleTeams, isFiltered })
provide(notificationActionsKey, actions)
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
    >
      <button
        v-if="notifications"
        type="button"
        :aria-label="fa.notification.bell(notifications.unreadCount)"
        aria-haspopup="dialog"
        :aria-expanded="notificationOpen"
        class="relative grid size-control shrink-0 place-items-center rounded-control text-secondary hover:bg-card-hover hover:text-primary"
        @click="notificationOpen = true"
      >
        <AppIcon name="bell" class="size-icon" />
        <span v-if="notifications.unreadCount" aria-hidden="true" class="absolute end-0 top-0 rounded-round bg-auth-button ps-1 pe-1 text-meta font-bold text-on-auth-button">{{ fa.common.number(notifications.unreadCount) }}</span>
      </button>
    </ShellHeader>
    <WorkspaceDialog v-if="notificationOpen && notifications" :title="fa.notification.title" anchored @close="notificationOpen = false">
      <div class="flex flex-wrap items-center gap-2 text-meta text-secondary">
        <p role="status" class="flex flex-wrap gap-2"><span>{{ fa.notification.unreadCount(notifications.unreadCount) }}</span><span>{{ fa.notification.total(notifications.entries.length) }}</span></p>
        <Link :href="notifications.url" class="ms-auto min-h-mark rounded-control ps-2 pe-2 text-accent hover:underline" @click="notificationOpen = false">{{ fa.notification.openCenter }}</Link>
      </div>
      <NotificationFeed
        :entries="notifications.entries.slice(0, 5)"
        :empty="fa.notification.empty"
        :error="error"
        :busy="busy"
        :can-retry="Boolean(failed)"
        @mark="mark"
        @retry="retry"
        @open="notificationOpen = false"
      />
    </WorkspaceDialog>
    <div v-if="loadingPage || failedPage" class="flex flex-wrap items-center gap-2 border-b border-subtle bg-sidebar-item ps-5 pe-5 py-2">
      <p v-if="loadingPage" role="status" class="flex items-center gap-2 text-secondary">
        <span aria-hidden="true" class="size-4 rounded-round border-2 border-accent border-t-transparent motion-safe:animate-auth-spinner" />
        {{ fa.common.loading }}
      </p>
      <template v-else>
        <p role="alert">{{ fa.common.network }}</p>
        <button type="button" class="min-h-mark rounded-control ps-2 pe-2 text-accent underline" @click="retryPage">{{ fa.common.retry }}</button>
      </template>
    </div>

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
        :aria-busy="Boolean(loadingPage)"
        class="min-w-0 flex-1 shell:overflow-y-auto"
        scroll-region
      >
        <p v-if="storageWarning" role="status" class="border-b border-subtle bg-sidebar-item p-3 text-secondary">{{ storageWarning }}</p>
        <slot />
      </main>
    </div>
  </div>
</template>
