import type { KeyMetricItem, MonthlyOrderStatItem } from '@/types/business'
import { mockPromise } from '../helper'

const monthlyStats: MonthlyOrderStatItem[] = [
  { month: '2026-01', orderCount: 18, reportCount: 12, refundCount: 1 },
  { month: '2026-02', orderCount: 23, reportCount: 19, refundCount: 0 },
  { month: '2026-03', orderCount: 31, reportCount: 24, refundCount: 2 },
  { month: '2026-04', orderCount: 27, reportCount: 18, refundCount: 1 },
]

const keyMetrics: KeyMetricItem[] = [
  { key: 'enterpriseCount', label: '入驻企业数', value: 328, unit: '家', hint: '含服务机构与检测机构' },
  { key: 'processingDemand', label: '处理中需求', value: 17, unit: '条', hint: '平台与机构待跟进' },
  { key: 'activeOrder', label: '活跃订单', value: 35, unit: '单', hint: '含检测中与报告编制中' },
  { key: 'publishedReport', label: '已发布报告', value: 142, unit: '份', hint: '本月累计' },
]

export function mockGetMonthlyOrderStats() {
  return mockPromise(monthlyStats)
}

export function mockGetKeyMetrics() {
  return mockPromise(keyMetrics)
}
