import type { LogisticsAddressItem, LogisticsQuery, LogisticsTrackItem } from '@/types/business'
import { createPageResult, mockPromise } from '../helper'

const logisticsTracks: LogisticsTrackItem[] = [
  {
    id: 'log-001',
    orderNo: 'QI202604080001',
    trackingNo: 'SF1234567890',
    logisticsCompany: '顺丰速运',
    receiverName: '张工',
    receiverPhone: '13800009999',
    address: '江苏省苏州市工业园区东长路 88 号',
    thirdPartyCode: 'sf',
    thirdPartyStatus: 'TRANSIT',
    latestNode: '样品运输中，预计今日送达',
    updatedAt: '2026-04-08 11:20:00',
  },
]

let logisticsAddresses: LogisticsAddressItem[] = [
  {
    id: 'addr-001',
    contactName: '张工',
    contactPhone: '13800009999',
    province: '江苏省',
    city: '苏州市',
    district: '工业园区',
    detailAddress: '东长路 88 号收样中心',
    postalCode: '215000',
    thirdPartyWarehouseCode: 'WH_SUZHOU_001',
    remark: '检测样品默认收样地址',
  },
]

export function mockGetLogisticsTrackList(_params?: LogisticsQuery) {
  return mockPromise(createPageResult(logisticsTracks))
}

export function mockGetLogisticsAddressList(_params?: LogisticsQuery) {
  return mockPromise(createPageResult(logisticsAddresses))
}

export function mockSaveLogisticsAddress(payload: LogisticsAddressItem) {
  const target = logisticsAddresses.find((item) => item.id === payload.id)
  if (target) {
    Object.assign(target, payload)
  } else {
    logisticsAddresses.unshift({ ...payload, id: `addr-${Date.now()}` })
  }
  return mockPromise(true)
}

export function mockDeleteLogisticsAddress(id: string) {
  logisticsAddresses = logisticsAddresses.filter((item) => item.id !== id)
  return mockPromise(true)
}
