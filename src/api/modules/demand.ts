import type { PageResult } from '@/types/api'
import type { DemandDetail, DemandForm, DemandItem, DemandQuery } from '@/types/business'
import { http } from '@/utils/request'
import { isUseMock } from '../helper'
import {
  mockAssignDemand,
  mockAcceptDemand,
  mockCreateDemand,
  mockDeleteDemand,
  mockGetDemandDetail,
  mockGetDemandList,
  mockReplyDemand,
} from '@/mock/modules/demand'

export function getDemandList(params?: DemandQuery): Promise<PageResult<DemandItem>> {
  if (isUseMock()) return mockGetDemandList(params)
  return http<PageResult<DemandItem>>({ url: '/demand/page', method: 'get', params })
}

export function getDemandDetail(id: string): Promise<DemandDetail> {
  if (isUseMock()) return mockGetDemandDetail(id)
  return http<DemandDetail>({ url: `/demand/${id}`, method: 'get' })
}

export function replyDemand(id: string, content: string): Promise<boolean> {
  if (isUseMock()) return mockReplyDemand(id, content)
  return http<boolean>({ url: `/demand/${id}/reply`, method: 'post', data: { content } })
}

export function assignDemand(id: string, orgName: string): Promise<boolean> {
  if (isUseMock()) return mockAssignDemand(id, orgName)
  return http<boolean>({ url: `/demand/${id}/assign`, method: 'post', data: { orgName } })
}

export function createDemand(payload: DemandForm): Promise<boolean> {
  if (isUseMock()) return mockCreateDemand(payload)
  return http<boolean>({ url: '/demand', method: 'post', data: payload })
}

export function acceptDemand(id: string): Promise<boolean> {
  if (isUseMock()) return mockAcceptDemand(id)
  return http<boolean>({ url: `/demand/${id}/accept`, method: 'post' })
}

export function deleteDemand(id: string): Promise<boolean> {
  if (isUseMock()) return mockDeleteDemand(id)
  return http<boolean>({ url: `/demand/${id}`, method: 'delete' })
}
