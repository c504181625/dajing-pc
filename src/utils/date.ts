function pad(value: number) {
  return String(value).padStart(2, '0')
}

function parseDateLike(value: string) {
  const normalized = value.trim()
  if (!normalized) return null

  const directDate = new Date(normalized)
  if (!Number.isNaN(directDate.getTime())) {
    return directDate
  }

  const match = normalized.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?)?$/,
  )
  if (!match) return null

  const [, year, month, day, hour = '00', minute = '00', second = '00'] = match
  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
  )
}

export function formatDateTime(
  value: unknown,
  options?: {
    withSeconds?: boolean
    fallback?: string
  },
) {
  const fallback = options?.fallback ?? '-'
  if (value === null || value === undefined) return fallback

  const raw = String(value).trim()
  if (!raw) return fallback

  const parsed = parseDateLike(raw)
  if (!parsed) {
    return raw.replace('T', ' ').replace(/\.\d+$/, '')
  }

  const year = parsed.getFullYear()
  const month = pad(parsed.getMonth() + 1)
  const day = pad(parsed.getDate())
  const hour = pad(parsed.getHours())
  const minute = pad(parsed.getMinutes())
  const second = pad(parsed.getSeconds())

  return options?.withSeconds
    ? `${year}-${month}-${day} ${hour}:${minute}:${second}`
    : `${year}-${month}-${day} ${hour}:${minute}`
}
