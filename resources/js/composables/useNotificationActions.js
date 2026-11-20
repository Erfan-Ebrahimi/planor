import { ref, watch } from 'vue'
import fa from '../lang/fa.js'
import { router, usePage } from '../lib/inertia.js'

export const notificationActionsKey = Symbol('notificationActions')

export function useNotificationActions(getInbox) {
  const page = usePage()
  const busy = ref(false)
  const error = ref('')
  const failed = ref(null)

  watch(() => page.url, () => {
    error.value = ''
    failed.value = null
  })

  function mark(data) {
    if (busy.value || !getInbox()?.actionUrl) return
    busy.value = true
    error.value = ''
    failed.value = null
    const query = new window.URLSearchParams({ returnTo: page.url })
    router.patch(getInbox().actionUrl + '?' + query, data, {
      preserveState: true,
      preserveScroll: true,
      replace: true,
      onError: (errors) => { error.value = errors.notifications || fa.notification.error },
      onNetworkError() {
        error.value = fa.common.network
        failed.value = data
        return false
      },
      onFinish() { busy.value = false },
    })
  }

  function retry() {
    if (failed.value) mark(failed.value)
  }

  return { busy, error, failed, mark, retry }
}
