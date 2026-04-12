import { ENTERPRISE_CAPABILITY } from '@/enum/role'
import { DemandStatus, OperationStatus, PublishMode, ServiceType } from '@/enum/status'
import type { DemandDetail, DemandForm, DemandQuery } from '@/types/business'

import {
  getCurrentEnterpriseId,
  getMockCurrentUser,
  hasAnyEnterpriseCapability,
  isPlatformMockUser,
} from '../context'
import { createPageResult, mockPromise } from '../helper'

type DemandRecord = DemandDetail & {
  ownerEnterpriseId: string
  ownerAccountId?: string
  assignedOrgId?: string
}

const demandRecords: DemandRecord[] = [
  {
    id: 'demand-000',
    title: '质量培训课程定制需求',
    serviceType: ServiceType.Training,
    enterpriseName: '个人用户演示账号',
    publishMode: PublishMode.PlatformAssign,
    status: DemandStatus.Pending,
    createdAt: '2026-04-09 10:18:00',
    contactName: '个人用户',
    contactPhone: '13800001001',
    content: '希望围绕现场质量管理和过程改进安排一场企业内训，请平台协助匹配合适机构。',
    attachments: [],
    replyRecords: [
      {
        id: 'reply-000',
        title: '需求已提交',
        time: '2026-04-09 10:18:00',
        description: '个人用户已提交培训需求，等待平台受理。',
        operator: '个人用户演示账号',
        status: OperationStatus.Waiting,
      },
    ],
    ownerEnterpriseId: '',
    ownerAccountId: 'acc-person_demo',
  },
  {
    id: 'demand-001',
    title: '电子元器件可靠性检测需求',
    serviceType: ServiceType.Inspection,
    enterpriseName: '苏州启航电子股份有限公司',
    publishMode: PublishMode.PlatformAssign,
    status: DemandStatus.Assigned,
    createdAt: '2026-04-08 09:20:10',
    assignedOrg: '苏州智造检测有限公司',
    contactName: '刘工',
    contactPhone: '13800008888',
    content: '需要进行电子元器件可靠性测试，包含高低温循环和振动试验。',
    attachments: [
      { id: 'demand-file-001', name: '需求说明书.pdf', url: '/mock/demand-1.pdf', fileType: 'pdf' },
    ],
    replyRecords: [
      {
        id: 'reply-001',
        title: '平台受理需求',
        time: '2026-04-08 09:30:00',
        description: '需求已进入平台分配池。',
        operator: '平台运营',
        status: OperationStatus.Done,
      },
      {
        id: 'reply-002',
        title: '已分配机构',
        time: '2026-04-08 10:00:00',
        description: '已分配给苏州智造检测有限公司。',
        operator: '平台运营',
        status: OperationStatus.Done,
      },
    ],
    ownerEnterpriseId: 'ent-100',
    ownerAccountId: 'acc-qihang_admin',
    assignedOrgId: 'ent-001',
  },
  {
    id: 'demand-002',
    title: 'ISO9001 质量诊断辅导',
    serviceType: ServiceType.Diagnosis,
    enterpriseName: '苏州启航电子股份有限公司',
    publishMode: PublishMode.SelfSelect,
    status: DemandStatus.Processing,
    createdAt: '2026-04-07 16:11:08',
    assignedOrg: '杭州工研质量技术服务有限公司',
    contactName: '许经理',
    contactPhone: '13800007777',
    content: '希望由专业机构协助开展质量诊断和内审辅导。',
    attachments: [
      { id: 'demand-file-002', name: '诊断需求.docx', url: '/mock/demand-2.docx', fileType: 'docx' },
    ],
    replyRecords: [
      {
        id: 'reply-101',
        title: '机构已接单',
        time: '2026-04-07 18:20:00',
        description: '服务机构已联系企业确认上门诊断时间。',
        operator: '杭州工研质量技术服务有限公司',
        status: OperationStatus.Done,
      },
    ],
    ownerEnterpriseId: 'ent-100',
    ownerAccountId: 'acc-qihang_admin',
    assignedOrgId: 'ent-200',
  },
  {
    id: 'demand-003',
    title: '企业标准编制咨询',
    serviceType: ServiceType.Standard,
    enterpriseName: '苏州启航电子股份有限公司',
    publishMode: PublishMode.PlatformAssign,
    status: DemandStatus.Pending,
    createdAt: '2026-04-06 14:10:00',
    contactName: '李主任',
    contactPhone: '13800006666',
    content: '拟申请团体标准立项，需要标准文本编制支持。',
    attachments: [],
    replyRecords: [
      {
        id: 'reply-201',
        title: '需求已提交',
        time: '2026-04-06 14:10:00',
        description: '等待平台分配服务机构。',
        operator: '苏州启航电子股份有限公司',
        status: OperationStatus.Waiting,
      },
    ],
    ownerEnterpriseId: 'ent-100',
    ownerAccountId: 'acc-qihang_admin',
  },
  {
    id: 'demand-004',
    title: '质量培训课程定制',
    serviceType: ServiceType.Training,
    enterpriseName: '无锡锐科装备有限公司',
    publishMode: PublishMode.PlatformAssign,
    status: DemandStatus.Assigned,
    createdAt: '2026-04-05 10:30:00',
    assignedOrg: '杭州工研质量技术服务有限公司',
    contactName: '马经理',
    contactPhone: '13800005555',
    content: '希望定制质量工具与现场管理培训课程。',
    attachments: [],
    replyRecords: [
      {
        id: 'reply-301',
        title: '已分配服务机构',
        time: '2026-04-05 11:00:00',
        description: '平台分配给杭州工研质量技术服务有限公司。',
        operator: '平台运营',
        status: OperationStatus.Done,
      },
    ],
    ownerEnterpriseId: 'ent-300',
    ownerAccountId: 'acc-mix_service_admin',
    assignedOrgId: 'ent-200',
  },
]

