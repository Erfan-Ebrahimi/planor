<script setup>
import fa from '../lang/fa.js'
import AppIcon from './AppIcon.vue'

defineProps({
  homeUrl: {
    type: String,
    required: true,
  },
  overviewCurrent: Boolean,
})
</script>

<template>
  <aside class="shrink-0 border-b border-subtle bg-sidebar p-2 shell:w-sidebar shell:overflow-y-auto shell:border-b-0 shell:border-e shell:p-3 shell:shadow-sidebar">
    <nav :aria-label="fa.shell.navigation">
      <a
        :href="homeUrl"
        :aria-current="overviewCurrent ? 'page' : undefined"
        class="flex min-h-control items-center gap-2 rounded-control border-s-2 ps-2.5 pe-2.5 text-start text-body"
        :class="overviewCurrent
          ? 'border-accent bg-sidebar-selected font-bold text-primary'
          : 'border-transparent text-secondary hover:bg-sidebar-item hover:text-primary'"
      >
        <AppIcon name="overview" class="size-icon shrink-0" />
        <span>{{ fa.overview.title }}</span>
      </a>
    </nav>
  </aside>
</template>
