<script setup>
defineProps({
  label: { type: String, required: true },
  busyLabel: { type: String, required: true },
  busy: Boolean,
})
</script>

<template>
  <button
    type="submit"
    :disabled="busy"
    :aria-busy="busy"
    class="flex min-h-control w-full items-center justify-center gap-2 rounded-control bg-auth-button ps-4 pe-4 text-label font-bold text-on-auth-button enabled:hover:brightness-110 disabled:cursor-wait"
  >
    <span
      v-if="busy"
      aria-hidden="true"
      class="size-4 animate-auth-spinner rounded-round border-2 border-current border-e-transparent motion-reduce:animate-none"
    />
    <span>{{ busy ? busyLabel : label }}</span>
  </button>
</template>
