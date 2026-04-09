import type { PageResult } from '@/types/api'
import type { GoodsForm, GoodsItem, GoodsQuery } from '@/types/business'
import { http } from '@/utils/request'
import { isUseMock } from '../helper'
import { mockDeleteGoods, mockGetGoodsList, mockSaveGoods } from '@/mock/modules/mall'

export function getGoodsList(params?: GoodsQuery): Promise<PageResult<GoodsItem>> {
  if (isUseMock()) return mockGetGoodsList(params)
  return http<PageResult<GoodsItem>>({ url: '/mall/goods/page', method: 'get', params })
}

export function saveGoods(payload: GoodsForm & { id?: string }): Promise<boolean> {
  if (isUseMock()) return mockSaveGoods(payload)
  return http<boolean>({ url: '/mall/goods', method: 'post', data: payload })
}

export function deleteGoods(id: string): Promise<boolean> {
  if (isUseMock()) return mockDeleteGoods(id)
  return http<boolean>({ url: `/mall/goods/${id}`, method: 'delete' })
}
