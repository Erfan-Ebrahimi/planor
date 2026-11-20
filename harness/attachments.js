import fa from '../resources/js/lang/fa.js'
import { cardCollaboration } from '../resources/js/mocks/collaboration.js'

export const maxFileBytes = 256 * 1024
export const maxUploadBytes = 768 * 1024
export const maxCardFiles = 10
const types = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', txt: 'text/plain' }
const previewLimit = 16 * 1024
const maxPixels = 4096 ** 2

export function fileName(value) {
  if (typeof value !== 'string') return null
  const name = value.trim().normalize('NFC')
  if (!name || name.length > 120 || name.startsWith('.') || /[\p{Cc}\u202a-\u202e\u2066-\u2069<>:"/\\|?*]/u.test(name)) return null
  const extension = name.split('.').at(-1).toLowerCase()
  if (!name.includes('.') || !Object.hasOwn(types, extension)) return null
  return { name, extension, type: types[extension] }
}

function bytesToBase64(bytes) {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return globalThis.btoa(binary)
}

function decodeText(bytes) {
  return new globalThis.TextDecoder('utf-8', { fatal: true }).decode(bytes)
}

function rasterSize(bytes, type) {
  const data = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  if (type === 'image/png') {
    if (bytes.length < 33 || data.getUint32(0) !== 0x89504e47 || data.getUint32(4) !== 0x0d0a1a0a
      || data.getUint32(8) !== 13 || data.getUint32(12) !== 0x49484452) return null
    return [data.getUint32(16), data.getUint32(20)]
  }
  if (bytes.length < 4 || data.getUint16(0) !== 0xffd8) return null
  let offset = 2
  while (offset + 4 <= bytes.length && bytes[offset] === 0xff) {
    const marker = bytes[offset + 1]
    if (marker === 0xff) { offset += 1; continue }
    if (marker === 0xd9 || marker === 0xda) break
    const length = data.getUint16(offset + 2)
    if (length < 2 || offset + 2 + length > bytes.length) break
    if ([0xc0, 0xc1, 0xc2].includes(marker) && length >= 8) {
      return [data.getUint16(offset + 7), data.getUint16(offset + 5)]
    }
    offset += length + 2
  }
  return null
}

export async function readUpload(form, signal) {
  const file = form instanceof globalThis.FormData ? form.get('file') : null
  const info = fileName(file?.name)
  if (!(file instanceof globalThis.Blob) || !info || (file.type && file.type !== 'application/octet-stream' && file.type !== info.type)) {
    return { errors: { file: fa.attachment.typeError } }
  }
  if (file.size === 0 || file.size > maxFileBytes) return { errors: { file: fa.attachment.sizeError } }
  try {
    const bytes = new Uint8Array(await file.arrayBuffer())
    if (signal?.aborted) return { changed: false }
    if (info.type === 'text/plain') {
      const text = decodeText(bytes)
      if (/\p{Cc}/u.test(text.replace(/[\t\r\n]/gu, ''))) return { errors: { file: fa.attachment.typeError } }
    } else {
      const size = rasterSize(bytes, info.type)
      if (!size || size.some((dimension) => dimension < 1 || dimension > 4096) || size[0] * size[1] > maxPixels) {
        return { errors: { file: fa.attachment.typeError } }
      }
    }
    return { file: { ...info, size: bytes.length, content: bytesToBase64(bytes) } }
  } catch {
    return { errors: { file: fa.attachment.readError } }
  }
}

export function cardFiles(card) {
  return card.attachments ?? (cardCollaboration[card.id]?.files ?? []).map(({ text, ...file }) => {
    const bytes = new globalThis.TextEncoder().encode(text)
    return { ...file, ...fileName(file.name), size: bytes.length, content: bytesToBase64(bytes) }
  })
}

export function projectFiles(card, members) {
  return cardFiles(card).flatMap(({ content, ...file }) => {
    const info = fileName(file.name)
    if (!info || info.type !== file.type || typeof content !== 'string' || content.length > 4 * Math.ceil(maxFileBytes / 3)
      || !/^[A-Za-z0-9+/]+={0,2}$/u.test(content)) return []
    const image = info.type !== 'text/plain'
    const downloadUrl = 'data:' + (image ? info.type : 'application/octet-stream') + ';base64,' + content
    let previewText = null
    if (!image && file.size <= previewLimit) {
      try { previewText = decodeText(Uint8Array.from(globalThis.atob(content), (character) => character.charCodeAt(0))) } catch { /* Download remains available. */ }
    }
    return [{ ...file, downloadUrl, isImage: image, previewText, author: members.find(({ id }) => id === file.authorId)?.name }]
  })
}

export function changeAttachment(card, { method, itemId, data, upload, accountId, serial, now, uploadBytes }) {
  const files = cardFiles(card)
  if (method === 'post' && !itemId) {
    if (!upload?.file) return upload || { errors: { file: fa.attachment.readError } }
    if (files.length >= maxCardFiles || uploadBytes + upload.file.size > maxUploadBytes) {
      return { errors: { file: fa.attachment.limitError } }
    }
    card.attachments = [...files, { ...upload.file, id: `file-review-${serial}`, createdAt: now, authorId: accountId }]
    return { changed: true }
  }
  const file = files.find(({ id }) => id === itemId)
  if (!file) return { errors: { file: fa.attachment.unavailable } }
  if (method === 'patch') {
    const name = fileName(data.name)
    if (!name || name.extension !== file.extension) return { errors: { file: fa.attachment.nameError } }
    if (name.name === file.name) return { changed: false }
    card.attachments = files.map((entry) => entry.id === itemId ? { ...entry, name: name.name } : entry)
    return { changed: true }
  }
  if (method === 'delete') {
    card.attachments = files.filter(({ id }) => id !== itemId)
    return { changed: true }
  }
  return { errors: { file: fa.attachment.unavailable } }
}
