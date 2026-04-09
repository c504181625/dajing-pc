import { GoodsStatus } from '@/enum/status'
import type { GoodsForm, GoodsItem, GoodsQuery } from '@/types/business'
import { createPageResult, mockPromise } from '../helper'

let goodsList: GoodsItem[] = [
  { id: 'goods-001', goodsCode: 'SKU-001', goodsName: '质量工具包', categoryName: '培训资料', specification: '标准版', status: GoodsStatus.OnSale, priceText: '¥299/套', updatedAt: '2026-04-08 09:00:00' },
  { id: 'goods-002', goodsCode: 'SKU-002', goodsName: '检测耗材包', categoryName: '实验用品', specification: 'A 型', status: GoodsStatus.OffSale, priceText: '¥499/箱', updatedAt: '2026-04-07 17:00:00' },
]

export function mockGetGoodsList(params?: GoodsQuery) {
  let list = [...goodsList]
  const keyword = String(params?.keyword || '').trim()
  const status = String(params?.status || '')
  if (keyword) list = list.filter((item) => [item.goodsCode, item.goodsName, item.categoryName, item.specification].some((field) => field.includes(keyword)))
  if (status) list = list.filter((item) => item.status === status)
  return mockPromise(createPageResult(list))
}

export function mockSaveGoods(payload: GoodsForm & { id?: string }) {
  if (payload.id) {
    const target = goodsList.find((item) => item.id === payload.id)
    if (target) Object.assign(target, payload, { updatedAt: new Date().toLocaleString('zh-CN', { hour12: false }) })
  } else {
    goodsList.unshift({ id: `goods-${Date.now()}`, ...payload, updatedAt: new Date().toLocaleString('zh-CN', { hour12: false }) })
  }
  return mockPromise(true)
}

export function mockDeleteGoods(id: string) {
  goodsList = goodsList.filter((item) => item.id !== id)
  return mockPromise(true)
}
