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
import { http } from '@/utils/request'
import {
  ACCOUNT_TYPE,
  normalizeAccountType,
  normalizeCurrentIdentity,
  normalizeEnterpriseTags,
} from '@/enum/role'

import { isUseOpenApi } from '../helper'
import {
  enterpriseCodeLogin as mockEnterpriseCodeLogin,
  changePassword as mockChangePassword,
  enterpriseRegister as mockEnterpriseRegister,
  enterpriseUsernameLogin as mockEnterpriseUsernameLogin,
  loginByCreditCode as mockLoginByCreditCode,
  firstLoginResetPassword as mockFirstLoginResetPassword,
  forgotPassword as mockForgotPassword,
  getAuthResult as mockGetAuthResult,
  getCurrentAuthUser as mockGetCurrentAuthUser,
  institutionApply as mockInstitutionApply,
  institutionCodeLogin as mockInstitutionCodeLogin,
  institutionUsernameLogin as mockInstitutionUsernameLogin,
  mockLogin,
  mockRegister,
  mockSendAuthCode,
  personalPasswordLogin as mockPersonalPasswordLogin,
  personalRegister as mockPersonalRegister,
  personalSmsLogin as mockPersonalSmsLogin,
  sendSmsCode as mockSendSmsCode,
} from '@/mock/modules/auth'

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

function buildLoginProfile(raw: unknown, fallbackIdentifier: string): CurrentUser {
  const source = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const accountType = normalizeAccountType(String(source.accountType || source.account_type || ''))
  const enterpriseTags = normalizeEnterpriseTags(
    ((source.enterpriseTags as CurrentUser['enterpriseTags']) ||
      (source.enterpriseCapabilities as CurrentUser['enterpriseCapabilities'])) as any,
  )
  const enterpriseId = String(source.enterpriseId || source.enterprise_id || '')
  const accountId = String(source.accountId || source.account_id || source.id || fallbackIdentifier)
  const permissionCodes = Array.isArray(source.permissionCodes) ? (source.permissionCodes as string[]) : []
  const menuCodes = Array.isArray(source.menuCodes) ? (source.menuCodes as string[]) : []
  const defaultIdentity = normalizeCurrentIdentity(undefined, accountType)
  const dataScope = createDefaultDataScope(accountType, enterpriseId || undefined)

  return {
    id: String(source.id || accountId),
    username: String(source.username || fallbackIdentifier),
    name: String(source.name || source.nickname || source.username || fallbackIdentifier),
    mobile: String(source.mobile || source.phone || ''),
    email: String(source.email || ''),
    accountId,
    accountType,
    currentIdentity: normalizeCurrentIdentity(String(source.currentIdentity || ''), accountType),
    availableIdentities: Array.isArray(source.availableIdentities)
      ? (source.availableIdentities as string[]).map((item) => normalizeCurrentIdentity(item, accountType))
      : [defaultIdentity],
    platformRole: source.platformRole as CurrentUser['platformRole'],
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
    lastLoginTime: source.lastLoginTime ? String(source.lastLoginTime) : undefined,
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
    status: String(source.status || 'submitted') as AuthSubmitResponse['status'],
  }
}

export function sendSmsCode(payload: SmsCodeParams): Promise<SmsCodeResponse> {
  if (!isUseOpenApi()) return mockSendSmsCode(payload)
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
  if (!isUseOpenApi()) return mockPersonalRegister(payload)
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

export function enterpriseRegister(payload: EnterpriseRegisterForm): Promise<AuthSubmitResponse> {
  if (!isUseOpenApi()) return mockEnterpriseRegister(payload)
  return http<AuthSubmitResponse>({
    url: '/api/user/enterprise/register',
    method: 'post',
    data: {
      enterpriseName: payload.enterpriseName,
      unifiedCreditCode: payload.unifiedSocialCode,
      businessLicense: payload.businessLicense[0]?.url || '',
      legalPerson: payload.contactName,
      contactName: payload.contactName,
      contactPhone: payload.mobile,
      enterpriseType: 1,
      region: payload.region.join(''),
      address: payload.registeredAddress,
    },
  }).then((res) => normalizeSubmitResponse(res, 'enterprise-register'))
}

export function institutionApply(payload: InstitutionApplyForm): Promise<AuthSubmitResponse> {
  return mockInstitutionApply(payload)
}

export function personalPasswordLogin(payload: PasswordLoginForm): Promise<AuthLoginResponse> {
  return mockPersonalPasswordLogin(payload)
}

export function personalSmsLogin(payload: SmsLoginForm): Promise<AuthLoginResponse> {
  return mockPersonalSmsLogin(payload)
}

export function enterpriseUsernameLogin(payload: PasswordLoginForm): Promise<AuthLoginResponse> {
  return mockEnterpriseUsernameLogin(payload)
}

export function enterpriseCodeLogin(payload: PasswordLoginForm): Promise<AuthLoginResponse> {
  return mockEnterpriseCodeLogin(payload)
}

export function loginByCreditCode(payload: LoginCreditCodeCommand): Promise<LoginResponse> {
  return mockLoginByCreditCode(payload)
}

export function institutionUsernameLogin(payload: PasswordLoginForm): Promise<AuthLoginResponse> {
  return mockInstitutionUsernameLogin(payload)
}

export function institutionCodeLogin(payload: PasswordLoginForm): Promise<AuthLoginResponse> {
  return mockInstitutionCodeLogin(payload)
}

export function getAuthResult(id: string): Promise<AuthResultInfo> {
  return mockGetAuthResult(id)
}

export function forgotPassword(payload: ForgotPasswordForm): Promise<AuthSubmitResponse> {
  return mockForgotPassword(payload)
}

export function firstLoginResetPassword(payload: FirstLoginResetPasswordForm): Promise<boolean> {
  return mockFirstLoginResetPassword(payload)
}

export function changePassword(payload: ChangePasswordForm): Promise<boolean> {
  return mockChangePassword(payload)
}

export function getCurrentAuthUser(token?: string): Promise<CurrentUser> {
  return mockGetCurrentAuthUser(token)
}

export const getCurrentUser = getCurrentAuthUser

export function loginByPassword(payload: LoginPasswordCommand): Promise<LoginResponse> {
  if (!isUseOpenApi()) return mockLogin(payload.account)
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
  if (!isUseOpenApi()) return mockLogin(payload.mobile)
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
  return mockLogin(payload.email)
}

export function sendAuthCode(payload: SendAuthCodeCommand): Promise<boolean> {
  if (!isUseOpenApi()) return mockSendAuthCode(payload)
  if (payload.channel === 'mobile') {
    return sendSmsCode({
      mobile: payload.target,
      scene: payload.scene as SmsCodeParams['scene'],
    }).then(() => true)
  }
  return mockSendAuthCode(payload)
}

export function registerAccount(payload: RegisterCommand): Promise<boolean> {
  return mockRegister(payload)
}
