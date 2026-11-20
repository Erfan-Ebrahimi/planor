<script setup>
import { ref } from 'vue'
import JalaliDateTimePicker from '../../Components/JalaliDateTimePicker.vue'
import WorkspaceLayout from '../../Layouts/WorkspaceLayout.vue'
import fa from '../../lang/fa.js'
import { Head } from '../../lib/inertia.js'

defineOptions({ name: 'WorkspaceDateReview', layout: WorkspaceLayout })

const props = defineProps({
  samples: { type: Array, required: true },
  now: { type: String, required: true },
})

const values = ref(Object.fromEntries(props.samples.map((sample) => [sample.id, sample.value])))
</script>

<template>
  <Head :title="fa.workspace.documentTitle(fa.date.reviewTitle)" />
  <section aria-labelledby="date-review-heading" class="grid gap-5 p-5">
    <h1 id="date-review-heading" class="text-heading font-bold">{{ fa.date.reviewTitle }}</h1>
    <div class="grid gap-4 shell:grid-cols-2">
      <section
        v-for="sample in samples"
        :key="sample.id"
        :aria-labelledby="'date-state-' + sample.id"
        class="grid content-start gap-3 rounded-panel border border-subtle bg-tile p-4 shadow-card"
      >
        <h2 :id="'date-state-' + sample.id" class="text-label font-bold">{{ fa.date.reviewCases[sample.id] }}</h2>
        <JalaliDateTimePicker v-model="values[sample.id]" :now="now" :disabled="sample.disabled" />
      </section>
    </div>
  </section>
</template>
