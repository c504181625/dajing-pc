import {
  createClientPageResult,
  createEmptyPageResult,
  isUseMock,
  normalizePageResult,
  toRecord,
} from '@/api/helper'
import type { PageResult } from '@/types/api'
import type {
  EnterpriseAuditQuery,
  OperatorEnterpriseServiceDetail,
  OperatorEnterpriseServiceItem,
  OperatorEnterpriseServiceQuery,
  ServiceForm,
  ServiceItem,
  ServiceQuery,
} from '@/types/business'
import { ServiceShelfStatus, ServiceType } from '@/enum/status'
import { formatDateTime } from '@/utils/date'
import { http } from '@/utils/request'
import {
  mockDeleteService,
  mockGetServiceList,
  mockSaveService,
  mockToggleServiceStatus,
} from '@/mock/modules/service'
import {
  mockGetEnterpriseAuditDetail,
  mockGetEnterpriseAuditList,
} from '@/mock/modules/enterprise'

import { getEnterpriseAuditDetail, getEnterpriseAuditList } from './enterprise'

const DEFAULT_SERVICE_PAGE_SIZE = 10
const SERVICE_FETCH_SIZE = 200
const INSTITUTION_LOOKUP_PAGE_SIZE = 100
const DEFAULT_SERVICE_PRICE = 0.01
const DEFAULT_SERVICE_CYCLE_DAYS = 7

type InstitutionSummary = {
  id: string
  enterpriseId: string
  name: string
}

type ServiceSavePayload = ServiceForm & {
  id?: string
  enterpriseId?: string
  enterpriseName?: string
  institutionId?: string
}

function toOptionalNumber(value: unknown) {
  if (value === undefined || value === null || value === '') return undefined
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : undefined
}

function buildEmptyServiceQuery(params?: ServiceQuery): ServiceQuery {
  return {
    pageNum: Number(params?.pageNum || 1),
    pageSize: Number(params?.pageSize || DEFAULT_SERVICE_PAGE_SIZE),
    keyword: String(params?.keyword || ''),
    scope: params?.scope || 'self',
    serviceType: params?.serviceType || '',
    status: params?.status || '',
  }
}

function buildOperatorEnterpriseQuery(
  params?: OperatorEnterpriseServiceQuery,
): EnterpriseAuditQuery {
  return {
    pageNum: Number(params?.pageNum || 1),
    pageSize: Number(params?.pageSize || DEFAULT_SERVICE_PAGE_SIZE),
    keyword: String(params?.keyword || ''),
    status: params?.status || '',
    serviceType: params?.serviceType || '',
  }
}

function normalizeServiceStatus(value: unknown): ServiceShelfStatus {
  const status = Number(value)
  if (status === 1) return ServiceShelfStatus.Enabled
  if (status === 2) return ServiceShelfStatus.Reviewing
  return ServiceShelfStatus.Disabled
}

function serializeServiceStatus(value?: ServiceQuery['status']) {
  if (value === ServiceShelfStatus.Enabled) return 1
  if (value === ServiceShelfStatus.Disabled) return 0
  return undefined
}

function normalizeServiceType(_value?: unknown): ServiceType {
  return ServiceType.Inspection
}

function formatServicePrice(value?: number) {
  if (typeof value !== 'number' || Number.isNaN(value) || value < 0) return ''
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.?0+$/, '')
}

function buildServicePriceText(source: Record<string, unknown>) {
  const price = Number(source.price)
  const cycleDays = Number(source.cycleDays)
  const urgentSupported = Number(source.supportUrgent) === 1
  const urgentExtraFee = Number(source.urgentExtraFee)

  const segments = [
    Number.isFinite(price) ? `￥${formatServicePrice(price)}` : '',
    Number.isFinite(cycleDays) && cycleDays > 0 ? `${cycleDays}天` : '',
    urgentSupported
      ? Number.isFinite(urgentExtraFee) && urgentExtraFee > 0
        ? `加急 +￥${formatServicePrice(urgentExtraFee)}`
        : '支持加急'
      : '',
  ].filter(Boolean)

  return segments.join(' / ')
}

