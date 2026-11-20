<script setup>
import { computed, inject, ref } from 'vue'
import NotificationFeed from '../../Components/NotificationFeed.vue'
import WorkspaceLayout from '../../Layouts/WorkspaceLayout.vue'
import { notificationActionsKey } from '../../composables/useNotificationActions.js'
import { normalizeName } from '../../composables/useWorkspaceNavigation.js'
import fa from '../../lang/fa.js'
import { Head } from '../../lib/inertia.js'

defineOptions({ name: 'WorkspaceNotifications', layout: WorkspaceLayout })
const props = defineProps({ notifications: { type: Object, required: true } })
const { busy, error, failed, mark, retry } = inject(notificationActionsKey)
const scope = ref('all')
const board = ref('')
const query = ref('')
const boards = computed(() => [...new Map(props.notifications.entries.map((item) => [item.boardId, item.boardName]))])
const entries = computed(() => {
  const search = normalizeName(query.value)
  return props.notifications.entries.filter((entry) => {
    if (board.value && entry.boardId !== board.value) return false
    if (scope.value !== 'all' && entry.read !== (scope.value === 'read')) return false
    return !search || normalizeName([entry.subject, entry.boardName, entry.actor, fa.activity.labels[entry.type]].join(' ')).includes(search)
  })
})
</script>

<template>
  <Head :title="fa.workspace.documentTitle(fa.notification.center)" />
  <section class="grid gap-5 p-5" aria-labelledby="notifications-heading">
    <header class="grid gap-2">
      <h1 id="notifications-heading" class="text-heading font-bold">{{ fa.notification.center }}</h1>
      <p role="status" class="flex flex-wrap gap-2 text-secondary">
        <span>{{ fa.notification.unreadCount(notifications.unreadCount) }}</span>
        <span>{{ fa.notification.results(entries.length, notifications.entries.length) }}</span>
      </p>
    </header>
    <div v-if="notifications.entries.length" class="grid gap-3">
      <div class="flex flex-wrap gap-2">
        <label class="grid min-w-0 flex-1 gap-1">
          <span>{{ fa.notification.search }}</span>
          <input v-model="query" type="search" class="min-h-control min-w-0 rounded-control border border-border bg-input ps-2 pe-2" @keydown.esc="!$event.isComposing && (query = '')" />
        </label>
        <label class="grid min-w-0 gap-1">
          <span>{{ fa.notification.status }}</span>
          <select v-model="scope" class="min-h-control rounded-control border border-border bg-input ps-2 pe-2">
            <option value="all">{{ fa.notification.all }}</option>
            <option value="unread">{{ fa.notification.unread }}</option>
            <option value="read">{{ fa.notification.read }}</option>
          </select>
        </label>
        <label class="grid min-w-0 gap-1">
          <span>{{ fa.notification.board }}</span>
          <select v-model="board" class="min-h-control max-w-full rounded-control border border-border bg-input ps-2 pe-2">
            <option value="">{{ fa.notification.allBoards }}</option>
            <option v-for="[id, name] in boards" :key="id" :value="id">{{ name }}</option>
          </select>
        </label>
      </div>
      <div class="flex flex-wrap gap-2">
        <button type="button" :disabled="busy || !notifications.unreadCount" class="min-h-control rounded-control border border-border ps-2 pe-2 hover:bg-card-hover disabled:opacity-60" @click="mark({ all: true, read: true })">{{ fa.notification.markAllRead }}</button>
        <button type="button" :disabled="busy || notifications.entries.length === notifications.unreadCount" class="min-h-control rounded-control border border-border ps-2 pe-2 hover:bg-card-hover disabled:opacity-60" @click="mark({ all: true, read: false })">{{ fa.notification.markAllUnread }}</button>
      </div>
    </div>
    <NotificationFeed
      :entries="entries"
      :empty="notifications.entries.length ? fa.notification.noResults : fa.notification.empty"
      :error="error"
      :busy="busy"
      :can-retry="Boolean(failed)"
      @mark="mark"
      @retry="retry"
    />
  </section>
</template>
