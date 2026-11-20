export function rebaseMentions(before, after, mentions) {
  let start = 0
  while (start < before.length && start < after.length && before[start] === after[start]) start++
  let oldEnd = before.length
  let newEnd = after.length
  while (oldEnd > start && newEnd > start && before[oldEnd - 1] === after[newEnd - 1]) {
    oldEnd--
    newEnd--
  }
  const delta = newEnd - oldEnd
  return mentions.flatMap((token) => {
    if (token.end <= start) return [token]
    if (token.start >= oldEnd) return [{ ...token, start: token.start + delta, end: token.end + delta }]
    return []
  })
}

export function mentionQuery(body, caret, mentions) {
  const trigger = body.slice(0, caret).match(/(?:^|\s)@([^\n@]{0,80})$/u)
  if (!trigger) return null
  const start = caret - trigger[1].length - 1
  if (mentions.some((token) => start === token.start && (caret <= token.end || !body.slice(token.end, caret).trim()))) return null
  return { start, end: caret, query: trigger[1] }
}

export function commentSegments(body, mentions) {
  let cursor = 0
  const segments = mentions.flatMap(({ start, end }) => {
    const pieces = [{ text: body.slice(cursor, start) }, { text: body.slice(start, end), mention: true }]
    cursor = end
    return pieces
  })
  return [...segments, { text: body.slice(cursor) }]
}