function normalizeInstitutionSummary(raw: unknown): InstitutionSummary {
  const source = toRecord(raw)

  return {
    id: String(source.id || source.institutionId || ''),
    enterpriseId: String(source.enterpriseId || ''),
    name: String(source.name || source.institutionName || source.enterpriseName || ''),
  }
}

function normalizeServiceItem(raw: unknown): ServiceItem {
  const source = toRecord(raw)
  const price = Number(source.price)
  const cycleDays = Number(source.cycleDays)
  const urgentExtraFee = Number(source.urgentExtraFee)
  const sort = Number(source.sort)
  const viewCount = Number(source.viewCount)
  const orderCount = Number(source.orderCount)
  const inspectionItemId = String(source.inspectionItemId || '')

  return {
    id: String(source.id || ''),
    institutionId: String(source.institutionId || ''),
    enterpriseId: String(source.enterpriseId || ''),
    enterpriseName: String(source.enterpriseName || ''),
    inspectionItemId: inspectionItemId || undefined,
    serviceCode: inspectionItemId || undefined,
    serviceName: String(source.serviceName || ''),
    serviceType: normalizeServiceType(source.serviceType),
    categoryCode: String(source.category || ''),
    categoryName: String(source.category || ''),
    specification: String(source.defaultStd || source.sampleType || ''),
    sampleType: String(source.sampleType || ''),
    defaultStd: String(source.defaultStd || ''),
    targetCustomer: String(source.sampleType || ''),
    priceText: buildServicePriceText(source),
    status: normalizeServiceStatus(source.status),
    updatedAt: formatDateTime(source.updateTime || source.createTime, { fallback: '' }),
    description: String(source.description || ''),
    price: Number.isFinite(price) ? price : undefined,
    cycleDays: Number.isFinite(cycleDays) && cycleDays > 0 ? cycleDays : undefined,
    supportCma: Number(source.supportCma) === 1,
    supportCnas: Number(source.supportCnas) === 1,
    supportUrgent: Number(source.supportUrgent) === 1,
    urgentExtraFee:
      Number.isFinite(urgentExtraFee) && urgentExtraFee >= 0 ? urgentExtraFee : undefined,
    coverUrl: String(source.coverUrl || ''),
    sort: Number.isFinite(sort) ? sort : undefined,
    viewCount: Number.isFinite(viewCount) ? viewCount : undefined,
    orderCount: Number.isFinite(orderCount) ? orderCount : undefined,
  }
}

function matchServiceKeyword(item: ServiceItem, keyword: string) {
  if (!keyword.trim()) return true

  const text = keyword.trim().toLowerCase()
  const fields = [
    item.serviceCode,
    item.inspectionItemId,
    item.serviceName,
    item.categoryCode,
    item.categoryName,
    item.specification,
    item.description,
    item.defaultStd,
    item.sampleType,
    item.priceText,
  ]

  return fields.some((value) => String(value || '').toLowerCase().includes(text))
}

function isSameOperatorServiceOwner(
  item: ServiceItem,
  params?: { enterpriseId?: string; enterpriseName?: string; institutionId?: string },
) {
  if (!params?.enterpriseId && !params?.enterpriseName && !params?.institutionId) return true

  return Boolean(
    (params.enterpriseId && item.enterpriseId === params.enterpriseId) ||
      (params.enterpriseName && item.enterpriseName === params.enterpriseName) ||
      (params.institutionId && item.institutionId === params.institutionId),
  )
}

function filterServiceItems(
  items: ServiceItem[],
  params?: ServiceQuery & { enterpriseId?: string; enterpriseName?: string; institutionId?: string },
) {
  if (!params) return items

  return items.filter((item) => {
    if (!isSameOperatorServiceOwner(item, params)) return false
    if (params.status && item.status !== params.status) return false
    if (params.serviceType && params.serviceType !== ServiceType.Inspection) return false
    if (!matchServiceKeyword(item, String(params.keyword || ''))) return false
    return true
  })
}

