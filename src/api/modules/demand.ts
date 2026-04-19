import {
  createClientPageResult,
  normalizeListPayload,
  normalizePageResult,
  resolveEmptyValue,
  toRecord,
} from '@/api/helper'
import type { OptionItem } from '@/types/api'
import type { PageResult } from '@/types/api'
import type { DemandDetail, DemandForm, DemandItem, DemandQuery } from '@/types/business'
import { ACCOUNT_TYPE } from '@/enum/role'
import { DemandStatus, OperationStatus, PublishMode, ServiceType } from '@/enum/status'
import { formatDateTime } from '@/utils/date'
import { http } from '@/utils/request'

const OPERATOR_DEMAND_LOCAL_KEY = 'dj:operator:demand-process'

export interface DemandAssignPayload {
  institutionId?: string
  institutionName: string
}

export interface DemandInstitutionOption extends OptionItem {
  value: string
  label: string
}

export interface DemandTransferPayload extends DemandForm {
  sourceRecordId?: string
  sourceAttachments?: string[]
  isPublic?: boolean
  priority?: string
  designatedInstitutionId?: string
  designatedInstitutionName?: string
  remark?: string
}

interface OperatorDemandLocalState {
  assignedOrg?: string
  assignedInstitutionId?: string
  transferDemandId?: string
  transferDemandTitle?: string
  invalidClosed?: boolean
  operations?: {
    id?: string
    title: string
    time: string
    description: string
    status: OperationStatus
    operator?: string
  }[]
}

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

function isBrowser() {
  return typeof window !== 'undefined'
}

function getCurrentOperatorName() {
  if (!isBrowser()) return '平台运营'

  try {
    const raw = localStorage.getItem('user')
    if (!raw) return '平台运营'
    const parsed = JSON.parse(raw) as { userInfo?: { name?: string; nickname?: string } }
    return String(parsed.userInfo?.name || parsed.userInfo?.nickname || '平台运营')
  } catch {
    return '平台运营'
  }
}

function readOperatorDemandStates(): Record<string, OperatorDemandLocalState> {
  if (!isBrowser()) return {}

  try {
    const raw = localStorage.getItem(OPERATOR_DEMAND_LOCAL_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, OperatorDemandLocalState>) : {}
  } catch {
    return {}
  }
}

function writeOperatorDemandStates(value: Record<string, OperatorDemandLocalState>) {
  if (!isBrowser()) return
  localStorage.setItem(OPERATOR_DEMAND_LOCAL_KEY, JSON.stringify(value))
}

function getOperatorDemandState(id: string) {
  return readOperatorDemandStates()[id] || {}
}

function updateOperatorDemandState(id: string, updater: (state: OperatorDemandLocalState) => OperatorDemandLocalState) {
  const all = readOperatorDemandStates()
  all[id] = updater(all[id] || {})
  writeOperatorDemandStates(all)
}

function normalizeDemandStatus(value: unknown): DemandStatus {
  const status = Number(value)
  if (status === 1) return DemandStatus.Assigned
  if (status === 2) return DemandStatus.Replied
  if (status === 3) return DemandStatus.Processing
  if (status === 4) return DemandStatus.Completed
  if (status === 5) return DemandStatus.Closed

  const text = String(value || '').toLowerCase()
  if (text.includes('close') || text.includes('invalid')) return DemandStatus.Closed
  if (text.includes('assign')) return DemandStatus.Assigned
  if (text.includes('reply')) return DemandStatus.Replied
  if (text.includes('process')) return DemandStatus.Processing
  if (text.includes('complete')) return DemandStatus.Completed
  if (text.includes('close')) return DemandStatus.Closed
  return DemandStatus.Pending
}

