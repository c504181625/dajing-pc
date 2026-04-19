import type {
  AuthLoginResponse,
  ChangePasswordForm,
  AuthResultInfo,
  AuthSubmitResponse,
  AccountType,
  CurrentUser,
  FirstLoginResetPasswordForm,
  ForgotPasswordForm,
  InstitutionApplyForm,
  LoginCreditCodeCommand,
  LoginEmailCommand,
  LoginMobileCommand,
  LoginPasswordCommand,
  LoginResponse,
  PasswordLoginForm,
  PersonalRegisterForm,
  RegisterCommand,
  SendAuthCodeCommand,
  SmsCodeParams,
  SmsCodeResponse,
  SmsLoginForm,
  EnterpriseRegisterForm,
} from '@/types/auth'
import { formatDateTime } from '@/utils/date'
import { http } from '@/utils/request'
import {
  uploadCertFile,
  uploadGeneralFile,
  uploadIdCardFile,
  uploadLicenseFile,
} from './file'
import {
  ACCOUNT_TYPE,
  normalizeAccountType,
  normalizeCurrentIdentity,
  normalizeEnterpriseTags,
  normalizePlatformRole,
} from '@/enum/role'

function getDefaultLandingPath(accountType: AccountType) {
  if (accountType === ACCOUNT_TYPE.operator) return '/operator/dashboard'
  if (accountType === ACCOUNT_TYPE.enterprise) return '/enterprise/dashboard'
  return '/personal/dashboard'
}

function createDefaultDataScope(accountType: AccountType, enterpriseId?: string) {
  if (accountType === ACCOUNT_TYPE.operator) {
    return { type: 'all' as const, note: '开放全量数据范围' }
  }

  if (accountType === ACCOUNT_TYPE.enterprise) {
    return {
      type: 'enterprise_self' as const,
      enterpriseIds: enterpriseId ? [enterpriseId] : [],
      note: '企业自有数据范围',
    }
  }

  return { type: 'self' as const, note: '仅本人数据范围' }
}

function normalizeSmsScene(scene: string) {
  const sceneMap: Record<string, string> = {
    login_mobile: 'LOGIN',
    personal_login: 'PERSONAL_LOGIN',
    personal_register: 'PERSONAL_REGISTER',
    forgot_password: 'FORGOT_PASSWORD',
    enterprise_contact_notice: 'ENTERPRISE_CONTACT_NOTICE',
    institution_contact_notice: 'INSTITUTION_CONTACT_NOTICE',
    login_email: 'LOGIN_EMAIL',
  }

  return sceneMap[scene] || scene.toUpperCase()
}

function normalizeSmsCodeResponse(raw: unknown): SmsCodeResponse {
  if (raw && typeof raw === 'object') {
    const record = raw as Record<string, unknown>
    return {
      success: record.success !== false,
      expireSeconds: Number(record.expireSeconds || record.expireSecond || 60),
    }
  }

  return {
    success: true,
    expireSeconds: 60,
  }
}

function pickDefined(source: Record<string, unknown>, keys: string[]) {
  return keys.find((key) => source[key] !== undefined && source[key] !== null)
}

function getDefinedValue(source: Record<string, unknown>, keys: string[]) {
  const key = pickDefined(source, keys)
  return key ? source[key] : undefined
}

function inferEnterpriseTags(
  rawAccountType: unknown,
  rawTags: CurrentUser['enterpriseTags'] | CurrentUser['enterpriseCapabilities'] | undefined,
) {
  if (rawTags?.length) {
    return normalizeEnterpriseTags(rawTags)
  }

  if (rawAccountType === 1 || rawAccountType === '1') {
    return normalizeEnterpriseTags(['demander'])
  }

  if (
    rawAccountType === 2 ||
    rawAccountType === '2' ||
    rawAccountType === 3 ||
    rawAccountType === '3'
  ) {
    return normalizeEnterpriseTags(['provider'])
  }

  return []
}

function inferPlatformRole(source: Record<string, unknown>) {
  const directRole = normalizePlatformRole(
    String(getDefinedValue(source, ['platformRole']) || '').trim() || undefined,
  )
  if (directRole) return directRole

  const roleCodes = Array.isArray(source.roleCodes)
    ? (source.roleCodes as string[])
    : Array.isArray(source.roles)
      ? (source.roles as string[])
      : []

  if (roleCodes.some((item) => ['SUPER_ADMIN', 'super_admin'].includes(item))) {
    return 'super_admin' as const
  }

  if (roleCodes.some((item) => ['AUDITOR', 'auditor'].includes(item))) {
    return 'auditor' as const
  }

  if (
    roleCodes.some((item) => ['OPERATOR', 'PLATFORM_ADMIN', 'operator', 'platform_admin'].includes(item))
  ) {
    return 'platform_admin' as const
  }

  return undefined
}

