import { AuditStatus, DemandStatus, OrderStatus, ReportStatus, ServiceType } from '@/enum/common'
import type { CurrentUser, LoginResponse, RoleCode } from '@/types/auth'
import type {
  AuditActionPayload,
  DashboardMetric,
  DemandItem,
  EnterpriseAuditDetail,
  EnterpriseAuditItem,
  OrderDetail,
  OrderItem,
  ReportItem,
} from '@/types/business'

const userPermissionMap: Record<RoleCode, string[]> = {
  SUPER_ADMIN: [
    '*:*:*',
    'audit:enterprise:query',
    'audit:enterprise:approve',
    'user:manage:view',
    'system:role:view',
  ],
  PLATFORM_ADMIN: [
    'audit:enterprise:query',
    'audit:enterprise:approve',
    'user:manage:view',
    'demand:manage:view',
    'order:manage:view',
    'report:manage:view',
    'system:role:view',
  ],
  AUDITOR: ['audit:enterprise:query', 'audit:enterprise:approve', 'report:manage:view'],
  ENTERPRISE_DEMAND: [
    'enterprise:dashboard:view',
    'enterprise:profile:edit',
    'enterprise:order:view',
    'enterprise:report:view',
  ],
  ENTERPRISE_SERVICE: ['enterprise:dashboard:view', 'enterprise:demand:view', 'enterprise:message:view'],
  ENTERPRISE_LAB: ['enterprise:dashboard:view', 'enterprise:order:view', 'enterprise:report:view'],
  ENTERPRISE_STAFF: ['enterprise:dashboard:view', 'enterprise:order:view'],
}

const mockUsers: Record<string, CurrentUser> = {
  admin: {
    id: 'u-admin',
    name: '平台管理员',
    mobile: '13800000001',
    email: 'admin@dajing.cn',
    roles: ['PLATFORM_ADMIN'],
    permissions: userPermissionMap.PLATFORM_ADMIN,
    dataScopes: [{ type: 'ALL' }],
    deptName: '平台运营中心',
  },
  auditor: {
    id: 'u-auditor',
    name: '企业审核员',
    mobile: '13800000002',
    email: 'auditor@dajing.cn',
    roles: ['AUDITOR'],
    permissions: userPermissionMap.AUDITOR,
    dataScopes: [{ type: 'ASSIGNED_ENTERPRISE', enterpriseIds: ['ent-001', 'ent-002'] }],
    deptName: '审核管理组',
  },
  enterprise: {
    id: 'u-enterprise',
    name: '苏州智造检测有限公司',
    mobile: '13800000003',
    email: 'service@smartlab.cn',
    roles: ['ENTERPRISE_LAB'],
    permissions: userPermissionMap.ENTERPRISE_LAB,
    dataScopes: [{ type: 'ENTERPRISE_SELF', enterpriseIds: ['ent-001'] }],
    enterpriseId: 'ent-001',
    enterpriseName: '苏州智造检测有限公司',
    deptName: '企业管理部',
  },
}

export const dashboardMetrics: DashboardMetric[] = [
  { label: '待审核企业', value: 28, trend: '+5 较昨日' },
  { label: '处理中需求', value: 63, trend: '+12 较本周' },
  { label: '检测中订单', value: 112, trend: '+18 较本周' },
  { label: '待发布报告', value: 41, trend: '-3 较昨日' },
]

export const enterpriseDashboardMetrics: DashboardMetric[] = [
  { label: '本月新订单', value: 16, trend: '+3 较上月' },
  { label: '检测中项目', value: 8, trend: '+2 较昨日' },
  { label: '待上传报告', value: 5, trend: '2 个加急' },
  { label: '消息提醒', value: 12, trend: '含 4 条系统消息' },
]

