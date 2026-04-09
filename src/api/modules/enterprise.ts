import type { PageResult } from '@/types/api'
import type {
  AuditActionPayload,
  EnterpriseAuditDetail,
  EnterpriseAuditItem,
  EnterpriseCapabilityProfile,
  EnterpriseProfile,
  EnterpriseAuditQuery,
} from '@/types/business'
import { http } from '@/utils/request'
import { isUseMock } from '../helper'
import {
  mockGetEnterpriseAuditDetail,
  mockGetEnterpriseAuditList,
  mockGetEnterpriseCapabilities,
  mockGetEnterpriseProfile,
  mockSubmitEnterpriseProfile,
  mockUpdateEnterpriseProfile,
  mockSubmitEnterpriseAuditAction,
} from '@/mock/modules/enterprise'

export function getEnterpriseAuditList(params?: EnterpriseAuditQuery): Promise<PageResult<EnterpriseAuditItem>> {
  if (isUseMock()) return mockGetEnterpriseAuditList(params)
  return http<PageResult<EnterpriseAuditItem>>({ url: '/enterprise/audit/page', method: 'get', params })
}

export function getEnterpriseAuditDetail(id: string): Promise<EnterpriseAuditDetail> {
  if (isUseMock()) return mockGetEnterpriseAuditDetail(id)
  return http<EnterpriseAuditDetail>({ url: `/enterprise/audit/${id}`, method: 'get' })
}

export function submitEnterpriseAuditAction(payload: AuditActionPayload): Promise<boolean> {
  if (isUseMock()) return mockSubmitEnterpriseAuditAction(payload)
  return http<boolean>({ url: '/enterprise/audit/action', method: 'post', data: payload })
}

export function getEnterpriseProfile(enterpriseId?: string): Promise<EnterpriseProfile> {
  if (isUseMock()) return mockGetEnterpriseProfile(enterpriseId)
  return http<EnterpriseProfile>({ url: '/enterprise/profile', method: 'get', params: { enterpriseId } })
}

export function getEnterpriseCapabilities(enterpriseId?: string): Promise<EnterpriseCapabilityProfile> {
  if (isUseMock()) return mockGetEnterpriseCapabilities(enterpriseId)
  return http<EnterpriseCapabilityProfile>({ url: '/enterprise/capabilities', method: 'get', params: { enterpriseId } })
}

export function updateEnterpriseProfile(payload: EnterpriseProfile): Promise<boolean> {
  if (isUseMock()) return mockUpdateEnterpriseProfile(payload)
  return http<boolean>({ url: '/enterprise/profile', method: 'put', data: payload })
}

export function submitEnterpriseProfile(): Promise<boolean> {
  if (isUseMock()) return mockSubmitEnterpriseProfile()
  return http<boolean>({ url: '/enterprise/profile/submit', method: 'post' })
}
