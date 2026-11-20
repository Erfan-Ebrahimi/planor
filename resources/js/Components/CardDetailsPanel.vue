<script setup>
import { computed, onMounted, reactive, ref, useTemplateRef } from 'vue'
import fa from '../lang/fa.js'
import AppIcon from './AppIcon.vue'
import BoardLabel from './BoardLabel.vue'
import CardChecklist from './CardChecklist.vue'
import JalaliDateTimePicker from './JalaliDateTimePicker.vue'

const props = defineProps({
  card: { type: Object, required: true },
  listName: { type: String, required: true },
  labels: { type: Array, required: true },
  members: { type: Array, required: true },
  priorities: { type: Array, required: true },
  now: { type: Number, required: true },
  errors: { type: Object, default: () => ({}) },
  errorSource: { type: String, default: null },
  canEdit: Boolean,
  canMove: Boolean,
  busy: Boolean,
})
const emit = defineEmits(['close', 'save', 'save-due-date', 'done', 'open-move', 'add-task', 'update-task', 'move-task'])
const heading = useTemplateRef('heading')
const title = useTemplateRef('title')
const invalidTitle = ref(false)

function fields() {
  const { title, description, assigneeId, priority, labelIds } = props.card
  return { title, description, assigneeId, priority, labelIds: [...labelIds] }
}

const draft = reactive(fields())
const dirty = computed(() => JSON.stringify(draft) !== JSON.stringify(fields()))
const assignee = computed(() => props.members.find((member) => member.id === props.card.assigneeId))
const cardLabels = computed(() => props.labels.filter((label) => props.card.labelIds.includes(label.id)))
const titleError = computed(() => invalidTitle.value ? fa.board.errors.required : props.errorSource === 'details' ? props.errors.title : '')

onMounted(() => heading.value?.focus())

function reset() {
  Object.assign(draft, fields())
  invalidTitle.value = false
}

function save() {
  if (props.busy) return
  const cleanTitle = draft.title.trim()
  if (!cleanTitle) {
    invalidTitle.value = true
    title.value?.focus()
    return
  }
  if (dirty.value) emit('save', { ...draft, title: cleanTitle, labelIds: [...draft.labelIds] }, reset)
}

function escape(event) {
  if (!event.isComposing) emit('close')
}
</script>

