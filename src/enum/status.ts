export enum AuditStatus {
  Pending = 'pending',
  Supplement = 'supplement',
  Approved = 'approved',
  Rejected = 'rejected',
}

export enum DemandStatus {
  Pending = 'pending',
  Assigned = 'assigned',
  Replied = 'replied',
  Processing = 'processing',
  Completed = 'completed',
  Closed = 'closed',
}

export enum ConsultStatus {
  Pending = 'pending',
  Replied = 'replied',
  Closed = 'closed',
}

export enum OrderStatus {
  Quoting = 'quoting',
  WaitingPayment = 'waiting_payment',
  WaitingSample = 'waiting_sample',
  Testing = 'testing',
  Reporting = 'reporting',
  Finished = 'finished',
  ForceClosed = 'force_closed',
  Refunding = 'refunding',
  Refunded = 'refunded',
}

export enum ReportStatus {
  Pending = 'pending',
  Reviewing = 'reviewing',
  Published = 'published',
  Invalid = 'invalid',
  Hidden = 'hidden',
}

export enum CommentStatus {
  Normal = 'normal',
  Deleted = 'deleted',
}

export enum MessageType {
  System = 'system',
  Demand = 'demand',
  Consult = 'consult',
  Order = 'order',
}

export enum MessageReadStatus {
  Read = 'read',
  Unread = 'unread',
}

export enum AccountStatus {
  Enabled = 'enabled',
  Disabled = 'disabled',
}

export enum ServiceShelfStatus {
  Enabled = 'enabled',
  Disabled = 'disabled',
}

export enum CommunityContentStatus {
  Draft = 'draft',
  Published = 'published',
  Offline = 'offline',
}

export enum GoodsStatus {
  OnSale = 'on_sale',
  OffSale = 'off_sale',
}

export enum WorkflowTemplateStatus {
  Enabled = 'enabled',
  Disabled = 'disabled',
}

export enum WorkflowNodeType {
  Submit = 'submit',
  Review = 'review',
  Approve = 'approve',
  Archive = 'archive',
}

export enum UserType {
  Personal = 'personal',
  Enterprise = 'enterprise',
}

export enum PaymentStatus {
  Unpaid = 'unpaid',
  PartPaid = 'part_paid',
  Paid = 'paid',
  Refunding = 'refunding',
  Refunded = 'refunded',
}

export enum SampleDeliveryMode {
  Mail = 'mail',
  Pickup = 'pickup',
  Onsite = 'onsite',
}

export enum SampleReceiveStatus {
  Pending = 'pending',
  Received = 'received',
  Abnormal = 'abnormal',
}

export enum ServiceType {
  Standard = 'standard',
  Metrology = 'metrology',
  Certification = 'certification',
  Diagnosis = 'diagnosis',
  Training = 'training',
  Inspection = 'inspection',
}

export enum OperationStatus {
  Done = 'done',
  Processing = 'processing',
  Waiting = 'waiting',
  Warning = 'warning',
}

export enum PublishMode {
  SelfSelect = 'self_select',
  PlatformAssign = 'platform_assign',
}

export enum AuditAction {
  Approve = 'approve',
  Reject = 'reject',
  Supplement = 'supplement',
}