function buildLoginProfile(raw: unknown, fallbackIdentifier: string): CurrentUser {
  const source = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const rawAccountType = getDefinedValue(source, ['accountType', 'account_type', 'userType', 'user_type'])
  const accountType = normalizeAccountType(rawAccountType as string | number | null | undefined)
  const rawEnterpriseTags = Array.isArray(source.enterpriseTags)
    ? (source.enterpriseTags as CurrentUser['enterpriseTags'])
    : []
  const rawEnterpriseCapabilities = Array.isArray(source.enterpriseCapabilities)
    ? (source.enterpriseCapabilities as NonNullable<CurrentUser['enterpriseCapabilities']>)
    : []
  const enterpriseTags = inferEnterpriseTags(rawAccountType, [
    ...rawEnterpriseTags,
    ...rawEnterpriseCapabilities,
  ])
  const enterpriseId = String(
    getDefinedValue(source, ['enterpriseId', 'enterprise_id']) || '',
  )
  const accountId = String(
    getDefinedValue(source, ['accountId', 'account_id', 'userId', 'user_id', 'id']) ||
      fallbackIdentifier,
  )
  const permissionCodes = Array.isArray(source.permissionCodes) ? (source.permissionCodes as string[]) : []
  const menuCodes = Array.isArray(source.menuCodes) ? (source.menuCodes as string[]) : []
  const defaultIdentity = normalizeCurrentIdentity(undefined, accountType)
  const dataScope = createDefaultDataScope(accountType, enterpriseId || undefined)

  return {
    id: String(getDefinedValue(source, ['id', 'userId', 'user_id']) || accountId),
    username: String(getDefinedValue(source, ['username', 'phone', 'mobile']) || fallbackIdentifier),
    name: String(
      getDefinedValue(source, ['name', 'nickname', 'username', 'phone', 'mobile']) || fallbackIdentifier,
    ),
    mobile: String(getDefinedValue(source, ['mobile', 'phone']) || ''),
    email: String(source.email || ''),
    avatar: String(
      getDefinedValue(source, ['avatar', 'avatarUrl', 'avatar_url', 'headImg', 'headimgurl', 'photo']) || '',
    ) || undefined,
    accountId,
    accountType,
    currentIdentity: normalizeCurrentIdentity(
      String(getDefinedValue(source, ['currentIdentity', 'current_identity']) || ''),
      accountType,
    ),
    availableIdentities: Array.isArray(source.availableIdentities)
      ? (source.availableIdentities as string[]).map((item) => normalizeCurrentIdentity(item, accountType))
      : [defaultIdentity],
    platformRole: inferPlatformRole(source),
    enterpriseId: enterpriseId || undefined,
    enterpriseName: source.enterpriseName ? String(source.enterpriseName) : undefined,
    enterpriseTags,
    enterpriseCapabilities: enterpriseTags,
    permissionCodes,
    menuCodes,
    homeRoute: String(source.homeRoute || getDefaultLandingPath(accountType)),
    dataScope,
    roles: Array.isArray(source.roles) ? (source.roles as CurrentUser['roles']) : [],
    permissions: Array.isArray(source.permissions) ? (source.permissions as string[]) : permissionCodes,
    dataScopes: Array.isArray(source.dataScopes) && source.dataScopes.length
      ? (source.dataScopes as CurrentUser['dataScopes'])
      : [dataScope],
    deptName: source.deptName ? String(source.deptName) : undefined,
    lastLoginTime: source.lastLoginTime ? formatDateTime(source.lastLoginTime) : undefined,
  }
}

