import type { ListQuery } from './api'
import type { EnterpriseCapability } from './auth'
import type {
  AccountStatus,
  AuditAction,
  AuditStatus,
  CommunityContentStatus,
  CommentStatus,
  ConsultStatus,
  DemandStatus,
  GoodsStatus,
  MessageReadStatus,
  MessageType,
  OperationStatus,
  OrderStatus,
  PaymentStatus,
  PublishMode,
  ReportStatus,
  SampleDeliveryMode,
  SampleReceiveStatus,
  ServiceShelfStatus,
  ServiceType,
  UserType,
  WorkflowNodeType,
  WorkflowTemplateStatus,
} from '@/enum/status'

export interface DictOption {
  label: string
  value: string
  tagType?: 'success' | 'warning' | 'danger' | 'info' | 'primary'
}

export interface AttachmentItem {
  id: string
  name: string
  url: string
  fileType: string
  size?: number
}

export interface OperationTimelineNode {
  id?: string
  title: string
  time: string
  description: string
  status: OperationStatus
  operator?: string
}

export interface EnterpriseQualification {
  id: string
  name: string
  number: string
  validUntil: string
  status: 'valid' | 'expiring' | 'expired'
}

export interface AuditRecord extends OperationTimelineNode {
  remark?: string
}

export interface UserItem {
  id: string
  userType: UserType
  name: string
  mobile: string
  email?: string
  enterpriseName?: string
  socialCreditCode?: string
  roleNames: string[]
  status: AccountStatus
  createdAt: string
  lastLoginTime?: string
}

export interface UserDetail extends UserItem {
  contactName?: string
  contactPhone?: string
  remark?: string
}

export interface UserQuery extends ListQuery {
  userType?: UserType | ''
  accountStatus?: AccountStatus | ''
}

