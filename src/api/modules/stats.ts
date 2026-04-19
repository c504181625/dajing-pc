import { resolveEmptyList } from '@/api/helper'
import type { KeyMetricItem, MonthlyOrderStatItem } from '@/types/business'

export function getMonthlyOrderStats(): Promise<MonthlyOrderStatItem[]> {
  return resolveEmptyList<MonthlyOrderStatItem>()
}

export function getKeyMetrics(): Promise<KeyMetricItem[]> {
  return resolveEmptyList<KeyMetricItem>()
}
