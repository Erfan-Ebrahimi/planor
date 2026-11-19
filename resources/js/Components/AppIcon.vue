<script setup>
defineProps({
  name: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.75"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path
      v-if="name === 'brand'"
      d="M18 5v14M12 5v9M6 5v5"
    />
    <template v-else-if="name === 'sidebar'">
      <rect x="3" y="4.5" width="18" height="15" rx="2" />
      <path d="M15 4.5v15" />
    </template>
    <template v-else-if="name === 'overview'">
      <path d="m3 10 9-7 9 7M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9" />
      <path d="M10 20v-6h4v6" />
    </template>
  </svg>
</template>
