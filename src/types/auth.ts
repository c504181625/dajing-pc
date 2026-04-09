export type AccountType = 'personal' | 'enterprise' | 'institution' | 'platform_admin'

export type EnterpriseCapability = 'demander' | 'service_provider' | 'lab_provider'

export type PlatformRole = 'super_admin' | 'platform_admin' | 'auditor'

export type LegacyRoleCode = PlatformRole | EnterpriseCapability
export type RoleCode = LegacyRoleCode

export type AuthStatus =
  | 'submitted'
  | 'reviewing'
  | 'approved'
  | 'rejected'
  | 'password_sent'

export type LoginType =
  | 'personal-password'
  | 'personal-sms'
  | 'enterprise-username-password'
  | 'enterprise-code-password'
  | 'institution-username-password'
  | 'institution-code-password'

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
  name: string
  mobile: string
  email: string
  avatar?: string
  accountType: AccountType
  platformRole?: PlatformRole
  enterpriseId?: string
  enterpriseName?: string
  enterpriseCapabilities?: EnterpriseCapability[]
  permissionCodes: string[]
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
  accountType: AccountType
  profile: CurrentUserInfo
}

export type LoginResponse = AuthLoginResponse & {
  user: CurrentUserInfo
}

export interface AuthSubmitResponse {
  id: string
  status: AuthStatus
}

// 兼容当前项目既有调用，后续新页面统一优先使用更明确的表单类型。
export interface LoginPasswordCommand extends LoginFormBase {
  account: string
  password: string
}

export interface LoginMobileCommand extends LoginFormBase {
  mobile: string
  code: string
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
