<script setup>
import { onMounted, ref, useId, useTemplateRef } from 'vue'
import fa from '../lang/fa.js'

const props = defineProps({
  label: { type: String, required: true },
  submitLabel: { type: String, required: true },
  initial: { type: String, default: '' },
  error: { type: String, default: '' },
  canOpen: Boolean,
  busy: Boolean,
})

const emit = defineEmits(['save', 'cancel'])
const id = useId()
const field = useTemplateRef('field')
const title = ref(props.initial)
const invalid = ref(false)

onMounted(() => field.value?.focus())

function submit(open = false) {
  if (props.busy) return
  const value = title.value.trim()
  if (!value) {
    invalid.value = true
    field.value?.focus()
    return
  }
  emit('save', { title: value, open }, () => {
    title.value = ''
    field.value?.focus()
  })
}
</script>

<template>
  <form class="grid w-full gap-2" novalidate @submit.prevent="submit()" @keydown.esc.stop="!busy && !$event.isComposing && $emit('cancel')">
    <label :for="id" class="sr-only">{{ label }}</label>
    <input
      :id="id"
      ref="field"
      v-model="title"
      :placeholder="label"
      :disabled="busy"
      :aria-invalid="invalid || Boolean(error) || undefined"
      :aria-describedby="invalid || error ? `${id}-error` : undefined"
      :class="invalid || error ? 'border-auth-error' : 'border-border'"
      class="min-h-mark min-w-0 rounded-control border bg-input ps-2 pe-2 text-start"
      @input="invalid = false"
      @keydown.enter.ctrl.prevent="!$event.isComposing && submit(canOpen)"
    />
    <p v-if="invalid || error" :id="`${id}-error`" role="alert" class="text-meta text-auth-error">
      {{ invalid ? fa.board.errors.required : error }}
    </p>
    <div class="flex flex-wrap items-center gap-2">
      <button type="submit" :disabled="busy" class="min-h-mark rounded-control bg-auth-button ps-2 pe-2 text-on-auth-button disabled:opacity-60">
        {{ submitLabel }}
      </button>
      <button type="button" :disabled="busy" class="min-h-mark rounded-control ps-2 pe-2 text-secondary hover:bg-sidebar-item" @click="$emit('cancel')">
        {{ fa.board.cancel }}
      </button>
    </div>
  </form>
</template>
