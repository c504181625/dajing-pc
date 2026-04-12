export type CanonicalAccountType = 'personal' | 'enterprise' | 'operator'
export type LegacyAccountType = 'platform_admin'
export type AccountType = CanonicalAccountType | LegacyAccountType

export type CanonicalEnterpriseTag = 'demander' | 'provider'
export type LegacyEnterpriseTag = 'service_provider'
export type EnterpriseCapability = CanonicalEnterpriseTag | LegacyEnterpriseTag
export type EnterpriseTag = CanonicalEnterpriseTag

export type PlatformRole = 'super_admin' | 'platform_admin' | 'auditor'

export type CurrentIdentity =
  | 'personal'
  | 'enterprise'
  | 'enterprise_demander'
  | 'enterprise_provider'
  | 'enterprise_service_provider'
  | 'operator'
  | 'platform_admin'

export type LegacyRoleCode = PlatformRole | EnterpriseCapability
export type RoleCode = LegacyRoleCode

export type AuthStatus = 'submitted' | 'reviewing' | 'approved' | 'rejected' | 'password_sent'

export type LoginType = 'password' | 'mobile' | 'credit-code'

export type DataScopeType =
  | 'all'
  | 'enterprise_self'
  | 'enterprise_related'
  | 'assigned_enterprise'
  | 'self'

export interface DataScope {
  type: DataScopeType
  enterpriseIds?: string[]
  note?: string
}

export interface UploadFileItem {
  uid: string
  name: string
  url?: string
  type?: string
  size?: number
  status?: 'success' | 'uploading' | 'fail'
}

export interface LoginFormBase {
  tenantCode?: string
}

export interface PasswordLoginForm {
  account: string
  password: string
}

export interface SmsLoginForm {
  mobile: string
  smsCode: string
}

export interface CreditCodeLoginForm {
  unifiedSocialCreditCode: string
  password: string
  mobile?: string
  code?: string
}

export interface PersonalRegisterForm {
  username: string
  mobile: string
  smsCode: string
  password: string
  confirmPassword: string
  region: string[]
  addressDetail: string
  agreement: boolean
}

export interface EnterpriseRegisterForm {
  username: string
  mobile: string
  smsCode: string
  enterpriseName: string
  unifiedSocialCode: string
  registeredAddress: string
  contactName: string
  region: string[]
  enterpriseIntro: string
  businessScope: string
  remark?: string
  businessLicense: UploadFileItem[]
}

export interface InstitutionApplyForm {
  loginAccount: string
  institutionName: string
  unifiedSocialCode: string
  registeredAddress: string
  legalPerson: string
  settleContactName: string
  settleContactMobile: string
  smsCode: string
  contactName: string
  contactMobile: string
  region: string[]
  nationalQualityCenter: boolean
  provincialQualityCenter: boolean
  serviceTypes: string[]
  institutionIntro: string
  businessScope: string
  remark?: string
  businessLicense: UploadFileItem[]
  qualificationCertificates: InstitutionQualificationItem[]
}

export interface InstitutionQualificationItem {
  id: string
  certificateNature: 'CMA' | 'CNAS' | 'other'
  certificateLevel: 'national' | 'provincial' | 'other'
  certificateNo: string
  remark?: string
  certificateFiles: UploadFileItem[]
  capabilityFiles: UploadFileItem[]
}

export interface ForgotPasswordForm {
  account: string
  mobile: string
  smsCode: string
  newPassword: string
  confirmPassword: string
}

export interface FirstLoginResetPasswordForm {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

export interface ChangePasswordForm {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

export interface AuthResultInfo {
  id?: string
  status: AuthStatus
  title: string
  description: string
  nextAction?: string
}

export interface SmsCodeParams extends LoginFormBase {
  mobile: string
  scene:
    | 'login_mobile'
    | 'personal_login'
    | 'personal_register'
    | 'forgot_password'
    | 'enterprise_contact_notice'
    | 'institution_contact_notice'
}

export interface SmsCodeResponse {
  success: boolean
  expireSeconds: number
}

export interface CurrentUserInfo {
  id: string
  username: string
  name: string
  mobile: string
  email: string
  avatar?: string
  accountId?: string
  accountType: AccountType
  currentIdentity?: CurrentIdentity
  availableIdentities?: CurrentIdentity[]
  platformRole?: PlatformRole
  enterpriseId?: string
  enterpriseName?: string
  enterpriseTags: EnterpriseTag[]
  enterpriseCapabilities?: EnterpriseCapability[]
  permissionCodes: string[]
  menuCodes: string[]
  homeRoute: string
  dataScope: DataScope
  roles?: RoleCode[]
  permissions?: string[]
  dataScopes: DataScope[]
  deptName?: string
  lastLoginTime?: string
}

export type CurrentUser = CurrentUserInfo

export interface AuthLoginResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  needResetPassword: boolean
  accountId?: string
  accountType: AccountType
  enterpriseTags?: EnterpriseTag[]
  permissionCodes?: string[]
  menuCodes?: string[]
  homeRoute?: string
  profile: CurrentUserInfo
}

export type LoginResponse = AuthLoginResponse & {
  user: CurrentUserInfo
}

export interface AuthSubmitResponse {
  id: string
  status: AuthStatus
}

export interface EnterpriseUpgradeForm {
  enterpriseName: string
  unifiedSocialCode: string
  contactName: string
  contactMobile: string
  region: string[]
  registeredAddress: string
  enterpriseTags: EnterpriseTag[]
  enterpriseCapabilities?: EnterpriseCapability[]
  businessScope: string
  enterpriseIntro?: string
  remark?: string
  businessLicense: UploadFileItem[]
}

export interface EnterpriseUpgradeSummary {
  canUpgrade: boolean
  hasPendingApplication: boolean
  currentStatus: AuthStatus | 'not_started'
  lastApplyTime?: string
  remark?: string
}

export interface LoginPasswordCommand extends LoginFormBase {
  account: string
  password: string
}

export interface LoginMobileCommand extends LoginFormBase {
  mobile: string
  code: string
}

export interface LoginCreditCodeCommand extends LoginFormBase {
  unifiedSocialCreditCode: string
  password?: string
  mobile?: string
  code?: string
}

export interface LoginEmailCommand extends LoginFormBase {
  email: string
  code: string
}

export type AuthCodeChannel = 'mobile' | 'email'

export type AuthCodeScene =
  | 'login_mobile'
  | 'login_email'
  | 'register_mobile'
  | 'personal_login'
  | 'personal_register'
  | 'forgot_password'

export interface SendAuthCodeCommand extends LoginFormBase {
  channel: AuthCodeChannel
  target: string
  scene: AuthCodeScene
}

export type RegisterRole = 'demander' | 'provider'

export interface RegisterCommand extends LoginFormBase {
  role: RegisterRole
  mobile: string
  code: string
  email?: string
  companyName: string
  creditCode: string
  standardCount?: string
  principalName: string
  principalPhone: string
  contactName: string
  contactJob: string
  contactPhone: string
  inviteCode?: string
  password: string
  confirmPassword: string
}
