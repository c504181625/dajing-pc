import type { PageResult } from '@/types/api'
import type { ReportDetail, ReportItem, ReportQuery } from '@/types/business'
import { http } from '@/utils/request'
import { isUseMock } from '../helper'
import { mockGetReportDetail, mockGetReportList, mockInvalidateReport, mockToggleReportHidden } from '@/mock/modules/report'

export function getReportList(params?: ReportQuery): Promise<PageResult<ReportItem>> {
  if (isUseMock()) return mockGetReportList(params)
  return http<PageResult<ReportItem>>({ url: '/report/page', method: 'get', params })
}

export function getReportDetail(id: string): Promise<ReportDetail> {
  if (isUseMock()) return mockGetReportDetail(id)
  return http<ReportDetail>({ url: `/report/${id}`, method: 'get' })
}

export function invalidateReport(id: string, reason: string): Promise<boolean> {
  if (isUseMock()) return mockInvalidateReport(id, reason)
  return http<boolean>({ url: `/report/${id}/invalidate`, method: 'post', data: { reason } })
}

export function toggleReportHidden(id: string): Promise<boolean> {
  if (isUseMock()) return mockToggleReportHidden(id)
  return http<boolean>({ url: `/report/${id}/toggle-hidden`, method: 'post' })
}