export const auditList: EnterpriseAuditItem[] = [
  {
    id: 'audit-001',
    enterpriseName: '苏州智造检测有限公司',
    socialCreditCode: '91320594MA1Q2A0X1Y',
    contactName: '陈璐',
    contactPhone: '13800001111',
    serviceTypes: [ServiceType.Inspection, ServiceType.Standard],
    status: AuditStatus.Pending,
    submitTime: '2026-04-07 10:20:10',
    reviewerName: '未分配',
  },
  {
    id: 'audit-002',
    enterpriseName: '杭州工研质量技术服务有限公司',
    socialCreditCode: '91330102MA27T6M993',
    contactName: '张凯',
    contactPhone: '13800002222',
    serviceTypes: [ServiceType.Training, ServiceType.Diagnosis],
    status: AuditStatus.Supplement,
    submitTime: '2026-04-06 14:05:20',
    reviewerName: '李审核',
  },
  {
    id: 'audit-003',
    enterpriseName: '宁波远航计量科技有限公司',
    socialCreditCode: '91330203MA2AFA420J',
    contactName: '王妍',
    contactPhone: '13800003333',
    serviceTypes: [ServiceType.Metrology],
    status: AuditStatus.Approved,
    submitTime: '2026-04-05 08:15:12',
    reviewerName: '李审核',
  },
]

export const auditDetails: Record<string, EnterpriseAuditDetail> = {
  'audit-001': {
    id: 'audit-001',
    enterpriseName: '苏州智造检测有限公司',
    socialCreditCode: '91320594MA1Q2A0X1Y',
    contactName: '陈璐',
    contactPhone: '13800001111',
    serviceTypes: [ServiceType.Inspection, ServiceType.Standard],
    status: AuditStatus.Pending,
    submitTime: '2026-04-07 10:20:10',
    reviewerName: '未分配',
    email: 'service@smartlab.cn',
    province: '江苏省',
    city: '苏州市',
    district: '工业园区',
    address: '星湖街 328 号创研产业园 B3',
    registeredCapital: '1000 万元',
    companyType: '有限责任公司',
    legalPerson: '陈海波',
    businessLicense: {
      uid: 'file-licence-001',
      name: '营业执照.pdf',
      url: '/mock/business-license.pdf',
      fileType: 'pdf',
    },
    qualificationFiles: [
      {
        uid: 'file-qual-001',
        name: 'CMA资质证书.pdf',
        url: '/mock/cma.pdf',
        fileType: 'pdf',
      },
      {
        uid: 'file-qual-002',
        name: 'CNAS实验室认可证书.pdf',
        url: '/mock/cnas.pdf',
        fileType: 'pdf',
      },
    ],
    qualifications: [
      {
        id: 'qual-001',
        name: 'CMA 检验检测机构资质认定',
        number: 'CMA20261234',
        validUntil: '2028-12-31',
        status: 'valid',
      },
      {
        id: 'qual-002',
        name: 'CNAS 实验室认可',
        number: 'CNAS-L23456',
        validUntil: '2027-08-30',
        status: 'expiring',
      },
    ],
    auditRecords: [
      {
        id: 'record-001',
        action: '提交入驻申请',
        operator: '企业用户',
        remark: '提交企业基本资料及资质证书',
        createdAt: '2026-04-07 10:20:10',
      },
      {
        id: 'record-002',
        action: '系统分配审核员',
        operator: '平台管理员',
        remark: '分配至企业审核组',
        createdAt: '2026-04-07 10:35:40',
      },
    ],
  },
}

export const demandList: DemandItem[] = [
  {
    id: 'demand-001',
    title: '电子元器件可靠性检测需求',
    serviceType: ServiceType.Inspection,
    enterpriseName: '苏州启航电子股份有限公司',
    publishMode: 'PLATFORM_ASSIGN',
    status: DemandStatus.Assigned,
    createdAt: '2026-04-08 09:20:10',
    assignedOrg: '苏州智造检测有限公司',
    contactName: '刘工',
  },
  {
    id: 'demand-002',
    title: 'ISO9001 质量诊断辅导',
    serviceType: ServiceType.Diagnosis,
    enterpriseName: '无锡锐科装备有限公司',
    publishMode: 'SELF_SELECT',
    status: DemandStatus.Processing,
    createdAt: '2026-04-07 16:11:08',
    assignedOrg: '江苏智标质量服务中心',
    contactName: '许经理',
  },
]

export const orderList: OrderItem[] = [
  {
    id: 'order-001',
    orderNo: 'QI202604080001',
    enterpriseName: '苏州启航电子股份有限公司',
    orgName: '苏州智造检测有限公司',
    projectName: '电子元器件可靠性检测',
    status: OrderStatus.Testing,
    amount: 26800,
    reportNo: 'BG20260408018',
    createdAt: '2026-04-08 10:03:00',
  },
  {
    id: 'order-002',
    orderNo: 'QI202604070014',
    enterpriseName: '无锡锐科装备有限公司',
    orgName: '国家工业计量测试中心',
    projectName: '计量校准服务',
    status: OrderStatus.WaitingSample,
    amount: 9800,
    createdAt: '2026-04-07 14:36:08',
  },
]

