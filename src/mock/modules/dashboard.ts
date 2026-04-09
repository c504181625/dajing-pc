import { ENTERPRISE_CAPABILITY } from '@/enum/role'
import type { DashboardTodoItem, MerchantWorkbenchData, PlatformWorkbenchData, QuickEntryItem, RecentOperationItem } from '@/types/business'

import { getMockCurrentUser } from '../context'
import { mockPromise } from '../helper'

const platformWorkbenchByRole: Record<string, PlatformWorkbenchData> = {
  super_admin: {
    todos: [
      { code: 'audit', title: '待审核机构', value: 28, path: '/platform/enterprise-audit', level: 'warning' },
      { code: 'demand', title: '待处理需求', value: 17, path: '/platform/demand', level: 'primary' },
      { code: 'order', title: '待跟进订单', value: 35, path: '/platform/order', level: 'danger' },
      { code: 'report', title: '待抽查报告', value: 11, path: '/platform/report', level: 'info' },
    ],
    recentOperations: [
      {
        id: 'op-001',
        title: '机构入驻审核通过',
        description: '苏州智造检测有限公司已完成平台准入审核并进入正式服务名单。',
        operator: '平台运营组',
        createdAt: '2026-04-08 10:18:00',
      },
      {
        id: 'op-002',
        title: '需求已分配服务机构',
        description: '电子元器件可靠性检测需求已分配给杭州工研质量技术服务有限公司。',
        operator: '平台运营组',
        createdAt: '2026-04-08 09:46:00',
      },
      {
        id: 'op-003',
        title: '发起报告抽查',
        description: '对报告 BG20260408018 发起完整性抽查，等待审核员跟进。',
        operator: '平台运营组',
        createdAt: '2026-04-08 09:12:00',
      },
    ],
    quickEntries: [
      { title: '用户管理', path: '/platform/user', description: '查看个人用户、企业账号和启停状态。' },
      { title: '机构审核', path: '/platform/enterprise-audit', description: '处理企业入驻、补充材料和审核流转。' },
      { title: '订单管理', path: '/platform/order', description: '跟进检验检测订单、样品与异常处理。' },
      { title: '系统设置', path: '/system/role', description: '维护角色权限、流程与系统级配置。' },
    ],
  },
  auditor: {
    todos: [
      { code: 'audit', title: '待审核机构', value: 18, path: '/platform/enterprise-audit', level: 'warning' },
      { code: 'order', title: '待抽检订单', value: 9, path: '/platform/order', level: 'primary' },
      { code: 'report', title: '待抽查报告', value: 11, path: '/platform/report', level: 'danger' },
    ],
    recentOperations: [
      {
        id: 'op-101',
        title: '审核员已退回补充材料',
        description: '杭州工研质量技术服务有限公司被要求补充近两年服务案例。',
        operator: '审核员',
        createdAt: '2026-04-08 10:20:00',
      },
      {
        id: 'op-102',
        title: '报告抽查处理中',
        description: '报告 BG20260408018 当前已进入抽查阶段。',
        operator: '审核员',
        createdAt: '2026-04-08 09:36:00',
      },
    ],
    quickEntries: [
      { title: '机构审核', path: '/platform/enterprise-audit', description: '优先处理入驻审核与补充材料。' },
      { title: '订单管理', path: '/platform/order', description: '关注收样异常、退款和高风险订单。' },
      { title: '报告管理', path: '/platform/report', description: '执行报告抽查与完整性核验。' },
      { title: '消息中心', path: '/platform/message', description: '查看系统通知和审核待办提醒。' },
    ],
  },
}

const merchantCommonTodos: DashboardTodoItem[] = [
  { code: 'demand', title: '我的待处理需求', value: 3, path: '/enterprise/demand', level: 'primary' },
  { code: 'order', title: '我的待跟进订单', value: 2, path: '/enterprise/order', level: 'warning' },
  { code: 'message', title: '最新消息提醒', value: 2, path: '/enterprise/message', level: 'info' },
]

const capabilityTodos: Record<string, DashboardTodoItem[]> = {
  [ENTERPRISE_CAPABILITY.demander]: [
    { code: 'publish', title: '待发布需求', value: 1, path: '/enterprise/demand-publish', level: 'info' },
  ],
  [ENTERPRISE_CAPABILITY.serviceProvider]: [
    { code: 'service', title: '待对接需求', value: 4, path: '/enterprise/demand-follow', level: 'primary' },
  ],
  [ENTERPRISE_CAPABILITY.labProvider]: [
    { code: 'report', title: '待上传报告', value: 2, path: '/enterprise/report-manage', level: 'danger' },
  ],
}

