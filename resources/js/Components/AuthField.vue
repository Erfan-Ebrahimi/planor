<script setup>
import { computed, ref, useTemplateRef, watch } from 'vue'
import fa from '../lang/fa.js'
import AppIcon from './AppIcon.vue'

const props = defineProps({
  name: { type: String, required: true },
  label: { type: String, required: true },
  type: { type: String, default: 'text' },
  autocomplete: { type: String, required: true },
  inputmode: { type: String, default: undefined },
  error: { type: String, default: '' },
  describedBy: { type: String, default: '' },
  disabled: Boolean,
})

const model = defineModel({ type: String, required: true })
const input = useTemplateRef('input')
const revealed = ref(false)
const isPassword = computed(() => props.type === 'password')
const invalid = computed(() => Boolean(props.error || props.describedBy))
const description = computed(() =>
  [props.error && `${props.name}-error`, props.describedBy].filter(Boolean).join(' ') || undefined,
)

function focus() {
  input.value?.focus()
}

defineExpose({ focus })

watch(model, (value) => {
  if (!value) revealed.value = false
})
</script>

<template>
  <div class="grid min-w-0 gap-1.5">
    <label :for="name" class="font-bold text-secondary">{{ label }}</label>
    <div
      class="flex min-h-control min-w-0 items-center rounded-control border bg-input focus-within:border-accent"
      :class="invalid ? 'border-auth-error' : 'border-border'"
    >
      <input
        :id="name"
        ref="input"
        v-model="model"
        :name="name"
        :type="isPassword && revealed ? 'text' : type"
        :autocomplete="autocomplete"
        :inputmode="inputmode"
        :disabled="disabled"
        :aria-invalid="invalid || undefined"
        :aria-describedby="description"
        required
        dir="ltr"
        spellcheck="false"
        autocapitalize="none"
        class="min-w-0 flex-1 self-stretch rounded-control bg-transparent ps-3 pe-3 text-start text-label"
      />
      <button
        v-if="isPassword"
        type="button"
        :aria-label="revealed ? fa.auth.hidePassword : fa.auth.showPassword"
        :disabled="disabled"
        class="grid size-control shrink-0 place-items-center rounded-control text-secondary hover:text-primary"
        @click="revealed = !revealed"
      >
        <AppIcon :name="revealed ? 'eye-off' : 'eye'" class="size-icon" />
      </button>
    </div>
    <p v-if="error" :id="`${name}-error`" class="text-body text-auth-error">{{ error }}</p>
  </div>
</template>
