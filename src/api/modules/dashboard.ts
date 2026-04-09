import type { MerchantWorkbenchData, PlatformWorkbenchData } from '@/types/business'
import { http } from '@/utils/request'
import { isUseMock } from '../helper'
import { mockGetMerchantDashboard, mockGetPlatformDashboard } from '@/mock/modules/dashboard'

export function getPlatformDashboard(): Promise<PlatformWorkbenchData> {
  if (isUseMock()) return mockGetPlatformDashboard()
  return http<PlatformWorkbenchData>({ url: '/dashboard/platform-workbench', method: 'get' })
}

export function getMerchantDashboard(): Promise<MerchantWorkbenchData> {
  if (isUseMock()) return mockGetMerchantDashboard()
  return http<MerchantWorkbenchData>({ url: '/dashboard/merchant-workbench', method: 'get' })
}

export const getPlatformWorkbench = getPlatformDashboard
export const getMerchantWorkbench = getMerchantDashboard