<template>
  <aside
    class="w-full min-w-0 border-subtle bg-detail detail:max-h-card-panel detail:w-card-panel detail:max-w-[70%] detail:shrink-0 detail:overflow-y-auto detail:border-s"
    aria-labelledby="card-panel-heading"
    @keydown.esc.stop="escape"
  >
    <header class="glass-surface sticky top-0 z-10 grid gap-2 border-b border-subtle bg-detail-header p-section">
      <div class="flex items-start gap-2">
        <h2 id="card-panel-heading" ref="heading" tabindex="-1" class="min-w-0 flex-1 text-shell-title font-bold [overflow-wrap:anywhere]"><bdi dir="auto">{{ card.title }}</bdi></h2>
        <button type="button" :disabled="busy" :aria-label="fa.board.closeCard" class="grid size-mark shrink-0 place-items-center rounded-control hover:bg-sidebar-item" @click="$emit('close')">
          <AppIcon name="close" class="size-4" />
        </button>
      </div>
      <div class="flex flex-wrap items-center gap-2 text-secondary">
        <bdi dir="auto" class="rounded-control bg-sidebar-item ps-2 pe-2">{{ listName }}</bdi>
        <button
          v-if="canMove"
          type="button"
          :disabled="busy"
          class="min-h-mark rounded-control ps-2 pe-2 text-accent hover:bg-sidebar-item"
          @click="$emit('open-move', $event)"
        >
          {{ fa.board.moveCard }}
        </button>
        <button
          v-if="canEdit"
          type="button"
          :disabled="busy"
          :aria-pressed="card.completed"
          class="min-h-mark rounded-control ps-2 pe-2 hover:bg-sidebar-item"
          :class="card.completed ? 'text-submit' : 'text-secondary'"
          @click="$emit('done')"
        >
          {{ card.completed ? fa.board.markUndone : fa.board.markDone }}
        </button>
        <span v-else-if="card.completed" class="text-submit">{{ fa.board.done }}</span>
      </div>
    </header>

    <div class="grid gap-5 p-section">
      <form v-if="canEdit" class="grid gap-3" novalidate @submit.prevent="save">
        <fieldset :disabled="busy" class="m-0 grid min-w-0 gap-3 border-0 p-0">
          <label for="card-editor-title" class="font-bold">{{ fa.board.cardTitle }}</label>
          <input
            id="card-editor-title"
            ref="title"
            v-model="draft.title"
            required
            :aria-invalid="Boolean(titleError) || undefined"
            :aria-describedby="titleError ? 'card-editor-title-error' : undefined"
            class="min-h-control min-w-0 rounded-control border bg-input ps-2 pe-2"
            :class="titleError ? 'border-auth-error' : 'border-border'"
            @input="invalidTitle = false"
          />
          <p v-if="titleError" id="card-editor-title-error" role="alert" class="text-auth-error">{{ titleError }}</p>
          <label for="card-editor-description" class="font-bold">{{ fa.board.description }}</label>
          <textarea id="card-editor-description" v-model="draft.description" rows="4" class="min-w-0 rounded-control border border-border bg-input p-2" />

          <div class="grid grid-cols-1 gap-2 detail:grid-cols-2">
            <label class="grid min-w-0 gap-1">
              <span class="font-bold">{{ fa.board.assignee }}</span>
              <select v-model="draft.assigneeId" class="min-h-control min-w-0 rounded-control border border-border bg-input ps-2 pe-2">
                <option :value="null">{{ fa.board.unassigned }}</option>
                <option v-for="member in members" :key="member.id" :value="member.id">{{ member.name }}</option>
              </select>
            </label>
            <label class="grid min-w-0 gap-1">
              <span class="font-bold">{{ fa.board.priority }}</span>
              <select v-model="draft.priority" class="min-h-control min-w-0 rounded-control border border-border bg-input ps-2 pe-2">
                <option v-for="priority in priorities" :key="priority" :value="priority">{{ fa.board.priorities[priority] }}</option>
              </select>
            </label>
          </div>

          <fieldset class="m-0 grid min-w-0 gap-2 border-0 p-0">
            <legend class="pb-1 font-bold">{{ fa.board.labels }}</legend>
            <div v-if="labels.length" class="flex flex-wrap gap-2">
              <label v-for="label in labels" :key="label.id" class="flex min-h-mark items-center gap-1 rounded-control border border-subtle bg-sidebar-item ps-2 pe-2">
                <input v-model="draft.labelIds" type="checkbox" :value="label.id" class="size-4 accent-accent" />
                <BoardLabel :label="label" />
              </label>
            </div>
            <span v-else class="text-secondary">{{ fa.board.noLabels }}</span>
          </fieldset>

          <div class="flex flex-wrap gap-2">
            <button type="submit" :disabled="!dirty" class="min-h-control rounded-control bg-auth-button ps-3 pe-3 text-on-auth-button disabled:opacity-60">{{ fa.board.save }}</button>
            <button v-if="dirty" type="button" class="min-h-control rounded-control ps-3 pe-3 text-secondary hover:bg-sidebar-item" @click="reset">{{ fa.board.cancel }}</button>
          </div>
        </fieldset>
      </form>

      <dl v-else class="grid gap-2">
        <dt class="font-bold">{{ fa.board.description }}</dt>
        <dd class="whitespace-pre-wrap text-secondary [overflow-wrap:anywhere]">{{ card.description || fa.board.noDescription }}</dd>
        <dt class="font-bold">{{ fa.board.assignee }}</dt>
        <dd><bdi dir="auto">{{ assignee?.name || fa.board.unassigned }}</bdi></dd>
        <dt class="font-bold">{{ fa.board.priority }}</dt>
        <dd>{{ fa.board.priorities[card.priority] }}</dd>
        <dt class="font-bold">{{ fa.board.labels }}</dt>
        <dd class="flex flex-wrap gap-1">
          <BoardLabel v-for="label in cardLabels" :key="label.id" :label="label" />
          <span v-if="!cardLabels.length">{{ fa.board.noLabels }}</span>
        </dd>
      </dl>

      <section aria-labelledby="card-due-date-heading" class="grid gap-2 border-t border-subtle pt-3">
        <h3 id="card-due-date-heading" class="text-label font-bold">{{ fa.date.dueDate }}</h3>
        <JalaliDateTimePicker
          :model-value="card.dueAt"
          :now="now"
          :completed="card.completed"
          :disabled="!canEdit"
          :busy="busy"
          :error="errorSource === 'due-date' ? errors.dueAt : ''"
          @update:model-value="$emit('save-due-date', $event)"
        />
      </section>

      <CardChecklist
        :card="card"
        :can-edit="canEdit"
        :busy="busy"
        :error-source="errorSource"
        :title-error="errors.title || ''"
        class="border-t border-subtle pt-3"
        @add="(...args) => $emit('add-task', ...args)"
        @update="(...args) => $emit('update-task', ...args)"
        @move="$emit('move-task', $event)"
      />
    </div>
  </aside>
</template>
