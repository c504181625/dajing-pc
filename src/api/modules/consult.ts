import { createClientPageResult, normalizePageResult, resolveEmptyValue, toRecord } from '@/api/helper'
import type { PageResult } from '@/types/api'
import type { ConsultDetail, ConsultItem, ConsultQuery } from '@/types/business'
import { ACCOUNT_TYPE } from '@/enum/role'
import { ConsultStatus, OperationStatus } from '@/enum/status'
import { http } from '@/utils/request'

function isOperatorSession() {
  if (typeof window === 'undefined') return false

  try {
    const raw = localStorage.getItem('user')
    if (!raw) return false
    const parsed = JSON.parse(raw) as { userInfo?: { accountType?: string } }
    return parsed.userInfo?.accountType === ACCOUNT_TYPE.operator
  } catch {
    return false
  }
}

function normalizeConsultStatus(value: unknown): ConsultStatus {
  const status = Number(value)
  if (status === 1) return ConsultStatus.Replied
  if (status === 2) return ConsultStatus.Closed

  const text = String(value || '').toLowerCase()
  if (text.includes('reply')) return ConsultStatus.Replied
  if (text.includes('close')) return ConsultStatus.Closed
  return ConsultStatus.Pending
}

function normalizeConsultItem(raw: unknown): ConsultItem {
  const source = toRecord(raw)
  return {
    id: String(source.id || ''),
    title: String(source.reqType || source.title || '服务咨询'),
    enterpriseName: String(source.enterpriseName || source.contactName || ''),
    contactName: String(source.contactName || ''),
    contactPhone: String(source.contactPhone || ''),
    status: normalizeConsultStatus(source.status),
    createdAt: String(source.createTime || source.createdAt || ''),
  }
}

function buildConsultDetail(raw: unknown, id: string): ConsultDetail {
  const source = toRecord(raw)
  const item = normalizeConsultItem(raw)
  const attachmentUrl = String(source.attachmentUrl || '')

  return {
    ...item,
    id: item.id || id,
    content: String(source.content || ''),
    attachments: attachmentUrl
      ? [
          {
            id: `${id}-attachment`,
            name: '咨询附件',
            url: attachmentUrl,
            fileType: attachmentUrl.split('.').pop() || 'file',
          },
        ]
      : [],
    replyRecords: source.replyContent
      ? [
          {
            id: `${id}-reply`,
            title: '已回复',
            time: String(source.replyTime || source.updateTime || ''),
            description: String(source.replyContent || ''),
            status: OperationStatus.Done,
            operator: '平台处理人',
          },
        ]
      : [
          {
            id: `${id}-submit`,
            title: '待处理',
            time: String(source.createTime || source.createdAt || ''),
            description: '咨询已提交，等待平台处理。',
            status: OperationStatus.Processing,
          },
        ],
  }
}

function buildStatusQuery(status?: string) {
  if (status === ConsultStatus.Replied) return 1
  if (status === ConsultStatus.Closed) return 2
  if (status === ConsultStatus.Pending) return 0
  return undefined
}

export function getConsultList(params?: ConsultQuery): Promise<PageResult<ConsultItem>> {
  if (isOperatorSession()) {
    return http<unknown>({
      url: '/api/base/consultation/admin/list',
      method: 'get',
      params: {
        page: params?.keyword ? 1 : params?.pageNum || 1,
        size: params?.keyword ? Math.max(Number(params?.pageSize || 10) * 10, 200) : params?.pageSize || 10,
        status: buildStatusQuery(params?.status),
      },
    }).then((res) => {
      const page = normalizePageResult(res, normalizeConsultItem, params)
      const keyword = String(params?.keyword || '').trim().toLowerCase()
      if (!keyword) return page

      const filtered = page.list.filter((item) =>
        [item.title, item.enterpriseName, item.contactName, item.contactPhone]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(keyword)),
      )

      return createClientPageResult(filtered, params)
    })
  }

  return http<unknown>({
    url: '/api/base/consultation/my',
    method: 'get',
  }).then((res) => {
    const page = normalizePageResult(Array.isArray(res) ? { records: res } : res, normalizeConsultItem, params)
    const keyword = String(params?.keyword || '').trim().toLowerCase()
    if (!keyword) return page

    const filtered = page.list.filter((item) =>
      [item.title, item.enterpriseName, item.contactName, item.contactPhone]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(keyword)),
    )

    return createClientPageResult(filtered, params)
  })
}

export function getConsultDetail(id: string): Promise<ConsultDetail> {
  return http<unknown>({
    url: `/api/base/consultation/${id}`,
    method: 'get',
  })
    .then((res) => buildConsultDetail(res, id))
    .catch(() =>
      resolveEmptyValue<ConsultDetail>({
        id,
        title: '',
        enterpriseName: '',
        contactName: '',
        contactPhone: '',
        status: ConsultStatus.Pending,
        createdAt: '',
        content: '',
        attachments: [],
        replyRecords: [],
      }),
    )
}

export function replyConsult(id: string, content: string): Promise<boolean> {
  return http<boolean>({
    url: `/api/base/consultation/admin/${id}/reply`,
    method: 'put',
    params: {
      replyContent: content,
    },
  }).then(() => true)
}

export function deleteConsult(id: string): Promise<boolean> {
  return http<boolean>({
    url: `/api/base/consultation/admin/${id}/close`,
    method: 'put',
  }).then(() => true)
}
