import type { AuditActionPayload, EnterpriseAuditQuery } from '@/types/business'

import { applyAuditAction, auditDetails, auditList, mockPromise } from '../mock'

export function getEnterpriseAuditList(_query: EnterpriseAuditQuery) {
  return mockPromise({
    list: auditList,
    pageNum: 1,
    pageSize: 10,
    total: auditList.length,
  })
}

export function getEnterpriseAuditDetail(id: string) {
  return mockPromise(auditDetails[id] || auditDetails['audit-001'])
}

export function submitAuditAction(payload: AuditActionPayload) {
  return applyAuditAction(payload)
}
