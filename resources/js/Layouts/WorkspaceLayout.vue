<script setup>
import { useId } from 'vue'
import ShellHeader from '../Components/ShellHeader.vue'
import ShellSidebar from '../Components/ShellSidebar.vue'
import { useSidebar } from '../composables/useSidebar.js'
import fa from '../lang/fa.js'

const props = defineProps({
  homeUrl: {
    type: String,
    required: true,
  },
  viewerName: {
    type: String,
    required: true,
  },
  sidebarShown: {
    type: Boolean,
    default: true,
  },
  overviewCurrent: Boolean,
})

const sidebarId = useId()
const contentId = useId()
const { isOpen, toggle } = useSidebar(() => props.sidebarShown)
</script>

<template>
  <div lang="fa" dir="rtl" class="flex min-h-dvh flex-col text-start shell:h-dvh">
    <a
      :href="`#${contentId}`"
      class="sr-only rounded-control bg-popup p-2 focus:not-sr-only focus:absolute focus:start-4 focus:top-2 focus:z-popup"
    >
      {{ fa.shell.skipToContent }}
    </a>

    <ShellHeader
      :home-url="homeUrl"
      :viewer-name="viewerName"
      :sidebar-id="sidebarId"
      :sidebar-open="isOpen"
      @toggle-sidebar="toggle"
    />

    <div class="flex min-h-0 flex-1 flex-col shell:flex-row">
      <ShellSidebar
        v-show="isOpen"
        :id="sidebarId"
        :home-url="homeUrl"
        :overview-current="overviewCurrent"
      />

      <main
        :id="contentId"
        tabindex="-1"
        class="min-w-0 flex-1 shell:overflow-y-auto"
      >
        <slot />
      </main>
    </div>
  </div>
</template>
