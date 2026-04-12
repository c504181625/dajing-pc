import { ENTERPRISE_CAPABILITY } from '@/enum/role'
import { ConsultStatus, OperationStatus } from '@/enum/status'
import type { ConsultDetail, ConsultQuery } from '@/types/business'
import {
  getCurrentEnterpriseId,
  getMockCurrentUser,
  hasAnyEnterpriseCapability,
  isPlatformMockUser,
} from '../context'
import { createPageResult, mockPromise } from '../helper'

type ConsultRecord = ConsultDetail & {
  ownerEnterpriseId: string
  receiverEnterpriseId?: string
}

const consultRecords: ConsultRecord[] = [
  {
    id: 'consult-001',
    title: '如何申请检验检测服务',
    enterpriseName: '苏州启航电子股份有限公司',
    contactName: '刘工',
    contactPhone: '13800008888',
    status: ConsultStatus.Pending,
    createdAt: '2026-04-08 10:10:00',
    content: '企业首次使用平台，想了解检验检测服务的完整提交流程。',
    attachments: [],
    replyRecords: [
      {
        id: 'consult-record-001',
        title: '提交咨询',
        time: '2026-04-08 10:10:00',
        description: '企业提交流程咨询问题',
        operator: '苏州启航电子股份有限公司',
        status: OperationStatus.Done,
      },
    ],
    ownerEnterpriseId: 'ent-100',
    receiverEnterpriseId: 'ent-200',
  },
  {
    id: 'consult-002',
    title: '质量培训排期咨询',
    enterpriseName: '无锡锐科装备有限公司',
    contactName: '马经理',
    contactPhone: '13800005555',
    status: ConsultStatus.Replied,
    createdAt: '2026-04-07 11:18:00',
    content: '想了解 5 月份质量培训班排期和讲师安排。',
    attachments: [],
    replyRecords: [
      {
        id: 'consult-record-101',
        title: '服务机构已回复',
        time: '2026-04-07 13:00:00',
        description: '已发送培训排期与报价清单',
        operator: '杭州工研质量技术服务有限公司',
        status: OperationStatus.Done,
      },
    ],
    ownerEnterpriseId: 'ent-300',
    receiverEnterpriseId: 'ent-200',
  },
]

function filterConsultRecords(list: ConsultRecord[]) {
  if (isPlatformMockUser()) return list

  const enterpriseId = getCurrentEnterpriseId()
  const visible = new Set<ConsultRecord>()

  if (hasAnyEnterpriseCapability([ENTERPRISE_CAPABILITY.demander])) {
    list
      .filter((item) => item.ownerEnterpriseId === enterpriseId)
      .forEach((item) => visible.add(item))
  }

  if (hasAnyEnterpriseCapability([ENTERPRISE_CAPABILITY.serviceProvider])) {
    list
      .filter((item) => item.receiverEnterpriseId === enterpriseId)
      .forEach((item) => visible.add(item))
  }

  return [...visible]
}

export function mockGetConsultList(params?: ConsultQuery) {
  let list = filterConsultRecords([...consultRecords])
  const keyword = String(params?.keyword || '').trim()
  const status = String(params?.status || '')

  if (keyword) {
    list = list.filter((item) =>
      [item.title, item.enterpriseName, item.contactName].some((field) => field.includes(keyword)),
    )
  }
  if (status) list = list.filter((item) => item.status === status)

  return mockPromise(createPageResult(list))
}

export function mockGetConsultDetail(id: string): Promise<ConsultDetail> {
  const visible = filterConsultRecords(consultRecords)
  return mockPromise(visible.find((item) => item.id === id) || visible[0] || consultRecords[0]!)
}

export function mockReplyConsult(id: string, content: string): Promise<boolean> {
  const row = consultRecords.find((item) => item.id === id)
  if (row) {
    row.status = ConsultStatus.Replied
    row.replyRecords.unshift({
      id: `consult-record-${Date.now()}`,
      title: '咨询已回复',
      time: new Date().toLocaleString('zh-CN', { hour12: false }),
      description: content,
      operator: getMockCurrentUser().enterpriseName || getMockCurrentUser().name,
      status: OperationStatus.Done,
    })
  }
  return mockPromise(true)
}

export function mockDeleteConsult(id: string): Promise<boolean> {
  const index = consultRecords.findIndex((item) => item.id === id)
  if (index >= 0) {
    consultRecords.splice(index, 1)
  }
  return mockPromise(true)
}
