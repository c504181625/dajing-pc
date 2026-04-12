import type { PageResult } from '@/types/api'
import type { ConsultDetail, ConsultItem, ConsultQuery } from '@/types/business'
import { http } from '@/utils/request'
import { isUseMock } from '../helper'
import {
  mockDeleteConsult,
  mockGetConsultDetail,
  mockGetConsultList,
  mockReplyConsult,
} from '@/mock/modules/consult'

export function getConsultList(params?: ConsultQuery): Promise<PageResult<ConsultItem>> {
  if (isUseMock()) return mockGetConsultList(params)
  return http<PageResult<ConsultItem>>({ url: '/consult/page', method: 'get', params })
}

export function getConsultDetail(id: string): Promise<ConsultDetail> {
  if (isUseMock()) return mockGetConsultDetail(id)
  return http<ConsultDetail>({ url: `/consult/${id}`, method: 'get' })
}

export function replyConsult(id: string, content: string): Promise<boolean> {
  if (isUseMock()) return mockReplyConsult(id, content)
  return http<boolean>({ url: `/consult/${id}/reply`, method: 'post', data: { content } })
}

export function deleteConsult(id: string): Promise<boolean> {
  if (isUseMock()) return mockDeleteConsult(id)
  return http<boolean>({ url: `/consult/${id}`, method: 'delete' })
}
