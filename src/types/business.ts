import type { ListQuery } from './api'
import type { AuditStatus, DemandStatus, OrderStatus, ReportStatus, ServiceType } from '@/enum/common'

export interface DictOption {
  label: string
  value: string
  tagType?: 'success' | 'warning' | 'danger' | 'info' | 'primary'
}

export interface AttachmentItem {
  uid: string
  name: string
  url: string
  fileType: string
}

export interface EnterpriseQualification {
  id: string
  name: string
  number: string
  validUntil: string
  status: 'valid' | 'expiring' | 'expired'
}

export interface AuditRecord {
  id: string
  action: string
  operator: string
  remark: string
  createdAt: string
}

export interface EnterpriseAuditItem {
  id: string
  enterpriseName: string
  socialCreditCode: string
  contactName: string
  contactPhone: string
  serviceTypes: ServiceType[]
  status: AuditStatus
  submitTime: string
  reviewerName?: string
}

export interface EnterpriseAuditDetail extends EnterpriseAuditItem {
  email: string
  province: string
  city: string
  district: string
  address: string
  registeredCapital: string
  companyType: string
  legalPerson: string
  businessLicense: AttachmentItem
  qualificationFiles: AttachmentItem[]
  qualifications: EnterpriseQualification[]
  auditRecords: AuditRecord[]
  remark?: string
}

export interface AuditActionPayload {
  auditId: string
  action: 'approve' | 'reject' | 'supplement'
  remark: string
}

export interface DemandItem {
  id: string
  title: string
  serviceType: ServiceType
  enterpriseName: string
  publishMode: 'SELF_SELECT' | 'PLATFORM_ASSIGN'
  status: DemandStatus
  createdAt: string
  assignedOrg?: string
  contactName: string
}

export interface OrderTimelineNode {
  title: string
  time: string
  description: string
  status: 'done' | 'processing' | 'waiting'
}

export interface OrderItem {
  id: string
  orderNo: string
  enterpriseName: string
  orgName: string
  projectName: string
  status: OrderStatus
  amount: number
  reportNo?: string
  createdAt: string
}

export interface OrderDetail extends OrderItem {
  sampleName: string
  sampleCode: string
  receiverName: string
  receiverPhone: string
  receiverAddress: string
  timeline: OrderTimelineNode[]
  attachments: AttachmentItem[]
}

export interface ReportItem {
  id: string
  reportNo: string
  enterpriseName: string
  orderNo: string
  projectName: string
  status: ReportStatus
  publishAt: string
}

export interface DashboardMetric {
  label: string
  value: number
  trend: string
}

export interface EnterpriseAuditQuery extends ListQuery {
  serviceType?: string
}
