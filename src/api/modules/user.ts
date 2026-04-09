import type { PageResult } from '@/types/api'
import type { UserDetail, UserItem, UserQuery } from '@/types/business'
import { http } from '@/utils/request'
import { isUseMock } from '../helper'
import { mockGetUserDetail, mockGetUserList, mockToggleUserStatus } from '@/mock/modules/user'

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
