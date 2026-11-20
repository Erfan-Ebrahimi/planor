<script setup>
import { computed, ref, useId, useTemplateRef } from 'vue'
import { formatDateTime } from '../composables/useDate.js'
import fa from '../lang/fa.js'
import AppIcon from './AppIcon.vue'
import WorkspaceDialog from './WorkspaceDialog.vue'

const props = defineProps({
  attachments: { type: Array, required: true },
  canEdit: Boolean,
  busy: Boolean,
  error: { type: String, default: '' },
})
const emit = defineEmits(['change'])
const id = useId()
const input = useTemplateRef('file')
const selected = ref(null)
const open = ref(null)
const name = ref('')
const brokenPreview = ref(false)
const uploading = ref(false)
const submittedDialog = ref(false)
const current = computed(() => props.attachments.find(({ id }) => id === open.value?.id))

function choose(event) {
  selected.value = event.target.files?.[0] ?? null
  uploading.value = false
}

function upload() {
  if (!selected.value || props.busy) return
  uploading.value = true
  emit('change', 'post', null, { file: selected.value }, () => {
    selected.value = null
    if (input.value) input.value.value = ''
    uploading.value = false
  })
}

function start(mode, attachment) {
  name.value = attachment.name
  brokenPreview.value = false
  uploading.value = false
  submittedDialog.value = false
  open.value = { mode, id: attachment.id }
}

function change(method) {
  if (props.busy || !current.value) return
  submittedDialog.value = true
  emit('change', method, current.value.id, method === 'patch' ? { name: name.value } : {}, () => { open.value = null })
}
</script>

<template>
  <section class="grid gap-3" :aria-labelledby="id + '-heading'">
    <h3 :id="id + '-heading'" class="text-label font-bold">{{ fa.attachment.title }}</h3>
    <p v-if="!attachments.length" class="text-secondary">{{ fa.attachment.empty }}</p>
    <ul v-else class="grid gap-2">
      <li v-for="item in attachments" :key="item.id" class="grid min-w-0 gap-2 rounded-control border border-subtle bg-sidebar-item p-2">
        <p class="flex items-center gap-2 font-bold">
          <AppIcon name="attachment" class="size-4 shrink-0 text-accent" />
          <bdi dir="auto" class="min-w-0 [overflow-wrap:anywhere]">{{ item.name }}</bdi>
        </p>
        <p class="flex flex-wrap gap-2 text-meta text-secondary">
          <span>{{ item.size < 1024 ? fa.attachment.bytes(item.size) : fa.attachment.kilobytes(item.size) }}</span>
          <bdi dir="auto">{{ item.author || fa.common.unknownActor }}</bdi>
          <time :datetime="item.createdAt">{{ formatDateTime(item.createdAt) }}</time>
        </p>
        <div class="flex flex-wrap gap-2 text-meta">
          <button v-if="item.isImage || item.previewText !== null" type="button" class="min-h-mark rounded-control ps-2 pe-2 text-accent hover:bg-card-hover" @click="start('preview', item)">{{ fa.attachment.preview }}</button>
          <a :href="item.downloadUrl" :download="item.name" class="inline-flex min-h-mark items-center rounded-control ps-2 pe-2 text-accent hover:bg-card-hover">{{ fa.attachment.download }}</a>
          <button v-if="canEdit" type="button" :disabled="busy" class="min-h-mark rounded-control ps-2 pe-2 hover:bg-card-hover" @click="start('rename', item)">{{ fa.attachment.rename }}</button>
          <button v-if="canEdit" type="button" :disabled="busy" class="min-h-mark rounded-control ps-2 pe-2 text-auth-error hover:bg-card-hover" @click="start('remove', item)">{{ fa.attachment.remove }}</button>
        </div>
      </li>
    </ul>

    <form v-if="canEdit" class="grid gap-2" :aria-busy="uploading && busy" @submit.prevent="upload">
      <div class="flex flex-wrap items-center gap-2">
        <label class="inline-flex min-h-control cursor-pointer items-center rounded-control border border-border bg-input ps-2 pe-2 focus-within:ring-1 focus-within:ring-accent">
          {{ fa.attachment.choose }}
          <input ref="file" type="file" class="sr-only" accept=".png,.jpg,.jpeg,.txt,image/png,image/jpeg,text/plain" :disabled="busy" :aria-describedby="id + '-hint'" @change="choose" />
        </label>
        <bdi v-if="selected" dir="auto" class="min-w-0 [overflow-wrap:anywhere]">{{ selected.name }}</bdi>
        <button v-if="selected" type="submit" :disabled="busy" class="min-h-control rounded-control bg-auth-button ps-3 pe-3 text-on-auth-button disabled:opacity-60">
          {{ uploading && busy ? fa.attachment.uploading : uploading && error ? fa.common.retry : fa.attachment.upload }}
        </button>
      </div>
      <p :id="id + '-hint'" class="text-meta text-secondary">{{ fa.attachment.hint }}</p>
      <p v-if="uploading && busy" role="status" class="sr-only">{{ fa.attachment.uploading }}</p>
      <p v-if="error && uploading && !open" role="alert" class="text-auth-error">{{ error }}</p>
    </form>

    <WorkspaceDialog
      v-if="open && current"
      :title="{ preview: fa.attachment.preview, rename: fa.attachment.rename, remove: fa.attachment.remove }[open.mode]"
      :busy="busy && open.mode !== 'preview'"
      @close="open = null"
    >
      <bdi dir="auto" class="min-w-0 [overflow-wrap:anywhere]">{{ current.name }}</bdi>
      <template v-if="open.mode === 'preview'">
        <img v-if="current.isImage && !brokenPreview" :src="current.downloadUrl" :alt="current.name" class="mx-auto max-h-[55dvh] max-w-full rounded-control object-contain" @error="brokenPreview = true" />
        <p v-else-if="brokenPreview" role="status" class="text-secondary">{{ fa.attachment.previewError }}</p>
        <pre v-else dir="auto" class="whitespace-pre-wrap rounded-control bg-input p-3 font-sans [overflow-wrap:anywhere]">{{ current.previewText }}</pre>
        <a :href="current.downloadUrl" :download="current.name" class="w-fit rounded-control text-accent hover:underline">{{ fa.attachment.download }}</a>
      </template>
      <form v-else class="grid gap-3" @submit.prevent="change(open.mode === 'rename' ? 'patch' : 'delete')">
        <label v-if="open.mode === 'rename'" class="grid gap-1">
          {{ fa.attachment.fileName }}
          <input v-model="name" required autofocus maxlength="120" :disabled="busy" class="min-h-control min-w-0 rounded-control border border-border bg-input ps-2 pe-2" />
        </label>
        <p v-else class="text-secondary">{{ fa.attachment.removeConfirm }}</p>
        <p v-if="error && submittedDialog" role="alert" class="text-auth-error">{{ error }}</p>
        <div class="flex flex-wrap gap-2">
          <button type="submit" :disabled="busy" class="min-h-control rounded-control border border-border ps-3 pe-3 disabled:opacity-60" :class="open.mode === 'remove' ? 'text-auth-error' : 'bg-auth-button text-on-auth-button'">
            {{ busy ? fa.common.busy : open.mode === 'remove' ? fa.attachment.remove : fa.common.save }}
          </button>
          <button type="button" :disabled="busy" class="min-h-control rounded-control ps-3 pe-3 hover:bg-card-hover" @click="open = null">{{ fa.common.cancel }}</button>
        </div>
      </form>
    </WorkspaceDialog>
  </section>
</template>
