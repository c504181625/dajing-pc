import { toRecord } from '@/api/helper'
import type { RoleItem } from '@/types/business'
import { http } from '@/utils/request'

function normalizeRoleItem(raw: unknown): RoleItem {
  const source = toRecord(raw)

  return {
    id: String(source.id || source.roleCode || ''),
    name: String(source.roleName || source.name || ''),
    code: String(source.roleCode || source.code || ''),
    dataScope: Number(source.isSystem) === 1 ? 'system' : 'custom',
    permissions: Array.isArray(source.permissions) ? (source.permissions as string[]) : [],
  }
}

export interface RoleMutationPayload {
  roleCode?: string
  roleName: string
  description?: string
  status?: number
  isSystem?: number
}

export function getRoleList(): Promise<RoleItem[]> {
  return http<unknown[]>({
    url: '/api/user/role/list',
    method: 'get',
  }).then((res) => (Array.isArray(res) ? res : []).map((item) => normalizeRoleItem(item)))
}

export function createRole(payload: RoleMutationPayload): Promise<string> {
  return http<number>({
    url: '/api/user/role',
    method: 'post',
    data: payload,
  }).then((res) => String(res || ''))
}

export function updateRole(id: string, payload: RoleMutationPayload): Promise<boolean> {
  return http<void>({
    url: `/api/user/role/${id}`,
    method: 'put',
    data: payload,
  }).then(() => true)
}

export function deleteRole(id: string): Promise<boolean> {
  return http<void>({
    url: `/api/user/role/${id}`,
    method: 'delete',
  }).then(() => true)
}

export function getUserAssignedRoles(userId: string): Promise<string[]> {
  return http<unknown>({
    url: `/api/user/role/user/${userId}`,
    method: 'get',
  }).then((res) => (Array.isArray(res) ? res.map((item) => String(item)) : []))
}

export function assignUserRoles(userId: string, roleCodes: string[]): Promise<boolean> {
  return http<void>({
    url: `/api/user/role/user/${userId}`,
    method: 'put',
    data: roleCodes,
  }).then(() => true)
}

export function addUserRole(userId: string, roleCode: string): Promise<boolean> {
  return http<void>({
    url: `/api/user/role/user/${userId}/add`,
    method: 'post',
    params: { roleCode },
  }).then(() => true)
}

export function removeUserRole(userId: string, roleCode: string): Promise<boolean> {
  return http<void>({
    url: `/api/user/role/user/${userId}/remove`,
    method: 'delete',
    params: { roleCode },
  }).then(() => true)
}
