import { resolveEmptyPageResult, resolveEmptyValue } from '@/api/helper'
import type { PageResult } from '@/types/api'
import type { ServiceForm, ServiceItem, ServiceQuery } from '@/types/business'

export function getServiceList(params?: ServiceQuery): Promise<PageResult<ServiceItem>> {
  return resolveEmptyPageResult<ServiceItem>(params)
}

export function saveService(_payload: ServiceForm & { id?: string }): Promise<boolean> {
  return resolveEmptyValue(true)
}

export function toggleServiceStatus(_id: string): Promise<boolean> {
  return resolveEmptyValue(true)
}

export function deleteService(_id: string): Promise<boolean> {
  return resolveEmptyValue(true)
}
