import { ROLE_CODE } from '@/enum/permission'
import { ACCOUNT_TYPE, ENTERPRISE_CAPABILITY, PLATFORM_ROLE } from '@/enum/role'
import {
  AccountStatus,
  AuditStatus,
  CommentStatus,
  CommunityContentStatus,
  ConsultStatus,
  DemandStatus,
  GoodsStatus,
  MessageReadStatus,
  MessageType,
  OrderStatus,
  PaymentStatus,
  ReportStatus,
  SampleDeliveryMode,
  SampleReceiveStatus,
  ServiceShelfStatus,
  ServiceType,
  UserType,
  WorkflowNodeType,
  WorkflowTemplateStatus,
} from '@/enum/status'
import type { DictOption } from '@/types/business'

export const SERVICE_TYPE_OPTIONS: DictOption[] = [
  { label: '标准化服务', value: ServiceType.Standard, tagType: 'primary' },
  { label: '计量', value: ServiceType.Metrology, tagType: 'success' },
  { label: '认证认可', value: ServiceType.Certification, tagType: 'warning' },
  { label: '质量诊断', value: ServiceType.Diagnosis, tagType: 'info' },
  { label: '质量培训', value: ServiceType.Training, tagType: 'primary' },
  { label: '检验检测', value: ServiceType.Inspection, tagType: 'danger' },
]

export const USER_TYPE_OPTIONS: DictOption[] = [
  { label: '个人用户', value: UserType.Personal, tagType: 'info' },
  { label: '企业用户', value: UserType.Enterprise, tagType: 'primary' },
]

export const ACCOUNT_STATUS_MAP: Record<string, DictOption> = {
  [AccountStatus.Enabled]: { label: '启用', value: AccountStatus.Enabled, tagType: 'success' },
  [AccountStatus.Disabled]: { label: '禁用', value: AccountStatus.Disabled, tagType: 'danger' },
}

export const SERVICE_SHELF_STATUS_MAP: Record<string, DictOption> = {
  [ServiceShelfStatus.Enabled]: { label: '已上架', value: ServiceShelfStatus.Enabled, tagType: 'success' },
  [ServiceShelfStatus.Disabled]: { label: '已停用', value: ServiceShelfStatus.Disabled, tagType: 'info' },
}

export const COMMUNITY_STATUS_MAP: Record<string, DictOption> = {
  [CommunityContentStatus.Draft]: { label: '草稿', value: CommunityContentStatus.Draft, tagType: 'info' },
  [CommunityContentStatus.Published]: { label: '已发布', value: CommunityContentStatus.Published, tagType: 'success' },
  [CommunityContentStatus.Offline]: { label: '已下线', value: CommunityContentStatus.Offline, tagType: 'danger' },
}

export const GOODS_STATUS_MAP: Record<string, DictOption> = {
  [GoodsStatus.OnSale]: { label: '上架中', value: GoodsStatus.OnSale, tagType: 'success' },
  [GoodsStatus.OffSale]: { label: '已下架', value: GoodsStatus.OffSale, tagType: 'info' },
}

export const WORKFLOW_TEMPLATE_STATUS_MAP: Record<string, DictOption> = {
  [WorkflowTemplateStatus.Enabled]: { label: '启用', value: WorkflowTemplateStatus.Enabled, tagType: 'success' },
  [WorkflowTemplateStatus.Disabled]: { label: '停用', value: WorkflowTemplateStatus.Disabled, tagType: 'info' },
}

export const WORKFLOW_NODE_TYPE_OPTIONS: DictOption[] = [
  { label: '提交流程', value: WorkflowNodeType.Submit, tagType: 'primary' },
  { label: '审核节点', value: WorkflowNodeType.Review, tagType: 'warning' },
  { label: '审批节点', value: WorkflowNodeType.Approve, tagType: 'success' },
  { label: '归档节点', value: WorkflowNodeType.Archive, tagType: 'info' },
]

