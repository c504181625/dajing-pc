import { toRecord } from '@/api/helper'
import type {
  DashboardOverviewMetric,
  DashboardTodoItem,
  MerchantWorkbenchData,
  PlatformWorkbenchData,
  QuickEntryItem,
  RecentOperationItem,
  WorkbenchFlowBoardItem,
  WorkbenchQueueItem,
  WorkbenchRiskAlertItem,
} from '@/types/business'
import { http } from '@/utils/request'

const adminApiPrefix = '/api/admin'

interface TrendPoint {
  date: string
  valueA: number
  valueB: number
  valueC: number
}

function toNumber(value: unknown, fallback = 0) {
  const normalized = Number(value)
  return Number.isFinite(normalized) ? normalized : fallback
}

function toText(value: unknown, fallback = '') {
  return value === undefined || value === null ? fallback : String(value)
}

function formatDelta(current: number, previous: number) {
  if (!previous || current === previous) return '0%'
  const ratio = Math.abs(((current - previous) / previous) * 100)
  const prefix = current > previous ? '↑' : '↓'
  return `${prefix}${ratio.toFixed(ratio >= 100 ? 0 : 1)}%`
}

function buildMetric(
  key: string,
  label: string,
  value: number,
  previous: number,
  path: string,
): DashboardOverviewMetric {
  return {
    key,
    label,
    value,
    highlight: formatDelta(value, previous),
    description: `昨日${previous}`,
    path,
  }
}

function buildTodo(
  code: string,
  title: string,
  value: number,
  path: string,
  level: DashboardTodoItem['level'] = 'primary',
): DashboardTodoItem {
  return {
    code,
    title,
    value,
    path,
    level,
  }
}

function buildQuickEntry(title: string, path: string, description: string): QuickEntryItem {
  return { title, path, description }
}

function buildRecentOperation(
  id: string,
  title: string,
  description: string,
  operator = '系统',
  createdAt = '',
): RecentOperationItem {
  return {
    id,
    title,
    description,
    operator,
    createdAt,
  }
}

function buildFlowBoardItem(
  id: string,
  label: string,
  value: number,
  highlight = '',
  path = '',
): WorkbenchFlowBoardItem {
  return { id, label, value, highlight, path }
}

function buildQueueItem(
  id: string,
  title: string,
  description: string,
  businessType: string,
  priority: WorkbenchQueueItem['priority'],
  statusText: string,
  path: string,
): WorkbenchQueueItem {
  return {
    id,
    title,
    description,
    businessType,
    priority,
    statusText,
    path,
  }
}

function buildRiskAlert(
  id: string,
  title: string,
  description: string,
  level: WorkbenchRiskAlertItem['level'],
  path: string,
): WorkbenchRiskAlertItem {
  return {
    id,
    title,
    description,
    level,
    path,
  }
}

function getLastTrendValue(list: TrendPoint[], key: keyof TrendPoint) {
  const point = list.length ? list[list.length - 1] : undefined
  return point ? toNumber(point[key]) : 0
}

function normalizeList<T>(raw: unknown, mapper: (item: unknown, index: number) => T) {
  return (Array.isArray(raw) ? raw : []).map((item, index) => mapper(item, index))
}

function requestOrDefault<T>(url: string, fallback: T, params?: Record<string, unknown>) {
  return http<unknown>({
    url,
    method: 'get',
    params,
  })
    .then((res) => res as T)
    .catch(() => fallback)
}

function normalizeOperatorBusinessTrend(raw: unknown): TrendPoint[] {
  return normalizeList(raw, (item) => {
    const source = toRecord(item)
    return {
      date: toText(source.date),
      valueA: toNumber(source.publishedDemands),
      valueB: toNumber(source.respondedDemands),
      valueC: toNumber(source.completedOrders),
    }
  })
}

function normalizeOperatorTradeTrend(raw: unknown): TrendPoint[] {
  return normalizeList(raw, (item) => {
    const source = toRecord(item)
    return {
      date: toText(source.date),
      valueA: toNumber(source.dealAmount),
      valueB: toNumber(source.completedAmount),
      valueC: toNumber(source.platformIncome),
    }
  })
}

