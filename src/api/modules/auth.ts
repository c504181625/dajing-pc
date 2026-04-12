import type {
  AuthLoginResponse,
  ChangePasswordForm,
  AuthResultInfo,
  AuthSubmitResponse,
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

import { isUseMock } from '../helper'
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

export function sendSmsCode(payload: SmsCodeParams): Promise<SmsCodeResponse> {
  if (isUseMock()) return mockSendSmsCode(payload)
  return http<SmsCodeResponse>({ url: '/auth/sms/send', method: 'post', data: payload })
}

export function personalRegister(payload: PersonalRegisterForm): Promise<AuthSubmitResponse> {
  if (isUseMock()) return mockPersonalRegister(payload)
  return http<AuthSubmitResponse>({ url: '/auth/register/personal', method: 'post', data: payload })
}

export function enterpriseRegister(payload: EnterpriseRegisterForm): Promise<AuthSubmitResponse> {
  if (isUseMock()) return mockEnterpriseRegister(payload)
  return http<AuthSubmitResponse>({ url: '/auth/register/enterprise', method: 'post', data: payload })
}

export function institutionApply(payload: InstitutionApplyForm): Promise<AuthSubmitResponse> {
  if (isUseMock()) return mockInstitutionApply(payload)
  return http<AuthSubmitResponse>({ url: '/auth/apply/institution', method: 'post', data: payload })
}

export function personalPasswordLogin(payload: PasswordLoginForm): Promise<AuthLoginResponse> {
  if (isUseMock()) return mockPersonalPasswordLogin(payload)
  return http<AuthLoginResponse>({ url: '/auth/login/personal/password', method: 'post', data: payload })
}

export function personalSmsLogin(payload: SmsLoginForm): Promise<AuthLoginResponse> {
  if (isUseMock()) return mockPersonalSmsLogin(payload)
  return http<AuthLoginResponse>({ url: '/auth/login/personal/sms', method: 'post', data: payload })
}

export function enterpriseUsernameLogin(payload: PasswordLoginForm): Promise<AuthLoginResponse> {
  if (isUseMock()) return mockEnterpriseUsernameLogin(payload)
  return http<AuthLoginResponse>({ url: '/auth/login/enterprise/username', method: 'post', data: payload })
}

export function enterpriseCodeLogin(payload: PasswordLoginForm): Promise<AuthLoginResponse> {
  if (isUseMock()) return mockEnterpriseCodeLogin(payload)
  return http<AuthLoginResponse>({ url: '/auth/login/enterprise/code', method: 'post', data: payload })
}

export function loginByCreditCode(payload: LoginCreditCodeCommand): Promise<LoginResponse> {
  if (isUseMock()) return mockLoginByCreditCode(payload)
  return http<LoginResponse>({ url: '/auth/login/credit-code', method: 'post', data: payload })
}

export function institutionUsernameLogin(payload: PasswordLoginForm): Promise<AuthLoginResponse> {
  if (isUseMock()) return mockInstitutionUsernameLogin(payload)
  return http<AuthLoginResponse>({ url: '/auth/login/institution/username', method: 'post', data: payload })
}

export function institutionCodeLogin(payload: PasswordLoginForm): Promise<AuthLoginResponse> {
  if (isUseMock()) return mockInstitutionCodeLogin(payload)
  return http<AuthLoginResponse>({ url: '/auth/login/institution/code', method: 'post', data: payload })
}

export function getAuthResult(id: string): Promise<AuthResultInfo> {
  if (isUseMock()) return mockGetAuthResult(id)
  return http<AuthResultInfo>({ url: `/auth/result/${id}`, method: 'get' })
}

export function forgotPassword(payload: ForgotPasswordForm): Promise<AuthSubmitResponse> {
  if (isUseMock()) return mockForgotPassword(payload)
  return http<AuthSubmitResponse>({ url: '/auth/password/forgot', method: 'post', data: payload })
}

export function firstLoginResetPassword(payload: FirstLoginResetPasswordForm): Promise<boolean> {
  if (isUseMock()) return mockFirstLoginResetPassword(payload)
  return http<boolean>({ url: '/auth/password/first-reset', method: 'post', data: payload })
}

export function changePassword(payload: ChangePasswordForm): Promise<boolean> {
  if (isUseMock()) return mockChangePassword(payload)
  return http<boolean>({ url: '/auth/password/change', method: 'post', data: payload })
}

export function getCurrentAuthUser(token?: string): Promise<CurrentUser> {
  if (isUseMock()) return mockGetCurrentAuthUser(token)
  return http<CurrentUser>({ url: '/auth/current-user', method: 'get' })
}

export const getCurrentUser = getCurrentAuthUser

export function loginByPassword(payload: LoginPasswordCommand): Promise<LoginResponse> {
  if (isUseMock()) return mockLogin(payload.account)
  return http<LoginResponse>({ url: '/auth/login/password', method: 'post', data: payload })
}

export function loginByMobile(payload: LoginMobileCommand): Promise<LoginResponse> {
  if (isUseMock()) return mockLogin(payload.mobile)
  return http<LoginResponse>({ url: '/auth/login/mobile', method: 'post', data: payload })
}

export function loginByEmail(payload: LoginEmailCommand): Promise<LoginResponse> {
  if (isUseMock()) return mockLogin(payload.email)
  return http<LoginResponse>({ url: '/auth/login/email', method: 'post', data: payload })
}

export function sendAuthCode(payload: SendAuthCodeCommand): Promise<boolean> {
  if (isUseMock()) return mockSendAuthCode(payload)
  return http<boolean>({ url: '/auth/code/send', method: 'post', data: payload })
}

export function registerAccount(payload: RegisterCommand): Promise<boolean> {
  if (isUseMock()) return mockRegister(payload)
  return http<boolean>({ url: '/auth/register', method: 'post', data: payload })
}
