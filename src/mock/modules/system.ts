import type { PermissionTreeNode, RoleItem } from '@/types/business'
import { mockPromise } from '../helper'

const roleList: RoleItem[] = [
  {
    id: 'role-001',
    name: '平台超级管理员',
    code: 'super_admin',
    dataScope: '全部企业',
    permissions: [
      '*:*:*',
      'user:manage:view',
      'audit:enterprise:approve',
      'demand:manage:view',
      'order:manage:view',
      'report:manage:view',
      'system:role:view',
    ],
  },
  {
    id: 'role-002',
    name: '平台审核员',
    code: 'auditor',
    dataScope: '审核相关数据',
    permissions: [
      'platform:dashboard:view',
      'audit:enterprise:query',
      'audit:enterprise:approve',
      'order:manage:view',
      'report:manage:view',
      'message:manage:view',
    ],
  },
  {
    id: 'role-003',
    name: '企业复合身份示例',
    code: 'enterprise_demander+service_provider',
    dataScope: '本企业数据',
    permissions: [
      'enterprise:dashboard:view',
      'enterprise:demand:view',
      'enterprise:demand:publish',
      'enterprise:demand-hall:view',
      'enterprise:demand:handle',
      'enterprise:order:view',
      'enterprise:service:manage',
      'enterprise:message:view',
    ],
  },
]

const permissionTree: PermissionTreeNode[] = [
  {
    id: 'platform-root',
    label: '平台运营后台',
    type: 'menu',
    children: [
      { id: 'platform-dashboard', label: '工作台', type: 'menu' },
      { id: 'platform-user', label: '用户管理', type: 'menu' },
      { id: 'platform-enterprise-audit', label: '机构管理', type: 'menu' },
      { id: 'platform-demand', label: '需求管理', type: 'menu' },
      { id: 'platform-consult', label: '咨询管理', type: 'menu' },
      { id: 'platform-order', label: '订单管理', type: 'menu' },
      { id: 'platform-report', label: '数据报告', type: 'menu' },
      { id: 'platform-comment', label: '评价管理', type: 'menu' },
      { id: 'platform-message', label: '消息管理', type: 'menu' },
      { id: 'platform-service', label: '服务管理', type: 'menu' },
      { id: 'platform-community-article', label: '社区文章管理', type: 'menu' },
      { id: 'platform-community-question', label: '社区提问管理', type: 'menu' },
      { id: 'platform-community-expert', label: '专家信息管理', type: 'menu' },
      { id: 'platform-mall', label: '商城管理', type: 'menu' },
      { id: 'platform-logistics', label: '物流信息', type: 'menu' },
      { id: 'platform-stats', label: '报表统计', type: 'menu' },
      { id: 'platform-order-force-close', label: '订单强制关闭', type: 'button' },
      { id: 'platform-report-invalidate', label: '报告作废', type: 'button' },
    ],
  },
  {
    id: 'merchant-demander-root',
    label: '服务需求方后台',
    type: 'menu',
    children: [
      { id: 'merchant-dashboard', label: '企业工作台', type: 'menu' },
      { id: 'merchant-enterprise', label: '机构信息维护', type: 'menu' },
      { id: 'merchant-demand', label: '需求管理', type: 'menu' },
      { id: 'merchant-consult', label: '咨询管理', type: 'menu' },
      { id: 'merchant-order', label: '订单管理', type: 'menu' },
      { id: 'merchant-report', label: '报告管理', type: 'menu' },
      { id: 'merchant-comment', label: '评价管理', type: 'menu' },
      { id: 'merchant-message', label: '消息管理', type: 'menu' },
      { id: 'merchant-community', label: '质量社区', type: 'menu' },
      { id: 'merchant-mall', label: '商城管理', type: 'menu' },
      { id: 'merchant-account-security', label: '账号安全', type: 'menu' },
    ],
  },
  {
    id: 'merchant-provider-root',
    label: '服务提供方后台',
    type: 'menu',
    children: [
      { id: 'provider-dashboard', label: '企业工作台', type: 'menu' },
      { id: 'provider-enterprise', label: '机构信息维护', type: 'menu' },
      { id: 'provider-demand', label: '需求管理', type: 'menu' },
      { id: 'provider-consult', label: '咨询管理', type: 'menu' },
      { id: 'provider-order', label: '订单管理', type: 'menu' },
      { id: 'provider-report', label: '报告管理', type: 'menu' },
      { id: 'provider-service', label: '服务管理', type: 'menu' },
      { id: 'provider-mall', label: '商城管理', type: 'menu' },
      { id: 'provider-stats', label: '报表管理', type: 'menu' },
      { id: 'provider-data-report', label: '数据报告', type: 'menu' },
      { id: 'provider-comment', label: '评价管理', type: 'menu' },
      { id: 'provider-message', label: '消息管理', type: 'menu' },
      { id: 'provider-community', label: '质量社区', type: 'menu' },
    ],
  },
  {
    id: 'system-root',
    label: '系统设置',
    type: 'menu',
    children: [
      { id: 'system-role', label: '角色权限管理', type: 'menu' },
      { id: 'system-workflow-template', label: '工作流模板', type: 'menu' },
      { id: 'system-workflow-node', label: '工作流节点', type: 'menu' },
      { id: 'system-workflow-record', label: '工作流审批记录', type: 'menu' },
    ],
  },
]

export function mockGetRoleList() {
  return mockPromise(roleList)
}

export function mockGetPermissionTree() {
  return mockPromise(permissionTree)
}
