<script setup>
import { formatDateTime } from '../composables/useDate.js'
import fa from '../lang/fa.js'
import { Link } from '../lib/inertia.js'

defineProps({
  entries: { type: Array, required: true },
  empty: { type: String, required: true },
  error: { type: String, default: '' },
  busy: Boolean,
  canRetry: Boolean,
})
defineEmits(['mark', 'open', 'retry'])
</script>

<template>
  <div class="grid gap-2" :aria-busy="busy">
    <div v-if="error" class="flex flex-wrap items-center gap-2 rounded-control border border-auth-error bg-auth-error-surface p-2">
      <p role="alert">{{ error }}</p>
      <button v-if="canRetry" type="button" class="min-h-mark rounded-control ps-2 pe-2 underline" :disabled="busy" @click="$emit('retry')">{{ fa.common.retry }}</button>
    </div>
    <p v-if="!entries.length" class="rounded-control border border-subtle p-3 text-secondary">{{ empty }}</p>
    <ol v-else class="grid gap-2">
      <li v-for="entry in entries" :key="entry.id" class="grid min-w-0 gap-1 rounded-control border bg-sidebar-item p-3" :class="entry.read ? 'border-subtle' : 'border-s-accent border-y-subtle border-e-subtle'">
        <div class="flex flex-wrap items-baseline gap-2 text-meta">
          <bdi dir="auto" class="font-bold">{{ entry.actor }}</bdi>
          <time :datetime="entry.at" class="text-secondary">{{ formatDateTime(entry.at) }}</time>
          <span v-if="!entry.read" class="text-accent">{{ fa.notification.unread }}</span>
          <span v-if="entry.kind === 'mention'" class="text-accent">{{ fa.notification.mention }}</span>
        </div>
        <p class="text-body">{{ fa.activity.labels[entry.type] }}</p>
        <p class="flex flex-wrap gap-2 text-meta text-secondary">
          <bdi dir="auto" class="min-w-0 [overflow-wrap:anywhere]">{{ entry.boardName }}</bdi>
          <bdi dir="auto" class="min-w-0 [overflow-wrap:anywhere]">{{ entry.subject }}</bdi>
        </p>
        <div class="flex flex-wrap items-center gap-2 text-body">
          <Link v-if="entry.cardUrl" :href="entry.cardUrl" class="inline-flex min-h-mark items-center rounded-control ps-2 pe-2 text-accent hover:bg-card-hover" @click="$emit('open')">{{ fa.notification.openCard }}</Link>
          <span v-else class="text-meta text-secondary">{{ fa.notification.unavailable }}</span>
          <button type="button" :disabled="busy" class="min-h-mark rounded-control ps-2 pe-2 hover:bg-card-hover" @click="$emit('mark', { id: entry.id, read: !entry.read })">
            {{ entry.read ? fa.notification.markUnread : fa.notification.markRead }}
          </button>
        </div>
      </li>
    </ol>
  </div>
</template>
