<script setup>
import { computed, nextTick, onMounted, ref, useId, useTemplateRef, watch } from 'vue'
import { normalizeName } from '../composables/useWorkspaceNavigation.js'
import fa from '../lang/fa.js'
import { mentionQuery, rebaseMentions } from '../lib/mentions.js'

const props = defineProps({
  members: { type: Array, required: true },
  initial: { type: Object, default: null },
  busy: Boolean,
  error: { type: String, default: '' },
})
const emit = defineEmits(['save', 'cancel'])
const id = useId()
const input = useTemplateRef('message')
const body = ref(props.initial?.body ?? '')
const mentions = ref(props.initial?.mentions ?? [])
const caret = ref(0)
const selected = ref(false)
const dismissed = ref(true)
const active = ref(0)
const match = computed(() => dismissed.value || selected.value ? null : mentionQuery(body.value, caret.value, mentions.value))
const options = computed(() => match.value ? props.members.filter((member) => normalizeName(member.name).includes(normalizeName(match.value.query))) : [])
const hasOptions = computed(() => options.value.length > 0)
watch(options, () => { active.value = 0 })
onMounted(() => { if (props.initial) input.value?.focus() })

function updateCaret(event) {
  caret.value = event.target.selectionStart
  selected.value = caret.value !== event.target.selectionEnd
}

function inputChanged(event) {
  const next = event.target.value
  mentions.value = rebaseMentions(body.value, next, mentions.value)
  body.value = next
  dismissed.value = false
  updateCaret(event)
}

async function choose(member) {
  if (props.busy || !match.value) return
  const { start, end } = match.value
  const label = '@' + member.name
  const next = body.value.slice(0, start) + label + ' ' + body.value.slice(end)
  if (next.length > 4000 || mentions.value.length >= 20) return
  mentions.value = [...rebaseMentions(body.value, next, mentions.value), { memberId: member.id, start, end: start + label.length }]
    .sort((a, b) => a.start - b.start)
  body.value = next
  dismissed.value = true
  await nextTick()
  input.value?.focus()
  input.value?.setSelectionRange(start + label.length + 1, start + label.length + 1)
}

function keyboard(event) {
  if (event.isComposing) return
  if (hasOptions.value) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      active.value = (active.value + options.value.length + (event.key === 'ArrowDown' ? 1 : -1)) % options.value.length
    } else if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      choose(options.value[active.value])
    } else if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      dismissed.value = true
    }
  } else if (event.key === 'Escape' && props.initial && !props.busy) {
    event.stopPropagation()
    emit('cancel')
  }
}

function save() {
  if (props.busy || !body.value.trim()) return
  emit('save', { body: body.value, mentions: mentions.value }, async () => {
    body.value = ''
    mentions.value = []
    dismissed.value = true
    await nextTick()
    input.value?.focus()
  })
}
</script>

<template>
  <form class="grid gap-2" :aria-busy="busy" @submit.prevent="save">
    <label :for="id + '-text'" class="font-bold">{{ fa.comment.field }}</label>
    <textarea
      :id="id + '-text'"
      ref="message"
      :value="body"
      :placeholder="fa.comment.placeholder"
      :disabled="busy"
      :aria-controls="hasOptions ? id + '-mentions' : undefined"
      :aria-activedescendant="hasOptions ? id + '-member-' + active : undefined"
      :aria-describedby="error ? id + '-error' : undefined"
      :aria-invalid="Boolean(error) || undefined"
      aria-autocomplete="list"
      maxlength="4000"
      rows="3"
      class="min-w-0 rounded-control border border-border bg-input p-2 text-start"
      @input="inputChanged"
      @click="dismissed = false; updateCaret($event)"
      @select="updateCaret"
      @keyup="updateCaret"
      @blur="dismissed = true"
      @keydown="keyboard"
    />
    <ul v-if="hasOptions" :id="id + '-mentions'" role="listbox" :aria-label="fa.comment.mentionList" class="grid max-h-44 overflow-auto rounded-control border border-border bg-popup p-1 shadow-popup">
      <li v-for="(member, index) in options" :key="member.id" role="none">
        <button :id="id + '-member-' + index" type="button" role="option" :aria-selected="index === active" tabindex="-1" class="min-h-mark w-full rounded-control ps-2 pe-2 text-start hover:bg-card-hover" :class="index === active ? 'bg-sidebar-selected' : ''" @pointerdown.prevent @click="choose(member)">
          <bdi dir="auto">{{ member.name }}</bdi>
        </button>
      </li>
    </ul>
    <p v-if="error" :id="id + '-error'" role="alert" class="text-auth-error">{{ error }}</p>
    <div class="flex flex-wrap gap-2">
      <button type="submit" :disabled="busy || !body.trim()" class="min-h-control rounded-control bg-auth-button ps-3 pe-3 text-on-auth-button disabled:opacity-60">
        {{ busy ? fa.common.busy : initial ? fa.common.save : fa.comment.add }}
      </button>
      <button v-if="initial" type="button" :disabled="busy" class="min-h-control rounded-control ps-3 pe-3 hover:bg-card-hover" @click="$emit('cancel')">{{ fa.common.cancel }}</button>
    </div>
  </form>
</template>
