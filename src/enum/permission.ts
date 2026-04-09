import { ENTERPRISE_CAPABILITY, PLATFORM_ROLE } from './role'

export const ROOT_PERMISSION = '*:*:*'

// 兼容项目中仍在过渡期的旧引用，实际菜单和数据权限判断请优先使用
// accountType + enterpriseCapabilities + platformRole + permissionCodes。
export const ROLE_CODE = {
  superAdmin: PLATFORM_ROLE.superAdmin,
  platformAdmin: PLATFORM_ROLE.platformAdmin,
  auditor: PLATFORM_ROLE.auditor,
  enterpriseDemander: ENTERPRISE_CAPABILITY.demander,
  enterpriseServiceProvider: ENTERPRISE_CAPABILITY.serviceProvider,
  enterpriseLabProvider: ENTERPRISE_CAPABILITY.labProvider,
} as const

export const PERMISSION_CODE = {
  platformDashboardView: 'platform:dashboard:view',
  userManageView: 'user:manage:view',
  auditEnterpriseQuery: 'audit:enterprise:query',
  auditEnterpriseApprove: 'audit:enterprise:approve',
  demandManageView: 'demand:manage:view',
  consultManageView: 'consult:manage:view',
  orderManageView: 'order:manage:view',
  reportManageView: 'report:manage:view',
  commentManageView: 'comment:manage:view',
  messageManageView: 'message:manage:view',
  contentManageView: 'content:manage:view',
  dictionaryManageView: 'system:dictionary:view',
  roleManageView: 'system:role:view',
  workflowManageView: 'workflow:manage:view',
  operationLogView: 'system:operation-log:view',
  dangerousAction: 'system:dangerous:action',

  enterpriseDashboardView: 'enterprise:dashboard:view',
  enterpriseProfileEdit: 'enterprise:profile:edit',
  enterpriseDemandView: 'enterprise:demand:view',
  enterpriseDemandPublish: 'enterprise:demand:publish',
  enterpriseDemandHallView: 'enterprise:demand-hall:view',
  enterpriseDemandHandle: 'enterprise:demand:handle',
  enterpriseConsultView: 'enterprise:consult:view',
  enterpriseConsultHandle: 'enterprise:consult:handle',
  enterpriseOrderView: 'enterprise:order:view',
  enterpriseOrderReceive: 'enterprise:order:receive',
  enterpriseOrderHandle: 'enterprise:order:handle',
  enterpriseReportView: 'enterprise:report:view',
  enterpriseReportHandle: 'enterprise:report:handle',
  enterpriseTestingProgressView: 'enterprise:testing-progress:view',
  enterpriseCommentView: 'enterprise:comment:view',
  enterpriseCommentManage: 'enterprise:comment:manage',
  enterpriseMessageView: 'enterprise:message:view',
  enterpriseServiceView: 'enterprise:service:view',
  enterpriseServiceManage: 'enterprise:service:manage',
  enterpriseDataReportView: 'enterprise:data-report:view',
} as const
