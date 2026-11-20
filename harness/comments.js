import fa from '../resources/js/lang/fa.js'
import { cardCollaboration } from '../resources/js/mocks/collaboration.js'

export const cardComments = (card) => card.comments ?? cardCollaboration[card.id]?.comments ?? []

export function projectComments(card, members, viewerId, canComment) {
  return cardComments(card).map((comment) => ({
    ...comment,
    author: members.find(({ id }) => id === comment.authorId)?.name,
    canManage: canComment && comment.authorId === viewerId,
  }))
}

function validMentions(body, mentions, members) {
  if (!Array.isArray(mentions) || mentions.length > 20) return false
  let previous = 0
  for (const token of mentions) {
    const member = members.find(({ id }) => id === token?.memberId)
    if (!member || !Number.isInteger(token.start) || !Number.isInteger(token.end) || token.start < previous
      || token.start >= token.end || token.end > body.length || body.slice(token.start, token.end) !== '@' + member.name) return false
    previous = token.end
  }
  return true
}

export function changeComment(card, members, { method, itemId, data, accountId, serial, now }) {
  const comments = cardComments(card)
  const current = comments.find(({ id }) => id === itemId)
  const creating = method === 'post' && !itemId
  if (!creating && (!current || current.authorId !== accountId)) return { errors: { comment: fa.comment.restricted } }
  if (method === 'delete') {
    card.comments = comments.filter(({ id }) => id !== itemId)
    return { changed: true }
  }
  if (!creating && method !== 'patch') return { errors: { comment: fa.comment.restricted } }
  const { body } = data
  if (typeof body !== 'string' || !body.trim() || body.length > 4000 || !validMentions(body, data.mentions, members)) {
    return { errors: { comment: fa.comment.invalid } }
  }
  const mentions = data.mentions.map(({ memberId, start, end }) => ({ memberId, start, end }))
  if (current && current.body === body && JSON.stringify(current.mentions) === JSON.stringify(mentions)) return { changed: false }
  const record = current
    ? { ...current, body, mentions, updatedAt: now }
    : { id: `cm-review-${serial}`, body, mentions, authorId: accountId, createdAt: now, updatedAt: null }
  card.comments = current ? comments.map((comment) => comment.id === itemId ? record : comment) : [...comments, record]
  const previous = new Set(current?.mentions.map(({ memberId }) => memberId))
  return { changed: true, commentId: record.id, mentioned: [...new Set(mentions.map(({ memberId }) => memberId))].filter((id) => !previous.has(id)) }
}
