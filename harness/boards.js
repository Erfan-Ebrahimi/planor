import { normalizeUtcDateTime } from '../resources/js/composables/useDate.js'
import fa from '../resources/js/lang/fa.js'
import { byPosition, moveAt, positionBetween, priorities } from '../resources/js/lib/board.js'
import { reviewBoardContents } from '../resources/js/mocks/boards.js'
import { reviewBoardCapabilities, reviewBoards, reviewTeamMemberships } from '../resources/js/mocks/workspace.js'
import { archiveCard, archiveFor, changeArchive } from './archive.js'
import { cardFiles, changeAttachment, readUpload } from './attachments.js'
import { changeComment } from './comments.js'
import { eligibleNotifications, recordBoardEvent } from './events.js'

const mutationPath = /^\/boards\/([^/]+)\/manage\/([^/]+)(?:\/([^/]+))?(?:\/([^/]+))?(?:\/([^/]+))?$/u
const emptyBoard = { lists: [], cards: [], members: [], labels: [] }

export function boardPermissions(accountId, boardId) {
  const board = reviewBoards.find(({ id }) => id === boardId)
  const membership = reviewTeamMemberships.find(({ userId, teamId }) => userId === accountId && teamId === board?.teamId)
  const grant = reviewBoardCapabilities.find(({ userId, boardId: id }) => userId === accountId && id === boardId)
  const canView = Boolean(membership?.canView && grant?.canView)
  const canEdit = canView && Boolean(grant.canEdit)
  return { canView, canEdit, canComment: canView && Boolean(grant.canComment), canArchive: canEdit }
}

const clone = (value) => JSON.parse(JSON.stringify(value))
const storageKey = 'planor.workspace-review.v2'
const legacyKey = 'planor.board-review.v1.usr-1007'

function isBoardContent(content) {
  return ['lists', 'cards', 'members', 'labels'].every((key) => Array.isArray(content?.[key]))
}

function readState(storage) {
  let raw
  try {
    raw = [storage?.getItem(storageKey), storage?.getItem(legacyKey)]
  } catch {
    return { state: { boards: {}, serial: 0 }, volatile: true }
  }
  for (const item of raw) {
    try {
      const value = JSON.parse(item || 'null')
      if (value?.boards && typeof value.boards === 'object' && !Array.isArray(value.boards)
        && Number.isSafeInteger(value.serial) && value.serial >= 0) {
        const { boards, serial } = value
        const notifications = Array.isArray(value.notifications) ? value.notifications.filter((entry) => entry?.event?.boardId && typeof entry.event.at === 'string') : []
        const notificationReads = typeof value.notificationReads === 'object' && value.notificationReads !== null ? value.notificationReads : {}
        return { state: { boards, serial, notifications, notificationReads }, volatile: false }
      }
    } catch {
      // If the newest snapshot is malformed, the previous seed or snapshot remains available.
    }
  }
  return { state: { boards: {}, serial: 0 }, volatile: !storage }
}

