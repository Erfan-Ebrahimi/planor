<script setup>
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'
import AppIcon from '../../Components/AppIcon.vue'
import BoardList from '../../Components/BoardList.vue'
import CardDetailsPanel from '../../Components/CardDetailsPanel.vue'
import InlineTitleForm from '../../Components/InlineTitleForm.vue'
import MoveDialog from '../../Components/MoveDialog.vue'
import WorkspaceLayout from '../../Layouts/WorkspaceLayout.vue'
import { useDueClock } from '../../composables/useDate.js'
import { useSortable } from '../../composables/useSortable.js'
import { normalizeName } from '../../composables/useWorkspaceNavigation.js'
import fa from '../../lang/fa.js'
import { Head, Link, router } from '../../lib/inertia.js'

defineOptions({ name: 'WorkspaceBoard', layout: WorkspaceLayout })

const props = defineProps({
  navigation: { type: Object, required: true },
  boardWorkspace: { type: Object, required: true },
})

const team = computed(() => props.navigation.teams.find((team) => team.id === props.navigation.current.teamId))
const board = computed(() => team.value.boards.find((board) => board.id === props.navigation.current.boardId))
const canEdit = computed(() => props.boardWorkspace.capabilities.canEdit)
const selected = computed(() => props.boardWorkspace.selectedCard)
const selectedList = computed(() => props.boardWorkspace.lists.find((list) => list.id === selected.value?.listId))
const deadlines = computed(() => props.boardWorkspace.lists.flatMap((list) => list.cards
  .filter((card) => card.dueAt && !card.completed)
  .map((card) => card.dueAt)))
const now = useDueClock(() => deadlines.value)
const query = ref('')
const searchTerm = computed(() => normalizeName(query.value))
const filtered = computed(() => Boolean(searchTerm.value))
const visibleLists = computed(() => props.boardWorkspace.lists.map((list) => ({
  ...list,
  totalCards: list.cards.length,
  cards: filtered.value
    ? list.cards.filter((card) => normalizeName(card.title).includes(searchTerm.value))
    : list.cards,
})))
const matchingCards = computed(() => visibleLists.value.reduce((sum, list) => sum + list.cards.length, 0))
const localCollapse = ref({})
const creatingList = ref(false)
const listTrigger = useTemplateRef('listTrigger')
const busy = ref(false)
const errors = ref({})
const errorSource = ref(null)
const canvas = useTemplateRef('canvas')
const boardTitle = useTemplateRef('boardTitle')
const liveStatus = ref('')
const moveRequest = ref(null)
const listItems = computed(() => props.boardWorkspace.lists.map((list) => ({ ...list, parentId: board.value.id })))
const cardItems = computed(() => props.boardWorkspace.lists.flatMap((list) => list.cards.map((card) => ({
  id: card.id,
  name: card.title,
  parentId: list.id,
  position: card.position,
}))))
const sources = {
  lists: { items: listItems, parents: () => [board.value], heading: fa.board.moveList },
  cards: { items: cardItems, parents: () => props.boardWorkspace.lists, heading: fa.board.moveCard },
}
const sortingEnabled = computed(() => canEdit.value && !filtered.value)
const canMoveSelected = computed(() => sortingEnabled.value && (props.boardWorkspace.lists.length > 1 || selectedList.value?.cards.length > 1))

function makeSorter(kind) {
  return useSortable({
    kind,
    getItems: () => sources[kind].items.value,
    getParents: sources[kind].parents,
    getRoot: () => canvas.value,
    enabled: () => sortingEnabled.value && !busy.value,
    onMove: (payload) => mutate(`order/${kind}`, payload, { onSuccess: () => { liveStatus.value = fa.board.moved } }),
  })
}

const sorters = { lists: makeSorter('lists'), cards: makeSorter('cards') }
const listPreview = sorters.lists.preview
const cardPreview = sorters.cards.preview
const moveSource = computed(() => moveRequest.value && sources[moveRequest.value.kind])

function openMove(kind, id, event) {
  if (sortingEnabled.value && !busy.value && sorters[kind].acceptsClick(id, event)) {
    moveRequest.value = { kind, id }
  }
}

