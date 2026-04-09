import type { PageResult } from '@/types/api'
import type { OrderDetail, OrderItem } from '@/types/business'
import { http } from '@/utils/request'
import { isUseMock } from '../helper'
import { mockForceCloseOrder, mockGetOrderDetail, mockGetOrderList } from '@/mock/modules/order'

export function getOrderList(params?: Record<string, unknown>): Promise<PageResult<OrderItem>> {
  if (isUseMock()) return mockGetOrderList(params)
  return http<PageResult<OrderItem>>({ url: '/order/page', method: 'get', params })
}

export function getOrderDetail(id: string): Promise<OrderDetail> {
  if (isUseMock()) return mockGetOrderDetail(id)
  return http<OrderDetail>({ url: `/order/${id}`, method: 'get' })
}

export function forceCloseOrder(id: string, reason: string): Promise<boolean> {
  if (isUseMock()) return mockForceCloseOrder(id, reason)
  return http<boolean>({ url: `/order/${id}/force-close`, method: 'post', data: { reason } })
}
