<script setup>
import { nextTick, ref, useId } from 'vue'
import { formatDateTime } from '../composables/useDate.js'
import fa from '../lang/fa.js'
import { commentSegments } from '../lib/mentions.js'
import CommentComposer from './CommentComposer.vue'
import WorkspaceDialog from './WorkspaceDialog.vue'

defineProps({
  comments: { type: Array, required: true },
  members: { type: Array, required: true },
  canComment: Boolean,
  busy: Boolean,
  error: { type: String, default: '' },
})
const emit = defineEmits(['change'])
const id = useId()
const editing = ref(null)
const removing = ref(null)
const submitted = ref(null)

function change(method, itemId, data, callback) {
  submitted.value = itemId || 'new'
  emit('change', method, itemId, data, callback)
}

async function endEdit() {
  const previous = editing.value
  editing.value = null
  await nextTick()
  document.getElementById(id + '-edit-' + previous)?.focus()
}
</script>

<template>
  <section class="grid gap-3" :aria-labelledby="id + '-heading'">
    <h3 :id="id + '-heading'" class="text-label font-bold">{{ fa.comment.title }}</h3>
    <p v-if="!comments.length" class="text-secondary">{{ fa.comment.empty }}</p>
    <ol v-else class="grid gap-2">
      <li v-for="comment in comments" :id="'comment-' + comment.id" :key="comment.id" class="grid min-w-0 gap-2 rounded-control border border-subtle bg-sidebar-item p-2">
        <header class="flex flex-wrap items-baseline gap-2">
          <bdi dir="auto" class="font-bold">{{ comment.author || fa.common.unknownActor }}</bdi>
          <time :datetime="comment.createdAt" class="text-meta text-secondary">{{ formatDateTime(comment.createdAt) }}</time>
          <span v-if="comment.updatedAt" :title="formatDateTime(comment.updatedAt)" class="text-meta text-secondary">{{ fa.comment.edited }}</span>
        </header>
        <CommentComposer
          v-if="editing === comment.id"
          :initial="comment"
          :members="members"
          :busy="busy"
          :error="submitted === comment.id ? error : ''"
          @save="(data) => change('patch', comment.id, data, endEdit)"
          @cancel="endEdit"
        />
        <template v-else>
          <p dir="auto" class="whitespace-pre-wrap text-start [overflow-wrap:anywhere]"><span v-for="(segment, index) in commentSegments(comment.body, comment.mentions)" :key="index" :class="segment.mention ? 'text-accent' : ''">{{ segment.text }}</span></p>
          <div v-if="comment.canManage" class="flex flex-wrap gap-2 text-meta">
            <button :id="id + '-edit-' + comment.id" type="button" :disabled="busy" class="min-h-mark rounded-control ps-2 pe-2 text-accent hover:bg-card-hover" @click="editing = comment.id">{{ fa.comment.edit }}</button>
            <button type="button" :disabled="busy" class="min-h-mark rounded-control ps-2 pe-2 text-auth-error hover:bg-card-hover" @click="removing = comment.id">{{ fa.comment.remove }}</button>
          </div>
        </template>
      </li>
    </ol>
    <CommentComposer
      v-if="canComment"
      :members="members"
      :busy="busy"
      :error="submitted === 'new' ? error : ''"
      @save="(data, reset) => change('post', null, data, reset)"
    />
    <WorkspaceDialog v-if="removing" :title="fa.comment.remove" :busy="busy" @close="removing = null">
      <p class="text-secondary">{{ fa.comment.removeConfirm }}</p>
      <p v-if="submitted === removing && error" role="alert" class="text-auth-error">{{ error }}</p>
      <button type="button" :disabled="busy" class="min-h-control w-fit rounded-control border border-border ps-3 pe-3 text-auth-error disabled:opacity-60" @click="change('delete', removing, {}, () => { removing = null })">
        {{ busy ? fa.common.busy : fa.comment.remove }}
      </button>
    </WorkspaceDialog>
  </section>
</template>
