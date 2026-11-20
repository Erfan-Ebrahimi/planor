<script setup>
import { computed, ref } from 'vue'
import AppIcon from '../../Components/AppIcon.vue'
import WorkspaceDialog from '../../Components/WorkspaceDialog.vue'
import { formatDateTime } from '../../composables/useDate.js'
import WorkspaceLayout from '../../Layouts/WorkspaceLayout.vue'
import fa from '../../lang/fa.js'
import { Head, Link, router } from '../../lib/inertia.js'

defineOptions({ name: 'WorkspaceArchive', layout: WorkspaceLayout })
const props = defineProps({ archiveWorkspace: { type: Object, required: true } })
const mode = ref('')
const itemId = ref(null)
const targetListId = ref('')
const confirmation = ref('')
const busy = ref(false)
const error = ref('')
const current = computed(() => props.archiveWorkspace.cards.find((card) => card.id === itemId.value))
const valid = computed(() => current.value && (mode.value === 'delete'
  ? confirmation.value === current.value.title
  : Boolean(current.value.originalListId || props.archiveWorkspace.lists.some(({ id }) => id === targetListId.value))))

function open(action, card) {
  mode.value = action
  itemId.value = card.id
  targetListId.value = ''
  confirmation.value = ''
  error.value = ''
}

function submit() {
  if (!valid.value || busy.value || !props.archiveWorkspace.canManage) return
  const deleting = mode.value === 'delete'
  busy.value = true
  error.value = ''
  router.visit(props.archiveWorkspace.actionUrl + '/' + current.value.id + (deleting ? '' : '/restore'), {
    method: deleting ? 'delete' : 'post',
    data: deleting ? { name: confirmation.value } : { targetListId: current.value.originalListId || targetListId.value },
    preserveState: true,
    preserveScroll: true,
    onSuccess() { itemId.value = null },
    onError(errors) { error.value = errors.archive || fa.archive.unavailable },
    onNetworkError() { error.value = fa.common.network; return false },
    onFinish() { busy.value = false },
  })
}
</script>

<template>
  <Head :title="fa.workspace.documentTitle(fa.archive.title)" />
  <section class="grid gap-4 p-5" aria-labelledby="archive-heading">
    <header class="grid gap-2">
      <Link :href="archiveWorkspace.boardUrl" class="inline-flex w-fit items-center gap-2 rounded-control text-accent hover:underline">
        <AppIcon name="back" class="size-4" />{{ fa.archive.back }}
      </Link>
      <h1 id="archive-heading" class="text-heading font-bold">{{ fa.archive.title }}</h1>
      <p class="flex flex-wrap gap-2 text-secondary" role="status">
        <bdi dir="auto">{{ archiveWorkspace.boardName }}</bdi>
        <span>{{ fa.archive.count(archiveWorkspace.cards.length) }}</span>
        <span v-if="!archiveWorkspace.canManage">{{ fa.board.viewOnly }}</span>
      </p>
    </header>
    <p v-if="!archiveWorkspace.cards.length" class="rounded-control border border-subtle p-3 text-secondary">{{ fa.archive.empty }}</p>
    <ul v-else class="grid gap-2">
      <li v-for="card in archiveWorkspace.cards" :key="card.id" class="grid min-w-0 gap-2 rounded-panel border border-subtle bg-tile p-3 shadow-card">
        <h2 class="text-label font-bold [overflow-wrap:anywhere]"><bdi dir="auto">{{ card.title }}</bdi></h2>
        <p class="flex flex-wrap gap-2 text-meta text-secondary">
          <bdi dir="auto">{{ card.originalListName }}</bdi>
          <bdi dir="auto">{{ card.archivedBy || fa.common.unknownActor }}</bdi>
          <time :datetime="card.archivedAt">{{ formatDateTime(card.archivedAt) }}</time>
        </p>
        <div v-if="archiveWorkspace.canManage" class="flex flex-wrap gap-2">
          <button type="button" aria-haspopup="dialog" :disabled="busy" class="min-h-control rounded-control ps-2 pe-2 text-accent hover:bg-card-hover" @click="open('restore', card)">{{ fa.archive.restore }}</button>
          <button type="button" aria-haspopup="dialog" :disabled="busy" class="min-h-control rounded-control ps-2 pe-2 text-auth-error hover:bg-card-hover" @click="open('delete', card)">{{ fa.archive.delete }}</button>
        </div>
      </li>
    </ul>
  </section>
  <WorkspaceDialog v-if="current" :title="mode === 'delete' ? fa.archive.delete : fa.archive.restore" :busy="busy" @close="itemId = null">
    <form class="grid gap-3" :aria-busy="busy" @submit.prevent="submit">
      <bdi dir="auto" class="font-bold [overflow-wrap:anywhere]">{{ current.title }}</bdi>
      <template v-if="mode === 'delete'">
        <p class="text-secondary">{{ fa.archive.irreversible }}</p>
        <label class="grid gap-1">
          {{ fa.archive.exact }}
          <input v-model="confirmation" type="text" dir="auto" autocomplete="off" autofocus :disabled="busy" class="min-h-control min-w-0 rounded-control border border-border bg-input ps-2 pe-2" />
        </label>
      </template>
      <p v-else-if="current.originalListId" class="text-secondary">{{ fa.archive.restoreOriginal }} <bdi dir="auto">{{ current.originalListName }}</bdi></p>
      <template v-else>
        <p class="text-secondary">{{ fa.archive.missingList }}</p>
        <label v-if="archiveWorkspace.lists.length" class="grid gap-1">
          {{ fa.archive.destination }}
          <select v-model="targetListId" :disabled="busy" class="min-h-control min-w-0 rounded-control border border-border bg-input ps-2 pe-2">
            <option value="">{{ fa.archive.chooseDestination }}</option>
            <option v-for="list in archiveWorkspace.lists" :key="list.id" :value="list.id">{{ list.name }}</option>
          </select>
        </label>
        <p v-else class="text-secondary">{{ fa.archive.noDestination }}</p>
      </template>
      <p v-if="error" role="alert" class="text-auth-error">{{ error }}</p>
      <div class="flex flex-wrap gap-2">
        <button type="submit" :disabled="!valid || busy" class="min-h-control rounded-control border border-border ps-3 pe-3 disabled:opacity-60" :class="mode === 'delete' ? 'text-auth-error' : 'bg-auth-button text-on-auth-button'">
          {{ busy ? fa.common.busy : mode === 'delete' ? fa.archive.delete : fa.archive.restore }}
        </button>
        <button type="button" :disabled="busy" class="min-h-control rounded-control ps-3 pe-3 hover:bg-card-hover" @click="itemId = null">{{ fa.common.cancel }}</button>
      </div>
    </form>
  </WorkspaceDialog>
</template>
