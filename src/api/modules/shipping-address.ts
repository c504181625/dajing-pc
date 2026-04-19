import { resolveEmptyValue, toRecord } from '@/api/helper'
import type { ShippingAddressForm, ShippingAddressItem } from '@/types/account'
import { formatDateTime } from '@/utils/date'
import { http } from '@/utils/request'

function normalizeShippingAddress(raw: unknown): ShippingAddressItem {
  const source = toRecord(raw)
  const region = String(source.region || '')
  const detailAddress = String(source.detailAddress || source.address || '')

  return {
    id: String(source.id || ''),
    contactName: String(source.contactName || ''),
    contactPhone: String(source.contactPhone || ''),
    region,
    detailAddress,
    isDefault: Boolean(source.isDefault),
    fullAddress: [region, detailAddress].filter(Boolean).join(' '),
    createTime: source.createTime ? formatDateTime(source.createTime) : undefined,
    updateTime: source.updateTime ? formatDateTime(source.updateTime) : undefined,
  }
}

export function getShippingAddressList(): Promise<ShippingAddressItem[]> {
  return http<unknown[]>({
    url: '/api/user/shipping-address',
    method: 'get',
  }).then((res) => (Array.isArray(res) ? res : []).map((item) => normalizeShippingAddress(item)))
}

export function getDefaultShippingAddress(): Promise<ShippingAddressItem | null> {
  return http<unknown>({
    url: '/api/user/shipping-address/default',
    method: 'get',
  }).then((res) => {
    if (!res) return null
    return normalizeShippingAddress(res)
  })
}

export function getShippingAddressDetail(id: string): Promise<ShippingAddressItem> {
  return http<unknown>({
    url: `/api/user/shipping-address/${id}`,
    method: 'get',
  }).then((res) => normalizeShippingAddress(res))
}

export function createShippingAddress(payload: ShippingAddressForm): Promise<string> {
  return http<number>({
    url: '/api/user/shipping-address',
    method: 'post',
    data: payload,
  }).then((res) => String(res || ''))
}

export function updateShippingAddress(id: string, payload: ShippingAddressForm): Promise<boolean> {
  return http<void>({
    url: `/api/user/shipping-address/${id}`,
    method: 'put',
    data: payload,
  }).then(() => true)
}

export function deleteShippingAddress(id: string): Promise<boolean> {
  return http<void>({
    url: `/api/user/shipping-address/${id}`,
    method: 'delete',
  }).then(() => true)
}

export function setDefaultShippingAddress(id: string): Promise<boolean> {
  return http<void>({
    url: `/api/user/shipping-address/${id}/default`,
    method: 'put',
  }).then(() => true)
}

export function saveShippingAddress(
  payload: ShippingAddressForm & { id?: string },
): Promise<boolean | string> {
  if (payload.id) {
    return updateShippingAddress(payload.id, payload)
  }

  return createShippingAddress(payload)
}

export function getShippingAddressOrEmpty(): Promise<ShippingAddressItem | null> {
  return getDefaultShippingAddress().catch(() => resolveEmptyValue(null))
}