function normalizeServiceType(value: unknown): ServiceType {
  const text = String(value || '').toLowerCase()
  if (text.includes('标准')) return ServiceType.Standard
  if (text.includes('计量')) return ServiceType.Metrology
  if (text.includes('认证')) return ServiceType.Certification
  if (text.includes('诊断')) return ServiceType.Diagnosis
  if (text.includes('培训')) return ServiceType.Training
  if (text.includes('检验') || text.includes('检测')) return ServiceType.Inspection
  if (text.includes('metro')) return ServiceType.Metrology
  if (text.includes('cert')) return ServiceType.Certification
  if (text.includes('diagnosis')) return ServiceType.Diagnosis
  if (text.includes('training')) return ServiceType.Training
  if (text.includes('inspect')) return ServiceType.Inspection
  return ServiceType.Standard
}

function normalizePublishMode(value: unknown): PublishMode {
  const text = String(value || '').toLowerCase()
  if (text.includes('自主') || text.includes('self')) return PublishMode.SelfSelect
  if (text.includes('self')) return PublishMode.SelfSelect
  return PublishMode.PlatformAssign
}

function splitAttachments(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((item, index) => {
        if (typeof item === 'string') {
          return {
            id: `attachment-${index + 1}`,
            name: `附件 ${index + 1}`,
            url: item,
            fileType: item.split('.').pop() || 'file',
          }
        }

        const record = toRecord(item)
        const url = String(record.url || record.fileUrl || record.attachmentUrl || '')
        if (!url) return null

        return {
          id: String(record.id || `attachment-${index + 1}`),
          name: String(record.name || record.fileName || `附件 ${index + 1}`),
          url,
          fileType: String(record.fileType || url.split('.').pop() || 'file'),
        }
      })
      .filter((item): item is { id: string; name: string; url: string; fileType: string } => !!item)
  }

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

function normalizeOperatorDemandStatus(value: unknown, localState: OperatorDemandLocalState) {
  if (localState.invalidClosed) return DemandStatus.Closed
  if (localState.transferDemandId) return DemandStatus.Processing

  const baseStatus = Number(value)
  if (baseStatus === 1) return DemandStatus.Replied
  if (baseStatus === 2) return DemandStatus.Closed
  if (localState.assignedOrg) return DemandStatus.Assigned
  return DemandStatus.Pending
}

function normalizeOperatorDemandItem(raw: unknown): DemandItem {
  const source = toRecord(raw)
  const id = String(source.id || '')
  const localState = getOperatorDemandState(id)

  return {
    id,
    title: String(source.title || source.reqType || '服务需求'),
    serviceType: normalizeServiceType(source.reqType || source.serviceType || source.category),
    enterpriseName: String(source.enterpriseName || source.companyName || source.orgName || ''),
    publishMode: PublishMode.PlatformAssign,
    status: normalizeOperatorDemandStatus(source.status, localState),
    createdAt: formatDateTime(source.createTime || source.createdAt, { fallback: '' }),
    assignedOrg: localState.assignedOrg,
    contactName: String(source.contactName || ''),
    contactPhone: String(source.contactPhone || ''),
  }
}

function sortTimeline(nodes: {
  id?: string
  title: string
  time: string
  description: string
  status: OperationStatus
  operator?: string
}[]) {
  return [...nodes].sort((prev, next) => {
    const prevTime = Date.parse(prev.time || '')
    const nextTime = Date.parse(next.time || '')
    if (Number.isNaN(prevTime) && Number.isNaN(nextTime)) return 0
    if (Number.isNaN(prevTime)) return -1
    if (Number.isNaN(nextTime)) return 1
    return prevTime - nextTime
  })
}

