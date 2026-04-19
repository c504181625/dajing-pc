import { createClientPageResult, normalizePageResult, resolveEmptyValue, toRecord } from '@/api/helper'
import type { PageResult } from '@/types/api'
import type { DemandDetail, DemandForm, DemandItem, DemandQuery } from '@/types/business'
import { ACCOUNT_TYPE } from '@/enum/role'
import { DemandStatus, OperationStatus, PublishMode, ServiceType } from '@/enum/status'
import { http } from '@/utils/request'

function readSessionUser() {
  if (typeof window === 'undefined') {
    return { accountType: '', enterpriseTags: [] as string[] }
  }

  try {
    const raw = localStorage.getItem('user')
    if (!raw) return { accountType: '', enterpriseTags: [] as string[] }
    const parsed = JSON.parse(raw) as {
      userInfo?: { accountType?: string; enterpriseTags?: string[]; enterpriseCapabilities?: string[] }
    }
    const userInfo = parsed.userInfo || {}
    return {
      accountType: String(userInfo.accountType || ''),
      enterpriseTags: (userInfo.enterpriseTags || userInfo.enterpriseCapabilities || []) as string[],
    }
  } catch {
    return { accountType: '', enterpriseTags: [] as string[] }
  }
}

function isOperatorSession() {
  return readSessionUser().accountType === ACCOUNT_TYPE.operator
}

function isProviderSession() {
  const { enterpriseTags } = readSessionUser()
  return enterpriseTags.includes('provider') || enterpriseTags.includes('service_provider')
}

function normalizeDemandStatus(value: unknown): DemandStatus {
  const status = Number(value)
  if (status === 1) return DemandStatus.Assigned
  if (status === 2) return DemandStatus.Replied
  if (status === 3) return DemandStatus.Processing
  if (status === 4) return DemandStatus.Completed
  if (status === 5) return DemandStatus.Closed

  const text = String(value || '').toLowerCase()
  if (text.includes('assign')) return DemandStatus.Assigned
  if (text.includes('reply')) return DemandStatus.Replied
  if (text.includes('process')) return DemandStatus.Processing
  if (text.includes('complete')) return DemandStatus.Completed
  if (text.includes('close')) return DemandStatus.Closed
  return DemandStatus.Pending
}

function normalizeServiceType(value: unknown): ServiceType {
  const text = String(value || '').toLowerCase()
  if (text.includes('metro')) return ServiceType.Metrology
  if (text.includes('cert')) return ServiceType.Certification
  if (text.includes('diagnosis')) return ServiceType.Diagnosis
  if (text.includes('training')) return ServiceType.Training
  if (text.includes('inspect')) return ServiceType.Inspection
  return ServiceType.Standard
}

function normalizePublishMode(value: unknown): PublishMode {
  const text = String(value || '').toLowerCase()
  if (text.includes('self')) return PublishMode.SelfSelect
  return PublishMode.PlatformAssign
}

function splitAttachments(value: unknown) {
  return String(value || '')
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((url, index) => ({
      id: `attachment-${index + 1}`,
      name: `附件 ${index + 1}`,
      url,
      fileType: url.split('.').pop() || 'file',
    }))
}

function normalizeDemandItem(raw: unknown): DemandItem {
  const source = toRecord(raw)

  return {
    id: String(source.id || source.demandId || ''),
    title: String(source.title || source.demandTitle || ''),
    serviceType: normalizeServiceType(source.category || source.serviceType),
    enterpriseName: String(source.enterpriseName || source.publisherName || source.contactName || ''),
    publishMode: normalizePublishMode(source.publishMode || source.publishModeDesc),
    status: normalizeDemandStatus(source.statusDesc || source.status),
    createdAt: String(source.createdAt || source.createTime || ''),
    assignedOrg: source.institutionName ? String(source.institutionName) : undefined,
    contactName: String(source.contactName || source.publisherName || ''),
    contactPhone: String(source.contactPhone || source.phone || ''),
  }
}