export interface EnterpriseAuditItem {
  id: string
  enterpriseName: string
  socialCreditCode: string
  contactName: string
  contactPhone: string
  enterpriseType: string
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

export interface EnterpriseAuditQuery extends ListQuery {
  serviceType?: string
}

export interface EnterpriseProfile {
  enterpriseId: string
  enterpriseName: string
  enterpriseType: string
  capabilities?: EnterpriseCapability[]
  socialCreditCode: string
  legalPerson: string
  contactName: string
  contactPhone: string
  email: string
  address: string
  intro?: string
  serviceTypes: ServiceType[]
  businessLicense?: AttachmentItem
  qualificationFiles?: AttachmentItem[]
}

export interface EnterpriseCapabilityProfile {
  enterpriseId: string
  enterpriseName: string
  capabilities: EnterpriseCapability[]
}

export interface AuditActionPayload {
  auditId: string
  action: AuditAction
  remark: string
}

export interface DemandReplyRecord extends OperationTimelineNode {
  content?: string
}

export interface DemandItem {
  id: string
  title: string
  serviceType: ServiceType
  enterpriseName: string
  publishMode: PublishMode
  status: DemandStatus
  createdAt: string
  assignedOrg?: string
  contactName: string
  contactPhone: string
}

export interface DemandDetail extends DemandItem {
  content: string
  attachments: AttachmentItem[]
  replyRecords: DemandReplyRecord[]
}

export interface DemandForm {
  title: string
  serviceType: ServiceType
  publishMode: PublishMode
  contactName: string
  contactPhone: string
  content: string
}

export interface DemandQuery extends ListQuery {
  serviceType?: ServiceType | ''
}

export interface ConsultItem {
  id: string
  title: string
  enterpriseName: string
  contactName: string
  contactPhone: string
  status: ConsultStatus
  createdAt: string
}

export interface ConsultDetail extends ConsultItem {
  content: string
  attachments: AttachmentItem[]
  replyRecords: OperationTimelineNode[]
}

export type ConsultQuery = ListQuery

export interface OrderItem {
  id: string
  orderNo: string
  enterpriseName: string
  orgName: string
  projectName: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  sampleReceiveStatus: SampleReceiveStatus
  amount: number
  reportNo?: string
  createdAt: string
}

export interface OrderSampleItem {
  id: string
  sampleName: string
  sampleCode: string
  sampleCount: number
  sampleRemark?: string
}

export interface OrderProjectItem {
  id: string
  projectName: string
  standardName: string
  price: number
}

export interface OrderExceptionRecord extends OperationTimelineNode {
  level?: 'normal' | 'warning' | 'danger'
}

export interface OrderReportInfo {
  reportNo?: string
  reportStatus: ReportStatus
  reportFile?: AttachmentItem
}

export interface OrderCommentInfo {
  score?: number
  content?: string
  createdAt?: string
}

export interface OrderRefundRecord {
  id: string
  applyTime: string
  amount: number
  status: string
  remark: string
}

export interface OrderDetail extends OrderItem {
  sampleMode: SampleDeliveryMode
  receiverName: string
  receiverPhone: string
  receiverAddress: string
  sampleItems: OrderSampleItem[]
  projectItems: OrderProjectItem[]
  attachments: AttachmentItem[]
  timeline: OperationTimelineNode[]
  exceptionRecords: OrderExceptionRecord[]
  reportInfo: OrderReportInfo
  commentInfo?: OrderCommentInfo
  refundRecords: OrderRefundRecord[]
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

export interface ReportDetail extends ReportItem {
  reportFile: AttachmentItem
  hidden: boolean
  extractRecords: OperationTimelineNode[]
}

export type ReportQuery = ListQuery

export interface CommentItem {
  id: string
  orderNo: string
  enterpriseName: string
  projectName: string
  score: number
  content: string
  status: CommentStatus
  createdAt: string
}

export interface CommentQuery extends ListQuery {
  score?: string
}

export interface MessageItem {
  id: string
  title: string
  type: MessageType
  readStatus: MessageReadStatus
  content: string
  createdAt: string
}

export interface MessageQuery extends ListQuery {
  type?: MessageType | ''
  readStatus?: MessageReadStatus | ''
}

export interface MessageStats {
  total: number
  unread: number
  system: number
  demand: number
  consult: number
  order: number
}

export interface ServiceItem {
  id: string
  enterpriseId?: string
  enterpriseName?: string
  serviceCode?: string
  serviceName: string
  serviceType: ServiceType
  categoryCode?: string
  categoryName?: string
  specification?: string
  targetCustomer: string
  contactName: string
  contactPhone: string
  priceText: string
  status: ServiceShelfStatus
  updatedAt: string
  description?: string
}

export interface ServiceQuery extends ListQuery {
  scope?: 'all' | 'self'
  serviceType?: ServiceType | ''
  status?: ServiceShelfStatus | ''
}

export interface ServiceForm {
  serviceName: string
  serviceCode?: string
  serviceType: ServiceType
  categoryCode?: string
  specification?: string
  targetCustomer: string
  contactName: string
  contactPhone: string
  priceText: string
  description: string
}

export interface CommunityArticleItem {
  id: string
  title: string
  authorName: string
  categoryName: string
  status: CommunityContentStatus
  createdAt: string
}

export interface CommunityQuestionItem {
  id: string
  title: string
  askerName: string
  answerCount: number
  status: CommunityContentStatus
  createdAt: string
}

export interface ExpertItem {
  id: string
  name: string
  title: string
  organization: string
  specialties: string[]
  status: AccountStatus
  updatedAt: string
}

export interface CommunityQuery extends ListQuery {
  categoryCode?: string
}

export interface GoodsItem {
  id: string
  goodsCode: string
  goodsName: string
  categoryName: string
  specification: string
  status: GoodsStatus
  priceText: string
  updatedAt: string
}

export interface GoodsForm {
  goodsCode: string
  goodsName: string
  categoryName: string
  specification: string
  priceText: string
  status: GoodsStatus
}

export interface GoodsQuery extends ListQuery {
  categoryCode?: string
  status?: GoodsStatus | ''
}

export interface LogisticsTrackItem {
  id: string
  orderNo: string
  trackingNo: string
  logisticsCompany: string
  receiverName: string
  receiverPhone: string
  address: string
  thirdPartyCode?: string
  thirdPartyStatus?: string
  latestNode: string
  updatedAt: string
}

export interface LogisticsAddressItem {
  id: string
  contactName: string
  contactPhone: string
  province: string
  city: string
  district: string
  detailAddress: string
  postalCode?: string
  thirdPartyWarehouseCode?: string
  remark?: string
}

export type LogisticsQuery = ListQuery

export interface WorkflowTemplateItem {
  id: string
  templateCode: string
  templateName: string
  businessType: string
  version: string
  status: WorkflowTemplateStatus
  updatedAt: string
}

export interface WorkflowNodeItem {
  id: string
  templateCode: string
  nodeCode: string
  nodeName: string
  nodeType: WorkflowNodeType
  approverType: string
  sort: number
}

export interface WorkflowRecordItem {
  id: string
  businessNo: string
  templateName: string
  currentNodeName: string
  result: string
  operator: string
  operatedAt: string
}

export interface WorkflowQuery extends ListQuery {
  businessType?: string
}

export interface MonthlyOrderStatItem {
  month: string
  orderCount: number
  reportCount: number
  refundCount: number
}

export interface KeyMetricItem {
  key: string
  label: string
  value: number
  unit?: string
  hint?: string
}

export interface PermissionTreeNode {
  id: string
  label: string
  type: 'menu' | 'button'
  children?: PermissionTreeNode[]
}

export interface RoleItem {
  id: string
  name: string
  code: string
  dataScope: string
  permissions: string[]
}

export interface DashboardMetric {
  label: string
  value: number
  hint?: string
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
}

export interface QuickEntryItem {
  title: string
  path: string
  description: string
}

export interface DashboardTodoItem {
  code: string
  title: string
  value: number
  path: string
  level: 'primary' | 'warning' | 'danger' | 'info'
}

export interface RecentOperationItem {
  id: string
  title: string
  description: string
  operator: string
  createdAt: string
}

export interface PlatformWorkbenchData {
  todos: DashboardTodoItem[]
  recentOperations: RecentOperationItem[]
  quickEntries: QuickEntryItem[]
}

export type MerchantWorkbenchData = PlatformWorkbenchData