function sortPointer(kind, phase, id, event) {
  sorters[kind].handlePointer(phase, id, event)
}

function confirmMove(id, parentId, index) {
  if (sorters[moveRequest.value.kind].move(id, parentId, index)) moveRequest.value = null
}

watch(() => selected.value?.id, async (id, previousId) => {
  if (id || !previousId) return
  await nextTick()
  const previousLink = document.getElementById(`board-card-${previousId}`)
  if (previousLink?.getClientRects().length) previousLink.focus()
  else boardTitle.value?.focus()
})

function closeCard() {
  if (!busy.value) router.visit(board.value.url, { preserveState: true, preserveScroll: true })
}

function saveCard(data, reset) {
  mutate(`cards/${selected.value.id}`, data, { onSuccess: reset, source: 'details' })
}

function saveDueDate(dueAt) {
  if (dueAt !== selected.value.dueAt) {
    mutate(`cards/${selected.value.id}`, { dueAt }, { source: 'due-date' })
  }
}

function addTask(data, reset) {
  mutate(`cards/${selected.value.id}/checklist`, data, { method: 'post', onSuccess: reset, source: 'new-task' })
}

function updateTask(id, data, onSuccess) {
  mutate(`cards/${selected.value.id}/checklist/${id}`, data, { onSuccess, source: id })
}

function moveTask(payload) {
  mutate(`order/checklist/${selected.value.id}`, payload, { onSuccess: () => { liveStatus.value = fa.board.moved } })
}

watch(() => props.boardWorkspace.id, () => {
  query.value = ''
  localCollapse.value = {}
  creatingList.value = false
  errors.value = {}
  moveRequest.value = null
})

function mutate(path, data, { method = 'patch', onSuccess, source = null } = {}) {
  if (!canEdit.value || busy.value) return
  busy.value = true
  errors.value = {}
  liveStatus.value = ''
  errorSource.value = source
  const context = selected.value ? `?card=${encodeURIComponent(selected.value.id)}` : ''
  let succeeded = false
  router[method](`${props.boardWorkspace.actionUrl}/${path}${context}`, data, {
    preserveState: true,
    preserveScroll: true,
    onError: (messages) => { errors.value = messages },
    onNetworkError() {
      errors.value = { board: fa.board.errors.network }
      return false
    },
    onSuccess() { succeeded = true },
    onFinish() {
      busy.value = false
      if (succeeded && onSuccess) nextTick(onSuccess)
    },
  })
}

function isCollapsed(list) {
  return localCollapse.value[list.id] ?? list.collapsed
}

function toggleCollapse(list) {
  if (canEdit.value) {
    mutate(`lists/${list.id}`, { collapsed: !list.collapsed })
  } else {
    localCollapse.value[list.id] = !isCollapsed(list)
  }
}

async function cancelList() {
  creatingList.value = false
  await nextTick()
  listTrigger.value?.focus()
}

function createList({ title }, reset) {
  mutate('lists', { name: title }, { method: 'post', onSuccess: reset, source: 'new-list' })
}

function createCard(listId, data, reset) {
  mutate(`lists/${listId}/cards`, data, { method: 'post', onSuccess: reset, source: listId })
}

function toggleDone(card) {
  mutate(`cards/${card.id}`, { completed: !card.completed })
}
</script>