export const AUDIT_STATUS_MAP: Record<string, DictOption> = {
  [AuditStatus.Pending]: { label: '待审核', value: AuditStatus.Pending, tagType: 'warning' },
  [AuditStatus.Supplement]: { label: '补充材料', value: AuditStatus.Supplement, tagType: 'info' },
  [AuditStatus.Approved]: { label: '已通过', value: AuditStatus.Approved, tagType: 'success' },
  [AuditStatus.Rejected]: { label: '已驳回', value: AuditStatus.Rejected, tagType: 'danger' },
}

export const DEMAND_STATUS_MAP: Record<string, DictOption> = {
  [DemandStatus.Pending]: { label: '待受理', value: DemandStatus.Pending, tagType: 'warning' },
  [DemandStatus.Assigned]: { label: '已分配', value: DemandStatus.Assigned, tagType: 'primary' },
  [DemandStatus.Replied]: { label: '已回复', value: DemandStatus.Replied, tagType: 'info' },
  [DemandStatus.Processing]: { label: '处理中', value: DemandStatus.Processing, tagType: 'primary' },
  [DemandStatus.Completed]: { label: '已完成', value: DemandStatus.Completed, tagType: 'success' },
  [DemandStatus.Closed]: { label: '已关闭', value: DemandStatus.Closed, tagType: 'danger' },
}

export const CONSULT_STATUS_MAP: Record<string, DictOption> = {
  [ConsultStatus.Pending]: { label: '待回复', value: ConsultStatus.Pending, tagType: 'warning' },
  [ConsultStatus.Replied]: { label: '已回复', value: ConsultStatus.Replied, tagType: 'success' },
  [ConsultStatus.Closed]: { label: '已关闭', value: ConsultStatus.Closed, tagType: 'info' },
}

export const ORDER_STATUS_MAP: Record<string, DictOption> = {
  [OrderStatus.Quoting]: { label: '报价中', value: OrderStatus.Quoting, tagType: 'warning' },
  [OrderStatus.WaitingPayment]: { label: '待支付', value: OrderStatus.WaitingPayment, tagType: 'danger' },
  [OrderStatus.WaitingSample]: { label: '待寄样', value: OrderStatus.WaitingSample, tagType: 'primary' },
  [OrderStatus.Testing]: { label: '检测中', value: OrderStatus.Testing, tagType: 'warning' },
  [OrderStatus.Reporting]: { label: '报告编制中', value: OrderStatus.Reporting, tagType: 'info' },
  [OrderStatus.Finished]: { label: '已完成', value: OrderStatus.Finished, tagType: 'success' },
  [OrderStatus.ForceClosed]: { label: '已强制关闭', value: OrderStatus.ForceClosed, tagType: 'danger' },
  [OrderStatus.Refunding]: { label: '退款中', value: OrderStatus.Refunding, tagType: 'warning' },
  [OrderStatus.Refunded]: { label: '已退款', value: OrderStatus.Refunded, tagType: 'info' },
}

export const PAYMENT_STATUS_MAP: Record<string, DictOption> = {
  [PaymentStatus.Unpaid]: { label: '未支付', value: PaymentStatus.Unpaid, tagType: 'danger' },
  [PaymentStatus.PartPaid]: { label: '部分支付', value: PaymentStatus.PartPaid, tagType: 'warning' },
  [PaymentStatus.Paid]: { label: '已支付', value: PaymentStatus.Paid, tagType: 'success' },
  [PaymentStatus.Refunding]: { label: '退款中', value: PaymentStatus.Refunding, tagType: 'warning' },
  [PaymentStatus.Refunded]: { label: '已退款', value: PaymentStatus.Refunded, tagType: 'info' },
}

export const SAMPLE_RECEIVE_STATUS_MAP: Record<string, DictOption> = {
  [SampleReceiveStatus.Pending]: { label: '待收样', value: SampleReceiveStatus.Pending, tagType: 'warning' },
  [SampleReceiveStatus.Received]: { label: '已收样', value: SampleReceiveStatus.Received, tagType: 'success' },
  [SampleReceiveStatus.Abnormal]: { label: '收样异常', value: SampleReceiveStatus.Abnormal, tagType: 'danger' },
}

