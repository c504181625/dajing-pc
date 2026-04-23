import { ServiceShelfStatus, ServiceType } from '@/enum/status'
import type { ServiceForm, ServiceItem, ServiceQuery } from '@/types/business'

import { getCurrentEnterpriseId, isPlatformMockUser } from '../context'
import { createPageResult, mockPromise } from '../helper'

type ServiceRecord = ServiceItem & {
  enterpriseId: string
  enterpriseName: string
}

let serviceRecords: ServiceRecord[] = [
  {
    id: 'service-001',
    institutionId: 'inst-001',
    enterpriseId: 'ent-001',
    enterpriseName: '苏州智造检测有限公司',
    inspectionItemId: '1001',
    serviceCode: '1001',
    serviceName: '电子元器件可靠性检测',
    serviceType: ServiceType.Inspection,
    categoryCode: '环境可靠性',
    categoryName: '环境可靠性',
    specification: 'GB/T 2423.1-2008',
    defaultStd: 'GB/T 2423.1-2008',
    sampleType: '电子元器件',
    targetCustomer: '电子元器件',
    priceText: '￥1500 / 7天 / 支持加急',
    price: 1500,
    cycleDays: 7,
    supportCma: true,
    supportCnas: true,
    supportUrgent: true,
    urgentExtraFee: 300,
    coverUrl: '',
    status: ServiceShelfStatus.Enabled,
    updatedAt: '2026-04-22 20:10:00',
    description: '覆盖高低温、振动、电性能等检测能力，支持平台标准化委托流程。',
    sort: 1,
    viewCount: 126,
    orderCount: 18,
  },
  {
    id: 'service-002',
    institutionId: 'inst-001',
    enterpriseId: 'ent-001',
    enterpriseName: '苏州智造检测有限公司',
    inspectionItemId: '1002',
    serviceCode: '1002',
    serviceName: '金属材料力学性能测试',
    serviceType: ServiceType.Inspection,
    categoryCode: '力学性能',
    categoryName: '力学性能',
    specification: 'GB/T 228.1-2021',
    defaultStd: 'GB/T 228.1-2021',
    sampleType: '金属材料',
    targetCustomer: '金属材料',
    priceText: '￥1200 / 5天',
    price: 1200,
    cycleDays: 5,
    supportCma: true,
    supportCnas: false,
    supportUrgent: false,
    coverUrl: '',
    status: ServiceShelfStatus.Disabled,
    updatedAt: '2026-04-21 16:22:00',
    description: '适用于钢材、铝材等金属材料的拉伸、弯曲、冲击性能验证。',
    sort: 2,
    viewCount: 53,
    orderCount: 7,
  },
  {
    id: 'service-003',
    institutionId: 'inst-200',
    enterpriseId: 'ent-200',
    enterpriseName: '杭州工研质量技术服务有限公司',
    inspectionItemId: '2001',
    serviceCode: '2001',
    serviceName: '包装材料跌落与振动测试',
    serviceType: ServiceType.Inspection,
    categoryCode: '包装测试',
    categoryName: '包装测试',
    specification: 'ISTA 3A',
    defaultStd: 'ISTA 3A',
    sampleType: '包装材料',
    targetCustomer: '包装材料',
    priceText: '￥980 / 3天',
    price: 980,
    cycleDays: 3,
    supportCma: false,
    supportCnas: true,
    supportUrgent: true,
    urgentExtraFee: 200,
    coverUrl: '',
    status: ServiceShelfStatus.Enabled,
    updatedAt: '2026-04-19 11:30:00',
    description: '针对运输包装与外箱结构开展跌落、振动、冲击和堆码验证。',
    sort: 3,
    viewCount: 88,
    orderCount: 11,
  },
]

function getVisibleServices(params?: ServiceQuery) {
  if (isPlatformMockUser() || params?.scope === 'all') return serviceRecords
  const enterpriseId = getCurrentEnterpriseId()
  return serviceRecords.filter((item) => item.enterpriseId === enterpriseId)
}

