<script setup>
import fa from '../lang/fa.js'
import AppIcon from './AppIcon.vue'

defineProps({
  message: { type: String, required: true },
  messageId: { type: String, default: undefined },
})

defineEmits(['dismiss'])
</script>

<template>
  <div class="flex items-center gap-2 rounded-control border border-auth-error bg-auth-error-surface ps-3 pe-1">
    <p :id="messageId" role="alert" class="min-w-0 flex-1 py-2">{{ message }}</p>
    <button
      type="button"
      :aria-label="fa.auth.closeMessage"
      class="grid size-control shrink-0 place-items-center rounded-control hover:bg-header"
      @click="$emit('dismiss')"
    >
      <AppIcon name="close" class="size-4" />
    </button>
  </div>
</template>
