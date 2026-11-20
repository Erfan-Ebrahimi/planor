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
    <template v-else-if="name === 'eye' || name === 'eye-off'">
      <path d="M2.5 12s3.5-5.5 9.5-5.5 9.5 5.5 9.5 5.5-3.5 5.5-9.5 5.5S2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.5" />
      <path v-if="name === 'eye-off'" d="m4 4 16 16" />
    </template>
    <path v-else-if="name === 'close'" d="m6 6 12 12M18 6 6 18" />
    <template v-else-if="name === 'team'">
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20v-1a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v1m1-15a3 3 0 0 1 0 6m1 3a5 5 0 0 1 4 5v1" />
    </template>
    <template v-else-if="name === 'board'">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9 8v8m6-8v5" />
    </template>
    <template v-else-if="name === 'search'">
      <circle cx="10.5" cy="10.5" r="5.5" />
      <path d="m15 15 4 4" />
    </template>
    <path v-else-if="name === 'chevron'" d="m14 6-6 6 6 6" />
    <g v-else-if="name === 'calendar'">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M7 3v4m10-4v4M3 10h18m-13 5h2m4 0h2" />
    </g>
    <path v-else-if="name === 'back'" d="M4 12h15m-6-6 6 6-6 6" />
    <path v-else-if="name === 'plus'" d="M5 12h14M12 5v14" />
    <path v-else-if="name === 'check'" d="m5 12 4 4L19 6" />
    <path v-else-if="name === 'description'" d="M5 7h14M5 12h14M5 17h8" />
    <path v-else-if="name === 'attachment'" d="m8 13 6.8-6.8a2.9 2.9 0 1 1 4.1 4.1l-8.5 8.5a4.5 4.5 0 0 1-6.4-6.4l8.4-8.4M8 13a1.5 1.5 0 0 0 2.1 2.1l5.6-5.6" />
    <path v-else-if="name === 'comment'" d="M4 5h16v11h-9l-5 3v-3H4zm4 5h8m-8 3h5" />
    <path v-else-if="name === 'bell'" d="M4 17h16l-2-3.5V9a6 6 0 0 0-12 0v4.5L4 17Zm6 3a2 2 0 0 0 4 0" />
    <g v-else-if="name === 'activity'">
      <circle cx="12" cy="12" r="8.5" /><path d="M12 7.5v5l3.5 2" />
    </g>
    <path v-else-if="name === 'archive'" d="M4 4h16v4H4zm1 4h14v12H5zm4 4h6" />
    <path v-else-if="name === 'grip'" d="M9 5h.01M15 5h.01M9 12h.01M15 12h.01M9 19h.01M15 19h.01" stroke-width="3" />
  </svg>
</template>
