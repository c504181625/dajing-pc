import type { PageResult } from '@/types/api'

export function mockPromise<T>(data: T, timeout = 140): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(structuredClone(data)), timeout)
  })
}

export function createPageResult<T>(list: T[], pageNum = 1, pageSize = 10): PageResult<T> {
  const currentPage = Math.max(1, Number(pageNum) || 1)
  const currentSize = Math.max(1, Number(pageSize) || 10)
  const start = (currentPage - 1) * currentSize

  return {
    list: list.slice(start, start + currentSize),
    pageNum: currentPage,
    pageSize: currentSize,
    total: list.length,
  }
}
