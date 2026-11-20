<script setup>
defineProps({ label: { type: Object, required: true } })
const tones = { blue: 'text-accent', amber: 'text-due-close', green: 'text-submit', rose: 'text-auth-error' }
</script>

<template>
  <span
    class="inline-flex max-w-full items-center gap-1 rounded-control border border-subtle bg-sidebar-item ps-2 pe-2 text-meta"
    :class="tones[label.tone]"
  >
    <span aria-hidden="true" class="size-1.5 shrink-0 rounded-round bg-current" />
    <bdi dir="auto" class="text-primary [overflow-wrap:anywhere]">{{ label.name }}</bdi>
  </span>
</template>
