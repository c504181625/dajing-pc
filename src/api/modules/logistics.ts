import type { PageResult } from '@/types/api'
import type { LogisticsAddressItem, LogisticsQuery, LogisticsTrackItem } from '@/types/business'
import { http } from '@/utils/request'
import { isUseMock } from '../helper'
import {
  mockDeleteLogisticsAddress,
  mockGetLogisticsAddressList,
  mockGetLogisticsTrackList,
  mockSaveLogisticsAddress,
} from '@/mock/modules/logistics'

export function getLogisticsTrackList(params?: LogisticsQuery): Promise<PageResult<LogisticsTrackItem>> {
  if (isUseMock()) return mockGetLogisticsTrackList(params)
  return http<PageResult<LogisticsTrackItem>>({ url: '/logistics/track/page', method: 'get', params })
}

export function getLogisticsAddressList(params?: LogisticsQuery): Promise<PageResult<LogisticsAddressItem>> {
  if (isUseMock()) return mockGetLogisticsAddressList(params)
  return http<PageResult<LogisticsAddressItem>>({ url: '/logistics/address/page', method: 'get', params })
}

export function saveLogisticsAddress(payload: LogisticsAddressItem): Promise<boolean> {
  if (isUseMock()) return mockSaveLogisticsAddress(payload)
  return http<boolean>({ url: '/logistics/address', method: 'post', data: payload })
}

export function deleteLogisticsAddress(id: string): Promise<boolean> {
  if (isUseMock()) return mockDeleteLogisticsAddress(id)
  return http<boolean>({ url: `/logistics/address/${id}`, method: 'delete' })
}
