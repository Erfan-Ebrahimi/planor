<script setup>
import { computed } from 'vue'
import fa from '../lang/fa.js'
import { Link } from '../lib/inertia.js'
import AppIcon from './AppIcon.vue'

const props = defineProps({
  homeUrl: {
    type: String,
    required: true,
  },
  viewerName: {
    type: String,
    required: true,
  },
  sidebarId: {
    type: String,
    required: true,
  },
  sidebarOpen: Boolean,
  contextTitle: {
    type: String,
    default: '',
  },
})

defineEmits(['toggle-sidebar'])

const initials = computed(() =>
  props.viewerName
    .trim()
    .split(/\s+/u)
    .slice(0, 2)
    .map((word) => Array.from(word)[0])
    .join(''),
)

const toggleLabel = computed(() => (props.sidebarOpen ? fa.shell.hideSidebar : fa.shell.showSidebar))
</script>

<template>
  <header class="glass-surface flex h-header shrink-0 items-center gap-2 border-b border-subtle bg-header ps-2.5 pe-2.5 shell:gap-3 shell:ps-5 shell:pe-5">
    <button
      type="button"
      class="grid size-control shrink-0 place-items-center rounded-control text-secondary hover:bg-sidebar hover:text-primary"
      :aria-controls="sidebarId"
      :aria-expanded="sidebarOpen"
      :aria-label="toggleLabel"
      :title="toggleLabel"
      @click="$emit('toggle-sidebar')"
    >
      <AppIcon name="sidebar" class="size-4" />
    </button>

    <Link
      :href="homeUrl"
      class="font-brand inline-flex shrink-0 items-center gap-1.5 rounded-control text-shell-title font-bold"
    >
      <span class="grid size-mark place-items-center rounded-control bg-sidebar-selected text-primary">
        <AppIcon name="brand" class="size-icon" />
      </span>
      {{ fa.product }}
    </Link>

    <bdi dir="auto" class="hidden min-w-0 truncate border-s border-subtle ps-3 text-body text-secondary shell:block">
      {{ contextTitle || fa.shell.workspace }}
    </bdi>

    <div class="ms-auto flex min-w-0 items-center gap-2">
      <slot />
      <span
        aria-hidden="true"
        class="grid size-mark shrink-0 place-items-center rounded-round bg-card text-meta font-bold text-secondary"
      >
        {{ initials }}
      </span>
      <bdi dir="auto" class="sr-only truncate text-body text-secondary shell:not-sr-only">
        {{ viewerName }}
      </bdi>
    </div>
  </header>
</template>
