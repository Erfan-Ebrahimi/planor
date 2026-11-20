<script setup>
import { computed, ref, useTemplateRef } from 'vue'
import { useSortable } from '../composables/useSortable.js'
import fa from '../lang/fa.js'
import AppIcon from './AppIcon.vue'
import InlineTitleForm from './InlineTitleForm.vue'
import MoveDialog from './MoveDialog.vue'
import MoveHandle from './MoveHandle.vue'

const props = defineProps({
  card: { type: Object, required: true },
  canEdit: Boolean,
  busy: Boolean,
  errorSource: { type: String, default: null },
  titleError: { type: String, default: '' },
})
const emit = defineEmits(['add', 'update', 'move'])
const adding = ref(false)
const editingId = ref(null)
const movingId = ref(null)
const taskList = useTemplateRef('taskList')
const completeCount = computed(() => props.card.checklist.filter((task) => task.completed).length)
const items = computed(() => props.card.checklist.map((task) => ({ ...task, name: task.title, parentId: props.card.id })))
const parents = computed(() => [{ id: props.card.id, name: props.card.title }])
const sorter = useSortable({
  kind: 'checklist',
  getItems: () => items.value,
  getParents: () => parents.value,
  getRoot: () => taskList.value,
  enabled: () => props.canEdit && !props.busy && items.value.length > 1,
  onMove: (payload) => emit('move', payload),
})
const preview = sorter.preview

function add({ title }, reset) {
  emit('add', { title }, reset)
}

function edit(id, { title }) {
  emit('update', id, { title }, () => { editingId.value = null })
}

function openMove(id, event) {
  if (sorter.acceptsClick(id, event)) movingId.value = id
}

function move(id, parentId, index) {
  if (sorter.move(id, parentId, index)) movingId.value = null
}
</script>

<template>
  <section class="grid gap-2" aria-labelledby="card-checklist-heading">
    <header class="flex flex-wrap items-center justify-between gap-2">
      <h3 id="card-checklist-heading" class="text-label font-bold">{{ fa.board.checklist }}</h3>
      <span v-if="card.checklist.length" class="text-meta text-secondary" aria-live="polite">
        {{ fa.board.progress(completeCount, card.checklist.length) }}
      </span>
    </header>
    <ul v-if="card.checklist.length" ref="taskList" class="grid gap-1">
      <li
        v-for="task in card.checklist"
        :key="task.id"
        :data-sort-task="task.id"
        class="flex min-w-0 flex-wrap items-center gap-2 rounded-control border border-subtle bg-sidebar-item p-2"
        :class="{
          'border-t-accent': preview?.anchorId === task.id && preview.edge === 'before',
          'border-b-accent': preview?.anchorId === task.id && preview.edge === 'after',
          'opacity-60': preview?.sourceId === task.id,
        }"
      >
        <InlineTitleForm
          v-if="editingId === task.id"
          :label="fa.board.taskTitle"
          :initial="task.title"
          :submit-label="fa.board.save"
          :busy="busy"
          :error="errorSource === task.id ? titleError : ''"
          @save="edit(task.id, $event)"
          @cancel="editingId = null"
        />
        <template v-else>
          <input
            type="checkbox"
            :checked="task.completed"
            :aria-label="task.title"
            :disabled="!canEdit || busy"
            class="size-4 shrink-0 accent-accent"
            @change="$emit('update', task.id, { completed: $event.target.checked })"
          />
          <bdi dir="auto" class="min-w-0 flex-1 [overflow-wrap:anywhere]" :class="{ 'text-muted line-through': task.completed }">{{ task.title }}</bdi>
          <button
            v-if="canEdit"
            type="button"
            :aria-label="fa.board.editTask"
            :disabled="busy"
            class="grid size-mark shrink-0 place-items-center rounded-control text-secondary hover:bg-card-hover"
            @click="editingId = task.id"
          >
            <AppIcon name="description" class="size-4" />
          </button>
          <MoveHandle
            v-if="canEdit && items.length > 1"
            :label="fa.board.moveTask"
            :disabled="busy"
            @pointer="(phase, event) => sorter.handlePointer(phase, task.id, event)"
            @activate="openMove(task.id, $event)"
          />
        </template>
      </li>
    </ul>
    <p v-else class="text-secondary">{{ fa.board.noTasks }}</p>

    <InlineTitleForm
      v-if="adding && canEdit"
      :label="fa.board.taskTitle"
      :submit-label="fa.board.addTask"
      :busy="busy"
      :error="errorSource === 'new-task' ? titleError : ''"
      @save="add"
      @cancel="adding = false"
    />
    <button
      v-else-if="canEdit"
      type="button"
      :disabled="busy"
      class="flex min-h-mark w-fit items-center gap-1 rounded-control ps-2 pe-2 text-secondary hover:bg-sidebar-item"
      @click="adding = true"
    >
      <AppIcon name="plus" class="size-4" />{{ fa.board.addTask }}
    </button>

    <MoveDialog
      v-if="movingId"
      :heading="fa.board.moveTask"
      :items="items"
      :parents="parents"
      :item-id="movingId"
      @close="movingId = null"
      @move="move"
    />
  </section>
</template>
