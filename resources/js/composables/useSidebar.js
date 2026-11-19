import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { shellMinWidth } from '../lib/breakpoints.js'

export function useSidebar(getDesktopPreference) {
  const isDesktop = ref(false)
  const desktopOpen = ref(getDesktopPreference())
  const mobileOpen = ref(false)
  const isOpen = computed(() => (isDesktop.value ? desktopOpen.value : mobileOpen.value))
  let desktopQuery

  function syncViewport(event) {
    isDesktop.value = event.matches
  }

  onMounted(() => {
    desktopQuery = window.matchMedia(`(min-width: ${shellMinWidth})`)
    syncViewport(desktopQuery)
    desktopQuery.addEventListener('change', syncViewport)
  })

  onUnmounted(() => desktopQuery?.removeEventListener('change', syncViewport))

  watch(getDesktopPreference, (shown) => {
    desktopOpen.value = shown
  })

  function toggle() {
    const open = isDesktop.value ? desktopOpen : mobileOpen
    open.value = !open.value
  }

  return { isOpen, toggle }
}