<template>
  <Head :title="fa.workspace.documentTitle(board.name)" />

  <header class="glass-surface flex min-h-toolbar flex-wrap items-center justify-between gap-2 border-b border-subtle bg-detail-header py-2.5 ps-5 pe-5">
    <div class="grid min-w-0 gap-1">
      <nav :aria-label="fa.workspace.workspacePath">
        <Link :href="team.url" class="inline-flex max-w-full items-center gap-2 rounded-control text-body text-accent hover:underline">
          <AppIcon name="back" class="size-4 shrink-0" />
          <bdi dir="auto" class="min-w-0 truncate">{{ team.name }}</bdi>
        </Link>
      </nav>
      <h1 ref="boardTitle" tabindex="-1" class="text-shell-title font-bold [overflow-wrap:anywhere]"><bdi dir="auto">{{ board.name }}</bdi></h1>
    </div>
    <div class="flex flex-wrap items-center gap-3">
      <input
        v-if="board.cardCount"
        v-model="query"
        type="search"
        class="min-h-mark min-w-0 rounded-control border border-border bg-input ps-2 pe-2 text-start"
        :aria-label="fa.board.search"
        :placeholder="fa.board.search"
        @keydown.esc="!$event.isComposing && (query = '')"
      />
      <p aria-live="polite" class="flex flex-wrap gap-3 text-body text-secondary">
        <span>{{ filtered ? fa.board.searchResults(matchingCards, board.cardCount) : fa.workspace.cardCount(board.cardCount) }}</span>
        <span>{{ fa.workspace.taskCount(board.taskCount) }}</span>
        <span v-if="!canEdit">{{ fa.board.viewOnly }}</span>
      </p>
    </div>
  </header>

  <p v-if="errors.board" role="alert" class="m-2 rounded-control border border-auth-error bg-auth-error-surface p-2">{{ errors.board }}</p>

  <p v-if="!visibleLists.length" class="px-5 pt-5 text-secondary">{{ fa.board.noLists }}</p>
  <div class="flex min-w-0 flex-col items-start detail:flex-row">
    <div ref="canvas" class="w-full min-w-0 items-start gap-2.5 overflow-x-auto p-5 detail:flex-1" :class="selected ? 'hidden detail:flex' : 'flex'" scroll-region>
      <BoardList
        v-for="list in visibleLists"
        :key="list.id"
        :list="list"
        :members="boardWorkspace.members"
        :labels="boardWorkspace.labels"
        :now="now"
        :active-card-id="selected?.id"
        :collapsed="isCollapsed(list)"
        :can-edit="canEdit"
        :filtered="filtered"
        :busy="busy"
        :can-sort-list="sortingEnabled && visibleLists.length > 1"
        :can-sort-cards="sortingEnabled && (visibleLists.length > 1 || list.cards.length > 1)"
        :list-preview="listPreview"
        :card-preview="cardPreview"
        :error="errorSource === list.id ? errors.title : ''"
        @toggle-collapse="toggleCollapse"
        @create-card="createCard"
        @toggle-done="toggleDone"
        @sort-pointer="sortPointer"
        @open-move="openMove"
      />
      <div v-if="canEdit" class="w-column shrink-0 rounded-panel border border-subtle bg-list p-2">
        <InlineTitleForm
          v-if="creatingList"
          :label="fa.board.listTitle"
          :submit-label="fa.board.addList"
          :busy="busy"
          :error="errorSource === 'new-list' ? errors.name : ''"
          @cancel="cancelList"
          @save="createList"
        />
        <button
          v-else
          ref="listTrigger"
          type="button"
          :disabled="busy"
          class="flex min-h-control w-full items-center gap-2 rounded-control ps-2 pe-2 text-start text-secondary hover:bg-sidebar-item"
          @click="creatingList = true"
        >
          <AppIcon name="plus" class="size-4 shrink-0" />{{ fa.board.addList }}
        </button>
      </div>
    </div>
    <CardDetailsPanel
      v-if="selected && selectedList"
      :key="selected.id"
      :card="selected"
      :list-name="selectedList.name"
      :labels="boardWorkspace.labels"
      :members="boardWorkspace.members"
      :priorities="boardWorkspace.priorities"
      :now="now"
      :errors="errors"
      :error-source="errorSource"
      :can-edit="canEdit"
      :can-move="canMoveSelected"
      :busy="busy"
      @close="closeCard"
      @save="saveCard"
      @save-due-date="saveDueDate"
      @done="toggleDone(selected)"
      @open-move="openMove('cards', selected.id, $event)"
      @add-task="addTask"
      @update-task="updateTask"
      @move-task="moveTask"
    />
  </div>
  <p class="sr-only" aria-live="polite">{{ liveStatus }}</p>
  <MoveDialog
    v-if="moveRequest"
    :heading="moveSource.heading"
    :item-id="moveRequest.id"
    :items="moveSource.items.value"
    :parents="moveSource.parents()"
    @close="moveRequest = null"
    @move="confirmMove"
  />
</template>
