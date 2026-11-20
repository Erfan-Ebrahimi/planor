<script setup>
import { nextTick, ref, useTemplateRef } from 'vue'
import fa from '../lang/fa.js'
import AppIcon from './AppIcon.vue'
import BoardCard from './BoardCard.vue'
import InlineTitleForm from './InlineTitleForm.vue'
import MoveHandle from './MoveHandle.vue'

const props = defineProps({
  list: { type: Object, required: true },
  members: { type: Array, required: true },
  labels: { type: Array, required: true },
  now: { type: Number, required: true },
  activeCardId: { type: String, default: null },
  collapsed: Boolean,
  canEdit: Boolean,
  filtered: Boolean,
  busy: Boolean,
  error: { type: String, default: '' },
  canSortList: Boolean,
  canSortCards: Boolean,
  listPreview: { type: Object, default: null },
  cardPreview: { type: Object, default: null },
})

const emit = defineEmits(['toggle-collapse', 'create-card', 'toggle-done', 'sort-pointer', 'open-move'])
const composing = ref(false)
const addTrigger = useTemplateRef('addTrigger')

async function cancelComposer() {
  composing.value = false
  await nextTick()
  addTrigger.value?.focus()
}

function createCard(data, reset) {
  emit('create-card', props.list.id, data, () => {
    if (data.open) composing.value = false
    else reset()
  })
}
</script>

<template>
  <section
    :data-sort-list="list.id"
    :data-sort-collapsed="String(collapsed)"
    :aria-labelledby="`list-title-${list.id}`"
    :class="[
      collapsed && !composing ? 'w-collapsed' : 'w-column',
      {
        'border-s-accent': listPreview?.anchorId === list.id && listPreview.edge === 'before',
        'border-e-accent': listPreview?.anchorId === list.id && listPreview.edge === 'after',
        'ring-1 ring-accent': cardPreview?.parentId === list.id && !cardPreview.anchorId,
        'opacity-60': listPreview?.sourceId === list.id,
      },
    ]"
    class="flex shrink-0 flex-col gap-2 rounded-panel border border-subtle bg-list p-2 motion-safe:transition-[border-color,opacity,box-shadow] motion-safe:duration-board-drop"
  >
    <header class="flex flex-wrap items-center gap-1" data-sort-list-start>
      <button
        type="button"
        class="grid size-mark shrink-0 place-items-center rounded-control text-secondary hover:bg-sidebar-item"
        :aria-label="collapsed ? fa.board.expand : fa.board.collapse"
        :aria-expanded="!collapsed"
        :aria-controls="`list-cards-${list.id}`"
        :disabled="busy"
        @click="$emit('toggle-collapse', list)"
      >
        <AppIcon name="chevron" class="size-4" :class="{ '-rotate-90': !collapsed }" />
      </button>
      <h2 :id="`list-title-${list.id}`" class="min-w-0 flex-1 font-bold [overflow-wrap:anywhere]"><bdi dir="auto">{{ list.name }}</bdi></h2>
      <span class="rounded-control bg-sidebar-item ps-1.5 pe-1.5 text-meta text-secondary">
        {{ filtered ? fa.board.searchResults(list.cards.length, list.totalCards) : fa.workspace.cardCount(list.totalCards) }}
      </span>
      <MoveHandle
        v-if="canSortList"
        :label="fa.board.moveList"
        :disabled="busy"
        @pointer="(phase, event) => $emit('sort-pointer', 'lists', phase, list.id, event)"
        @activate="$emit('open-move', 'lists', list.id, $event)"
      />
    </header>

    <div :id="`list-cards-${list.id}`" v-show="!collapsed" class="grid gap-2 overflow-y-auto p-0.5 shell:max-h-card-stack" data-card-scroller>
      <BoardCard
        v-for="card in list.cards"
        :key="card.id"
        :card="card"
        :members="members"
        :labels="labels"
        :now="now"
        :active="activeCardId === card.id"
        :can-edit="canEdit"
        :busy="busy"
        :can-sort="canSortCards"
        :drop-edge="cardPreview?.anchorId === card.id ? cardPreview.edge : ''"
        :dragging="cardPreview?.sourceId === card.id"
        @toggle-done="$emit('toggle-done', $event)"
        @sort-pointer="(...args) => $emit('sort-pointer', ...args)"
        @open-move="(...args) => $emit('open-move', ...args)"
      />
      <p v-if="!list.cards.length" class="rounded-control border border-subtle p-2 text-meta text-secondary">
        {{ filtered ? fa.workspace.noSearchResults : fa.board.noCards }}
      </p>
    </div>

    <div v-if="canEdit" class="min-w-0">
      <InlineTitleForm
        v-if="composing"
        :label="fa.board.cardTitle"
        :submit-label="fa.board.addCard"
        :error="error"
        :busy="busy"
        can-open
        @cancel="cancelComposer"
        @save="createCard"
      />
      <button
        v-else
        ref="addTrigger"
        type="button"
        :disabled="busy"
        class="flex min-h-mark w-full items-center gap-1 rounded-control ps-2 pe-2 text-start text-secondary hover:bg-sidebar-item"
        @click="composing = true"
      >
        <AppIcon name="plus" class="size-4 shrink-0" />
        <span>{{ fa.board.addCard }}</span>
      </button>
    </div>
  </section>
</template>
