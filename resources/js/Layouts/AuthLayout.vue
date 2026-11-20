<script setup>
import AppIcon from '../Components/AppIcon.vue'
import fa from '../lang/fa.js'

defineProps({
  heading: {
    type: String,
    required: true,
  },
  notice: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <main class="grid min-h-dvh place-items-center bg-auth p-5 text-start">
    <section aria-labelledby="auth-heading" class="grid w-full max-w-auth-panel gap-5">
      <div class="font-brand flex items-center justify-center gap-2 text-shell-title font-bold">
        <span class="grid size-mark place-items-center rounded-control bg-sidebar-selected">
          <AppIcon name="brand" class="size-icon" />
        </span>
        {{ fa.product }}
      </div>

      <div class="glass-surface grid gap-5 rounded-panel border border-subtle bg-header p-5 shadow-card">
        <h1 id="auth-heading" class="text-center text-auth-title font-normal">{{ heading }}</h1>
        <slot />
        <div v-if="$slots.alternate" class="border-t border-subtle pt-5 text-center text-secondary">
          <slot name="alternate" />
        </div>
      </div>

      <p v-if="notice" class="text-center text-meta text-muted">{{ notice }}</p>
    </section>
  </main>
</template>
