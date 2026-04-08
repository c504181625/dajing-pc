import { AuditStatus, DemandStatus, OrderStatus, ReportStatus, ServiceType } from '@/enum/common'
import type { DictOption } from '@/types/business'

export const SERVICE_TYPE_OPTIONS: DictOption[] = [
  { label: '标准化服务', value: ServiceType.Standard, tagType: 'primary' },
  { label: '计量', value: ServiceType.Metrology, tagType: 'success' },
  { label: '认证认可', value: ServiceType.Certification, tagType: 'warning' },
  { label: '质量诊断', value: ServiceType.Diagnosis, tagType: 'info' },
  { label: '质量培训', value: ServiceType.Training, tagType: 'primary' },
  { label: '检验检测', value: ServiceType.Inspection, tagType: 'danger' },
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
  [DemandStatus.Processing]: { label: '处理中', value: DemandStatus.Processing, tagType: 'info' },
  [DemandStatus.Completed]: { label: '已完成', value: DemandStatus.Completed, tagType: 'success' },
  [DemandStatus.Closed]: { label: '已关闭', value: DemandStatus.Closed, tagType: 'danger' },
}

export const ORDER_STATUS_MAP: Record<string, DictOption> = {
  [OrderStatus.Quoting]: { label: '报价中', value: OrderStatus.Quoting, tagType: 'warning' },
  [OrderStatus.WaitingPayment]: { label: '待支付', value: OrderStatus.WaitingPayment, tagType: 'danger' },
  [OrderStatus.WaitingSample]: { label: '待寄样', value: OrderStatus.WaitingSample, tagType: 'primary' },
  [OrderStatus.Testing]: { label: '检测中', value: OrderStatus.Testing, tagType: 'warning' },
  [OrderStatus.Reporting]: { label: '报告编制中', value: OrderStatus.Reporting, tagType: 'info' },
  [OrderStatus.Finished]: { label: '已完成', value: OrderStatus.Finished, tagType: 'success' },
  [OrderStatus.Refunding]: { label: '退款中', value: OrderStatus.Refunding, tagType: 'danger' },
  [OrderStatus.Refunded]: { label: '已退款', value: OrderStatus.Refunded, tagType: 'info' },
}

export const REPORT_STATUS_MAP: Record<string, DictOption> = {
  [ReportStatus.Pending]: { label: '待生成', value: ReportStatus.Pending, tagType: 'warning' },
  [ReportStatus.Reviewing]: { label: '审核中', value: ReportStatus.Reviewing, tagType: 'primary' },
  [ReportStatus.Published]: { label: '已发布', value: ReportStatus.Published, tagType: 'success' },
  [ReportStatus.Invalid]: { label: '已作废', value: ReportStatus.Invalid, tagType: 'danger' },
}

export const LOGIN_DEMO_ACCOUNTS = [
  { label: '平台管理员', account: 'admin', password: '123456' },
  { label: '审核员', account: 'auditor', password: '123456' },
  { label: '企业用户', account: 'enterprise', password: '123456' },
]