function filterDemandRecords(list: DemandRecord[]) {
  if (isPlatformMockUser()) return list

  const currentUser = getMockCurrentUser()
  const enterpriseId = getCurrentEnterpriseId()
  const visible = new Set<DemandRecord>()

  if (currentUser.accountType === 'personal') {
    list
      .filter((item) => item.ownerAccountId === currentUser.accountId)
      .forEach((item) => visible.add(item))
  }

  if (hasAnyEnterpriseCapability([ENTERPRISE_CAPABILITY.demander])) {
    list
      .filter((item) => item.ownerEnterpriseId === enterpriseId)
      .forEach((item) => visible.add(item))
  }

  if (hasAnyEnterpriseCapability([ENTERPRISE_CAPABILITY.serviceProvider])) {
    list.filter((item) => item.assignedOrgId === enterpriseId).forEach((item) => visible.add(item))
  }

  return [...visible]
}

export function mockGetDemandList(params?: DemandQuery) {
  let list = filterDemandRecords([...demandRecords])
  const keyword = String(params?.keyword || '').trim()
  const status = String(params?.status || '')
  const serviceType = String(params?.serviceType || '')
  const pageNum = Number(params?.pageNum || 1)
  const pageSize = Number(params?.pageSize || 10)

  if (keyword) {
    list = list.filter((item) =>
      [item.title, item.enterpriseName, item.assignedOrg, item.contactName].some((field) =>
        String(field || '').includes(keyword),
      ),
    )
  }
  if (status) list = list.filter((item) => item.status === status)
  if (serviceType) list = list.filter((item) => item.serviceType === serviceType)

  return mockPromise(createPageResult(list, pageNum, pageSize))
}

export function mockGetDemandDetail(id: string): Promise<DemandDetail> {
  const visible = filterDemandRecords(demandRecords)
  return mockPromise(visible.find((item) => item.id === id) || visible[0] || demandRecords[0]!)
}

export function mockReplyDemand(id: string, content: string): Promise<boolean> {
  const row = demandRecords.find((item) => item.id === id)
  if (row) {
    row.status = DemandStatus.Replied
    row.replyRecords.unshift({
      id: `reply-${Date.now()}`,
      title: '服务机构回复需求',
      time: new Date().toLocaleString('zh-CN', { hour12: false }),
      description: content,
      operator: getMockCurrentUser().enterpriseName || getMockCurrentUser().name,
      status: OperationStatus.Done,
      content,
    })
  }
  return mockPromise(true)
}

export function mockAssignDemand(id: string, orgName: string): Promise<boolean> {
  const row = demandRecords.find((item) => item.id === id)
  if (row) {
    row.status = DemandStatus.Assigned
    row.assignedOrg = orgName
    row.replyRecords.unshift({
      id: `reply-${Date.now()}`,
      title: '平台重新分配机构',
      time: new Date().toLocaleString('zh-CN', { hour12: false }),
      description: `已分配给 ${orgName}`,
      operator: '平台运营',
      status: OperationStatus.Done,
    })
  }
  return mockPromise(true)
}

export function mockCreateDemand(payload: DemandForm): Promise<boolean> {
  const currentUser = getMockCurrentUser()
  demandRecords.unshift({
    id: `demand-${Date.now()}`,
    title: payload.title,
    serviceType: payload.serviceType,
    enterpriseName: currentUser.enterpriseName || currentUser.name || '当前主体',
    publishMode: payload.publishMode,
    status: DemandStatus.Pending,
    createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
    contactName: payload.contactName,
    contactPhone: payload.contactPhone,
    content: payload.content,
    attachments: [],
    replyRecords: [
      {
        id: `reply-${Date.now()}`,
        title: '需求已提交',
        time: new Date().toLocaleString('zh-CN', { hour12: false }),
        description: '需求已提交成功，等待平台受理或服务机构跟进。',
        operator: currentUser.enterpriseName || currentUser.name,
        status: OperationStatus.Done,
      },
    ],
    ownerEnterpriseId: getCurrentEnterpriseId(),
    ownerAccountId: currentUser.accountId,
  })
  return mockPromise(true)
}

export function mockAcceptDemand(id: string): Promise<boolean> {
  const row = demandRecords.find((item) => item.id === id)
  if (row) {
    row.status = DemandStatus.Processing
    row.replyRecords.unshift({
      id: `reply-${Date.now()}`,
      title: '服务机构已接单',
      time: new Date().toLocaleString('zh-CN', { hour12: false }),
      description: '服务机构已确认承接需求，正在安排后续沟通与执行计划。',
      operator: getMockCurrentUser().enterpriseName || getMockCurrentUser().name,
      status: OperationStatus.Processing,
    })
  }
  return mockPromise(true)
}

export function mockDeleteDemand(id: string): Promise<boolean> {
  const index = demandRecords.findIndex((item) => item.id === id)
  if (index >= 0) {
    demandRecords.splice(index, 1)
  }
  return mockPromise(true)
}
