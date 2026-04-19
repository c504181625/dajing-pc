import { resolveEmptyPageResult, resolveEmptyValue } from '@/api/helper'
import type { PageResult } from '@/types/api'
import type {
  LogisticsAddressItem,
  LogisticsAddressItem as LogisticsAddressForm,
  LogisticsQuery,
  LogisticsTrackItem,
} from '@/types/business'

export function getLogisticsTrackList(
  params?: LogisticsQuery,
): Promise<PageResult<LogisticsTrackItem>> {
  return resolveEmptyPageResult<LogisticsTrackItem>(params)
}

export function getLogisticsAddressList(
  params?: LogisticsQuery,
): Promise<PageResult<LogisticsAddressItem>> {
  return resolveEmptyPageResult<LogisticsAddressItem>(params)
}

export function saveLogisticsAddress(_payload: LogisticsAddressForm): Promise<boolean> {
  return resolveEmptyValue(true)
}

export function deleteLogisticsAddress(_id: string): Promise<boolean> {
  return resolveEmptyValue(true)
}
