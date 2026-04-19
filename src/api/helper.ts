import type { ListQuery, PageResult } from '@/types/api'

export function isUseMock() {
  return import.meta.env.VITE_USE_MOCK === 'true'
}

export function isUseOpenApi() {
  return !isUseMock()
}

export function mockPromise<T>(data: T, timeout = 160): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(structuredClone(data)), timeout)
  })
}

export function toRecord(raw: unknown): Record<string, unknown> {
  return raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
}

export function getRecordValue(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = source[key]
    if (value !== undefined && value !== null) {
      return value
    }
  }
  return undefined
}

export function normalizeListPayload(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw

  const source = toRecord(raw)
  const candidates = ['records', 'list', 'content', 'items', 'rows']

  for (const key of candidates) {
    if (Array.isArray(source[key])) {
      return source[key] as unknown[]
    }
  }

  return []
}

export function createEmptyPageResult<T>(params?: Partial<ListQuery>, pageSize = 20): PageResult<T> {
  const pageNum = Number(params?.pageNum || 1)
  const size = Number(params?.pageSize || pageSize)
  return {
    list: [],
    records: [],
    total: 0,
    pageNum,
    pageSize: size,
    current: pageNum,
    size,
    pages: 0,
  }
}

export function resolveEmptyPageResult<T>(params?: Partial<ListQuery>, pageSize = 20) {
  return Promise.resolve(createEmptyPageResult<T>(params, pageSize))
}

export function resolveEmptyList<T>(value: T[] = []) {
  return Promise.resolve(value)
}

export function resolveEmptyValue<T>(value: T) {
  return Promise.resolve(value)
}

export function normalizePageResult<T>(
  raw: unknown,
  mapper: (item: unknown) => T,
  params?: Partial<ListQuery>,
  defaultPageSize = 20,
): PageResult<T> {
  const source = toRecord(raw)
  const list = normalizeListPayload(raw).map((item) => mapper(item))
  const total = Number(
    getRecordValue(source, ['total', 'totalElements', 'count']) ?? list.length,
  )
  const pageNum = Number(
    getRecordValue(source, ['current', 'pageNum', 'page', 'number']) ??
      params?.pageNum ??
      1,
  )
  const pageSize = Number(
    getRecordValue(source, ['size', 'pageSize']) ?? params?.pageSize ?? defaultPageSize,
  )
  const pages = Number(
    getRecordValue(source, ['pages']) ?? (pageSize > 0 ? Math.ceil(total / pageSize) : 0),
  )

  return {
    list,
    records: list,
    total,
    pageNum,
    pageSize,
    current: pageNum,
    size: pageSize,
    pages,
  }
}

export function createClientPageResult<T>(
  items: T[],
  params?: Partial<ListQuery>,
  defaultPageSize = 20,
): PageResult<T> {
  const pageNum = Number(params?.pageNum || 1)
  const pageSize = Number(params?.pageSize || defaultPageSize)
  const start = Math.max(0, (pageNum - 1) * pageSize)
  const list = items.slice(start, start + pageSize)
  const total = items.length

  return {
    list,
    records: list,
    total,
    pageNum,
    pageSize,
    current: pageNum,
    size: pageSize,
    pages: pageSize > 0 ? Math.ceil(total / pageSize) : 0,
  }
}