function buildOperatorDemandDetail(raw: unknown, id: string): DemandDetail {
  const source = toRecord(raw)
  const localState = getOperatorDemandState(id)
  const item = normalizeOperatorDemandItem(raw)
  const attachments = splitAttachments(source.attachments || source.attachmentUrl)
  const sourceReply = String(source.replyContent || '').trim()

  const nodes = [
    {
      id: `${id}-submit`,
      title: '需求已提交',
      time: formatDateTime(source.createTime || source.createdAt, { fallback: '' }),
      description: '当前需求来源于用户提交的服务诉求，平台可继续回复、分配机构或转为正式需求。',
      status: OperationStatus.Done,
      operator: source.contactName ? `提交人：${String(source.contactName)}` : undefined,
    },
    ...(sourceReply
      ? [
          {
            id: `${id}-reply`,
            title: '平台已回复',
            time: formatDateTime(source.replyTime || source.updateTime, { fallback: '' }),
            description: sourceReply,
            status: OperationStatus.Done,
            operator: getCurrentOperatorName(),
          },
        ]
      : []),
    ...((localState.operations || []).map((item) => ({
      ...item,
      status: item.status || OperationStatus.Processing,
    })) as DemandDetail['replyRecords']),
  ]

  return {
    ...item,
    id: item.id || id,
    content: String(source.content || source.reqContent || source.additionalReq || source.remark || ''),
    attachments,
    replyRecords: sortTimeline(nodes),
  }
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
    createdAt: formatDateTime(source.createdAt || source.createTime, { fallback: '' }),
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
        time: formatDateTime(source.createTime || source.createdAt, { fallback: '' }),
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
      url: '/api/base/consultation/admin/list',
      method: 'get',
      params: {
        page: params?.keyword || params?.status || params?.serviceType ? 1 : params?.pageNum || 1,
        size:
          params?.keyword || params?.status || params?.serviceType
            ? Math.max(Number(params?.pageSize || 10) * 10, 200)
            : params?.pageSize || 10,
        status:
          params?.status === DemandStatus.Replied
            ? 1
            : params?.status === DemandStatus.Closed
              ? 2
              : undefined,
      },
    }).then((res) => {
      const page = normalizePageResult(res, normalizeOperatorDemandItem, params)
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
  if (isOperatorSession()) {
    return http<unknown>({
      url: `/api/base/consultation/${id}`,
      method: 'get',
    })
      .then((res) => buildOperatorDemandDetail(res, id))
      .catch(() =>
        resolveEmptyValue<DemandDetail>({
          ...normalizeOperatorDemandItem({ id }),
          content: '',
          attachments: [],
          replyRecords: [],
        }),
      )
  }

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

export function replyDemand(id: string, content: string): Promise<boolean> {
  if (isOperatorSession()) {
    return http<boolean>({
      url: `/api/base/consultation/admin/${id}/reply`,
      method: 'put',
      params: {
        replyContent: content,
      },
    }).then(() => true)
  }

  return resolveEmptyValue(true)
}

export function assignDemand(id: string, payload: string | DemandAssignPayload): Promise<boolean> {
  if (isOperatorSession()) {
    const institutionName = typeof payload === 'string' ? payload : payload.institutionName
    const institutionId = typeof payload === 'string' ? '' : String(payload.institutionId || '')

    // 最新 OpenAPI 暂无“运营方分配机构”接口，这里先保留前端交互与本地追溯记录，
    // 待后端补充正式指派接口后可直接替换为真实写入。
    updateOperatorDemandState(id, (state) => ({
      ...state,
      assignedOrg: institutionName,
      assignedInstitutionId: institutionId,
      operations: [
        ...(state.operations || []),
        {
          id: `${id}-assign-${Date.now()}`,
          title: '已分配机构',
          time: formatDateTime(new Date().toISOString(), { fallback: '' }),
          description: `已将当前记录分配给机构：${institutionName}${institutionId ? `（ID：${institutionId}）` : ''}`,
          status: OperationStatus.Processing,
          operator: getCurrentOperatorName(),
        },
      ],
    }))

    return resolveEmptyValue(true)
  }

  return resolveEmptyValue(true)
}

export function searchDemandInstitutions(keyword = ''): Promise<DemandInstitutionOption[]> {
  return http<unknown>({
    url: '/api/base/institution/search',
    method: 'get',
    params: {
      keyword: keyword || undefined,
      page: 1,
      size: 20,
    },
  })
    .then((res) => normalizeListPayload(res))
    .then((list) =>
      list
        .map((item) => {
          const source = toRecord(item)
          const value = String(source.id || source.institutionId || '')
          const label = String(source.name || source.institutionName || source.enterpriseName || '')
          if (!value && !label) return null
          return {
            value: value || label,
            label: label || `机构 ${value}`,
          } satisfies DemandInstitutionOption
        })
        .filter(Boolean) as DemandInstitutionOption[],
    )
}

export function createDemand(payload: DemandForm | DemandTransferPayload): Promise<string> {
  const transferPayload = payload as DemandTransferPayload
  const remarkParts = [
    transferPayload.remark || '',
    transferPayload.sourceRecordId ? `来源记录ID：${transferPayload.sourceRecordId}` : '',
    typeof transferPayload.isPublic === 'boolean'
      ? `公开范围：${transferPayload.isPublic ? '公开需求池' : '仅平台处理'}`
      : '',
    transferPayload.priority ? `优先级：${transferPayload.priority}` : '',
    transferPayload.designatedInstitutionName
      ? `指定机构：${transferPayload.designatedInstitutionName}`
      : '',
    transferPayload.sourceAttachments?.length
      ? `来源附件：${transferPayload.sourceAttachments.join('；')}`
      : '',
  ].filter(Boolean)

  return http<string | number>({
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
      remark: remarkParts.join('\n'),
    },
  }).then((res) => String(res || ''))
}

export function transferDemand(id: string, payload: DemandTransferPayload): Promise<string> {
  return createDemand(payload).then((demandId) => {
    if (isOperatorSession()) {
      updateOperatorDemandState(id, (state) => ({
        ...state,
        transferDemandId: demandId,
        transferDemandTitle: payload.title,
        operations: [
          ...(state.operations || []),
          {
            id: `${id}-transfer-${Date.now()}`,
            title: '已转为正式需求',
            time: formatDateTime(new Date().toISOString(), { fallback: '' }),
            description: [
              `已生成需求单：${payload.title}`,
              demandId ? `需求单 ID：${demandId}` : '',
              payload.designatedInstitutionName ? `指定机构：${payload.designatedInstitutionName}` : '',
              payload.priority ? `优先级：${payload.priority}` : '',
              typeof payload.isPublic === 'boolean'
                ? `公开设置：${payload.isPublic ? '公开到需求池' : '仅平台内部跟进'}`
                : '',
              payload.remark ? `备注：${payload.remark}` : '',
            ]
              .filter(Boolean)
              .join('；'),
            status: OperationStatus.Done,
            operator: getCurrentOperatorName(),
          },
        ],
      }))
    }

    return demandId
  })
}

export function closeDemand(id: string, reason: string): Promise<boolean> {
  if (isOperatorSession()) {
    return http<boolean>({
      url: `/api/base/consultation/admin/${id}/close`,
      method: 'put',
    }).then(() => {
      updateOperatorDemandState(id, (state) => ({
        ...state,
        invalidClosed: true,
        operations: [
          ...(state.operations || []),
          {
            id: `${id}-close-${Date.now()}`,
            title: '已标记无效',
            time: formatDateTime(new Date().toISOString(), { fallback: '' }),
            description: reason || '运营已关闭当前记录。',
            status: OperationStatus.Warning,
            operator: getCurrentOperatorName(),
          },
        ],
      }))
      return true
    })
  }

  return resolveEmptyValue(true)
}

export function acceptDemand(_id: string): Promise<boolean> {
  return resolveEmptyValue(true)
}

export function deleteDemand(id: string): Promise<boolean> {
  if (isOperatorSession()) {
    return http<boolean>({
      url: `/api/base/consultation/admin/${id}/close`,
      method: 'put',
    }).then(() => {
      updateOperatorDemandState(id, (state) => ({
        ...state,
        invalidClosed: true,
        operations: [
          ...(state.operations || []),
          {
            id: `${id}-delete-${Date.now()}`,
            title: '记录已关闭',
            time: formatDateTime(new Date().toISOString(), { fallback: '' }),
            description: '运营方已在列表中关闭当前记录。',
            status: OperationStatus.Warning,
            operator: getCurrentOperatorName(),
          },
        ],
      }))
      return true
    })
  }

  return http<boolean>({
    url: `/api/trade/demand/${id}/close`,
    method: 'put',
  }).then(() => true)
}
