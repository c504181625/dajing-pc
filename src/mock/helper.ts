import type { PageResult } from '@/types/api'

export function mockPromise<T>(data: T, timeout = 140): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(structuredClone(data)), timeout)
  })
}

export function createPageResult<T>(list: T[], pageNum = 1, pageSize = 10): PageResult<T> {
  return {
    list,
    pageNum,
    pageSize,
    total: list.length,
  }
}