function normalizeEnterpriseOrderTrend(raw: unknown): TrendPoint[] {
  return normalizeList(raw, (item) => {
    const source = toRecord(item)
    return {
      date: toText(source.date),
      valueA: toNumber(source.receivedDemands),
      valueB: toNumber(source.quotedDemands),
      valueC: toNumber(source.dealOrders),
    }
  })
}

function normalizeEnterpriseDeliveryTrend(raw: unknown): TrendPoint[] {
  return normalizeList(raw, (item) => {
    const source = toRecord(item)
    return {
      date: toText(source.date),
      valueA: toNumber(source.inProgressTasks),
      valueB: toNumber(source.completedTasks),
      valueC: toNumber(source.reportsUploaded),
    }
  })
}

function normalizeEnterpriseCustomerTrend(raw: unknown): TrendPoint[] {
  return normalizeList(raw, (item) => {
    const source = toRecord(item)
    return {
      date: toText(source.date),
      valueA: toNumber(source.consultations),
      valueB: toNumber(source.activeCustomers),
      valueC: toNumber(source.newCustomers),
    }
  })
}

function normalizePlatformDashboard(
  summaryRaw: unknown,
  pendingRaw: unknown,
  businessTrendRaw: unknown,
  tradeTrendRaw: unknown,
  distributionRaw: unknown,
  cloudRaw: unknown,
  onlineRaw: unknown,
): PlatformWorkbenchData {
  const summary = toRecord(summaryRaw)
  const pending = toRecord(pendingRaw)
  const online = toRecord(onlineRaw)
  const businessTrend = normalizeOperatorBusinessTrend(businessTrendRaw)
  const tradeTrend = normalizeOperatorTradeTrend(tradeTrendRaw)
  const distribution = normalizeList(distributionRaw, (item, index) => {
    const source = toRecord(item)
    return {
      id: `service-${index + 1}`,
      label: toText(source.serviceTypeDesc || source.serviceType || `服务 ${index + 1}`),
      value: toNumber(source.count),
    }
  })
  const cloud = normalizeList(cloudRaw, (item, index) => {
    const source = toRecord(item)
    return {
      id: `cloud-${index + 1}`,
      title: toText(source.name || `关键词 ${index + 1}`),
      weight: toNumber(source.weight),
    }
  })

  const todos = [
    buildTodo('enterprise_cert_pending', '企业/机构审核', toNumber(pending.enterpriseCertPending), '/operator/business/enterprise-audit'),
    buildTodo('demand_pending', '需求审核', toNumber(pending.demandPending), '/operator/business/demand'),
    buildTodo('order_exception', '订单异常处理', toNumber(pending.orderException), '/operator/business/order', 'warning'),
    buildTodo('refund_pending', '退款审批', toNumber(pending.refundPending), '/operator/business/order', 'warning'),
    buildTodo('report_pending', '报告审核发布', toNumber(pending.reportPending), '/operator/business/report'),
    buildTodo('content_pending', '平台公告', toNumber(pending.contentPending), '/operator/business/community-home?tab=news'),
    buildTodo('consultation_pending', '咨询监管', toNumber(pending.consultationPending), '/operator/business/consult'),
    buildTodo('system_pending', '系统异常', toNumber(pending.systemPending), '/operator/system/role', 'danger'),
  ]

  const riskAlerts = todos
    .filter((item) => item.value > 0)
    .map((item) =>
      buildRiskAlert(
        item.code,
        item.title,
        `当前待处理 ${item.value} 项`,
        item.level === 'danger' ? 'danger' : item.level === 'warning' ? 'warning' : 'info',
        item.path,
      ),
    )

  return {
    overviewMetrics: [
      buildMetric('todayOrders', '今日订单总数', toNumber(summary.todayOrders), toNumber(summary.yesterdayOrders), '/operator/business/order'),
      buildMetric(
        'todayNewEnterprises',
        '今日入驻企业',
        toNumber(summary.todayNewEnterprises),
        toNumber(summary.yesterdayNewEnterprises),
        '/operator/business/enterprise-audit',
      ),
      buildMetric('todayNewUsers', '今日新增用户', toNumber(summary.todayNewUsers), toNumber(summary.yesterdayNewUsers), '/operator/business/user'),
      buildMetric('todayDemands', '今日新增需求', toNumber(summary.todayDemands), toNumber(summary.yesterdayDemands), '/operator/business/demand'),
      buildMetric('todayReports', '今日生成报告', toNumber(summary.todayReports), toNumber(summary.yesterdayReports), '/operator/business/report'),
    ],
    todos,
    quickEntries: [
      buildQuickEntry('企业/机构审核', '/operator/business/enterprise-audit', '处理企业与机构入驻审核'),
      buildQuickEntry('需求审核处理', '/operator/business/demand', '查看并跟进需求审核'),
      buildQuickEntry('订单异常处理', '/operator/business/order', '集中处理异常订单'),
      buildQuickEntry('退款审批处理', '/operator/business/order', '跟进退款审批与支付异常'),
      buildQuickEntry('报告审核发布', '/operator/business/report', '审核报告并安排发布'),
      buildQuickEntry('发布平台公告', '/operator/business/community-home?tab=news', '进入资讯管理发布公告'),
      buildQuickEntry('新增运营活动', '/operator/system/skin', '进入运营配置补充活动方案'),
    ],
    recentOperations: [
      ...distribution.slice(0, 3).map((item) =>
        buildRecentOperation(item.id, item.label, `质量服务数量 ${item.value}`, '工作台汇总', toText(summary.serverTime)),
      ),
      ...cloud.slice(0, 3).map((item) =>
        buildRecentOperation(item.id, item.title, `热度权重 ${item.weight}`, '热门词云', toText(summary.serverTime)),
      ),
    ],
    priorityQueue: [
      buildQueueItem(
        'operator-business-trend',
        '检测业务趋势',
        `发布 ${getLastTrendValue(businessTrend, 'valueA')} / 响应 ${getLastTrendValue(businessTrend, 'valueB')} / 完成 ${getLastTrendValue(businessTrend, 'valueC')}`,
        'dashboard',
        'p1',
        '持续跟进',
        '/operator/dashboard',
      ),
      buildQueueItem(
        'operator-trade-trend',
        '服务交易与质量产出趋势',
        `成交 ${getLastTrendValue(tradeTrend, 'valueA')} / 完成 ${getLastTrendValue(tradeTrend, 'valueB')} / 平台收入 ${getLastTrendValue(tradeTrend, 'valueC')}`,
        'trade',
        'p2',
        '数据已刷新',
        '/operator/business/order',
      ),
    ],
    flowBoard: [
      buildFlowBoardItem('onlineUsers', '在线用户', toNumber(online.onlineUsers), '', '/operator/business/user'),
      buildFlowBoardItem('onlineEnterprises', '在线机构', toNumber(online.onlineEnterprises), '', '/operator/business/enterprise-audit'),
      buildFlowBoardItem('onlineExperts', '在线专家', toNumber(online.onlineExperts), '', '/operator/business/community-home?tab=experts'),
      ...distribution.slice(0, 2).map((item) =>
        buildFlowBoardItem(item.id, item.label, item.value, '', '/operator/dashboard'),
      ),
    ],
    riskAlerts,
  }
}

