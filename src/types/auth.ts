export type RoleCode =
  | 'SUPER_ADMIN'
  | 'PLATFORM_ADMIN'
  | 'AUDITOR'
  | 'ENTERPRISE_DEMAND'
  | 'ENTERPRISE_SERVICE'
  | 'ENTERPRISE_LAB'
  | 'ENTERPRISE_STAFF'

export type DataScopeType =
  | 'ALL'
  | 'ENTERPRISE_SELF'
  | 'ENTERPRISE_CHILD'
  | 'ASSIGNED_ENTERPRISE'
  | 'SELF'

export interface DataScope {
  type: DataScopeType
  enterpriseIds?: string[]
}

export interface LoginPasswordCommand {
  account: string
  password: string
}

export interface LoginMobileCommand {
  mobile: string
  code: string
}

export interface LoginEmailCommand {
  email: string
  code: string
}

export interface CurrentUser {
  id: string
  name: string
  mobile: string
  email: string
  avatar?: string
  roles: RoleCode[]
  permissions: string[]
  dataScopes: DataScope[]
  enterpriseId?: string
  enterpriseName?: string
  deptName?: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  user: CurrentUser
}