function normalizeLoginResponse(raw: unknown, fallbackIdentifier: string): LoginResponse {
  const source = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const profile = buildLoginProfile(source.profile || source.user || source, fallbackIdentifier)

  return {
    accessToken: String(source.accessToken || source.token || source.access_token || ''),
    refreshToken: String(source.refreshToken || source.refresh_token || ''),
    expiresIn: Number(source.expiresIn || source.expires_in || 7200),
    needResetPassword: !!source.needResetPassword,
    accountId: String(source.accountId || source.account_id || profile.accountId),
    accountType: profile.accountType,
    enterpriseTags: profile.enterpriseTags,
    permissionCodes: profile.permissionCodes,
    menuCodes: profile.menuCodes,
    homeRoute: profile.homeRoute,
    profile,
    user: profile,
  }
}

function normalizeSubmitResponse(raw: unknown, prefix: string): AuthSubmitResponse {
  const source = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  return {
    id: String(source.id || source.requestId || `${prefix}-${Date.now()}`),
    status:
      Number(source.status) === 2
        ? 'approved'
        : Number(source.status) === 3
          ? 'rejected'
          : Number(source.status) === 1
            ? 'reviewing'
            : (String(source.status || 'submitted') as AuthSubmitResponse['status']),
  }
}

async function uploadFile(file: File, category: 'general' | 'license' | 'cert' | 'id-card' = 'general') {
  const request =
    category === 'license'
      ? uploadLicenseFile(file)
      : category === 'cert'
        ? uploadCertFile(file)
        : category === 'id-card'
          ? uploadIdCardFile(file)
          : uploadGeneralFile(file)

  return request.then((res) => String(res.url || ''))
}

async function ensureUploadedFile(
  item: EnterpriseRegisterForm['businessLicense'][number] | undefined,
  category: 'general' | 'license' | 'cert' | 'id-card' = 'general',
) {
  if (!item) return ''
  if (item.url && !item.raw) return item.url
  if (item.raw) {
    const uploaded =
      category === 'license'
        ? await uploadLicenseFile(item.raw)
        : category === 'cert'
          ? await uploadCertFile(item.raw)
          : category === 'id-card'
            ? await uploadIdCardFile(item.raw)
            : await uploadGeneralFile(item.raw)

    return String(uploaded.objectName || uploaded.fileKey || uploaded.url || '')
  }
  return ''
}

export function sendSmsCode(payload: SmsCodeParams): Promise<SmsCodeResponse> {
  return http<SmsCodeResponse>({
    url: '/api/user/auth/sms/send',
    method: 'post',
    data: {
      phone: payload.mobile,
      scene: normalizeSmsScene(payload.scene),
    },
  }).then((res) => normalizeSmsCodeResponse(res))
}

export function personalRegister(payload: PersonalRegisterForm): Promise<AuthSubmitResponse> {
  return http<AuthSubmitResponse>({
    url: '/api/user/auth/register',
    method: 'post',
    data: {
      phone: payload.mobile,
      smsCode: payload.smsCode,
      password: payload.password,
      nickname: payload.username,
      email: '',
      device: 'WEB',
    },
  }).then((res) => normalizeSubmitResponse(res, 'personal-register'))
}

export async function enterpriseRegister(payload: EnterpriseRegisterForm): Promise<AuthSubmitResponse> {
  const businessLicense = await ensureUploadedFile(payload.businessLicense[0], 'license')

  return http<AuthSubmitResponse>({
    url: '/api/user/enterprise/register',
    method: 'post',
    data: {
      enterpriseName: payload.enterpriseName,
      unifiedCreditCode: payload.unifiedSocialCode,
      businessLicense,
      legalPerson: payload.contactName,
      contactName: payload.contactName,
      contactPhone: payload.mobile,
      enterpriseType: 1,
      region: payload.region.join(''),
      address: payload.registeredAddress,
      introduction: payload.enterpriseIntro,
      serviceRange: payload.businessScope,
    },
  }).then((res) => normalizeSubmitResponse(res, 'enterprise-register'))
}

export function institutionApply(_payload: InstitutionApplyForm): Promise<AuthSubmitResponse> {
  return Promise.reject(new Error('QIP.openapi.json 未提供机构入驻申请接口'))
}

export function personalPasswordLogin(payload: PasswordLoginForm): Promise<AuthLoginResponse> {
  return loginByPassword(payload)
}

export function personalSmsLogin(payload: SmsLoginForm): Promise<AuthLoginResponse> {
  return loginByMobile({
    mobile: payload.mobile,
    code: payload.smsCode,
  })
}

export function enterpriseUsernameLogin(payload: PasswordLoginForm): Promise<AuthLoginResponse> {
  return loginByPassword(payload)
}

