export enum AuditStatus {
  Pending = 'PENDING',
  Supplement = 'SUPPLEMENT',
  Approved = 'APPROVED',
  Rejected = 'REJECTED',
}

export enum DemandStatus {
  Pending = 'PENDING',
  Assigned = 'ASSIGNED',
  Processing = 'PROCESSING',
  Completed = 'COMPLETED',
  Closed = 'CLOSED',
}

export enum OrderStatus {
  Quoting = 'QUOTING',
  WaitingPayment = 'WAITING_PAYMENT',
  WaitingSample = 'WAITING_SAMPLE',
  Testing = 'TESTING',
  Reporting = 'REPORTING',
  Finished = 'FINISHED',
  Refunding = 'REFUNDING',
  Refunded = 'REFUNDED',
}

export enum ReportStatus {
  Pending = 'PENDING',
  Reviewing = 'REVIEWING',
  Published = 'PUBLISHED',
  Invalid = 'INVALID',
}

export enum ServiceType {
  Standard = 'STANDARD',
  Metrology = 'METROLOGY',
  Certification = 'CERTIFICATION',
  Diagnosis = 'DIAGNOSIS',
  Training = 'TRAINING',
  Inspection = 'INSPECTION',
}
