import { onUnmounted, shallowRef, watch } from 'vue'
import { byPosition, moveAt } from '../lib/board.js'

const selectors = { lists: '[data-sort-list]', cards: '[data-sort-card]', checklist: '[data-sort-task]' }
const edgeSize = 32
const scrollStep = 12

function edgeDelta(value, start, end) {
  if (value < start + edgeSize) return -scrollStep
  if (value > end - edgeSize) return scrollStep
  return 0
}

export function useSortable({ kind, getItems, getParents, getRoot, enabled, onMove }) {
  const preview = shallowRef(null)
  let pointer
  let frame
  let suppressedId

  function placement(id, parentId, index) {
    if (!enabled() || !getParents().some((parent) => parent.id === parentId)) return null
    return moveAt(getItems(), id, parentId, index)
  }

  function move(id, parentId, index) {
    const payload = placement(id, parentId, index)
    if (payload) onMove(payload)
    return Boolean(payload)
  }

  function hit(point) {
    const root = getRoot()
    const element = document.elementFromPoint(point.x, point.y)
    if (!element || !root?.contains(element)) return null
    const target = element.closest(selectors[kind])
    const list = element.closest('[data-sort-list]')
    const parentId = kind === 'cards' ? list?.dataset.sortList : getParents()[0]?.id
    if (!parentId) return null

    const peers = byPosition(getItems().filter((item) => item.parentId === parentId && item.id !== point.id))
    const targetId = target?.dataset.sortList ?? target?.dataset.sortCard ?? target?.dataset.sortTask
    if (targetId === point.id) return null
    const targetIndex = peers.findIndex((item) => item.id === targetId)
    if (targetIndex < 0) {
      const atStart = kind === 'cards' && list?.dataset.sortCollapsed !== 'true' && Boolean(element.closest('[data-sort-list-start]'))
      return { parentId, index: atStart ? 0 : peers.length, anchorId: atStart ? peers[0]?.id : undefined, edge: atStart ? 'before' : 'after' }
    }

    const rect = target.getBoundingClientRect()
    const before = kind === 'lists'
      ? (point.x < rect.left + rect.width / 2) !== (window.getComputedStyle(target).direction === 'rtl')
      : point.y < rect.top + rect.height / 2
    return { parentId, index: targetIndex + Number(!before), anchorId: targetId, edge: before ? 'before' : 'after' }
  }

  function refresh() {
    const target = hit(pointer)
    preview.value = target && placement(pointer.id, target.parentId, target.index)
      ? { ...target, sourceId: pointer.id }
      : null
  }

  function scrollFrame() {
    if (!pointer?.dragging) return
    const root = getRoot()
    if (!root) return
    const rect = root.getBoundingClientRect()
    if (kind !== 'checklist' && pointer.y >= rect.top && pointer.y <= rect.bottom) {
      root.scrollBy({ left: edgeDelta(pointer.x, rect.left, rect.right) })
    }
    if (kind === 'cards') {
      const target = document.elementFromPoint(pointer.x, pointer.y)?.closest('[data-sort-list]')
      const scroller = target && root.contains(target) && target.querySelector('[data-card-scroller]')
      if (scroller) {
        const bounds = scroller.getBoundingClientRect()
        if (pointer.y >= bounds.top && pointer.y <= bounds.bottom) {
          scroller.scrollBy({ top: edgeDelta(pointer.y, bounds.top, bounds.bottom) })
        }
      }
    }
    refresh()
    frame = window.requestAnimationFrame(scrollFrame)
  }

  function clearPointer() {
    pointer = null
    preview.value = null
    window.removeEventListener('keydown', cancelFromKeyboard, true)
    if (frame !== undefined) window.cancelAnimationFrame(frame)
    frame = undefined
  }

  function cancelFromKeyboard(event) {
    if (event.key !== 'Escape' || !pointer?.dragging) return
    event.preventDefault()
    event.stopPropagation()
    suppressedId = pointer.id
    clearPointer()
  }

  function handlePointer(phase, id, event) {
    if (phase === 'start') {
      suppressedId = null
      if (!enabled() || pointer || event.button !== 0 || event.isPrimary === false) return
      pointer = { id, pointerId: event.pointerId, x: event.clientX, y: event.clientY, dragging: false }
      event.currentTarget.setPointerCapture(event.pointerId)
      window.addEventListener('keydown', cancelFromKeyboard, true)
      return
    }
    if (pointer?.pointerId !== event.pointerId) return
    if (phase === 'cancel') {
      if (pointer.dragging) suppressedId = pointer.id
      clearPointer()
      return
    }
    if (phase === 'end') {
      if (pointer.dragging) {
        suppressedId = pointer.id
        const target = hit({ ...pointer, x: event.clientX, y: event.clientY })
        if (target) move(pointer.id, target.parentId, target.index)
      }
      clearPointer()
      return
    }

    if (!pointer.dragging && Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) < 6) return
    pointer.x = event.clientX
    pointer.y = event.clientY
    pointer.dragging = true
    event.preventDefault()
    if (frame !== undefined) window.cancelAnimationFrame(frame)
    scrollFrame()
  }

  function acceptsClick(id, event) {
    if (event.detail === 0 || suppressedId !== id) return true
    suppressedId = null
    return false
  }

  watch(enabled, (allowed) => {
    if (!allowed && pointer) {
      suppressedId = pointer.id
      clearPointer()
    }
  })
  onUnmounted(clearPointer)
  return { preview, move, handlePointer, acceptsClick }
}