function buildDemandDetail(raw: unknown, id: string): DemandDetail {
  const source = toRecord(raw)
  const item = normalizeDemandItem(raw)

  return {
    ...item,
    id: item.id || id,
    content: String(
      source.additionalReq || source.remark || source.sampleDesc || source.testProject || '',
    ),
    attachments: splitAttachments(source.attachments),
    replyRecords: [
      {
        id: `${id}-submit`,
        title: '需求已提交',
        time: String(source.createTime || source.createdAt || ''),
        description: '当前需求详情已接入 QIP 真实接口。',
        status: OperationStatus.Done,
      },
    ],
  }
}

function buildDemandStatusQuery(status?: string) {
  if (!status) return undefined
  return status
}

export function getDemandList(params?: DemandQuery): Promise<PageResult<DemandItem>> {
  if (isOperatorSession()) {
    return http<unknown>({
      url: '/api/admin/admin/order/demands',
      method: 'get',
      params: {
        page:
          params?.keyword || params?.status || params?.serviceType
            ? 1
            : params?.pageNum || 1,
        size:
          params?.keyword || params?.status || params?.serviceType
            ? Math.max(Number(params?.pageSize || 10) * 10, 200)
            : params?.pageSize || 10,
      },
    }).then((res) => {
      const page = normalizePageResult(res, normalizeDemandItem, params)
      const keyword = String(params?.keyword || '').trim().toLowerCase()

      const filtered = page.list.filter((item) => {
        const matchKeyword =
          !keyword ||
          [item.title, item.enterpriseName, item.assignedOrg, item.contactName]
            .filter(Boolean)
            .some((field) => String(field).toLowerCase().includes(keyword))
        const matchStatus = !params?.status || item.status === params.status
        const matchServiceType = !params?.serviceType || item.serviceType === params.serviceType

        return matchKeyword && matchStatus && matchServiceType
      })

      return createClientPageResult(filtered, params)
    })
  }

  const isProvider = isProviderSession()
  return http<unknown>({
    url: isProvider ? '/api/trade/demand/hall' : '/api/trade/demand/my',
    method: 'get',
    params: {
      page: params?.pageNum || 1,
      size: params?.pageSize || 10,
      category: params?.serviceType || undefined,
      status: buildDemandStatusQuery(params?.status),
    },
  }).then((res) => {
    const page = normalizePageResult(res, normalizeDemandItem, params)
    const keyword = String(params?.keyword || '').trim().toLowerCase()
    if (!keyword) return page

    const filtered = page.list.filter((item) =>
      [item.title, item.enterpriseName, item.assignedOrg, item.contactName]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(keyword)),
    )

    return createClientPageResult(filtered, params)
  })
}

export function getDemandDetail(id: string): Promise<DemandDetail> {
  return http<unknown>({
    url: `/api/trade/demand/${id}`,
    method: 'get',
  })
    .then((res) => buildDemandDetail(res, id))
    .catch(() =>
      resolveEmptyValue<DemandDetail>({
        ...normalizeDemandItem({ id }),
        content: '',
        attachments: [],
        replyRecords: [],
      }),
    )
}

export function replyDemand(_id: string, _content: string): Promise<boolean> {
  return resolveEmptyValue(true)
}

export function assignDemand(_id: string, _orgName: string): Promise<boolean> {
  return resolveEmptyValue(true)
}

export function createDemand(payload: DemandForm): Promise<boolean> {
  return http<boolean>({
    url: '/api/trade/demand/publish',
    method: 'post',
    data: {
      title: payload.title,
      contactName: payload.contactName,
      contactPhone: payload.contactPhone,
      sampleName: payload.title,
      sampleCount: 1,
      additionalReq: payload.content,
      category: payload.serviceType,
    },
  }).then(() => true)
}

export function acceptDemand(_id: string): Promise<boolean> {
  return resolveEmptyValue(true)
}

export function deleteDemand(id: string): Promise<boolean> {
  if (isOperatorSession()) {
    return resolveEmptyValue(true)
  }

  return http<boolean>({
    url: `/api/trade/demand/${id}/close`,
    method: 'put',
  }).then(() => true)
}
