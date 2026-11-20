<script setup>
import { computed } from 'vue'
import fa from '../lang/fa.js'
import { Link } from '../lib/inertia.js'
import AppIcon from './AppIcon.vue'
import BoardLabel from './BoardLabel.vue'
import DueDateBadge from './DueDateBadge.vue'
import MoveHandle from './MoveHandle.vue'

const props = defineProps({
  card: { type: Object, required: true },
  members: { type: Array, required: true },
  labels: { type: Array, required: true },
  now: { type: Number, required: true },
  active: Boolean,
  canEdit: Boolean,
  busy: Boolean,
  canSort: Boolean,
  dropEdge: { type: String, default: '' },
  dragging: Boolean,
})

defineEmits(['toggle-done', 'sort-pointer', 'open-move'])
const assignee = computed(() => props.members.find(({ id }) => id === props.card.assigneeId))
const cardLabels = computed(() => props.labels.filter(({ id }) => props.card.labelIds.includes(id)))
</script>

<template>
  <article
    :data-sort-card="card.id"
    class="grid min-w-0 gap-2 rounded-card border p-2 shadow-card motion-safe:transition-[border-color,opacity] motion-safe:duration-board-drop"
    :class="[
      active ? 'border-accent bg-card-selected' : 'border-subtle bg-card hover:bg-card-hover',
      { 'border-t-accent': dropEdge === 'before', 'border-b-accent': dropEdge === 'after', 'opacity-60': dragging },
    ]"
  >
    <div v-if="cardLabels.length" class="flex flex-wrap gap-1">
      <BoardLabel v-for="label in cardLabels" :key="label.id" :label="label" />
    </div>
    <div class="flex items-start gap-1">
      <MoveHandle
        v-if="canSort"
        :label="fa.board.moveCard"
        :disabled="busy"
        @pointer="(phase, event) => $emit('sort-pointer', 'cards', phase, card.id, event)"
        @activate="$emit('open-move', 'cards', card.id, $event)"
      />
      <Link
        :id="`board-card-${card.id}`"
        :href="card.url"
        :aria-current="active ? 'page' : undefined"
        preserve-state
        preserve-scroll
        class="line-clamp-3 min-w-0 flex-1 rounded-control font-bold [overflow-wrap:anywhere] hover:underline"
      >
        <bdi dir="auto">{{ card.title }}</bdi>
      </Link>
      <button
        v-if="canEdit"
        type="button"
        :aria-label="card.completed ? fa.board.markUndone : fa.board.markDone"
        :aria-pressed="card.completed"
        :disabled="busy"
        class="grid size-mark shrink-0 place-items-center rounded-control border border-subtle hover:border-accent"
        :class="card.completed ? 'text-submit' : 'text-muted'"
        @click="$emit('toggle-done', card)"
      >
        <AppIcon name="check" class="size-4" />
      </button>
    </div>
    <div
      v-if="card.dueAt || card.completed || assignee || card.hasDescription || card.taskCount || card.priority !== 'normal'"
      class="flex flex-wrap items-center gap-2 text-meta text-secondary"
    >
      <DueDateBadge v-if="card.dueAt" :value="card.dueAt" :now="now" :completed="card.completed" />
      <span v-if="card.completed" class="inline-flex items-center gap-1 text-submit">
        <AppIcon v-if="!canEdit" name="check" class="size-3" />{{ fa.board.done }}
      </span>
      <span v-if="card.priority !== 'normal'" class="rounded-control bg-sidebar-item ps-1.5 pe-1.5">
        {{ fa.board.priorities[card.priority] }}
      </span>
      <span v-if="card.hasDescription" :title="fa.board.description">
        <AppIcon name="description" class="size-4" />
        <span class="sr-only">{{ fa.board.description }}</span>
      </span>
      <span v-if="card.taskCount">{{ fa.board.progress(card.completedTaskCount, card.taskCount) }}</span>
      <bdi v-if="assignee" dir="auto" class="min-w-0 [overflow-wrap:anywhere]">{{ assignee.name }}</bdi>
    </div>
  </article>
</template>
