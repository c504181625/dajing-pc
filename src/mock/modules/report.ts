import { ENTERPRISE_CAPABILITY } from '@/enum/role'
import { OperationStatus, ReportStatus } from '@/enum/status'
import type { ReportDetail, ReportQuery } from '@/types/business'
import {
  getCurrentEnterpriseId,
  getMockCurrentUser,
  hasAnyEnterpriseCapability,
  isPlatformMockUser,
} from '../context'
import { createPageResult, mockPromise } from '../helper'

type ReportRecord = ReportDetail & {
  demanderEnterpriseId: string
  orgEnterpriseId: string
}

const reportRecords: ReportRecord[] = [
  {
    id: 'report-001',
    reportNo: 'BG20260408018',
    enterpriseName: '苏州启航电子股份有限公司',
    orderNo: 'QI202604080001',
    projectName: '电子元器件可靠性检测',
    status: ReportStatus.Reviewing,
    sealStatus: 'pending',
    publishAt: '2026-04-14 18:00:00',
    reportFile: {
      id: 'report-001-file',
      name: '检测报告.pdf',
      url: '/mock/report-001.pdf',
      fileType: 'pdf',
    },
    hidden: false,
    extractRecords: [
      {
        id: 'extract-001',
        title: '发起抽查',
        time: '2026-04-15 10:00:00',
        description: '抽查报告附件与标准引用是否一致',
        operator: '平台抽查员',
        status: OperationStatus.Done,
      },
    ],
    demanderEnterpriseId: 'ent-100',
    orgEnterpriseId: 'ent-001',
  },
  {
    id: 'report-002',
    reportNo: 'BG20260407012',
    enterpriseName: '无锡锐科装备有限公司',
    orderNo: 'QI202604070014',
    projectName: '计量校准服务',
    status: ReportStatus.Published,
    sealStatus: 'sealed',
    publishAt: '2026-04-11 09:00:00',
    reportFile: {
      id: 'report-002-file',
      name: '计量校准报告.pdf',
      url: '/mock/report-002.pdf',
      fileType: 'pdf',
    },
    hidden: false,
    extractRecords: [],
    demanderEnterpriseId: 'ent-300',
    orgEnterpriseId: 'ent-001',
  },
  {
    id: 'report-003',
    reportNo: 'BG20260406009',
    enterpriseName: '苏州启航电子股份有限公司',
    orderNo: 'QI202604060009',
    projectName: '环境可靠性验证',
    status: ReportStatus.Pending,
    sealStatus: 'pending',
    publishAt: '2026-04-09 14:20:00',
    reportFile: {
      id: 'report-003-file',
      name: '环境可靠性验证报告.pdf',
      url: '/mock/report-003.pdf',
      fileType: 'pdf',
    },
    hidden: false,
    extractRecords: [],
    demanderEnterpriseId: 'ent-100',
    orgEnterpriseId: 'ent-001',
  },
  {
    id: 'report-004',
    reportNo: 'BG20260405005',
    enterpriseName: '杭州工研质量技术服务有限公司',
    orderNo: 'QI202604050005',
    projectName: '计量校准复核',
    status: ReportStatus.Invalid,
    sealStatus: 'rejected',
    publishAt: '2026-04-08 10:00:00',
    reportFile: {
      id: 'report-004-file',
      name: '计量校准复核报告.pdf',
      url: '/mock/report-004.pdf',
      fileType: 'pdf',
    },
    hidden: false,
    extractRecords: [
      {
        id: 'extract-004',
        title: '报告退回',
        time: '2026-04-09 09:30:00',
        description: '签章材料不完整，退回补充',
        operator: '平台审核组',
        status: OperationStatus.Warning,
      },
    ],
    demanderEnterpriseId: 'ent-300',
    orgEnterpriseId: 'ent-001',
  },
]

function filterReportRecords(list: ReportRecord[]) {
  if (isPlatformMockUser()) return list

  const enterpriseId = getCurrentEnterpriseId()
  const visible = new Set<ReportRecord>()

  if (hasAnyEnterpriseCapability([ENTERPRISE_CAPABILITY.demander])) {
    list
      .filter((item) => item.demanderEnterpriseId === enterpriseId)
      .forEach((item) => visible.add(item))
  }

  if (hasAnyEnterpriseCapability([ENTERPRISE_CAPABILITY.serviceProvider])) {
    list
      .filter((item) => item.orgEnterpriseId === enterpriseId)
      .forEach((item) => visible.add(item))
  }

  return [...visible]
}

export function mockGetReportList(params?: ReportQuery) {
  let list = filterReportRecords([...reportRecords])
  const keyword = String(params?.keyword || '').trim()
  const status = String(params?.status || '')
  const sealStatus = String(params?.sealStatus || '')
  const pageNum = Number(params?.pageNum || 1)
  const pageSize = Number(params?.pageSize || 10)

  if (keyword) {
    list = list.filter((item) =>
      [item.reportNo, item.orderNo, item.enterpriseName, item.projectName].some((field) =>
        field.includes(keyword),
      ),
    )
  }
  if (status) list = list.filter((item) => item.status === status)
  if (sealStatus) list = list.filter((item) => item.sealStatus === sealStatus)

  return mockPromise(createPageResult(list, pageNum, pageSize))
}

export function mockGetReportDetail(id: string): Promise<ReportDetail> {
  const visible = filterReportRecords(reportRecords)
  return mockPromise(visible.find((item) => item.id === id) || visible[0] || reportRecords[0]!)
}

export function mockInvalidateReport(id: string, reason: string): Promise<boolean> {
  const row = reportRecords.find((item) => item.id === id)
  if (row) {
    row.status = ReportStatus.Invalid
    row.extractRecords.unshift({
      id: `extract-${Date.now()}`,
      title: '报告作废',
      time: new Date().toLocaleString('zh-CN', { hour12: false }),
      description: reason,
      operator: getMockCurrentUser().name,
      status: OperationStatus.Warning,
    })
  }
  return mockPromise(true)
}

export function mockToggleReportHidden(id: string): Promise<boolean> {
  const row = reportRecords.find((item) => item.id === id)
  if (row) {
    row.hidden = !row.hidden
    row.status = row.hidden ? ReportStatus.Hidden : ReportStatus.Published
  }
  return mockPromise(true)
}

export function mockDeleteReport(id: string): Promise<boolean> {
  const index = reportRecords.findIndex((item) => item.id === id)
  if (index >= 0) {
    reportRecords.splice(index, 1)
  }
  return mockPromise(true)
}