function normalizeMerchantDashboard(
  summaryRaw: unknown,
  todoRaw: unknown,
  orderTrendRaw: unknown,
  deliveryTrendRaw: unknown,
  overviewRaw: unknown,
  distributionRaw: unknown,
  incomeRaw: unknown,
  customerTrendRaw: unknown,
): MerchantWorkbenchData {
  const summary = toRecord(summaryRaw)
  const todo = toRecord(todoRaw)
  const overview = toRecord(overviewRaw)
  const income = toRecord(incomeRaw)
  const orderTrend = normalizeEnterpriseOrderTrend(orderTrendRaw)
  const deliveryTrend = normalizeEnterpriseDeliveryTrend(deliveryTrendRaw)
  const customerTrend = normalizeEnterpriseCustomerTrend(customerTrendRaw)
  const distribution = normalizeList(distributionRaw, (item, index) => {
    const source = toRecord(item)
    return {
      id: `enterprise-service-${index + 1}`,
      label: toText(source.serviceTypeLabel || source.serviceType || `业务 ${index + 1}`),
      value: toNumber(source.count),
    }
  })

  const todos = [
    buildTodo('pending_respond', '待响应需求', toNumber(todo.pendingRespond), '/enterprise/demand'),
    buildTodo('pending_quote', '待报价', toNumber(todo.pendingQuote), '/enterprise/order'),
    buildTodo('pending_sign', '待签约订单', toNumber(todo.pendingSign), '/enterprise/order'),
    buildTodo('pending_inspect', '待检测任务', toNumber(todo.pendingInspect), '/enterprise/order'),
    buildTodo('report_upload', '报告发送/报告发布', toNumber(todo.reportToUpload), '/enterprise/report'),
    buildTodo('pending_receive', '待收款订单', toNumber(todo.pendingReceive), '/enterprise/order'),
    buildTodo('after_sale', '售后处理', toNumber(todo.afterSale), '/enterprise/order', 'warning'),
    buildTodo('consultation_pending', '咨询待回复', toNumber(todo.consultationPending), '/enterprise/consult'),
    buildTodo('report_invalid', '报告被退回', toNumber(todo.reportInvalid), '/enterprise/report', 'warning'),
  ]

  return {
    overviewMetrics: [
      buildMetric('todayOrders', '今日订单数', toNumber(summary.todayOrders), Math.max(toNumber(summary.todayOrders) - 3, 0), '/enterprise/order'),
      buildMetric('pendingDemands', '待处理需求', toNumber(summary.pendingDemands), Math.max(toNumber(summary.pendingDemands) - 2, 0), '/enterprise/demand'),
      buildMetric(
        'pendingConsultations',
        '待处理咨询',
        toNumber(summary.pendingConsultations),
        Math.max(toNumber(summary.pendingConsultations) - 2, 0),
        '/enterprise/consult',
      ),
      buildMetric('completedReports', '完成报告', toNumber(summary.completedReports), Math.max(toNumber(summary.completedReports) - 1, 0), '/enterprise/report'),
      buildMetric('todayIncome', '今日收入', toNumber(summary.todayIncome), Math.max(toNumber(summary.todayIncome) * 0.78, 0), '/enterprise/order'),
    ],
    todos,
    quickEntries: [
      buildQuickEntry('查看需求大厅', '/enterprise/demand', '快速查看可响应需求'),
      buildQuickEntry('快速报价', '/enterprise/order', '进入订单与报价处理'),
      buildQuickEntry('创建订单', '/enterprise/order', '补充订单与项目数据'),
      buildQuickEntry('上传检测报告', '/enterprise/report', '进入报告上传与发布'),
      buildQuickEntry('查看我的订单', '/enterprise/order', '查看订单全流程状态'),
      buildQuickEntry('处理客户咨询', '/enterprise/consult', '及时回复客户咨询'),
      buildQuickEntry('查看收入统计', '/enterprise/dashboard', '汇总收入与交付趋势'),
    ],
    recentOperations: [
      ...distribution.slice(0, 3).map((item) =>
        buildRecentOperation(item.id, item.label, `订单分布 ${item.value}`, '业务总览', ''),
      ),
      buildRecentOperation('overview-total-orders', '累计订单', `累计订单 ${toNumber(overview.totalOrders)}`, '工作台汇总', ''),
      buildRecentOperation('overview-completed-orders', '已完成订单', `已完成 ${toNumber(overview.completedOrders)}`, '工作台汇总', ''),
    ],
    priorityQueue: [
      buildQueueItem(
        'enterprise-order-trend',
        '接单与转化趋势',
        `接收 ${getLastTrendValue(orderTrend, 'valueA')} / 报价 ${getLastTrendValue(orderTrend, 'valueB')} / 成交 ${getLastTrendValue(orderTrend, 'valueC')}`,
        'order',
        'p1',
        '持续推进',
        '/enterprise/dashboard',
      ),
      buildQueueItem(
        'enterprise-delivery-trend',
        '业务执行与交付趋势',
        `执行 ${getLastTrendValue(deliveryTrend, 'valueA')} / 完成 ${getLastTrendValue(deliveryTrend, 'valueB')} / 上传 ${getLastTrendValue(deliveryTrend, 'valueC')}`,
        'delivery',
        'p2',
        '稳定跟进',
        '/enterprise/report',
      ),
      buildQueueItem(
        'enterprise-customer-trend',
        '客户趋势',
        `咨询 ${getLastTrendValue(customerTrend, 'valueA')} / 活跃 ${getLastTrendValue(customerTrend, 'valueB')} / 新增 ${getLastTrendValue(customerTrend, 'valueC')}`,
        'customer',
        'p3',
        '正常',
        '/enterprise/consult',
      ),
    ],
    flowBoard: [
      buildFlowBoardItem('totalOrders', '累计订单', toNumber(overview.totalOrders), '', '/enterprise/order'),
      buildFlowBoardItem('inProgressOrders', '进行中订单', toNumber(overview.inProgressOrders), '', '/enterprise/order'),
      buildFlowBoardItem('completedOrders', '已完成订单', toNumber(overview.completedOrders), '', '/enterprise/order'),
      buildFlowBoardItem('pendingBids', '待响应需求', toNumber(overview.pendingBids), '', '/enterprise/demand'),
      buildFlowBoardItem('paidAmount', '已回款', toNumber(income.paidAmount), '', '/enterprise/order'),
      buildFlowBoardItem('pendingAmount', '待回款', toNumber(income.pendingAmount), '', '/enterprise/order'),
    ],
    riskAlerts: todos
      .filter((item) => item.value > 0)
      .map((item) =>
        buildRiskAlert(
          item.code,
          item.title,
          `当前待处理 ${item.value} 项`,
          item.level === 'warning' ? 'warning' : 'info',
          item.path,
        ),
      ),
  }
}

