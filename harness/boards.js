import { normalizeUtcDateTime } from '../resources/js/composables/useDate.js'
import fa from '../resources/js/lang/fa.js'
import { byPosition, moveAt, positionBetween, priorities } from '../resources/js/lib/board.js'
import { reviewBoardContents } from '../resources/js/mocks/boards.js'
import { reviewBoardCapabilities, reviewBoards, reviewTeamMemberships } from '../resources/js/mocks/workspace.js'

const mutationPath = /^\/boards\/([^/]+)\/manage\/([^/]+)(?:\/([^/]+))?(?:\/([^/]+))?(?:\/([^/]+))?$/u
const emptyBoard = { lists: [], cards: [], members: [], labels: [] }

export function boardPermissions(accountId, boardId) {
  const board = reviewBoards.find(({ id }) => id === boardId)
  const membership = reviewTeamMemberships.find(({ userId, teamId }) => userId === accountId && teamId === board?.teamId)
  const grant = reviewBoardCapabilities.find(({ userId, boardId: id }) => userId === accountId && id === boardId)
  const canView = Boolean(membership?.canView && grant?.canView)
  return { canView, canEdit: canView && Boolean(grant.canEdit) }
}

const clone = (value) => JSON.parse(JSON.stringify(value))
const storageKey = (accountId) => `planor.board-review.v1.${accountId}`

function isBoardContent(content) {
  return ['lists', 'cards', 'members', 'labels'].every((key) => Array.isArray(content?.[key]))
}

function readState(storage, accountId) {
  try {
    const value = JSON.parse(storage?.getItem(storageKey(accountId)) || 'null')
    if (value?.boards && Number.isSafeInteger(value.serial) && value.serial >= 0) return value
  } catch {
    // A malformed local snapshot falls back to the fictional seed.
  }
  return { boards: {}, serial: 0 }
}

export function createBoardHarness(storage) {
  const sessions = new Map()

  function stateFor(accountId) {
    if (!sessions.has(accountId)) sessions.set(accountId, readState(storage, accountId))
    return sessions.get(accountId)
  }

  function read(accountId, boardId) {
    if (!boardPermissions(accountId, boardId).canView) return null
    const saved = stateFor(accountId).boards[boardId]
    return isBoardContent(saved) ? saved : reviewBoardContents[boardId] || emptyBoard
  }

  function revision(accountId) {
    return stateFor(accountId).serial
  }

  function mutate(accountId, location, method, data) {
    const match = location.pathname.match(mutationPath)
    if (!match) return null

    const [, boardId, resource, id, action, itemId] = match
    const boardUrl = `/boards/${boardId}`
    const requestedCard = location.searchParams.get('card')
    const permissions = boardPermissions(accountId, boardId)
    const current = read(accountId, boardId)
    const cardUrl = current?.cards.some((card) => card.id === requestedCard) ? `/cards/${requestedCard}` : null
    const url = cardUrl || boardUrl
    if (!permissions.canEdit) return { url, errors: { board: fa.board.errors.restricted } }

    const state = stateFor(accountId)
    const draft = clone(current)
    const nextSerial = state.serial + 1
    const operation = { resource, id, action, itemId, method, boardId }
    const result = applyMutation(draft, operation, data || {}, nextSerial)
    if (result.errors) return { url, errors: result.errors }
    if (result.changed) {
      state.boards[boardId] = draft
      state.serial = nextSerial
      try {
        storage?.setItem(storageKey(accountId), JSON.stringify(state))
      } catch {
        // Keep the current tab usable without storage.
      }
    }
    return { url: result.cardId ? `/cards/${result.cardId}` : url, errors: {} }
  }

  return { read, revision, mutate }
}

const invalid = (key = 'board') => ({ errors: { [key]: key === 'title' || key === 'name' ? fa.board.errors.required : fa.board.errors.invalid } })
const text = (value) => typeof value === 'string' ? value.trim() : ''
const updated = { changed: true }
const appendPosition = (items) => positionBetween(byPosition(items).at(-1)?.position)

function applyMutation(board, operation, data, serial) {
  const { resource, id, action, itemId, method, boardId } = operation
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
    if (action === 'checklist') return updateChecklist(card, itemId, method, data, serial)
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