export function enterpriseCodeLogin(payload: PasswordLoginForm): Promise<AuthLoginResponse> {
  return loginByPassword(payload)
}

export function loginByCreditCode(payload: LoginCreditCodeCommand): Promise<LoginResponse> {
  if (payload.password) {
    return loginByPassword({
      account: payload.unifiedSocialCreditCode,
      password: payload.password,
    })
  }

  return Promise.reject(new Error('QIP.openapi.json 未提供统一社会信用代码验证码登录接口'))
}

export function institutionUsernameLogin(payload: PasswordLoginForm): Promise<AuthLoginResponse> {
  return loginByPassword(payload)
}

export function institutionCodeLogin(payload: PasswordLoginForm): Promise<AuthLoginResponse> {
  return loginByPassword(payload)
}

export function getAuthResult(id: string): Promise<AuthResultInfo> {
  const isApproved = id.includes('approved')
  const isRejected = id.includes('rejected')

  return Promise.resolve({
    id,
    status: isApproved ? 'approved' : isRejected ? 'rejected' : 'reviewing',
    title: isApproved ? '申请已通过' : isRejected ? '申请未通过' : '申请已提交',
    description: isApproved
      ? '当前申请已通过审核，请返回登录页继续使用系统。'
      : isRejected
        ? '当前申请未通过审核，请根据平台反馈调整后重新提交。'
        : '当前申请已提交，系统正在等待平台审核处理。',
    nextAction: '返回登录',
  })
}

export function forgotPassword(_payload: ForgotPasswordForm): Promise<AuthSubmitResponse> {
  return Promise.reject(new Error('QIP.openapi.json 未提供忘记密码找回接口'))
}

export function firstLoginResetPassword(payload: FirstLoginResetPasswordForm): Promise<boolean> {
  return changePassword({
    oldPassword: payload.oldPassword,
    newPassword: payload.newPassword,
    confirmPassword: payload.confirmPassword,
  })
}

export function changePassword(payload: ChangePasswordForm): Promise<boolean> {
  return http<boolean>({
    url: '/api/user/account/password',
    method: 'put',
    data: {
      oldPassword: payload.oldPassword,
      newPassword: payload.newPassword,
    },
  }).then(() => true)
}

export function getCurrentAuthUser(token?: string): Promise<CurrentUser> {
  return http<unknown>({
    url: '/api/user/user/me',
    method: 'get',
  }).then((res) => buildLoginProfile(res, 'current'))
}

export const getCurrentUser = getCurrentAuthUser

export function loginByPassword(payload: LoginPasswordCommand): Promise<LoginResponse> {
  return http<LoginResponse>({
    url: '/api/user/auth/login/password',
    method: 'post',
    data: {
      account: payload.account,
      password: payload.password,
      device: 'WEB',
    },
  }).then((res) => normalizeLoginResponse(res, payload.account))
}

export function loginByMobile(payload: LoginMobileCommand): Promise<LoginResponse> {
  return http<LoginResponse>({
    url: '/api/user/auth/login',
    method: 'post',
    data: {
      phone: payload.mobile,
      smsCode: payload.code,
      device: 'WEB',
    },
  }).then((res) => normalizeLoginResponse(res, payload.mobile))
}

export function loginByEmail(payload: LoginEmailCommand): Promise<LoginResponse> {
  return Promise.reject(new Error(`QIP.openapi.json 未提供邮箱验证码登录接口：${payload.email}`))
}

export function sendAuthCode(payload: SendAuthCodeCommand): Promise<boolean> {
  if (payload.channel === 'mobile') {
    return sendSmsCode({
      mobile: payload.target,
      scene: payload.scene as SmsCodeParams['scene'],
    }).then(() => true)
  }
  return Promise.reject(new Error('QIP.openapi.json 未提供邮箱验证码发送接口'))
}

export function refreshAuthToken(refreshToken: string): Promise<LoginResponse> {
  return http<LoginResponse>({
    url: '/api/user/auth/refresh',
    method: 'post',
    params: { refreshToken },
  }).then((res) => normalizeLoginResponse(res, 'refresh'))
}

export function logoutAuth(): Promise<boolean> {
  return http<void>({
    url: '/api/user/auth/logout',
    method: 'post',
  }).then(() => true)
}

export function registerAccount(_payload: RegisterCommand): Promise<boolean> {
  return Promise.reject(new Error('当前项目未接入通用企业注册聚合接口'))
}
