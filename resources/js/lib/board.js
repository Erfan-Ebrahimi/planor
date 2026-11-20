export const priorities = ['low', 'normal', 'high', 'urgent']

export function byPosition(items) {
  return [...items].sort((a, b) => a.position - b.position)
}

export function positionBetween(previous, next) {
  if (previous == null) return next == null ? 1000 : next / 2
  if (next == null) return previous + 1000
  return (previous + next) / 2
}

export function moveAt(items, id, targetParentId, index) {
  const item = items.find((candidate) => candidate.id === id)
  if (!item) return null
  const siblings = byPosition(items.filter((candidate) => candidate.parentId === targetParentId))
  const peers = siblings.filter((candidate) => candidate.id !== id)
  if (!Number.isInteger(index) || index < 0 || index > peers.length) return null
  if (item.parentId === targetParentId && siblings.indexOf(item) === index) return null
  const previous = peers[index - 1]?.position
  const next = peers[index]?.position
  const position = positionBetween(previous, next)
  if (!Number.isFinite(position) || position <= (previous ?? 0) || position >= (next ?? Infinity)) return null
  return { id, targetParentId, position }
}