const merchantCommonOperations: RecentOperationItem[] = [
  {
    id: 'merchant-op-001',
    title: '收到平台消息提醒',
    description: '当前有新的业务通知与订单进展提醒，请及时查看。',
    operator: '平台系统',
    createdAt: '2026-04-08 11:10:00',
  },
]

const capabilityOperations: Record<string, RecentOperationItem[]> = {
  [ENTERPRISE_CAPABILITY.demander]: [
    {
      id: 'merchant-op-101',
      title: '需求已分配机构',
      description: '电子元器件可靠性检测需求已分配至服务机构，请持续关注跟进。',
      operator: '平台运营组',
      createdAt: '2026-04-08 10:00:00',
    },
  ],
  [ENTERPRISE_CAPABILITY.serviceProvider]: [
    {
      id: 'merchant-op-201',
      title: '收到平台分配需求',
      description: 'ISO9001 质量诊断辅导需求已进入本机构待跟进池。',
      operator: '平台运营组',
      createdAt: '2026-04-08 10:30:00',
    },
  ],
  [ENTERPRISE_CAPABILITY.labProvider]: [
    {
      id: 'merchant-op-301',
      title: '订单待上传正式报告',
      description: '订单 QI202604080001 已完成检测，请上传正式报告。',
      operator: '平台系统',
      createdAt: '2026-04-08 09:50:00',
    },
  ],
}

const merchantCommonEntries: QuickEntryItem[] = [
  { title: '企业信息', path: '/enterprise/enterprise', description: '维护企业资料、资质附件和服务范围。' },
  { title: '我的订单', path: '/enterprise/order', description: '跟进订单状态、收样和执行进度。' },
  { title: '我的报告', path: '/enterprise/report', description: '查看、预览和归档企业报告。' },
  { title: '消息中心', path: '/enterprise/message', description: '集中查看系统、需求、咨询和订单消息。' },
]

const capabilityEntries: Record<string, QuickEntryItem[]> = {
  [ENTERPRISE_CAPABILITY.demander]: [
    { title: '发布需求', path: '/enterprise/demand-publish', description: '创建需求并提交平台或指定机构处理。' },
    { title: '我的评价', path: '/enterprise/comment', description: '查看企业已提交的服务评价。' },
  ],
  [ENTERPRISE_CAPABILITY.serviceProvider]: [
    { title: '需求大厅', path: '/enterprise/demand-hall', description: '查看可承接需求并进行需求对接。' },
    { title: '服务管理', path: '/enterprise/service', description: '维护服务项目、规范字段和上下架状态。' },
  ],
  [ENTERPRISE_CAPABILITY.labProvider]: [
    { title: '接单管理', path: '/enterprise/order-receive', description: '查看待接单、执行中和待回传订单。' },
    { title: '数据报告', path: '/enterprise/data-report', description: '查看检测进度与数据报告输出。' },
  ],
}

function dedupeByKey<T>(list: T[], getKey: (item: T) => string) {
  const seen = new Set<string>()
  return list.filter((item) => {
    const key = getKey(item)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function mockGetPlatformDashboard(): Promise<PlatformWorkbenchData> {
  const role = getMockCurrentUser().platformRole || 'super_admin'
  return mockPromise(platformWorkbenchByRole[role] ?? platformWorkbenchByRole.super_admin!)
}

export function mockGetMerchantDashboard(): Promise<MerchantWorkbenchData> {
  const capabilities = getMockCurrentUser().enterpriseCapabilities || []
  const todos = dedupeByKey(
    [
      ...merchantCommonTodos,
      ...capabilities.flatMap((item) => capabilityTodos[item] || []),
    ],
    (item) => item.path || item.code,
  )
  const recentOperations = dedupeByKey(
    [
      ...merchantCommonOperations,
      ...capabilities.flatMap((item) => capabilityOperations[item] || []),
    ],
    (item) => item.id,
  )
  const quickEntries = dedupeByKey(
    [
      ...merchantCommonEntries,
      ...capabilities.flatMap((item) => capabilityEntries[item] || []),
    ],
    (item) => item.path,
  )

  return mockPromise({
    todos,
    recentOperations,
    quickEntries,
  })
}

export const mockGetPlatformWorkbench = mockGetPlatformDashboard
export const mockGetMerchantWorkbench = mockGetMerchantDashboard
