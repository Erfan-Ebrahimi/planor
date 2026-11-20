import fa from '../resources/js/lang/fa.js'
import { byPosition, positionBetween } from '../resources/js/lib/board.js'
import { reviewArchivedCards } from '../resources/js/mocks/boards.js'

export const archiveFor = (board, boardId) => board.archivedCards ?? reviewArchivedCards[boardId] ?? []

export function projectArchive(board, boardId, capabilities) {
  return {
    actionUrl: `/boards/${boardId}/manage/archive`,
    canManage: capabilities.canArchive,
    lists: byPosition(board.lists).map(({ id, name }) => ({ id, name })),
    cards: [...archiveFor(board, boardId)].sort((a, b) => b.archivedAt.localeCompare(a.archivedAt))
      .map(({ card, originalListName, archivedBy, archivedAt }) => ({
        id: card.id,
        title: card.title,
        originalListName,
        originalListId: board.lists.some(({ id }) => id === card.listId) ? card.listId : null,
        archivedAt,
        archivedBy: board.members.find(({ id }) => id === archivedBy)?.name,
      })),
  }
}

export function archiveCard(board, card, { boardId, accountId, now }) {
  const originalList = board.lists.find(({ id }) => id === card.listId)
  board.archivedCards = [...archiveFor(board, boardId), { card, originalListName: originalList?.name ?? fa.archive.missingList, archivedAt: now, archivedBy: accountId }]
  board.cards = board.cards.filter(({ id }) => id !== card.id)
  return { changed: true, url: `/boards/${boardId}`, event: { type: 'cardArchived', cardId: card.id, subject: card.title } }
}

export function changeArchive(board, { boardId, id, method, action, itemId }, data) {
  const error = (key) => ({ errors: { archive: fa.archive[key] } })
  const archived = archiveFor(board, boardId)
  const entry = archived.find(({ card }) => card.id === id)
  if (!entry || itemId) return error('unavailable')
  const url = `/boards/${boardId}/archive`
  const event = { cardId: id, subject: entry.card.title }
  if (method === 'delete' && !action) {
    if (data.name !== entry.card.title) return error('exactError')
    board.archivedCards = archived.filter((record) => record !== entry)
    return { changed: true, url, event: { ...event, type: 'cardDeleted' } }
  }
  if (method !== 'post' || action !== 'restore') return error('unavailable')
  const original = board.lists.find(({ id }) => id === entry.card.listId)
  const destination = original ?? board.lists.find(({ id }) => id === data.targetListId)
  if (!destination || (original && data.targetListId && data.targetListId !== original.id)) return error('destinationError')
  const peers = byPosition(board.cards.filter(({ listId }) => listId === destination.id))
  const position = positionBetween(peers.at(-1)?.position)
  if (board.cards.some((card) => card.id === id) || !Number.isFinite(position) || position <= (peers.at(-1)?.position ?? 0)) return error('destinationError')
  board.cards.push({ ...entry.card, listId: destination.id, position })
  board.archivedCards = archived.filter((record) => record !== entry)
  return { changed: true, url, event: { ...event, type: 'cardRestored' } }
}
