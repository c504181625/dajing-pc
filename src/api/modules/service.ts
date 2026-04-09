import type { PageResult } from '@/types/api'
import type { ServiceForm, ServiceItem, ServiceQuery } from '@/types/business'
import { http } from '@/utils/request'
import { isUseMock } from '../helper'
import { mockDeleteService, mockGetServiceList, mockSaveService, mockToggleServiceStatus } from '@/mock/modules/service'

export function getServiceList(params?: ServiceQuery): Promise<PageResult<ServiceItem>> {
  if (isUseMock()) return mockGetServiceList(params)
  return http<PageResult<ServiceItem>>({ url: '/enterprise/service/page', method: 'get', params })
}

export function saveService(payload: ServiceForm & { id?: string; enterpriseId?: string; enterpriseName?: string }): Promise<boolean> {
  if (isUseMock()) return mockSaveService(payload)
  return http<boolean>({ url: '/enterprise/service', method: 'post', data: payload })
}

export function toggleServiceStatus(id: string): Promise<boolean> {
  if (isUseMock()) return mockToggleServiceStatus(id)
  return http<boolean>({ url: `/enterprise/service/${id}/toggle-status`, method: 'post' })
}

export function deleteService(id: string): Promise<boolean> {
  if (isUseMock()) return mockDeleteService(id)
  return http<boolean>({ url: `/enterprise/service/${id}`, method: 'delete' })
}
