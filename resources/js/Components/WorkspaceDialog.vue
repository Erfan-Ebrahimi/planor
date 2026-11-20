<script setup>
import { onBeforeUnmount, onMounted, useId, useTemplateRef } from 'vue'
import fa from '../lang/fa.js'
import AppIcon from './AppIcon.vue'

defineProps({
  title: { type: String, required: true },
  busy: Boolean,
  anchored: Boolean,
})
defineEmits(['close'])
const dialog = useTemplateRef('dialog')
const headingId = useId()

onMounted(() => dialog.value?.showModal())
onBeforeUnmount(() => dialog.value?.close())
</script>

<template>
  <dialog
    ref="dialog"
    :aria-labelledby="headingId"
    class="glass-surface fixed max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-auth-panel overflow-auto rounded-panel border border-subtle bg-popup p-4 text-start text-primary shadow-popup"
    :class="anchored ? 'inset-0 m-auto mb-auto me-3 mt-header' : 'inset-0 m-auto'"
    @cancel.prevent="!busy && $emit('close')"
    @keydown.esc.stop
  >
    <div class="grid gap-4">
      <div class="flex items-start gap-2">
        <h2 :id="headingId" class="min-w-0 flex-1 text-shell-title font-bold [overflow-wrap:anywhere]">{{ title }}</h2>
        <button type="button" :disabled="busy" :aria-label="fa.common.close" class="grid size-mark shrink-0 place-items-center rounded-control hover:bg-card-hover" @click="$emit('close')">
          <AppIcon name="close" class="size-4" />
        </button>
      </div>
      <slot />
    </div>
  </dialog>
</template>
