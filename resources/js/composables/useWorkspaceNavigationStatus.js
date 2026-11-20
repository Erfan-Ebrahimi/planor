import { onMounted, onUnmounted, shallowRef } from 'vue'
import { router } from '../lib/inertia.js'

export function useWorkspaceNavigationStatus() {
  const pending = shallowRef(null)
  const failed = shallowRef(null)
  const removeListeners = []

  function fail() {
    if (!pending.value) return
    failed.value = pending.value
    return false
  }

  onMounted(() => {
    removeListeners.push(
      router.on('start', ({ detail: { visit } }) => {
        if (visit.method !== 'get' || visit.prefetch) return
        pending.value = visit
        failed.value = null
      }),
      router.on('finish', ({ detail: { visit } }) => {
        if (pending.value?.id === visit.id) pending.value = null
      }),
      router.on('networkError', fail),
      router.on('httpException', fail),
    )
  })
  onUnmounted(() => removeListeners.forEach((remove) => remove()))

  function retry() {
    if (!failed.value || pending.value) return
    const { url, preserveState, preserveScroll } = failed.value
    router.visit(url, { preserveState, preserveScroll })
  }

  return { pending, failed, retry }
}