export function mockGetServiceList(params?: ServiceQuery) {
  let list = [...getVisibleServices(params)]
  const keyword = String(params?.keyword || '').trim()
  const serviceType = String(params?.serviceType || '')
  const status = String(params?.status || '')

  if (keyword) {
    list = list.filter((item) =>
      [
        item.serviceCode,
        item.inspectionItemId,
        item.serviceName,
        item.targetCustomer,
        item.description,
        item.enterpriseName,
        item.categoryCode,
      ].some((field) => String(field || '').includes(keyword)),
    )
  }
  if (serviceType) list = list.filter((item) => item.serviceType === serviceType)
  if (status) list = list.filter((item) => item.status === status)

  return mockPromise(createPageResult(list))
}

export function mockSaveService(
  payload: ServiceForm & {
    id?: string
    enterpriseId?: string
    enterpriseName?: string
    institutionId?: string
  },
): Promise<string> {
  const enterpriseId = payload.enterpriseId || getCurrentEnterpriseId()
  const enterpriseName =
    payload.enterpriseName ||
    serviceRecords.find((item) => item.enterpriseId === enterpriseId)?.enterpriseName ||
    '平台维护服务'

  if (payload.id) {
    const target = serviceRecords.find((item) => item.id === payload.id)
    if (target) {
      Object.assign(target, payload, {
        inspectionItemId: payload.inspectionItemId || payload.serviceCode || '',
        serviceCode: payload.inspectionItemId || payload.serviceCode || '',
        targetCustomer: payload.sampleType || payload.targetCustomer || '',
        sampleType: payload.sampleType || payload.targetCustomer || '',
        specification: payload.defaultStd || payload.specification || '',
        defaultStd: payload.defaultStd || payload.specification || '',
        updatedAt: new Date().toLocaleString('zh-CN', { hour12: false }),
        enterpriseId,
        enterpriseName,
        institutionId: payload.institutionId || target.institutionId,
      })
    }
    return mockPromise(payload.id)
  }

  const id = `service-${Date.now()}`
  serviceRecords.unshift({
    id,
    institutionId: payload.institutionId || `inst-${enterpriseId}`,
    enterpriseId,
    enterpriseName,
    inspectionItemId: payload.inspectionItemId || payload.serviceCode || '',
    serviceCode: payload.inspectionItemId || payload.serviceCode || '',
    serviceName: payload.serviceName,
    serviceType: payload.serviceType || ServiceType.Inspection,
    categoryCode: payload.categoryCode || '检测服务',
    categoryName: payload.categoryCode || '检测服务',
    specification: payload.defaultStd || payload.specification || '',
    defaultStd: payload.defaultStd || payload.specification || '',
    sampleType: payload.sampleType || payload.targetCustomer || '',
    targetCustomer: payload.sampleType || payload.targetCustomer || '',
    contactName: payload.contactName,
    contactPhone: payload.contactPhone,
    priceText: payload.priceText,
    price: payload.price,
    cycleDays: payload.cycleDays,
    supportCma: payload.supportCma,
    supportCnas: payload.supportCnas,
    supportUrgent: payload.supportUrgent,
    urgentExtraFee: payload.urgentExtraFee,
    description: payload.description,
    coverUrl: payload.coverUrl,
    sort: payload.sort,
    viewCount: 0,
    orderCount: 0,
    status: ServiceShelfStatus.Disabled,
    updatedAt: new Date().toLocaleString('zh-CN', { hour12: false }),
  })

  return mockPromise(id)
}

export function mockToggleServiceStatus(id: string): Promise<boolean> {
  const target = serviceRecords.find((item) => item.id === id)
  if (target) {
    target.status =
      target.status === ServiceShelfStatus.Enabled
        ? ServiceShelfStatus.Disabled
        : ServiceShelfStatus.Enabled
    target.updatedAt = new Date().toLocaleString('zh-CN', { hour12: false })
  }
  return mockPromise(true)
}

export function mockDeleteService(id: string): Promise<boolean> {
  serviceRecords = serviceRecords.filter((item) => item.id !== id)
  return mockPromise(true)
}