export const orderDetails: Record<string, OrderDetail> = {
  'order-001': {
    id: 'order-001',
    orderNo: 'QI202604080001',
    enterpriseName: '苏州启航电子股份有限公司',
    orgName: '苏州智造检测有限公司',
    projectName: '电子元器件可靠性检测',
    status: OrderStatus.Testing,
    amount: 26800,
    reportNo: 'BG20260408018',
    createdAt: '2026-04-08 10:03:00',
    sampleName: '芯片模组 A1',
    sampleCode: 'SM-A1-202604',
    receiverName: '张工',
    receiverPhone: '13800009999',
    receiverAddress: '江苏省苏州市工业园区东长路 88 号',
    attachments: [
      {
        uid: 'sample-file-001',
        name: '寄样清单.xlsx',
        url: '/mock/sample-list.xlsx',
        fileType: 'xlsx',
      },
    ],
    timeline: [
      {
        title: '委托已提交',
        time: '2026-04-08 10:03',
        description: '企业提交检验检测委托单',
        status: 'done',
      },
      {
        title: '机构已报价',
        time: '2026-04-08 10:40',
        description: '报价金额 26800 元，等待支付',
        status: 'done',
      },
      {
        title: '样品已收样',
        time: '2026-04-09 09:30',
        description: '样品外观完好，已登记入库',
        status: 'done',
      },
      {
        title: '检测进行中',
        time: '2026-04-10 15:20',
        description: '环境试验与电性能测试并行进行',
        status: 'processing',
      },
      {
        title: '报告待发布',
        time: '',
        description: '预计 2026-04-14 前完成',
        status: 'waiting',
      },
    ],
  },
}

export const reportList: ReportItem[] = [
  {
    id: 'report-001',
    reportNo: 'BG20260408018',
    enterpriseName: '苏州启航电子股份有限公司',
    orderNo: 'QI202604080001',
    projectName: '电子元器件可靠性检测',
    status: ReportStatus.Reviewing,
    publishAt: '2026-04-14 18:00:00',
  },
  {
    id: 'report-002',
    reportNo: 'BG20260407012',
    enterpriseName: '无锡锐科装备有限公司',
    orderNo: 'QI202604070014',
    projectName: '计量校准服务',
    status: ReportStatus.Published,
    publishAt: '2026-04-11 09:00:00',
  },
]

function createToken(key: string) {
  return `mock-token-${key}`
}

function resolveUserKey(source: string) {
  if (source.includes('auditor') || source.includes('13800000002')) {
    return 'auditor'
  }

  if (source.includes('enterprise') || source.includes('13800000003') || source.includes('smartlab')) {
    return 'enterprise'
  }

  return 'admin'
}

export function resolveUserFromToken(token: string): CurrentUser {
  const key = token.replace('mock-token-', '')
  return mockUsers[key] ?? mockUsers.admin!
}

export function mockLogin(source: string): LoginResponse {
  const key = resolveUserKey(source)
  const user: CurrentUser = mockUsers[key] ?? mockUsers.admin!
  return {
    accessToken: createToken(key),
    refreshToken: `refresh-${key}`,
    expiresIn: 7200,
    user,
  }
}

export function mockPromise<T>(data: T, timeout = 180): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(structuredClone(data)), timeout)
  })
}

export async function applyAuditAction(payload: AuditActionPayload) {
  const detail = auditDetails[payload.auditId]
  if (!detail) return mockPromise(true)

  detail.status =
    payload.action === 'approve'
      ? AuditStatus.Approved
      : payload.action === 'reject'
        ? AuditStatus.Rejected
        : AuditStatus.Supplement

  detail.auditRecords.unshift({
    id: `record-${Date.now()}`,
    action:
      payload.action === 'approve'
        ? '审核通过'
        : payload.action === 'reject'
          ? '审核驳回'
          : '要求补充材料',
    operator: '当前审核员',
    remark: payload.remark,
    createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
  })

  const item = auditList.find((entry) => entry.id === payload.auditId)
  if (item) {
    item.status = detail.status
    item.reviewerName = '当前审核员'
  }

  return mockPromise(true)
}
