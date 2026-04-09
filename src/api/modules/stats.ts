import type { KeyMetricItem, MonthlyOrderStatItem } from '@/types/business'
import { http } from '@/utils/request'
import { isUseMock } from '../helper'
import { mockGetKeyMetrics, mockGetMonthlyOrderStats } from '@/mock/modules/stats'

export function getMonthlyOrderStats(): Promise<MonthlyOrderStatItem[]> {
  if (isUseMock()) return mockGetMonthlyOrderStats()
  return http<MonthlyOrderStatItem[]>({ url: '/stats/monthly-order', method: 'get' })
}

export function getKeyMetrics(): Promise<KeyMetricItem[]> {
  if (isUseMock()) return mockGetKeyMetrics()
  return http<KeyMetricItem[]>({ url: '/stats/metrics', method: 'get' })
}
