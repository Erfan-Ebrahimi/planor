<script setup>
import { computed, onBeforeUnmount, onMounted, ref, useId, useTemplateRef, watch } from 'vue'
import { byPosition, moveAt } from '../lib/board.js'
import fa from '../lang/fa.js'

const props = defineProps({
  heading: { type: String, required: true },
  items: { type: Array, required: true },
  parents: { type: Array, required: true },
  itemId: { type: String, required: true },
})

const emit = defineEmits(['close', 'move'])
const dialog = useTemplateRef('dialog')
const headingId = useId()
const item = computed(() => props.items.find((item) => item.id === props.itemId))
const parentId = ref(item.value.parentId)
const index = ref(byPosition(props.items.filter((entry) => entry.parentId === parentId.value)).findIndex((entry) => entry.id === props.itemId))
const peers = computed(() => byPosition(props.items.filter((entry) => entry.parentId === parentId.value && entry.id !== props.itemId)))
const canMove = computed(() => Boolean(moveAt(props.items, props.itemId, parentId.value, index.value)))

watch(parentId, () => { index.value = peers.value.length })
onMounted(() => dialog.value?.showModal())
onBeforeUnmount(() => dialog.value?.close())
</script>

<template>
  <dialog
    ref="dialog"
    :aria-labelledby="headingId"
    class="glass-surface m-auto w-[calc(100%-2*var(--space-20))] max-w-auth-panel rounded-panel border border-subtle bg-popup p-5 text-start text-primary shadow-popup"
    @cancel.prevent="$emit('close')"
    @keydown.esc.stop
  >
    <form class="grid gap-3" @submit.prevent="canMove && emit('move', itemId, parentId, index)">
      <h2 :id="headingId" class="text-shell-title font-bold">{{ heading }}</h2>
      <p class="text-secondary [overflow-wrap:anywhere]"><bdi dir="auto">{{ item.name }}</bdi></p>
      <label v-if="parents.length > 1" class="grid gap-1">
        {{ fa.board.destination }}
        <select v-model="parentId" class="min-h-control min-w-0 rounded-control border border-border bg-input ps-2 pe-2">
          <option v-for="parent in parents" :key="parent.id" :value="parent.id">{{ parent.name }}</option>
        </select>
      </label>
      <label class="grid gap-1">
        {{ fa.board.position }}
        <select v-model="index" class="min-h-control min-w-0 rounded-control border border-border bg-input ps-2 pe-2">
          <option v-for="(peer, peerIndex) in peers" :key="peer.id" :value="peerIndex">{{ fa.board.before(peer.name) }}</option>
          <option :value="peers.length">{{ fa.board.end }}</option>
        </select>
      </label>
      <div class="flex flex-wrap gap-2">
        <button type="submit" :disabled="!canMove" class="min-h-control rounded-control bg-auth-button ps-3 pe-3 text-on-auth-button disabled:opacity-60">{{ fa.board.move }}</button>
        <button type="button" class="min-h-control rounded-control ps-3 pe-3 text-secondary hover:bg-sidebar-item" @click="$emit('close')">{{ fa.board.cancel }}</button>
      </div>
    </form>
  </dialog>
</template>
