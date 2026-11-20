<script setup>
import { Link } from '../lib/inertia.js'
import AppIcon from './AppIcon.vue'

defineProps({
  items: { type: Array, required: true },
  icon: { type: String, required: true },
})
</script>

<template>
  <ul class="grid auto-rows-workspace grid-cols-workspace gap-5">
    <li v-for="item in items" :key="item.id" class="min-w-0">
      <Link
        :href="item.url"
        class="flex h-full min-w-0 flex-col items-start justify-between gap-3 rounded-tile border border-subtle bg-tile p-section shadow-card hover:border-accent hover:bg-card-hover motion-safe:transition-colors motion-safe:duration-tile"
      >
        <span class="flex w-full min-w-0 items-start gap-2">
          <span class="grid size-mark shrink-0 place-items-center rounded-control bg-sidebar-item text-accent">
            <AppIcon :name="icon" class="size-icon" />
          </span>
          <bdi dir="auto" class="min-w-0 self-center text-label font-bold [overflow-wrap:anywhere]">{{ item.name }}</bdi>
        </span>
        <span class="flex flex-wrap gap-2 text-body text-secondary">
          <slot name="detail" :item="item" />
        </span>
      </Link>
    </li>
  </ul>
</template>
