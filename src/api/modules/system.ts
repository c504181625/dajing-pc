import { PERMISSION_CODE } from '@/enum/permission'
import type { PermissionTreeNode, RoleItem } from '@/types/business'
import {
  addUserRole,
  assignUserRoles,
  createRole,
  deleteRole,
  getRoleList as fetchRoleList,
  getUserAssignedRoles,
  removeUserRole,
  updateRole,
} from './role'

const DOMAIN_LABEL_MAP: Record<string, string> = {
  operator: '平台运营后台',
  enterprise: '企业/机构后台',
  personal: '个人后台',
  content: '质量社区',
  system: '系统管理',
  workflow: '流程配置',
}

const RESOURCE_LABEL_MAP: Record<string, string> = {
  dashboard: '工作台',
  user: '用户管理',
  enterprise: '企业资料',
  'enterprise-audit': '企业/机构审核',
  demand: '需求管理',
  consult: '咨询管理',
  order: '订单管理',
  report: '报告管理',
  comment: '评价管理',
  message: '消息中心',
  role: '角色权限',
  skin: '系统皮肤',
  profile: '个人资料',
  'account-settings': '账号安全',
  'enterprise-upgrade': '企业升级',
  'service-capability': '服务能力',
  'service-project': '服务项目',
  'order-receive': '接单管理',
  qualification: '资质认证',
  'provider-qualification': '机构认证',
  service: '服务管理',
  manage: '内容管理',
  dictionary: '数据字典',
  'operation-log': '操作日志',
  dangerous: '高风险操作',
}

const ACTION_LABEL_MAP: Record<string, string> = {
  view: '查看',
  edit: '编辑',
  approve: '审核',
  assign: '分派',
  handle: '处理',
  audit: '发布审核',
  publish: '发布',
  submit: '提交',
  manage: '管理',
  shelf: '上架',
  action: '执行',
}

function humanizePermissionLabel(code: string) {
  const [, resource = '', action = ''] = code.split(':')
  const resourceLabel = RESOURCE_LABEL_MAP[resource] || resource || code
  const actionLabel = ACTION_LABEL_MAP[action] || action || '查看'
  return `${resourceLabel} / ${actionLabel}`
}

export function getRoleList(): Promise<RoleItem[]> {
  return fetchRoleList()
}

export function getPermissionTree(): Promise<PermissionTreeNode[]> {
  const groups = new Map<string, PermissionTreeNode>()

  Object.values(PERMISSION_CODE).forEach((code) => {
    const [domain = 'misc'] = code.split(':')
    const existing = groups.get(domain)
    const child: PermissionTreeNode = {
      id: code,
      label: humanizePermissionLabel(code),
      type: 'button',
    }

    if (existing) {
      existing.children = [...(existing.children || []), child]
      return
    }

    groups.set(domain, {
      id: `group:${domain}`,
      label: DOMAIN_LABEL_MAP[domain] || domain,
      type: 'menu',
      children: [child],
    })
  })

  return Promise.resolve([...groups.values()])
}

export {
  addUserRole,
  assignUserRoles,
  createRole,
  deleteRole,
  getUserAssignedRoles,
  removeUserRole,
  updateRole,
}
