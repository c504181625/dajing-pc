export const ACCOUNT_TYPE = {
  personal: 'personal',
  enterprise: 'enterprise',
  institution: 'institution',
  platformAdmin: 'platform_admin',
} as const

export const ENTERPRISE_CAPABILITY = {
  demander: 'demander',
  serviceProvider: 'service_provider',
  labProvider: 'lab_provider',
} as const

export const PLATFORM_ROLE = {
  superAdmin: 'super_admin',
  platformAdmin: 'platform_admin',
  auditor: 'auditor',
} as const

export const ACCOUNT_TYPE_LABEL_MAP: Record<string, string> = {
  [ACCOUNT_TYPE.personal]: '个人用户',
  [ACCOUNT_TYPE.enterprise]: '企业用户',
  [ACCOUNT_TYPE.institution]: '机构用户',
  [ACCOUNT_TYPE.platformAdmin]: '平台运营方',
}

export const ENTERPRISE_CAPABILITY_LABEL_MAP: Record<string, string> = {
  [ENTERPRISE_CAPABILITY.demander]: '需求发布方',
  [ENTERPRISE_CAPABILITY.serviceProvider]: '基础服务提供方',
  [ENTERPRISE_CAPABILITY.labProvider]: '检测机构方',
}

export const PLATFORM_ROLE_LABEL_MAP: Record<string, string> = {
  [PLATFORM_ROLE.superAdmin]: '平台超级管理员',
  [PLATFORM_ROLE.platformAdmin]: '平台运营管理员',
  [PLATFORM_ROLE.auditor]: '平台审核员',
}
