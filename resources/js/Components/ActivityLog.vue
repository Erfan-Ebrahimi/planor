<script setup>
import { computed, ref } from 'vue'
import { formatDateTime } from '../composables/useDate.js'
import fa from '../lang/fa.js'
import { Link } from '../lib/inertia.js'

const props = defineProps({
  activity: { type: Array, required: true },
  cardContext: Boolean,
})
defineEmits(['open'])
const limit = ref(12)
const entries = computed(() => props.activity.slice(0, limit.value))
</script>

<template>
  <div class="grid gap-2">
    <p v-if="!entries.length" class="rounded-control border border-subtle p-3 text-secondary">{{ fa.activity.empty }}</p>
    <ol v-else class="grid gap-2">
      <li v-for="entry in entries" :key="entry.id" class="grid min-w-0 gap-1 rounded-control border border-subtle bg-sidebar-item p-2">
        <div class="flex flex-wrap items-baseline gap-2">
          <bdi dir="auto" class="font-bold">{{ entry.actor }}</bdi>
          <time :datetime="entry.at" class="text-meta text-secondary">{{ formatDateTime(entry.at) }}</time>
        </div>
        <p>{{ fa.activity.labels[entry.type] }}</p>
        <Link v-if="!cardContext && entry.cardUrl" :href="entry.cardUrl" class="w-fit rounded-control text-accent [overflow-wrap:anywhere] hover:underline" @click="$emit('open')"><bdi dir="auto">{{ entry.subject }}</bdi></Link>
        <bdi v-else-if="!cardContext" dir="auto" class="text-secondary [overflow-wrap:anywhere]">{{ entry.subject }}</bdi>
      </li>
    </ol>
    <button v-if="limit < activity.length" type="button" class="min-h-control w-fit rounded-control border border-border ps-3 pe-3 hover:bg-card-hover" @click="limit += 12">{{ fa.activity.more }}</button>
  </div>
</template>