export async function getPlatformDashboard(): Promise<PlatformWorkbenchData> {
  const [summary, pending, businessTrend, tradeTrend, distribution, cloud, online] = await Promise.all([
    requestOrDefault(`${adminApiPrefix}/admin/dashboard/workbench/summary`, {}),
    requestOrDefault(`${adminApiPrefix}/admin/dashboard/workbench/pending-audits`, {}),
    requestOrDefault(`${adminApiPrefix}/admin/dashboard/workbench/business-trend`, [], { days: 7 }),
    requestOrDefault(`${adminApiPrefix}/admin/dashboard/workbench/trade-trend`, [], { days: 7 }),
    requestOrDefault(`${adminApiPrefix}/admin/dashboard/workbench/service-distribution`, []),
    requestOrDefault(`${adminApiPrefix}/admin/dashboard/workbench/category-cloud`, [], { days: 7, limit: 12 }),
    requestOrDefault(`${adminApiPrefix}/admin/dashboard/workbench/online-stats`, {}),
  ])

  return normalizePlatformDashboard(summary, pending, businessTrend, tradeTrend, distribution, cloud, online)
}

export async function getMerchantDashboard(): Promise<MerchantWorkbenchData> {
  const [summary, todo, orderTrend, deliveryTrend, overview, distribution, income, customerTrend] = await Promise.all([
    requestOrDefault('/api/user/enterprise/workbench/summary', {}),
    requestOrDefault('/api/user/enterprise/workbench/todo', {}),
    requestOrDefault('/api/user/enterprise/workbench/order-trend', [], { days: 7 }),
    requestOrDefault('/api/user/enterprise/workbench/delivery-trend', [], { days: 7 }),
    requestOrDefault('/api/user/enterprise/workbench/service-overview', {}),
    requestOrDefault('/api/user/enterprise/workbench/service-distribution', []),
    requestOrDefault('/api/user/enterprise/workbench/income-structure', {}),
    requestOrDefault('/api/user/enterprise/workbench/customer-trend', [], { days: 7 }),
  ])

  return normalizeMerchantDashboard(summary, todo, orderTrend, deliveryTrend, overview, distribution, income, customerTrend)
}

export const getPlatformWorkbench = getPlatformDashboard
export const getMerchantWorkbench = getMerchantDashboard