export function createBoardHarness(storage, clock = Date.now) {
  const { state, volatile: unavailableAtStart } = readState(storage)
  let volatile = unavailableAtStart

  function read(accountId, boardId) {
    if (!boardPermissions(accountId, boardId).canView) return null
    const saved = state.boards[boardId]
    return isBoardContent(saved) ? saved : reviewBoardContents[boardId] || emptyBoard
  }

  function persist() {
    try {
      storage?.setItem(storageKey, JSON.stringify(state))
      volatile = !storage
    } catch {
      volatile = true
    }
  }

  function inbox(accountId) {
    const entries = eligibleNotifications(state, accountId, (id) => read(accountId, id))
      .map((entry) => ({ ...entry, boardName: reviewBoards.find(({ id }) => id === entry.boardId)?.name }))
    return { entries, unreadCount: entries.filter(({ read }) => !read).length, url: '/notifications', actionUrl: '/notifications/manage' }
  }

  function mark(entries, read) {
    const changed = entries.filter((entry) => entry.read !== read)
    if (!changed.length) return
    state.notificationReads ??= {}
    for (const entry of changed) state.notificationReads[entry.id] = read
    state.serial += 1
    persist()
  }

  function openCard(accountId, cardId) {
    mark(inbox(accountId).entries.filter((entry) => entry.cardId === cardId && entry.cardUrl), true)
  }

  function changeInbox(accountId, data) {
    const all = data?.all === true
    if (typeof data?.read !== 'boolean' || (all ? data.id != null : typeof data.id !== 'string' || !data.id)) {
      return { notifications: fa.notification.error }
    }
    const entries = inbox(accountId).entries.filter((entry) => all || entry.id === data.id)
    if (!entries.length && !all) return { notifications: fa.notification.error }
    mark(entries, data.read)
    return {}
  }

  async function mutate(accountId, location, method, data, signal) {
    const match = location.pathname.match(mutationPath)
    if (!match) return null

    const [, boardId, resource, id, action, itemId] = match
    const boardUrl = `/boards/${boardId}`
    const requestedCard = location.searchParams.get('card')
    const permissions = boardPermissions(accountId, boardId)
    const responseUrl = (board) => {
      if (resource === 'archive') return boardUrl + '/archive'
      return board?.cards.some((card) => card.id === requestedCard) ? `/cards/${requestedCard}` : boardUrl
    }
    const initial = read(accountId, boardId)
    const comment = resource === 'cards' && action === 'comments'
    const attachment = resource === 'cards' && action === 'attachments'
    const archival = resource === 'archive' || (resource === 'cards' && action === 'archive')
    const allowed = archival ? permissions.canArchive : comment ? permissions.canComment : permissions.canEdit
    if (!allowed) {
      return { url: responseUrl(initial), errors: { [resource === 'archive' ? 'archive' : 'board']: fa.board.errors.restricted } }
    }
    const upload = attachment && method === 'post' && !itemId && initial?.cards.some((card) => card.id === id)
      ? await readUpload(data, signal) : null
    const current = read(accountId, boardId)
    const url = responseUrl(current)
    if (signal?.aborted) return { url, errors: {} }

    const draft = clone(current)
    const nextSerial = state.serial + 1
    const operation = { resource, id, action, itemId, method, boardId, accountId, upload, now: new Date(clock()).toISOString() }
    if (upload?.file) {
      operation.uploadBytes = reviewBoards.flatMap(({ id }) => {
        const board = state.boards[id] ?? reviewBoardContents[id]
        return board ? [...board.cards, ...archiveFor(board, id).map(({ card }) => card)] : []
      })
        .flatMap(cardFiles).reduce((total, file) => total + file.size, 0)
    }
    const result = applyMutation(draft, operation, data || {}, nextSerial)
    if (result.errors) return { url, errors: result.errors }
    if (result.changed && JSON.stringify(draft) !== JSON.stringify(current)) {
      const recorded = recordBoardEvent(draft, operation, data || {}, result, nextSerial)
      if (recorded) {
        const created = recorded.recipients
          .filter(({ recipientId }) => boardPermissions(recipientId, boardId).canView)
          .map(({ recipientId, kind }) => ({ id: `nt-review-${nextSerial}-${recipientId}`, recipientId, kind, event: recorded.event, read: false }))
        if (created.length) state.notifications = [...(state.notifications ?? []), ...created]
      }
      state.boards[boardId] = draft
      state.serial = nextSerial
      persist()
    }
    return { url: result.url ?? (result.cardId ? `/cards/${result.cardId}` : url), errors: {} }
  }

  return { read, revision: () => state.serial, mutate, inbox, openCard, changeInbox, isVolatile: () => volatile }
}

const invalid = (key = 'board') => ({ errors: { [key]: key === 'title' || key === 'name' ? fa.board.errors.required : fa.board.errors.invalid } })
const text = (value) => typeof value === 'string' ? value.trim() : ''
const updated = { changed: true }
const appendPosition = (items) => positionBetween(byPosition(items).at(-1)?.position)

