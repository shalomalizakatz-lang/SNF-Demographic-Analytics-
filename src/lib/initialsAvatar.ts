/** Deterministic per-facility color + initials, so placeholder cards are at least visually distinct. */
const PALETTE = [
  '#0f4c5c',
  '#0ea5e9',
  '#7c3aed',
  '#dc2626',
  '#059669',
  '#d97706',
  '#4338ca',
  '#be185d',
  '#0891b2',
  '#65a30d'
]

const STOPWORDS = new Set(['the', 'of', 'for', 'and', 'at', 'a', 'an'])

export function getInitials(name: string): string {
  const words = name
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z]/g, ''))
    .filter((w) => w.length > 0 && !STOPWORDS.has(w.toLowerCase()))

  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

export function getAvatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0
  }
  return PALETTE[Math.abs(hash) % PALETTE.length]
}
