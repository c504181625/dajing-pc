import { ENTERPRISE_CAPABILITY } from '@/enum/role'
import type {
  DashboardTodoItem,
  MerchantWorkbenchData,
  PlatformWorkbenchData,
  QuickEntryItem,
  RecentOperationItem,
} from '@/types/business'

import { getMockCurrentUser } from '../context'
import { mockPromise } from '../helper'

const platformWorkbenchByRole: Record<string, PlatformWorkbenchData> = {
  super_admin: {
    overviewMetrics: [
      {
        key: 'pending_audit',
        label: '待审核主体',
        value: 28,
        highlight: '6 条已接近 SLA',
        description: '企业注册、服务机构入驻与补充材料复核任务',
        level: 'warning',
        path: '/platform/enterprise-audit',
      },
      {
        key: 'processing_demand',
        label: '处理中需求',
        value: 17,
        highlight: '4 条待重新分配',
        description: '覆盖检测、诊断、培训与标准化服务需求',
        level: 'primary',
        path: '/platform/demand',
      },
      {
        key: 'active_order',
        label: '履约中订单',
        value: 35,
        highlight: '3 条存在异常',
        description: '重点关注待收样、退款与超时订单',
        level: 'danger',
        path: '/platform/order',
      },
      {
        key: 'report_review',
        label: '待抽查报告',
        value: 11,
        highlight: '2 条高风险',
        description: '聚焦报告版本、签章与标准引用完整性',
        level: 'info',
        path: '/platform/report',
      },
    ],
    priorityQueue: [
      {
        id: 'queue-001',
        title: '苏州智造检测有限公司入驻审核',
        description: '证照已齐全，待核验 CMA/CNAS 有效期和服务范围附表。',
        businessType: '机构审核',
        priority: 'p1',
        owner: '审核组',
        deadlineText: '距 SLA 4 小时',
        statusText: '待处理',
        path: '/platform/enterprise-audit/audit-001',
      },
      {
        id: 'queue-002',
        title: '电子元器件可靠性检测需求待分配',
        description: '需求已提交 18 小时，客户要求优先匹配检测能力机构。',
        businessType: '需求流转',
        priority: 'p1',
        owner: '需求运营',
        deadlineText: '今日内完成',
        statusText: '待分配',
        path: '/platform/demand',
      },
      {
        id: 'queue-003',
        title: '报告 BG20260408018 抽查',
        description: '需复核签章页、认可范围附页与订单项目一致性。',
        businessType: '报告抽查',
        priority: 'p2',
        owner: '报告审核',
        deadlineText: '剩余 1 天',
        statusText: '处理中',
        path: '/platform/report',
      },
    ],
    flowBoard: [
      {
        id: 'flow-001',
        label: '需求待受理',
        value: 8,
        highlight: '今日新增 3',
        path: '/platform/demand',
      },
      {
        id: 'flow-002',
        label: '服务机构对接中',
        value: 12,
        highlight: '4 条待确认',
        path: '/platform/consult',
      },
      {
        id: 'flow-003',
        label: '订单履约中',
        value: 35,
        highlight: '3 条异常',
        path: '/platform/order',
      },
      {
        id: 'flow-004',
        label: '报告待发布',
        value: 9,
        highlight: '2 条待抽查',
        path: '/platform/report',
      },
    ],
    riskAlerts: [
      {
        id: 'risk-001',
        title: '机构审核积压风险',
        description: '高优先审核任务连续两天未清零，建议优先分配审核员。',
        level: 'warning',
        path: '/platform/enterprise-audit',
      },
      {
        id: 'risk-002',
        title: '订单异常需升级跟进',
        description: '退款中的 2 条订单已超 24 小时未更新处理记录。',
        level: 'danger',
        path: '/platform/order',
      },
      {
        id: 'risk-003',
        title: '社区内容待复核',
        description: '1 篇政策解读稿处于待审状态，计划今日发布。',
        level: 'info',
        path: '/platform/community/article',
      },
    ],
    todos: [
      {
        code: 'audit',
        title: '待审核机构',
        value: 28,
        path: '/platform/enterprise-audit',
        level: 'warning',
      },
      {
        code: 'demand',
        title: '待处理需求',
        value: 17,
        path: '/platform/demand',
        level: 'primary',
      },
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
      {
        title: '用户管理',
        path: '/platform/user',
        description: '查看个人用户、企业账号和启停状态。',
      },
      {
        title: '机构审核',
        path: '/platform/enterprise-audit',
        description: '处理企业入驻、补充材料和审核流转。',
      },
      {
        title: '订单管理',
        path: '/platform/order',
        description: '跟进检验检测订单、样品与异常处理。',
      },
      { title: '系统设置', path: '/system/role', description: '维护角色权限、流程与系统级配置。' },
    ],
  },
  auditor: {
    overviewMetrics: [
      {
        key: 'audit',
        label: '待审核主体',
        value: 18,
        highlight: '3 条超时预警',
        description: '以审核和抽查任务为主',
        level: 'warning',
        path: '/platform/enterprise-audit',
      },
      {
        key: 'order',
        label: '待抽检订单',
        value: 9,
        highlight: '1 条高风险',
        description: '重点查看样品异常和节点停滞订单',
        level: 'primary',
        path: '/platform/order',
      },
      {
        key: 'report',
        label: '待抽查报告',
        value: 11,
        highlight: '2 条需复核',
        description: '聚焦抽查规则命中报告',
        level: 'danger',
        path: '/platform/report',
      },
    ],
    priorityQueue: [
      {
        id: 'queue-auditor-001',
        title: '杭州工研质量技术服务有限公司补充材料复核',
        description: '已重新上传服务案例与资质附件，待人工复核。',
        businessType: '机构审核',
        priority: 'p1',
        owner: '当前审核员',
        deadlineText: '今日内',
        statusText: '待复核',
        path: '/platform/enterprise-audit/audit-002',
      },
      {
        id: 'queue-auditor-002',
        title: '报告 BG20260408018 抽查结论待确认',
        description: '需确认报告版本与标准引用一致性后给出抽查结果。',
        businessType: '报告抽查',
        priority: 'p2',
        owner: '当前审核员',
        deadlineText: '剩余 8 小时',
        statusText: '处理中',
        path: '/platform/report',
      },
    ],
    flowBoard: [
      {
        id: 'auditor-flow-001',
        label: '待审核',
        value: 18,
        highlight: '补材 5',
        path: '/platform/enterprise-audit',
      },
      {
        id: 'auditor-flow-002',
        label: '订单抽检',
        value: 9,
        highlight: '异常 1',
        path: '/platform/order',
      },
      {
        id: 'auditor-flow-003',
        label: '报告抽查',
        value: 11,
        highlight: '高风险 2',
        path: '/platform/report',
      },
    ],
    riskAlerts: [
      {
        id: 'risk-auditor-001',
        title: '审核结论超时风险',
        description: '有 3 条审核任务距 SLA 小于 6 小时。',
        level: 'warning',
        path: '/platform/enterprise-audit',
      },
    ],
    todos: [
      {
        code: 'audit',
        title: '待审核机构',
        value: 18,
        path: '/platform/enterprise-audit',
        level: 'warning',
      },
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
      {
        title: '机构审核',
        path: '/platform/enterprise-audit',
        description: '优先处理入驻审核与补充材料。',
      },
      {
        title: '订单管理',
        path: '/platform/order',
        description: '关注收样异常、退款和高风险订单。',
      },
      { title: '报告管理', path: '/platform/report', description: '执行报告抽查与完整性核验。' },
      { title: '消息中心', path: '/platform/message', description: '查看系统通知和审核待办提醒。' },
    ],
  },
}