function applyMutation(board, operation, data, serial) {
  const { resource, id, action, itemId, method, boardId } = operation
  if (resource === 'archive') return changeArchive(board, operation, data)
  if (resource === 'order' && method === 'patch' && !itemId) {
    return applyOrder(board, boardId, id, action, data)
  }

  if (resource === 'lists' && method === 'post' && !id) {
    const name = text(data.name)
    if (!name) return invalid('name')
    board.lists.push({ id: `ls-review-${serial}`, name, position: appendPosition(board.lists), collapsed: false })
    return updated
  }

  if (resource === 'lists') {
    const list = board.lists.find((list) => list.id === id)
    if (!list) return invalid()
    if (method === 'patch' && !action) {
      if (typeof data.collapsed !== 'boolean') return invalid()
      if (list.collapsed === data.collapsed) return { changed: false }
      list.collapsed = data.collapsed
      return updated
    }
    if (method === 'post' && action === 'cards' && !itemId) {
      const title = text(data.title)
      if (!title) return invalid('title')
      const cardId = `cr-review-${serial}`
      const position = appendPosition(board.cards.filter(({ listId }) => listId === list.id))
      board.cards.push({
        id: cardId,
        listId: list.id,
        position,
        title,
        description: '',
        priority: 'normal',
        assigneeId: null,
        labelIds: [],
        completed: false,
        dueAt: null,
        checklist: [],
      })
      return { ...updated, cardId: data.open === true ? cardId : null }
    }
  }

  if (resource === 'cards') {
    const card = board.cards.find((card) => card.id === id)
    if (!card) return invalid()
    if (method === 'patch' && !action) return updateCard(board, card, data)
    if (action === 'archive' && method === 'post' && !itemId) return archiveCard(board, card, operation)
    if (action === 'checklist') return updateChecklist(card, itemId, method, data, serial)
    if (action === 'attachments') return changeAttachment(card, { ...operation, data, serial })
    if (action === 'comments') return changeComment(card, board.members, { ...operation, data, serial })
  }

  return invalid()
}

function updateCard(board, card, data) {
  const allowed = ['title', 'description', 'assigneeId', 'priority', 'labelIds', 'completed', 'dueAt']
  if (!Object.keys(data).length || Object.keys(data).some((key) => !allowed.includes(key))) return invalid()
  if ('title' in data && !text(data.title)) return invalid('title')
  if ('description' in data && typeof data.description !== 'string') return invalid()
  if ('assigneeId' in data && data.assigneeId !== null && !board.members.some(({ id }) => id === data.assigneeId)) return invalid()
  if ('priority' in data && !priorities.includes(data.priority)) return invalid()
  if ('labelIds' in data && (!Array.isArray(data.labelIds) || data.labelIds.some((id) => !board.labels.some((label) => label.id === id)))) return invalid()
  if ('completed' in data && typeof data.completed !== 'boolean') return invalid()
  const dueAt = normalizeUtcDateTime(data.dueAt)
  if ('dueAt' in data && data.dueAt !== null && dueAt === null) {
    return { errors: { dueAt: fa.date.mutationError } }
  }

  for (const key of Object.keys(data)) {
    if (key === 'labelIds') card[key] = [...new Set(data[key])]
    else if (key === 'title') card[key] = text(data[key])
    else if (key === 'dueAt') card[key] = dueAt
    else card[key] = data[key]
  }
  return updated
}

function updateChecklist(card, itemId, method, data, serial) {
  if (method === 'post' && !itemId) {
    const title = text(data.title)
    if (!title) return invalid('title')
    card.checklist.push({ id: `ck-review-${serial}`, title, position: appendPosition(card.checklist), completed: false })
    return updated
  }

  const task = card.checklist.find(({ id }) => id === itemId)
  if (!task || method !== 'patch') return invalid()
  if ('title' in data) {
    const title = text(data.title)
    if (!title) return invalid('title')
    task.title = title
  }
  if ('completed' in data) {
    if (typeof data.completed !== 'boolean') return invalid()
    task.completed = data.completed
  }
  return updated
}

function applyOrder(board, boardId, kind, cardId, data) {
  let records
  let parentOf
  const { id, targetParentId, position } = data

  if (kind === 'lists' && targetParentId === boardId && !cardId) {
    records = board.lists
    parentOf = () => boardId
  } else if (kind === 'cards' && !cardId && board.lists.some((list) => list.id === targetParentId)) {
    records = board.cards
    parentOf = (card) => card.listId
  } else if (kind === 'checklist' && cardId === targetParentId) {
    records = board.cards.find((card) => card.id === cardId)?.checklist
    parentOf = () => cardId
  }

  const moving = records?.find((item) => item.id === id)
  if (!moving || !Number.isFinite(position)) return invalid()
  if (parentOf(moving) === targetParentId && moving.position === position) return { changed: false }

  const items = records.map((item) => ({ id: item.id, parentId: parentOf(item), position: item.position }))
  const peers = items.filter((item) => item.parentId === targetParentId && item.id !== id)
  const targetIndex = peers.filter((item) => item.position < position).length
  const placement = moveAt(items, id, targetParentId, targetIndex)
  if (placement?.position !== position) return invalid()

  moving.position = position
  if (kind === 'cards') moving.listId = targetParentId
  return updated
}
