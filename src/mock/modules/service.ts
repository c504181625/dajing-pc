import { ServiceShelfStatus, ServiceType } from '@/enum/status'
import type { ServiceForm, ServiceItem, ServiceQuery } from '@/types/business'
import { isPlatformMockUser, getCurrentEnterpriseId } from '../context'
import { createPageResult, mockPromise } from '../helper'

type ServiceRecord = ServiceItem & {
  enterpriseId: string
  enterpriseName: string
}

let serviceRecords: ServiceRecord[] = [
  {
    id: 'service-001',
    serviceCode: 'SVC-DIA-001',
    serviceName: 'ISO9001 质量诊断辅导',
    serviceType: ServiceType.Diagnosis,
    categoryCode: 'diagnosis',
    categoryName: '质量诊断',
    specification: '按企业项目制',
    targetCustomer: '制造型企业',
    contactName: '张凯',
    contactPhone: '13800002222',
    priceText: '按项目报价',
    status: ServiceShelfStatus.Enabled,
    updatedAt: '2026-04-08 09:30:00',
    description: '提供质量诊断、问题识别和改善建议输出。',
    enterpriseId: 'ent-200',
    enterpriseName: '杭州工研质量技术服务有限公司',
  },
  {
    id: 'service-002',
    serviceCode: 'SVC-TRN-002',
    serviceName: '质量培训课程定制',
    serviceType: ServiceType.Training,
    categoryCode: 'training',
    categoryName: '质量培训',
    specification: '按天计费',
    targetCustomer: '中小制造企业',
    contactName: '张凯',
    contactPhone: '13800002222',
    priceText: '按天报价',
    status: ServiceShelfStatus.Enabled,
    updatedAt: '2026-04-07 16:00:00',
    description: '围绕质量工具、流程优化、现场管理开展定制培训。',
    enterpriseId: 'ent-200',
    enterpriseName: '杭州工研质量技术服务有限公司',
  },
  {
    id: 'service-003',
    serviceCode: 'SVC-INS-003',
    serviceName: '电子元器件可靠性检测',
    serviceType: ServiceType.Inspection,
    categoryCode: 'inspection',
    categoryName: '检验检测',
    specification: '按测试项目组合报价',
    targetCustomer: '电子制造企业',
    contactName: '陈玥',
    contactPhone: '13800001111',
    priceText: '按测试项目报价',
    status: ServiceShelfStatus.Enabled,
    updatedAt: '2026-04-08 10:20:00',
    description: '覆盖高低温、振动、电性能等检测能力。',
    enterpriseId: 'ent-001',
    enterpriseName: '苏州智造检测有限公司',
  },
  {
    id: 'service-004',
    serviceCode: 'SVC-MET-004',
    serviceName: '计量校准服务',
    serviceType: ServiceType.Metrology,
    categoryCode: 'metrology',
    categoryName: '计量',
    specification: '按器具计费',
    targetCustomer: '装备制造企业',
    contactName: '陈玥',
    contactPhone: '13800001111',
    priceText: '按器具计费',
    status: ServiceShelfStatus.Disabled,
    updatedAt: '2026-04-06 15:10:00',
    description: '提供长度、力学与电学计量校准服务。',
    enterpriseId: 'ent-001',
    enterpriseName: '苏州智造检测有限公司',
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
      [item.serviceCode, item.serviceName, item.targetCustomer, item.description, item.enterpriseName].some((field) =>
        String(field || '').includes(keyword),
      ),
    )
  }
  if (serviceType) list = list.filter((item) => item.serviceType === serviceType)
  if (status) list = list.filter((item) => item.status === status)

  return mockPromise(createPageResult(list))
}

export function mockSaveService(payload: ServiceForm & { id?: string; enterpriseId?: string; enterpriseName?: string }): Promise<boolean> {
  const enterpriseId = payload.enterpriseId || getCurrentEnterpriseId()
  const enterpriseName =
    payload.enterpriseName ||
    serviceRecords.find((item) => item.enterpriseId === enterpriseId)?.enterpriseName ||
    '平台维护服务'

  if (payload.id) {
    const target = serviceRecords.find((item) => item.id === payload.id)
    if (target) {
      Object.assign(target, payload, {
        updatedAt: new Date().toLocaleString('zh-CN', { hour12: false }),
        enterpriseId,
        enterpriseName,
      })
    }
  } else {
    serviceRecords.unshift({
      id: `service-${Date.now()}`,
      ...payload,
      status: ServiceShelfStatus.Enabled,
      updatedAt: new Date().toLocaleString('zh-CN', { hour12: false }),
      enterpriseId,
      enterpriseName,
    })
  }

  return mockPromise(true)
}

export function mockToggleServiceStatus(id: string): Promise<boolean> {
  const target = serviceRecords.find((item) => item.id === id)
  if (target) {
    target.status = target.status === ServiceShelfStatus.Enabled ? ServiceShelfStatus.Disabled : ServiceShelfStatus.Enabled
    target.updatedAt = new Date().toLocaleString('zh-CN', { hour12: false })
  }
  return mockPromise(true)
}

export function mockDeleteService(id: string): Promise<boolean> {
  serviceRecords = serviceRecords.filter((item) => item.id !== id)
  return mockPromise(true)
}
