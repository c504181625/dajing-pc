import type { LoginEmailCommand, LoginMobileCommand, LoginPasswordCommand, LoginResponse } from '@/types/auth'

import { mockLogin, mockPromise, resolveUserFromToken } from '../mock'

export function loginByPassword(payload: LoginPasswordCommand): Promise<LoginResponse> {
  return mockPromise(mockLogin(payload.account))
}

export function loginByMobile(payload: LoginMobileCommand): Promise<LoginResponse> {
  return mockPromise(mockLogin(payload.mobile))
}

export function loginByEmail(payload: LoginEmailCommand): Promise<LoginResponse> {
  return mockPromise(mockLogin(payload.email))
}

export function getCurrentUser(token: string) {
  return mockPromise(resolveUserFromToken(token))
}
