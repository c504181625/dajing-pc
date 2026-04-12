import type { PageResult } from '@/types/api'
import type { OrderDetail, OrderItem, OrderUpdatePayload } from '@/types/business'
import { http } from '@/utils/request'
import { isUseMock } from '../helper'
import {
  mockAcceptOrder,
  mockDeleteOrder,
  mockForceCloseOrder,
  mockGetOrderDetail,
  mockGetOrderList,
  mockRejectOrder,
  mockUpdateOrderDetail,
} from '@/mock/modules/order'

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

export function updateOrderDetail(id: string, data: OrderUpdatePayload): Promise<boolean> {
  if (isUseMock()) return mockUpdateOrderDetail(id, data)
  return http<boolean>({ url: `/order/${id}`, method: 'put', data })
}

export function acceptOrder(id: string): Promise<boolean> {
  if (isUseMock()) return mockAcceptOrder(id)
  return http<boolean>({ url: `/order/${id}/accept`, method: 'post' })
}

export function rejectOrder(id: string, reason: string): Promise<boolean> {
  if (isUseMock()) return mockRejectOrder(id, reason)
  return http<boolean>({ url: `/order/${id}/reject`, method: 'post', data: { reason } })
}

export function deleteOrder(id: string): Promise<boolean> {
  if (isUseMock()) return mockDeleteOrder(id)
  return http<boolean>({ url: `/order/${id}`, method: 'delete' })
}
