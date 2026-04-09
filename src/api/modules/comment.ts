import type { PageResult } from '@/types/api'
import type { CommentItem, CommentQuery } from '@/types/business'
import { http } from '@/utils/request'
import { isUseMock } from '../helper'
import { mockDeleteComment, mockGetCommentList } from '@/mock/modules/comment'

export function getCommentList(params?: CommentQuery): Promise<PageResult<CommentItem>> {
  if (isUseMock()) return mockGetCommentList(params)
  return http<PageResult<CommentItem>>({ url: '/comment/page', method: 'get', params })
}

export function deleteComment(id: string): Promise<boolean> {
  if (isUseMock()) return mockDeleteComment(id)
  return http<boolean>({ url: `/comment/${id}`, method: 'delete' })
}