export const REPORT_STATUS_MAP: Record<string, DictOption> = {
  [ReportStatus.Pending]: { label: '待生成', value: ReportStatus.Pending, tagType: 'warning' },
  [ReportStatus.Reviewing]: { label: '审核中', value: ReportStatus.Reviewing, tagType: 'primary' },
  [ReportStatus.Published]: { label: '已发布', value: ReportStatus.Published, tagType: 'success' },
  [ReportStatus.Invalid]: { label: '已作废', value: ReportStatus.Invalid, tagType: 'danger' },
  [ReportStatus.Hidden]: { label: '已隐藏', value: ReportStatus.Hidden, tagType: 'info' },
}

export const COMMENT_STATUS_MAP: Record<string, DictOption> = {
  [CommentStatus.Normal]: { label: '正常', value: CommentStatus.Normal, tagType: 'success' },
  [CommentStatus.Deleted]: { label: '已删除', value: CommentStatus.Deleted, tagType: 'danger' },
}

export const MESSAGE_TYPE_OPTIONS: DictOption[] = [
  { label: '系统通知', value: MessageType.System, tagType: 'info' },
  { label: '需求通知', value: MessageType.Demand, tagType: 'primary' },
  { label: '咨询通知', value: MessageType.Consult, tagType: 'warning' },
  { label: '订单通知', value: MessageType.Order, tagType: 'success' },
]

export const MESSAGE_READ_STATUS_MAP: Record<string, DictOption> = {
  [MessageReadStatus.Unread]: { label: '未读', value: MessageReadStatus.Unread, tagType: 'warning' },
  [MessageReadStatus.Read]: { label: '已读', value: MessageReadStatus.Read, tagType: 'success' },
}

export const SAMPLE_DELIVERY_MODE_OPTIONS: DictOption[] = [
  { label: '寄样', value: SampleDeliveryMode.Mail, tagType: 'primary' },
  { label: '上门取样', value: SampleDeliveryMode.Pickup, tagType: 'success' },
  { label: '现场检测', value: SampleDeliveryMode.Onsite, tagType: 'warning' },
]

export const LOGIN_DEMO_ACCOUNTS = [
  { label: '平台运营方', account: 'admin', password: '123456' },
  { label: '服务需求方', account: 'demander', password: '123456' },
  { label: '服务提供方', account: 'service', password: '123456' },
]

export const ROLE_LABEL_MAP: Record<string, string> = {
  [ROLE_CODE.superAdmin]: '平台超级管理员',
  [ROLE_CODE.platformAdmin]: '平台运营方',
  [ROLE_CODE.auditor]: '平台审核员',
  [ROLE_CODE.enterpriseDemander]: '服务需求方',
  [ROLE_CODE.enterpriseServiceProvider]: '服务提供方',
  [ROLE_CODE.enterpriseLabProvider]: '检测机构方',
}

export const ACCOUNT_TYPE_LABEL_MAP: Record<string, string> = {
  [ACCOUNT_TYPE.personal]: '个人用户',
  [ACCOUNT_TYPE.enterprise]: '企业用户',
  [ACCOUNT_TYPE.platformAdmin]: '平台运营方',
}

export const PLATFORM_ROLE_LABEL_MAP: Record<string, string> = {
  [PLATFORM_ROLE.superAdmin]: '平台超级管理员',
  [PLATFORM_ROLE.platformAdmin]: '平台运营管理员',
  [PLATFORM_ROLE.auditor]: '平台审核员',
}

export const ENTERPRISE_CAPABILITY_LABEL_MAP: Record<string, string> = {
  [ENTERPRISE_CAPABILITY.demander]: '需求发布方',
  [ENTERPRISE_CAPABILITY.serviceProvider]: '基础服务提供方',
  [ENTERPRISE_CAPABILITY.labProvider]: '检测机构方',
}
