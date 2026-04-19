import { toRecord } from '@/api/helper'
import type {
  AccountProfileForm,
  ChangeEmailPayload,
  ChangePhonePayload,
  RealNameAuthPayload,
  RealNameAuthStatus,
} from '@/types/account'
import { http } from '@/utils/request'

function normalizeRealNameStatus(raw: unknown): RealNameAuthStatus {
  const source = toRecord(raw)

  return {
    userId: source.userId !== undefined ? String(source.userId) : undefined,
    realName: source.realName ? String(source.realName) : undefined,
    idCardNo: source.idCardNo ? String(source.idCardNo) : undefined,
    realNameStatus: source.realNameStatus !== undefined ? Number(source.realNameStatus) : undefined,
  }
}

export function setUsername(username: string): Promise<boolean> {
  return http<void>({
    url: '/api/user/account/username',
    method: 'put',
    params: { username },
  }).then(() => true)
}

export function updateAccountProfile(payload: AccountProfileForm): Promise<boolean> {
  return http<void>({
    url: '/api/user/account/profile',
    method: 'put',
    data: payload,
  }).then(() => true)
}

export function updateAccountNickname(nickname: string): Promise<boolean> {
  return http<void>({
    url: '/api/user/user/nickname',
    method: 'put',
    params: { nickname },
  }).then(() => true)
}

export function updateAccountAvatar(avatarUrl: string): Promise<boolean> {
  return http<void>({
    url: '/api/user/user/avatar',
    method: 'put',
    params: { avatarUrl },
  }).then(() => true)
}

export function changeAccountPhone(payload: ChangePhonePayload): Promise<boolean> {
  return http<void>({
    url: '/api/user/account/phone',
    method: 'put',
    data: payload,
  }).then(() => true)
}

export function changeAccountEmail(payload: ChangeEmailPayload): Promise<boolean> {
  return http<void>({
    url: '/api/user/account/email',
    method: 'put',
    data: payload,
  }).then(() => true)
}

export function getRealNameStatus(): Promise<RealNameAuthStatus> {
  return http<unknown>({
    url: '/api/user/account/real-name',
    method: 'get',
  }).then((res) => normalizeRealNameStatus(res))
}

export function submitRealName(payload: RealNameAuthPayload): Promise<boolean> {
  return http<void>({
    url: '/api/user/account/real-name',
    method: 'post',
    data: payload,
  }).then(() => true)
}
