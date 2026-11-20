import fa from '../resources/js/lang/fa.js'
import { boardActivity, workspaceNotifications } from '../resources/js/mocks/events.js'

export const eventsFor = (board, boardId) => board.activity ?? boardActivity[boardId] ?? []
const newestFirst = (a, b) => (b.at || b.event.at).localeCompare(a.at || a.event.at)
const cardLink = (board, cardId) => board.cards.some((card) => card.id === cardId) ? `/cards/${cardId}` : null

export function projectActivity(board, boardId, cardId = null) {
  return eventsFor(board, boardId)
    .filter((event) => !cardId || event.cardId === cardId)
    .reverse()
    .sort(newestFirst)
    .map((event) => ({ ...event, cardUrl: cardLink(board, event.cardId) }))
}

function subjectFor(board, operation, data, serial) {
  const { resource, method, action, id, itemId } = operation
  if (resource === 'lists') {
    if (action === 'cards') return { type: 'cardCreated', cardId: `cr-review-${serial}` }
    if (method === 'post') return { type: 'listCreated', listId: `ls-review-${serial}` }
    return null
  }
  if (resource === 'order') {
    if (id === 'lists') return { type: 'listMoved', listId: data.id }
    if (id === 'cards') return { type: 'cardMoved', cardId: data.id }
    return { type: 'checklistChanged', cardId: action }
  }
  if (action === 'comments') return { type: method === 'post' ? 'commentAdded' : method === 'delete' ? 'commentDeleted' : 'commentEdited', cardId: id }
  if (action === 'attachments') return { type: method === 'post' ? 'attachmentAdded' : method === 'delete' ? 'attachmentDeleted' : 'attachmentRenamed', cardId: id }
  if (action === 'checklist') return { type: 'checklistChanged', cardId: id }
  if (action) return null
  const card = board.cards.find((card) => card.id === id)
  if (itemId || !card) return null
  if ('dueAt' in data) return { type: data.dueAt ? 'dueChanged' : 'dueCleared', cardId: id }
  if ('assigneeId' in data && card.assigneeId) return { type: 'assigneeChanged', cardId: id }
  if ('completed' in data) return { type: card.completed ? 'cardCompleted' : 'cardReopened', cardId: id }
  return { type: 'cardEdited', cardId: id }
}

export function recordBoardEvent(board, operation, data, result, serial) {
  const change = result.event ?? subjectFor(board, operation, data, serial)
  if (!change) return null
  const card = board.cards.find(({ id }) => id === change.cardId)
  const list = board.lists.find(({ id }) => id === change.listId)
  const { accountId, boardId, now } = operation
  const event = {
    ...change,
    id: `ev-review-${serial}`,
    subject: change.subject ?? card?.title ?? list?.name,
    boardId,
    actor: board.members.find(({ id }) => id === accountId)?.name ?? fa.common.unknownActor,
    at: now,
  }
  board.activity = [...eventsFor(board, boardId), event]
  const mentions = (result.mentioned ?? []).map((recipientId) => ({ recipientId, kind: 'mention' }))
  const activity = card?.assigneeId && ['cardMoved', 'dueChanged', 'dueCleared', 'assigneeChanged', 'cardCompleted', 'cardReopened', 'attachmentAdded'].includes(event.type)
    ? [{ recipientId: card.assigneeId, kind: 'activity' }] : []
  const recipients = [...mentions, ...activity].filter(({ recipientId }) => recipientId !== accountId)
  return { event, recipients }
}

function notificationRecords(state) {
  return [...workspaceNotifications, ...(state.notifications ?? [])]
}

export function eligibleNotifications(state, recipientId, getBoard) {
  return notificationRecords(state).reverse().flatMap((entry) => {
    if (entry.recipientId !== recipientId) return []
    const board = getBoard(entry.event.boardId)
    if (!board) return []
    return [{
      kind: entry.kind,
      ...entry.event,
      eventId: entry.event.id,
      id: entry.id,
      read: typeof state.notificationReads?.[entry.id] === 'boolean' ? state.notificationReads[entry.id] : entry.read,
      cardUrl: cardLink(board, entry.event.cardId),
    }]
  }).sort(newestFirst)
}
