import { resolveEmptyPageResult, resolveEmptyValue } from '@/api/helper'
import type { PageResult } from '@/types/api'
import type { GoodsForm, GoodsItem, GoodsQuery } from '@/types/business'

export function getGoodsList(params?: GoodsQuery): Promise<PageResult<GoodsItem>> {
  return resolveEmptyPageResult<GoodsItem>(params)
}

export function saveGoods(_payload: GoodsForm): Promise<boolean> {
  return resolveEmptyValue(true)
}

export function deleteGoods(_id: string): Promise<boolean> {
  return resolveEmptyValue(true)
}
