import { createClientPageResult, normalizePageResult, resolveEmptyPageResult, toRecord } from '@/api/helper'
import type { PageResult } from '@/types/api'
import type { CommentItem, CommentQuery } from '@/types/business'
import { ACCOUNT_TYPE } from '@/enum/role'
import { CommentStatus } from '@/enum/status'
import { formatDateTime } from '@/utils/date'
import { http } from '@/utils/request'

function isOperatorSession() {
  if (typeof window === 'undefined') return false

  try {
    const raw = localStorage.getItem('user')
    if (!raw) return false
    const parsed = JSON.parse(raw) as { userInfo?: { accountType?: string | number } }
    const accountType = parsed.userInfo?.accountType
    return accountType === ACCOUNT_TYPE.operator || accountType === 4 || accountType === '4'
  } catch {
    return false
  }
}

function normalizeCommentStatus(value: unknown): CommentStatus {
  return Number(value) === 1 ? CommentStatus.Deleted : CommentStatus.Normal
}

function normalizeCommentItem(raw: unknown): CommentItem {
  const source = toRecord(raw)

  return {
    id: String(source.id || ''),
    orderNo: String(source.orderNo || source.orderId || ''),
    enterpriseName: String(source.enterpriseName || source.demandEnterpriseName || source.demandUserId || '-'),
    projectName: String(source.projectName || source.serviceName || source.institutionId || '-'),
    score: Number(source.score || 0),
    content: String(source.content || ''),
    status: normalizeCommentStatus(source.status),
    appealStatus: 'none',
    violated: Number(source.status || 0) === 1,
    createdAt: formatDateTime(source.createTime || source.createdAt, { fallback: '' }),
  }
}

export function getCommentList(params?: CommentQuery): Promise<PageResult<CommentItem>> {
  if (!isOperatorSession()) {
    return resolveEmptyPageResult<CommentItem>(params)
  }

  const shouldUseClientFilter = Boolean(params?.keyword || params?.score || params?.appealStatus)

  return http<unknown>({
    url: '/api/trade/order/evaluate/admin/list',
    method: 'get',
    params: {
      page: shouldUseClientFilter ? 1 : params?.pageNum || 1,
      size: shouldUseClientFilter ? Math.max(Number(params?.pageSize || 10) * 10, 200) : params?.pageSize || 10,
    },
  }).then((res) => {
    const page = normalizePageResult(res, normalizeCommentItem, params)
    const keyword = String(params?.keyword || '').trim().toLowerCase()

    const filtered = page.list.filter((item) => {
      const matchKeyword =
        !keyword ||
        [item.orderNo, item.enterpriseName, item.projectName, item.content]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(keyword))
      const matchScore = !params?.score || String(item.score) === String(params.score)
      const matchAppeal = !params?.appealStatus || item.appealStatus === params.appealStatus
      return matchKeyword && matchScore && matchAppeal
    })

    return shouldUseClientFilter ? createClientPageResult(filtered, params) : page
  })
}

export function deleteComment(id: string): Promise<boolean> {
  return http<boolean>({
    url: `/api/admin/admin/evaluation/${id}`,
    method: 'delete',
  }).then(() => true)
}