const merchantCommonTodos: DashboardTodoItem[] = [
  {
    code: 'demand',
    title: '我的待处理需求',
    value: 3,
    path: '/enterprise/demand',
    level: 'primary',
  },
  { code: 'order', title: '我的待跟进订单', value: 2, path: '/enterprise/order', level: 'warning' },
  { code: 'message', title: '最新消息提醒', value: 2, path: '/enterprise/message', level: 'info' },
]

const capabilityTodos: Record<string, DashboardTodoItem[]> = {
  [ENTERPRISE_CAPABILITY.demander]: [
    {
      code: 'publish',
      title: '待发布需求',
      value: 1,
      path: '/enterprise/demand-publish',
      level: 'info',
    },
  ],
  [ENTERPRISE_CAPABILITY.serviceProvider]: [
    {
      code: 'service',
      title: '待对接需求',
      value: 4,
      path: '/enterprise/demand-follow',
      level: 'primary',
    },
    {
      code: 'report',
      title: '待上传报告',
      value: 2,
      path: '/enterprise/report-manage',
      level: 'danger',
    },
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
  {
    title: '企业信息',
    path: '/enterprise/enterprise',
    description: '维护企业资料、资质附件和服务范围。',
  },
  { title: '我的订单', path: '/enterprise/order', description: '跟进订单状态、收样和执行进度。' },
  { title: '我的报告', path: '/enterprise/report', description: '查看、预览和归档企业报告。' },
  {
    title: '消息中心',
    path: '/enterprise/message',
    description: '集中查看系统、需求、咨询和订单消息。',
  },
]

const capabilityEntries: Record<string, QuickEntryItem[]> = {
  [ENTERPRISE_CAPABILITY.demander]: [
    {
      title: '发布需求',
      path: '/enterprise/demand-publish',
      description: '创建需求并提交平台或指定机构处理。',
    },
    { title: '我的评价', path: '/enterprise/comment', description: '查看企业已提交的服务评价。' },
  ],
  [ENTERPRISE_CAPABILITY.serviceProvider]: [
    {
      title: '需求大厅',
      path: '/enterprise/demand-hall',
      description: '查看可承接需求并进行需求对接。',
    },
    {
      title: '服务管理',
      path: '/enterprise/service',
      description: '维护服务项目、规范字段和上下架状态。',
    },
    {
      title: '接单管理',
      path: '/enterprise/order-receive',
      description: '查看待接单、执行中和待回传订单。',
    },
    {
      title: '数据报告',
      path: '/enterprise/data-report',
      description: '查看检测进度与数据报告输出。',
    },
  ],
}

const merchantOverviewMetrics = {
  common: [
    {
      key: 'merchant-order',
      label: '我的订单',
      value: 12,
      highlight: '2 条待跟进',
      description: '覆盖履约中、待收样和待报告订单',
      level: 'primary' as const,
      path: '/enterprise/order',
    },
    {
      key: 'merchant-report',
      label: '我的报告',
      value: 8,
      highlight: '2 份待确认',
      description: '统一查看已发布和处理中报告',
      level: 'info' as const,
      path: '/enterprise/report',
    },
    {
      key: 'merchant-message',
      label: '消息提醒',
      value: 4,
      highlight: '2 条未读',
      description: '订单、需求和系统消息统一汇总',
      level: 'warning' as const,
      path: '/enterprise/message',
    },
  ],
  demander: [
    {
      key: 'merchant-demand',
      label: '我的需求',
      value: 6,
      highlight: '1 条待发布',
      description: '已提交需求与待分配需求统一管理',
      level: 'success' as const,
      path: '/enterprise/demand',
    },
  ],
  serviceProvider: [
    {
      key: 'merchant-service',
      label: '服务执行',
      value: 5,
      highlight: '2 条待上传报告',
      description: '覆盖需求对接、接单和服务履约任务',
      level: 'danger' as const,
      path: '/enterprise/order-receive',
    },
  ],
}

const merchantFlowBoard = {
  common: [
    {
      id: 'm-flow-001',
      label: '待处理消息',
      value: 4,
      highlight: '2 条未读',
      path: '/enterprise/message',
    },
    {
      id: 'm-flow-002',
      label: '履约中订单',
      value: 7,
      highlight: '样品跟进中',
      path: '/enterprise/order',
    },
  ],
  demander: [
    {
      id: 'm-flow-101',
      label: '待分配需求',
      value: 2,
      highlight: '平台处理中',
      path: '/enterprise/demand',
    },
    {
      id: 'm-flow-102',
      label: '已评价订单',
      value: 3,
      highlight: '持续沉淀服务口碑',
      path: '/enterprise/comment',
    },
  ],
  serviceProvider: [
    {
      id: 'm-flow-201',
      label: '待对接需求',
      value: 4,
      highlight: '今日新增 1',
      path: '/enterprise/demand-follow',
    },
    {
      id: 'm-flow-202',
      label: '待上传报告',
      value: 2,
      highlight: '需尽快完成',
      path: '/enterprise/report-manage',
    },
  ],
}

const merchantPriorityQueue = {
  common: [
    {
      id: 'm-queue-001',
      title: '订单 QI202604080001 需持续跟进',
      description: '当前订单已进入关键履约阶段，请保持消息与节点同步。',
      businessType: '订单履约',
      priority: 'p2' as const,
      owner: '企业主账号',
      deadlineText: '本周内',
      statusText: '处理中',
      path: '/enterprise/order',
    },
  ],
  demander: [
    {
      id: 'm-queue-101',
      title: '电子元器件可靠性需求待确认机构响应',
      description: '平台已分配服务机构，建议今日内确认排期与需求范围。',
      businessType: '需求跟进',
      priority: 'p1' as const,
      owner: '需求发布方',
      deadlineText: '今日内',
      statusText: '待确认',
      path: '/enterprise/demand',
    },
  ],
  serviceProvider: [
    {
      id: 'm-queue-201',
      title: '检测报告上传前复核',
      description: '需确认报告版本、附件和签章页后上传正式报告。',
      businessType: '报告管理',
      priority: 'p1' as const,
      owner: '服务执行团队',
      deadlineText: '剩余 8 小时',
      statusText: '待上传',
      path: '/enterprise/report-manage',
    },
  ],
}

const merchantRiskAlerts = {
  common: [
    {
      id: 'm-risk-001',
      title: '站内消息待处理',
      description: '有 2 条业务消息仍未确认，建议先进入消息中心处理。',
      level: 'warning' as const,
      path: '/enterprise/message',
    },
  ],
  demander: [
    {
      id: 'm-risk-101',
      title: '需求反馈超时风险',
      description: '1 条需求超过 24 小时未收到机构最新反馈。',
      level: 'warning' as const,
      path: '/enterprise/demand',
    },
  ],
  serviceProvider: [
    {
      id: 'm-risk-201',
      title: '报告上传节点临近',
      description: '检测完成后的报告上传节点已接近约定时限。',
      level: 'danger' as const,
      path: '/enterprise/report-manage',
    },
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
    [...merchantCommonTodos, ...capabilities.flatMap((item) => capabilityTodos[item] || [])],
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
    [...merchantCommonEntries, ...capabilities.flatMap((item) => capabilityEntries[item] || [])],
    (item) => item.path,
  )
  const overviewMetrics = dedupeByKey(
    [
      ...merchantOverviewMetrics.common,
      ...(capabilities.includes(ENTERPRISE_CAPABILITY.demander)
        ? merchantOverviewMetrics.demander
        : []),
      ...(capabilities.includes(ENTERPRISE_CAPABILITY.serviceProvider)
        ? merchantOverviewMetrics.serviceProvider
        : []),
    ],
    (item) => item.key,
  )
  const flowBoard = dedupeByKey(
    [
      ...merchantFlowBoard.common,
      ...(capabilities.includes(ENTERPRISE_CAPABILITY.demander) ? merchantFlowBoard.demander : []),
      ...(capabilities.includes(ENTERPRISE_CAPABILITY.serviceProvider)
        ? merchantFlowBoard.serviceProvider
        : []),
    ],
    (item) => item.id,
  )
  const priorityQueue = dedupeByKey(
    [
      ...merchantPriorityQueue.common,
      ...(capabilities.includes(ENTERPRISE_CAPABILITY.demander)
        ? merchantPriorityQueue.demander
        : []),
      ...(capabilities.includes(ENTERPRISE_CAPABILITY.serviceProvider)
        ? merchantPriorityQueue.serviceProvider
        : []),
    ],
    (item) => item.id,
  )
  const riskAlerts = dedupeByKey(
    [
      ...merchantRiskAlerts.common,
      ...(capabilities.includes(ENTERPRISE_CAPABILITY.demander) ? merchantRiskAlerts.demander : []),
      ...(capabilities.includes(ENTERPRISE_CAPABILITY.serviceProvider)
        ? merchantRiskAlerts.serviceProvider
        : []),
    ],
    (item) => item.id,
  )

  return mockPromise({
    todos,
    recentOperations,
    quickEntries,
    overviewMetrics,
    flowBoard,
    priorityQueue,
    riskAlerts,
  })
}

export const mockGetPlatformWorkbench = mockGetPlatformDashboard
export const mockGetMerchantWorkbench = mockGetMerchantDashboard
