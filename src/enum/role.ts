import type {
  AccountType,
  CurrentIdentity,
  EnterpriseCapability,
  EnterpriseTag,
  PlatformRole,
} from '@/types/auth'

export const ACCOUNT_TYPE = {
  personal: 'personal',
  enterprise: 'enterprise',
  operator: 'operator',
  platformAdmin: 'operator',
  legacyPlatformAdmin: 'platform_admin',
} as const

export const ENTERPRISE_TAG = {
  demander: 'demander',
  provider: 'provider',
  legacyProvider: 'service_provider',
} as const

export const ENTERPRISE_CAPABILITY = {
  demander: ENTERPRISE_TAG.demander,
  provider: ENTERPRISE_TAG.provider,
  serviceProvider: ENTERPRISE_TAG.provider,
} as const

export const PLATFORM_ROLE = {
  superAdmin: 'super_admin',
  platformAdmin: 'platform_admin',
  auditor: 'auditor',
} as const

export const ACCOUNT_TYPE_LABEL_MAP: Record<string, string> = {
  [ACCOUNT_TYPE.personal]: '个人用户',
  [ACCOUNT_TYPE.enterprise]: '企业用户',
  [ACCOUNT_TYPE.operator]: '平台运营方',
  [ACCOUNT_TYPE.legacyPlatformAdmin]: '平台运营方',
}

export const ENTERPRISE_TAG_LABEL_MAP: Record<string, string> = {
  [ENTERPRISE_TAG.demander]: '需求发布方',
  [ENTERPRISE_TAG.provider]: '服务提供方',
  [ENTERPRISE_TAG.legacyProvider]: '服务提供方',
}

export const ENTERPRISE_CAPABILITY_LABEL_MAP = ENTERPRISE_TAG_LABEL_MAP

export const PLATFORM_ROLE_LABEL_MAP: Record<string, string> = {
  [PLATFORM_ROLE.superAdmin]: '平台超级管理员',
  [PLATFORM_ROLE.platformAdmin]: '平台运营管理员',
  [PLATFORM_ROLE.auditor]: '平台审核员',
}

export function normalizeAccountType(accountType?: string | number | null): AccountType {
  if (accountType === 4 || accountType === '4' || accountType === ACCOUNT_TYPE.legacyPlatformAdmin) {
    return ACCOUNT_TYPE.operator
  }

  if (accountType === 1 || accountType === '1') return ACCOUNT_TYPE.enterprise
  if (accountType === 2 || accountType === '2') return ACCOUNT_TYPE.enterprise
  if (accountType === 3 || accountType === '3') return ACCOUNT_TYPE.enterprise
  if (accountType === 0 || accountType === '0') return ACCOUNT_TYPE.personal

  if (
    accountType === ACCOUNT_TYPE.personal ||
    accountType === ACCOUNT_TYPE.enterprise ||
    accountType === ACCOUNT_TYPE.operator
  ) {
    return accountType
  }

  return ACCOUNT_TYPE.personal
}

export function isOperatorAccountType(accountType?: string) {
  return normalizeAccountType(accountType) === ACCOUNT_TYPE.operator
}

export function normalizeEnterpriseTag(tag?: string): EnterpriseTag | null {
  if (tag === ENTERPRISE_TAG.demander) return ENTERPRISE_TAG.demander
  if (
    tag === ENTERPRISE_TAG.provider ||
    tag === ENTERPRISE_TAG.legacyProvider ||
    tag === 'institution'
  ) {
    return ENTERPRISE_TAG.provider
  }
  return null
}

export function normalizeEnterpriseTags(tags?: EnterpriseCapability[] | EnterpriseTag[]) {
  return Array.from(
    new Set((tags || []).map((item) => normalizeEnterpriseTag(item)).filter(Boolean)),
  ) as EnterpriseTag[]
}

export function hasEnterpriseTag(
  ownedTags: EnterpriseCapability[] | EnterpriseTag[] | undefined,
  targetTag: EnterpriseTag | EnterpriseTag[],
) {
  const normalizedOwnedTags = normalizeEnterpriseTags(ownedTags)
  const targetList = Array.isArray(targetTag) ? targetTag : [targetTag]
  return targetList.some((item) => normalizedOwnedTags.includes(item))
}

export function normalizeCurrentIdentity(identity?: string, accountType?: string): CurrentIdentity {
  const normalizedAccountType = normalizeAccountType(accountType)

  if (normalizedAccountType === ACCOUNT_TYPE.operator) {
    return 'operator'
  }

  if (identity === 'enterprise_service_provider') return 'enterprise_provider'
  if (identity === 'platform_admin') return 'operator'
  if (
    identity === 'personal' ||
    identity === 'enterprise' ||
    identity === 'enterprise_demander' ||
    identity === 'enterprise_provider' ||
    identity === 'operator'
  ) {
    return identity
  }

  return normalizedAccountType === ACCOUNT_TYPE.enterprise ? 'enterprise' : 'personal'
}

export function normalizePlatformRole(role?: string | null): PlatformRole | undefined {
  if (!role) return undefined

  const normalizedRole = role.toLowerCase()

  if (normalizedRole === PLATFORM_ROLE.superAdmin) return PLATFORM_ROLE.superAdmin
  if (normalizedRole === PLATFORM_ROLE.platformAdmin || normalizedRole === 'operator') {
    return PLATFORM_ROLE.platformAdmin
  }
  if (normalizedRole === PLATFORM_ROLE.auditor) return PLATFORM_ROLE.auditor

  return undefined
}
