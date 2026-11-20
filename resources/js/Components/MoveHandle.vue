<script setup>
import AppIcon from './AppIcon.vue'

defineProps({
  label: { type: String, required: true },
  disabled: Boolean,
})

defineEmits(['pointer', 'activate'])
</script>

<template>
  <button
    type="button"
    :aria-label="label"
    :title="label"
    :disabled="disabled"
    class="grid size-mark shrink-0 touch-none cursor-grab place-items-center rounded-control text-secondary hover:bg-sidebar-item active:cursor-grabbing disabled:opacity-60"
    @pointerdown="$emit('pointer', 'start', $event)"
    @pointermove="$emit('pointer', 'move', $event)"
    @pointerup="$emit('pointer', 'end', $event)"
    @pointercancel="$emit('pointer', 'cancel', $event)"
    @lostpointercapture="$emit('pointer', 'cancel', $event)"
    @click="$emit('activate', $event)"
  >
    <AppIcon name="grip" class="size-4" />
  </button>
</template>
