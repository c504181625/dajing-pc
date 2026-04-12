import type { EnterpriseUpgradeForm, EnterpriseUpgradeSummary } from '@/types/auth'
import type { PageResult } from '@/types/api'
import type { UserDetail, UserItem, UserQuery } from '@/types/business'
import { http } from '@/utils/request'
import { isUseMock } from '../helper'
import {
  mockDeleteUser,
  mockGetEnterpriseUpgradeSummary,
  mockGetUserDetail,
  mockGetUserList,
  mockSubmitEnterpriseUpgrade,
  mockToggleUserStatus,
  mockUpdateUser,
} from '@/mock/modules/user'

export function getUserList(params?: UserQuery): Promise<PageResult<UserItem>> {
  if (isUseMock()) return mockGetUserList(params)
  return http<PageResult<UserItem>>({ url: '/system/user/page', method: 'get', params })
}

export function getUserDetail(id: string): Promise<UserDetail> {
  if (isUseMock()) return mockGetUserDetail(id)
  return http<UserDetail>({ url: `/system/user/${id}`, method: 'get' })
}

export function toggleUserStatus(id: string): Promise<boolean> {
  if (isUseMock()) return mockToggleUserStatus(id)
  return http<boolean>({ url: `/system/user/${id}/toggle-status`, method: 'post' })
}

export function updateUser(payload: Partial<UserDetail> & { id: string }): Promise<boolean> {
  if (isUseMock()) return mockUpdateUser(payload)
  return http<boolean>({ url: `/system/user/${payload.id}`, method: 'put', data: payload })
}

export function deleteUser(id: string): Promise<boolean> {
  if (isUseMock()) return mockDeleteUser(id)
  return http<boolean>({ url: `/system/user/${id}`, method: 'delete' })
}

export function getEnterpriseUpgradeSummary(): Promise<EnterpriseUpgradeSummary> {
  if (isUseMock()) return mockGetEnterpriseUpgradeSummary()
  return http<EnterpriseUpgradeSummary>({ url: '/user/enterprise-upgrade/summary', method: 'get' })
}

export function submitEnterpriseUpgrade(payload: EnterpriseUpgradeForm): Promise<boolean> {
  if (isUseMock()) return mockSubmitEnterpriseUpgrade(payload)
  return http<boolean>({ url: '/user/enterprise-upgrade', method: 'post', data: payload })
}