function buildEnterpriseServiceStats(
  services: ServiceItem[],
  enterpriseId: string,
  enterpriseName: string,
) {
  const matched = services.filter(
    (item) => item.enterpriseId === enterpriseId || item.enterpriseName === enterpriseName,
  )
  const latest = matched
    .map((item) => item.updatedAt)
    .filter(Boolean)
    .sort((a, b) => String(b).localeCompare(String(a)))[0]

  return {
    serviceTotal: matched.length,
    enabledServiceCount: matched.filter((item) => item.status === ServiceShelfStatus.Enabled).length,
    disabledServiceCount: matched.filter((item) => item.status === ServiceShelfStatus.Disabled).length,
    latestServiceUpdate: latest || '',
  }
}

function normalizeOperatorEnterpriseServiceItem(
  source: Awaited<ReturnType<typeof getEnterpriseAuditList>>['list'][number],
  services: ServiceItem[],
): OperatorEnterpriseServiceItem {
  const stats = buildEnterpriseServiceStats(services, source.id, source.enterpriseName)

  return {
    id: source.id,
    enterpriseId: source.id,
    enterpriseName: source.enterpriseName,
    socialCreditCode: source.socialCreditCode,
    contactName: source.contactName,
    contactPhone: source.contactPhone,
    enterpriseType: source.enterpriseType,
    serviceTypes: source.serviceTypes,
    status: source.status,
    submitTime: source.submitTime,
    serviceTotal: isUseMock() ? stats.serviceTotal : null,
    enabledServiceCount: isUseMock() ? stats.enabledServiceCount : null,
    disabledServiceCount: isUseMock() ? stats.disabledServiceCount : null,
    latestServiceUpdate: isUseMock()
      ? formatDateTime(stats.latestServiceUpdate, { fallback: '' })
      : undefined,
  }
}

function parseServicePrice(value?: string) {
  const matched = String(value || '').match(/\d+(?:\.\d+)?/)
  const price = matched ? Number(matched[0]) : NaN
  if (Number.isFinite(price) && price > 0) return price
  return DEFAULT_SERVICE_PRICE
}

function parseServiceCycleDays(value?: string) {
  const matched = String(value || '').match(/(\d+)\s*天/)
  const days = matched ? Number(matched[1]) : NaN
  if (Number.isFinite(days) && days > 0) return days
  return DEFAULT_SERVICE_CYCLE_DAYS
}

function buildServicePayload(payload: ServiceSavePayload) {
  const rawCode = String(payload.inspectionItemId || payload.serviceCode || '').trim()
  const inspectionItemId = toOptionalNumber(rawCode)
  const price =
    typeof payload.price === 'number' && Number.isFinite(payload.price) && payload.price > 0
      ? payload.price
      : parseServicePrice(payload.priceText)
  const cycleDays =
    typeof payload.cycleDays === 'number' &&
    Number.isFinite(payload.cycleDays) &&
    payload.cycleDays > 0
      ? payload.cycleDays
      : parseServiceCycleDays(payload.priceText)

  return {
    serviceName: payload.serviceName,
    category: payload.categoryCode || '检测服务',
    sampleType: payload.sampleType || payload.targetCustomer || undefined,
    defaultStd: payload.defaultStd || payload.specification || undefined,
    price,
    cycleDays,
    supportCma: payload.supportCma ? 1 : 0,
    supportCnas: payload.supportCnas ? 1 : 0,
    supportUrgent: payload.supportUrgent ? 1 : 0,
    urgentExtraFee:
      payload.supportUrgent && typeof payload.urgentExtraFee === 'number'
        ? payload.urgentExtraFee
        : undefined,
    description: payload.description || undefined,
    coverUrl: payload.coverUrl || undefined,
    inspectionItemId,
    enterpriseId: toOptionalNumber(payload.enterpriseId),
    institutionId: toOptionalNumber(payload.institutionId),
    sort: typeof payload.sort === 'number' ? payload.sort : 0,
  }
}

