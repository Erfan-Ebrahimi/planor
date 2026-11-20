<script setup>
import { computed } from 'vue'
import { formatDate, formatDateTime, getDueState } from '../composables/useDate.js'
import fa from '../lang/fa.js'
import AppIcon from './AppIcon.vue'

const props = defineProps({
  value: { type: String, default: null },
  now: { type: [String, Number], default: undefined },
  completed: Boolean,
})

const date = computed(() => formatDate(props.value))
const detail = computed(() => formatDateTime(props.value))
const state = computed(() => props.completed ? 'normal' : getDueState(props.value, props.now))
</script>

<template>
  <time
    v-if="date"
    :datetime="value"
    :title="detail"
    class="inline-flex items-center gap-1 rounded-control border border-subtle bg-sidebar-item ps-1.5 pe-1.5 py-0.5"
    :class="{
      'text-due-normal': state === 'normal',
      'text-due-close': state === 'close',
      'text-due-over': state === 'overdue',
    }"
  >
    <AppIcon name="calendar" class="size-3 shrink-0" />
    <span>{{ date }}</span>
    <span v-if="state === 'close'" class="sr-only">{{ fa.date.dueSoon }}</span>
    <span v-if="state === 'overdue'" class="sr-only">{{ fa.date.overdue }}</span>
  </time>
</template>
