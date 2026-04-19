import type { InvoiceInfoForm, InvoiceInfoItem } from '@/types/account'
import { toRecord } from '@/api/helper'
import { http } from '@/utils/request'

function normalizeInvoiceInfo(raw: unknown): InvoiceInfoItem {
  const source = toRecord(raw)

  return {
    id: String(source.id || ''),
    invoiceType: Number(source.invoiceType || 0),
    title: String(source.title || ''),
    taxNo: source.taxNo ? String(source.taxNo) : undefined,
    bankName: source.bankName ? String(source.bankName) : undefined,
    bankAccount: source.bankAccount ? String(source.bankAccount) : undefined,
    registerAddress: source.registerAddress ? String(source.registerAddress) : undefined,
    registerPhone: source.registerPhone ? String(source.registerPhone) : undefined,
    isDefault: Boolean(source.isDefault),
    createTime: source.createTime ? String(source.createTime) : undefined,
    updateTime: source.updateTime ? String(source.updateTime) : undefined,
  }
}

export function getInvoiceInfoList(): Promise<InvoiceInfoItem[]> {
  return http<unknown[]>({
    url: '/api/user/invoice-info',
    method: 'get',
  }).then((res) => (Array.isArray(res) ? res : []).map((item) => normalizeInvoiceInfo(item)))
}

export function getDefaultInvoiceInfo(): Promise<InvoiceInfoItem | null> {
  return http<unknown>({
    url: '/api/user/invoice-info/default',
    method: 'get',
  }).then((res) => {
    if (!res) return null
    return normalizeInvoiceInfo(res)
  })
}

export function getInvoiceInfoDetail(id: string): Promise<InvoiceInfoItem> {
  return http<unknown>({
    url: `/api/user/invoice-info/${id}`,
    method: 'get',
  }).then((res) => normalizeInvoiceInfo(res))
}

export function createInvoiceInfo(payload: InvoiceInfoForm): Promise<string> {
  return http<number>({
    url: '/api/user/invoice-info',
    method: 'post',
    data: payload,
  }).then((res) => String(res || ''))
}

export function updateInvoiceInfo(id: string, payload: InvoiceInfoForm): Promise<boolean> {
  return http<void>({
    url: `/api/user/invoice-info/${id}`,
    method: 'put',
    data: payload,
  }).then(() => true)
}

export function deleteInvoiceInfo(id: string): Promise<boolean> {
  return http<void>({
    url: `/api/user/invoice-info/${id}`,
    method: 'delete',
  }).then(() => true)
}

export function setDefaultInvoiceInfo(id: string): Promise<boolean> {
  return http<void>({
    url: `/api/user/invoice-info/${id}/default`,
    method: 'put',
  }).then(() => true)
}