async function findInstitutionByEnterprise(
  enterpriseId: string,
  enterpriseName: string,
): Promise<InstitutionSummary | null> {
  const page = await http<unknown>({
    url: '/api/base/institution/list',
    method: 'get',
    params: {
      keyword: enterpriseName || undefined,
      page: 1,
      size: INSTITUTION_LOOKUP_PAGE_SIZE,
    },
  }).then((res) =>
    normalizePageResult(res, normalizeInstitutionSummary, {
      pageNum: 1,
      pageSize: INSTITUTION_LOOKUP_PAGE_SIZE,
    }),
  )

  const exactByEnterpriseId = page.list.find((item) => item.enterpriseId === enterpriseId)
  if (exactByEnterpriseId) return exactByEnterpriseId

  const exactByName = page.list.find((item) => item.name === enterpriseName)
  if (exactByName) return exactByName

  return page.list.find((item) => item.name.includes(enterpriseName)) || null
}

function fetchMyServicesPage(params?: ServiceQuery) {
  return http<unknown>({
    url: '/api/base/institution/service/my',
    method: 'get',
    params: {
      status: serializeServiceStatus(params?.status),
      page: params?.pageNum || 1,
      size: params?.pageSize || DEFAULT_SERVICE_PAGE_SIZE,
    },
  }).then((res) => normalizePageResult(res, normalizeServiceItem, params, DEFAULT_SERVICE_PAGE_SIZE))
}

async function fetchMyServicesAll(status?: ServiceQuery['status']) {
  const firstPage = await fetchMyServicesPage({
    pageNum: 1,
    pageSize: SERVICE_FETCH_SIZE,
    status,
  })

  const pages = Number(firstPage.pages || 1)
  if (pages <= 1) return firstPage.list

  const rest = await Promise.all(
    Array.from({ length: pages - 1 }, (_, index) =>
      fetchMyServicesPage({
        pageNum: index + 2,
        pageSize: SERVICE_FETCH_SIZE,
        status,
      }),
    ),
  )

  return [firstPage, ...rest].flatMap((page) => page.list)
}

function updateServiceShelfStatus(id: string, currentStatus: ServiceShelfStatus) {
  return http<unknown>({
    url:
      currentStatus === ServiceShelfStatus.Enabled
        ? `/api/base/institution/service/${id}/unshelve`
        : `/api/base/institution/service/${id}/shelve`,
    method: 'put',
  }).then(() => true)
}

export function hasOperatorServiceAdminApi() {
  return true
}

export function hasOperatorServiceCreateApi() {
  return true
}

export function hasOperatorServiceShelfApi() {
  return true
}

export async function getOperatorEnterpriseServiceList(
  params?: OperatorEnterpriseServiceQuery,
): Promise<PageResult<OperatorEnterpriseServiceItem>> {
  const enterpriseQuery = buildOperatorEnterpriseQuery(params)
  const serviceQuery = buildEmptyServiceQuery({
    pageNum: 1,
    pageSize: 500,
    scope: 'all',
  })

  const [enterprisePage, servicePage] = await Promise.all([
    isUseMock()
      ? mockGetEnterpriseAuditList(enterpriseQuery)
      : getEnterpriseAuditList(enterpriseQuery),
    isUseMock()
      ? mockGetServiceList(serviceQuery)
      : Promise.resolve(createEmptyPageResult<ServiceItem>(serviceQuery, 500)),
  ])

  const mappedList = enterprisePage.list.map((item) =>
    normalizeOperatorEnterpriseServiceItem(item, servicePage.list),
  )
  const filteredList = params?.serviceType
    ? mappedList.filter((item) => item.serviceTypes.includes(params.serviceType as ServiceType))
    : mappedList

  return {
    ...enterprisePage,
    total: filteredList.length,
    list: filteredList,
    records: filteredList,
    pages:
      Number(params?.pageSize || enterprisePage.pageSize || DEFAULT_SERVICE_PAGE_SIZE) > 0
        ? Math.ceil(
            filteredList.length /
              Number(params?.pageSize || enterprisePage.pageSize || DEFAULT_SERVICE_PAGE_SIZE),
          )
        : 0,
  }
}

