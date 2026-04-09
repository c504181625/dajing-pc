import type { PermissionTreeNode, RoleItem } from '@/types/business'
import { http } from '@/utils/request'
import { isUseMock } from '../helper'
import { mockGetPermissionTree, mockGetRoleList } from '@/mock/modules/system'

export function getRoleList(): Promise<RoleItem[]> {
  if (isUseMock()) return mockGetRoleList()
  return http<RoleItem[]>({ url: '/system/role/list', method: 'get' })
}

export function getPermissionTree(): Promise<PermissionTreeNode[]> {
  if (isUseMock()) return mockGetPermissionTree()
  return http<PermissionTreeNode[]>({ url: '/system/permission/tree', method: 'get' })
}
