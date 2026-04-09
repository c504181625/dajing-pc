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
    publishAt: '2026-04-14 18:00:00',
    reportFile: { id: 'report-001-file', name: '检测报告.pdf', url: '/mock/report-001.pdf', fileType: 'pdf' },
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
    publishAt: '2026-04-11 09:00:00',
    reportFile: { id: 'report-002-file', name: '计量校准报告.pdf', url: '/mock/report-002.pdf', fileType: 'pdf' },
    hidden: false,
    extractRecords: [],
    demanderEnterpriseId: 'ent-300',
    orgEnterpriseId: 'ent-001',
  },
]

function filterReportRecords(list: ReportRecord[]) {
  if (isPlatformMockUser()) return list

  const enterpriseId = getCurrentEnterpriseId()
  const visible = new Set<ReportRecord>()

  if (hasAnyEnterpriseCapability([ENTERPRISE_CAPABILITY.demander])) {
    list.filter((item) => item.demanderEnterpriseId === enterpriseId).forEach((item) => visible.add(item))
  }

  if (hasAnyEnterpriseCapability([ENTERPRISE_CAPABILITY.serviceProvider, ENTERPRISE_CAPABILITY.labProvider])) {
    list.filter((item) => item.orgEnterpriseId === enterpriseId).forEach((item) => visible.add(item))
  }

  return [...visible]
}

export function mockGetReportList(params?: ReportQuery) {
  let list = filterReportRecords([...reportRecords])
  const keyword = String(params?.keyword || '').trim()
  const status = String(params?.status || '')

  if (keyword) {
    list = list.filter((item) => [item.reportNo, item.orderNo, item.enterpriseName, item.projectName].some((field) => field.includes(keyword)))
  }
  if (status) list = list.filter((item) => item.status === status)

  return mockPromise(createPageResult(list))
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