export async function getOperatorEnterpriseServiceDetail(
  enterpriseId: string,
): Promise<OperatorEnterpriseServiceDetail> {
  const detail = isUseMock()
    ? await mockGetEnterpriseAuditDetail(enterpriseId)
    : await getEnterpriseAuditDetail(enterpriseId)

  return {
    enterpriseId: detail.id,
    enterpriseName: detail.enterpriseName,
    socialCreditCode: detail.socialCreditCode,
    contactName: detail.contactName,
    contactPhone: detail.contactPhone,
    enterpriseType: detail.enterpriseType,
    serviceTypes: detail.serviceTypes,
    address: detail.address,
    email: detail.email,
    intro: detail.remark || '',
    serviceRange: detail.serviceTypes.join(' / '),
    qualificationCount: detail.qualifications?.length || detail.qualificationFiles?.length || 0,
  }
}

export async function getOperatorServiceListByEnterprise(
  enterpriseId: string,
  enterpriseName: string,
  params?: ServiceQuery,
): Promise<PageResult<ServiceItem>> {
  const query = buildEmptyServiceQuery(params)

  if (isUseMock()) {
    return mockGetServiceList({
      ...query,
      scope: 'all',
    }).then((res) => {
      const list = res.list.filter(
        (item) => item.enterpriseId === enterpriseId || item.enterpriseName === enterpriseName,
      )
      return createClientPageResult(list, query)
    })
  }

  const institution = await findInstitutionByEnterprise(enterpriseId, enterpriseName)
  const allServices = await fetchMyServicesAll(query.status)
  const filtered = filterServiceItems(allServices, {
    ...query,
    enterpriseId,
    enterpriseName,
    institutionId: institution?.id,
  })

  return createClientPageResult(filtered, query, DEFAULT_SERVICE_PAGE_SIZE)
}

export function getServiceList(params?: ServiceQuery): Promise<PageResult<ServiceItem>> {
  const query = buildEmptyServiceQuery(params)

  if (isUseMock()) {
    return mockGetServiceList(query)
  }

  if (!query.keyword && !query.serviceType) {
    return fetchMyServicesPage(query)
  }

  return fetchMyServicesAll(query.status).then((list) =>
    createClientPageResult(filterServiceItems(list, query), query, DEFAULT_SERVICE_PAGE_SIZE),
  )
}

export function getServiceDetail(id: string): Promise<ServiceItem> {
  if (isUseMock()) {
    return mockGetServiceList({
      pageNum: 1,
      pageSize: SERVICE_FETCH_SIZE,
      scope: 'all',
    }).then((page) => {
      const matched = page.list.find((item) => item.id === id)
      if (!matched) {
        throw new Error(`未找到服务：${id}`)
      }
      return matched
    })
  }

  return http<unknown>({
    url: `/api/base/institution/service/${id}`,
    method: 'get',
  }).then((res) => normalizeServiceItem(res))
}

export function saveService(payload: ServiceSavePayload): Promise<string> {
  if (isUseMock()) return mockSaveService(payload)

  return http<number | string>({
    url: payload.id ? `/api/base/institution/service/${payload.id}` : '/api/base/institution/service',
    method: payload.id ? 'put' : 'post',
    data: buildServicePayload(payload),
  }).then((res) => String(res || payload.id || ''))
}

export async function toggleServiceStatus(id: string): Promise<boolean> {
  if (isUseMock()) return mockToggleServiceStatus(id)

  const detail = await getServiceDetail(id)
  return updateServiceShelfStatus(id, detail.status)
}

export function deleteService(id: string): Promise<boolean> {
  if (isUseMock()) return mockDeleteService(id)

  return http<unknown>({
    url: `/api/base/institution/service/${id}`,
    method: 'delete',
  }).then(() => true)
}

export function toggleOperatorServiceStatus(
  id: string,
  currentStatus = ServiceShelfStatus.Enabled,
): Promise<boolean> {
  if (isUseMock()) return mockToggleServiceStatus(id)
  return updateServiceShelfStatus(id, currentStatus)
}

export function getOperatorServiceDetail(id: string) {
  return getServiceDetail(id)
}
