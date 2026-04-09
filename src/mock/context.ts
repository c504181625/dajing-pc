import { ACCOUNT_TYPE, ENTERPRISE_CAPABILITY } from '@/enum/role'
import { getAccessToken } from '@/utils/auth'
import type { CurrentUser, EnterpriseCapability } from '@/types/auth'

import { mockUsersByToken } from './modules/auth'

export function getMockCurrentUser(): CurrentUser {
  const token = getAccessToken().replace('mock-token-', '')
  return mockUsersByToken[token] ?? mockUsersByToken.admin!
}

export function getCurrentEnterpriseId() {
  return getMockCurrentUser().enterpriseId || ''
}

export function hasEnterpriseCapability(capability: EnterpriseCapability) {
  return getMockCurrentUser().enterpriseCapabilities?.includes(capability) || false
}

export function hasAnyEnterpriseCapability(capabilities: EnterpriseCapability[]) {
  return capabilities.some((item) => hasEnterpriseCapability(item))
}

export function isPlatformMockUser() {
  return getMockCurrentUser().accountType === ACCOUNT_TYPE.platformAdmin
}

export function isMerchantMockUser() {
  const accountType = getMockCurrentUser().accountType
  return accountType === ACCOUNT_TYPE.enterprise || accountType === ACCOUNT_TYPE.institution
}

export function isDemanderMockUser() {
  return hasEnterpriseCapability(ENTERPRISE_CAPABILITY.demander)
}

export function isServiceProviderMockUser() {
  return hasEnterpriseCapability(ENTERPRISE_CAPABILITY.serviceProvider)
}

export function isLabProviderMockUser() {
  return hasEnterpriseCapability(ENTERPRISE_CAPABILITY.labProvider)
}
