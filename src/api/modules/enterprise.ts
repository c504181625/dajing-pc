import { createClientPageResult, isUseOpenApi, normalizePageResult, toRecord } from '@/api/helper'
import type { PageResult } from '@/types/api'
import type {
  AttachmentItem,
  AuditActionPayload,
  EnterpriseBusinessLicenseOcrResult,
  EnterpriseAuditDetail,
  EnterpriseAuditItem,
  EnterpriseCapabilityProfile,
  EnterpriseCertificate,
  EnterpriseProfile,
  EnterpriseAuditQuery,
} from '@/types/business'
import { AuditAction, AuditStatus, OperationStatus } from '@/enum/status'
import { formatDateTime } from '@/utils/date'
import { http } from '@/utils/request'

const adminApiPrefix = '/api/admin'
const userApiPrefix = '/api/user'

function normalizeEnterpriseProfile(raw: unknown, enterpriseId?: string): EnterpriseProfile {
  const source = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const firstLicense = Array.isArray(source.businessLicense)
    ? (source.businessLicense[0] as { id?: string; name?: string; url?: string; fileType?: string } | undefined)
    : (source.businessLicense as { id?: string; name?: string; url?: string; fileType?: string } | undefined)

  return {
    enterpriseId: String(source.enterpriseId || source.id || enterpriseId || ''),
    enterpriseName: String(source.enterpriseName || source.name || ''),
    enterpriseType: String(source.enterpriseType || source.enterprise_type || ''),
    capabilities: Array.isArray(source.capabilities) ? (source.capabilities as EnterpriseProfile['capabilities']) : undefined,
    socialCreditCode: String(source.socialCreditCode || source.unifiedCreditCode || source.unifiedSocialCode || ''),
    legalPerson: String(source.legalPerson || ''),
    contactName: String(source.contactName || ''),
    contactPhone: String(source.contactPhone || source.mobile || ''),
    email: String(source.email || ''),
    address: String(source.address || source.registeredAddress || ''),
    intro: String(source.intro || source.enterpriseIntro || ''),
    serviceTypes: Array.isArray(source.serviceTypes) ? (source.serviceTypes as EnterpriseProfile['serviceTypes']) : [],
    businessLicense: firstLicense
      ? {
          id: String(firstLicense.id || 'business-license'),
          name: String(firstLicense.name || '营业执照'),
          url: String(firstLicense.url || ''),
          fileType: String(firstLicense.fileType || 'pdf'),
        }
      : undefined,
    qualificationFiles: Array.isArray(source.qualificationFiles)
      ? (source.qualificationFiles as EnterpriseProfile['qualificationFiles'])
      : [],
  }
}

function normalizeEnterpriseType(value: unknown) {
  if (value === 1 || value === '1') return '检测机构'
  if (value === 2 || value === '2') return '基础服务机构'
  return String(value || '')
}

function normalizeEnterpriseAuditStatus(value: unknown): AuditStatus {
  const status = Number(value)
  if (status === 2) return AuditStatus.Approved
  if (status === 3) return AuditStatus.Rejected
  if (status === 4) return AuditStatus.Supplement
  return AuditStatus.Pending
}

function splitRegion(region: unknown) {
  const text = String(region || '')
  if (!text) return { province: '', city: '', district: '' }
  const provinceMatch = text.match(/^(.+?省|.+?自治区|.+?特别行政区|.+?市)/)
  const province = provinceMatch?.[0] || ''
  const rest = province ? text.slice(province.length) : text
  const cityMatch = rest.match(/^(.+?市|.+?州|.+?盟|.+?地区)/)
  const city = cityMatch?.[0] || ''
  const district = city ? rest.slice(city.length) : rest
  return { province, city, district }
}

function normalizeEnterpriseAuditItem(raw: unknown): EnterpriseAuditItem {
  const source = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const socialCreditCode = String(source.unifiedCreditCode || source.socialCreditCode || '')
  const contactPhone = String(source.contactPhone || '')
  const maskedPhone =
    contactPhone && contactPhone.includes('*')
      ? contactPhone
      : contactPhone.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2')
  return {
    id: String(source.id || source.enterpriseId || ''),
    enterpriseName: String(source.enterpriseName || source.name || ''),
    socialCreditCode,
    contactName: String(source.contactName || ''),
    contactPhone: maskedPhone || contactPhone,
    enterpriseType: normalizeEnterpriseType(source.enterpriseType || source.companyType),
    serviceTypes: Array.isArray(source.serviceTypes)
      ? (source.serviceTypes as EnterpriseAuditItem['serviceTypes'])
      : [],
    status: normalizeEnterpriseAuditStatus(source.certStatus),
    submitTime: formatDateTime(source.createTime || source.submitTime, { fallback: '' }),
    reviewerName: source.reviewerName ? String(source.reviewerName) : undefined,
  }
}

function normalizeQualificationStatus(expireDate?: string, expireStatus?: unknown) {
  const status = Number(expireStatus)
  if (status === 2) return 'expired' as const
  if (status === 1) return 'expiring' as const
  if (expireDate) {
    const date = new Date(expireDate)
    const now = new Date()
    const diff = date.getTime() - now.getTime()
    const days = diff / (1000 * 60 * 60 * 24)
    if (days <= 0) return 'expired' as const
    if (days <= 90) return 'expiring' as const
  }
  return 'valid' as const
}

function buildAuditRecords(raw: Record<string, unknown>, detailId: string) {
  const submitTime = formatDateTime(raw.createTime || raw.submitTime, { fallback: '' })
  const certStatus = normalizeEnterpriseAuditStatus(raw.certStatus)
  const baseRecords: NonNullable<EnterpriseAuditDetail['auditRecords']> = [
    {
      id: `${detailId}-submit`,
      title: '提交入驻申请',
      time: submitTime || new Date().toISOString().slice(0, 19).replace('T', ' '),
      description: '提交企业基础资料、营业执照和资质文件。',
      operator: '企业用户',
      status: OperationStatus.Done,
    },
  ]

  if (certStatus === AuditStatus.Pending) {
    baseRecords.push({
      id: `${detailId}-pending`,
      title: '等待平台审核',
      time: submitTime || new Date().toISOString().slice(0, 19).replace('T', ' '),
      description: '当前等待平台审核员完成资质核验。',
      operator: '平台系统',
      status: OperationStatus.Processing,
    })
  } else if (certStatus === AuditStatus.Supplement) {
    baseRecords.push({
      id: `${detailId}-supplement`,
      title: '要求补充材料',
      time: submitTime || new Date().toISOString().slice(0, 19).replace('T', ' '),
      description: '当前需要企业补充营业执照、资质证书或说明材料。',
      operator: '平台审核组',
      status: OperationStatus.Warning,
    })
  } else if (certStatus === AuditStatus.Approved) {
    baseRecords.push({
      id: `${detailId}-approved`,
      title: '审核通过',
      time: submitTime || new Date().toISOString().slice(0, 19).replace('T', ' '),
      description: '企业资料已通过审核，可进入对应后台继续办理业务。',
      operator: '平台审核组',
      status: OperationStatus.Done,
    })
  } else {
    baseRecords.push({
      id: `${detailId}-rejected`,
      title: '审核驳回',
      time: submitTime || new Date().toISOString().slice(0, 19).replace('T', ' '),
      description: '企业资料未通过审核，需按照意见重新提交。',
      operator: '平台审核组',
      status: OperationStatus.Warning,
    })
  }

  return baseRecords
}

async function loadEnterpriseCertFiles(enterpriseId: string) {
  try {
    return await getEnterpriseCertificateList(enterpriseId)
  } catch {
    return []
  }
}

function certificateToAttachment(item: EnterpriseCertificate): AttachmentItem {
  return {
    id: String(item.id || item.certNo || item.certName),
    name: String(item.certName || item.certNo || '资质证书'),
    url: String(item.certFile || ''),
    fileType: String(item.certFile?.toString().split('.').pop() || 'pdf'),
  }
}

export function getEnterpriseAuditList(params?: EnterpriseAuditQuery): Promise<PageResult<EnterpriseAuditItem>> {
  if (!isUseOpenApi()) return Promise.resolve({ total: 0, list: [], pageNum: 1, pageSize: 20 } as any)

  const needClientFilter = Boolean(params?.enterpriseType)
  const certStatus =
    params?.status === AuditStatus.Pending
      ? 0
      : params?.status === AuditStatus.Approved
        ? 1
        : params?.status === AuditStatus.Rejected
          ? 2
          : undefined

  return http<unknown>({
    url: `${adminApiPrefix}/admin/enterprise/list`,
    method: 'get',
    params: {
      page: needClientFilter ? 1 : params?.pageNum || 1,
      size: needClientFilter ? Math.max(Number(params?.pageSize || 10) * 10, 200) : params?.pageSize || 10,
      keyword: params?.keyword || undefined,
      certStatus,
    },
  }).then((res) => {
    const page = normalizePageResult(res, normalizeEnterpriseAuditItem, params)
    const filtered = params?.enterpriseType
      ? page.list.filter((item) => String(item.enterpriseType || '').includes(params.enterpriseType === '1' ? '检测' : '基础'))
      : page.list

    return needClientFilter ? createClientPageResult(filtered, params) : page
  })
}

export function getEnterpriseAuditDetail(id: string): Promise<EnterpriseAuditDetail> {
  if (!isUseOpenApi()) return Promise.resolve({ total: 0, list: [], pageNum: 1, pageSize: 20 } as any)

  return Promise.all([
    http<unknown>({ url: `${userApiPrefix}/enterprise/${id}`, method: 'get' }),
    loadEnterpriseCertFiles(id),
  ]).then(([detailRes, certs]) => {
    const source = (detailRes && typeof detailRes === 'object' ? detailRes : {}) as Record<string, unknown>
    const { province, city, district } = splitRegion(source.region)
    const qualificationFiles = certs.map((item) => ({
      id: String(item.id || item.certNo || item.certName),
      name: String(item.certName || item.certNo || '资质证书'),
      url: String(item.certFile || ''),
      fileType: String(item.certFile?.toString().split('.').pop() || 'pdf'),
    }))

    const qualifications = certs.map((item) => ({
      id: String(item.id || item.certNo || item.certName),
      name: String(item.certName || item.certNo || '资质证书'),
      number: String(item.certNo || ''),
      validUntil: formatDateTime(item.expireDate, { fallback: '' }),
      status: normalizeQualificationStatus(item.expireDate, (item.raw as Record<string, unknown> | undefined)?.expireStatus),
    }))

    return {
      id: String(source.id || id),
      enterpriseName: String(source.enterpriseName || ''),
      socialCreditCode: String(source.unifiedCreditCode || source.socialCreditCode || ''),
      contactName: String(source.contactName || ''),
      contactPhone: String(source.contactPhone || ''),
      enterpriseType: normalizeEnterpriseType(source.enterpriseType || source.companyType),
      status: normalizeEnterpriseAuditStatus(source.certStatus),
      submitTime: formatDateTime(source.createTime || source.submitTime, { fallback: '' }),
      reviewerName: source.reviewerName ? String(source.reviewerName) : undefined,
      email: String(source.email || ''),
      province,
      city,
      district,
      address: String(source.address || ''),
      registeredCapital: String(source.registeredCapital || ''),
      companyType: String(source.companyType || ''),
      legalPerson: String(source.legalPerson || ''),
      serviceTypes: Array.isArray(source.serviceTypes)
        ? (source.serviceTypes as EnterpriseAuditDetail['serviceTypes'])
        : [],
      businessLicense: {
        id: String(source.id || id),
        name: '营业执照',
        url: String(source.certFileUrl || source.authorizationLetter || ''),
        fileType: 'pdf',
      },
      qualificationFiles,
      qualifications,
      auditRecords: buildAuditRecords(source, id) as EnterpriseAuditDetail['auditRecords'],
      remark: String(source.rejectReason || ''),
    }
  })
}

export function submitEnterpriseAuditAction(payload: AuditActionPayload): Promise<boolean> {
  if (!isUseOpenApi()) return Promise.resolve(true)

  return http<boolean>({
    url: `${adminApiPrefix}/admin/enterprise/${payload.auditId}/audit`,
    method: 'put',
    params: {
      passed: payload.action === AuditAction.Approve,
      rejectReason:
        payload.action === AuditAction.Approve ? undefined : payload.remark || undefined,
    },
  }).then(() => true)
}

export function getEnterpriseProfile(enterpriseId?: string): Promise<EnterpriseProfile> {
  if (!isUseOpenApi()) return Promise.resolve({ total: 0, list: [], pageNum: 1, pageSize: 20 } as any)

  const request = enterpriseId
    ? http<EnterpriseProfile>({
        url: `${userApiPrefix}/enterprise/${enterpriseId}`,
        method: 'get',
      })
    : http<EnterpriseProfile>({
        url: `${userApiPrefix}/enterprise/my`,
        method: 'get',
      })

  return request.then((res) => {
    const profile = normalizeEnterpriseProfile(res, enterpriseId)
    const certEnterpriseId = profile.enterpriseId || enterpriseId
    if (!certEnterpriseId) return profile

    return loadEnterpriseCertFiles(certEnterpriseId)
      .then((certs) => {
        const qualificationFiles = certs.map((item) => certificateToAttachment(item))
        return {
          ...profile,
          qualificationFiles: profile.qualificationFiles?.length
            ? profile.qualificationFiles
            : qualificationFiles,
          businessLicense: profile.businessLicense || qualificationFiles[0],
        }
      })
      .catch(() => profile)
  })
}

export function getEnterpriseCapabilities(enterpriseId?: string): Promise<EnterpriseCapabilityProfile> {
  if (!isUseOpenApi()) return Promise.resolve({ total: 0, list: [], pageNum: 1, pageSize: 20 } as any)

  return getEnterpriseProfile(enterpriseId).then((profile) => ({
    enterpriseId: profile.enterpriseId,
    enterpriseName: profile.enterpriseName,
    capabilities: profile.capabilities || [],
  }))
}

export function updateEnterpriseProfile(payload: EnterpriseProfile): Promise<boolean> {
  if (!isUseOpenApi() || !payload.enterpriseId) return Promise.resolve(true)

  return http<boolean>({
    url: `${userApiPrefix}/enterprise/${payload.enterpriseId}`,
    method: 'put',
    data: payload,
  }).then(() => true)
}

export function submitEnterpriseProfile(): Promise<boolean> {
  return Promise.resolve(true)
}

function normalizeEnterpriseCertificate(raw: unknown): EnterpriseCertificate {
  const source = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  return {
    id: String(source.id || source.certId || ''),
    certType: String(source.certType || source.certificateType || 'OTHER'),
    certNo: String(source.certNo || source.certificateNo || ''),
    certName: String(source.certName || source.certificateName || ''),
    certFile: String(source.certFile || source.certificateFile || ''),
    expireDate: source.expireDate ? String(source.expireDate) : undefined,
    raw: source,
  }
}

function normalizeOcrBusinessLicense(raw: unknown, imageUrl: string): EnterpriseBusinessLicenseOcrResult {
  const source = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  return {
    enterpriseName: source.enterpriseName ? String(source.enterpriseName) : undefined,
    socialCreditCode: String(source.socialCreditCode || source.unifiedCreditCode || ''),
    legalPerson: source.legalPerson ? String(source.legalPerson) : undefined,
    registeredAddress: source.registeredAddress ? String(source.registeredAddress) : undefined,
    address: source.address ? String(source.address) : undefined,
    businessScope: source.businessScope ? String(source.businessScope) : undefined,
    imageUrl,
    raw: source,
  }
}

export function ocrBusinessLicense(imageUrl: string): Promise<EnterpriseBusinessLicenseOcrResult> {
  if (!isUseOpenApi()) {
    return Promise.resolve({
      imageUrl,
      enterpriseName: '苏州智造检测有限公司',
      socialCreditCode: '91320594MA1Q2A0X1Y',
      legalPerson: '陈海涛',
      registeredAddress: '江苏省苏州市工业园区星湖街 28 号',
      businessScope: '检测、检验、技术服务',
      raw: {},
    })
  }

  return http<EnterpriseBusinessLicenseOcrResult>({
    url: `${userApiPrefix}/enterprise/ocr/business-license`,
    method: 'post',
    data: { imageUrl },
  }).then((res) => normalizeOcrBusinessLicense(res, imageUrl))
}

export function createEnterpriseCertificate(
  enterpriseId: string,
  payload: EnterpriseCertificate,
): Promise<EnterpriseCertificate> {
  if (!isUseOpenApi()) {
    return Promise.resolve({
      ...payload,
      id: payload.id || `cert-${Date.now()}`,
    })
  }

  return http<EnterpriseCertificate>({
    url: `${userApiPrefix}/enterprise/${enterpriseId}/cert`,
    method: 'post',
    data: payload,
  }).then((res) => {
    if (typeof res === 'number' || typeof res === 'string') {
      return {
        ...payload,
        id: String(res),
      }
    }
    return normalizeEnterpriseCertificate(res)
  })
}

export function getEnterpriseCertificateList(enterpriseId: string): Promise<EnterpriseCertificate[]> {
  if (!isUseOpenApi()) {
    return Promise.resolve([])
  }

  return http<unknown>({
    url: `${userApiPrefix}/enterprise/${enterpriseId}/cert`,
    method: 'get',
  }).then((res) => {
    const payload = Array.isArray(res)
      ? res
      : res && typeof res === 'object' && Array.isArray((res as Record<string, unknown>).list)
        ? ((res as Record<string, unknown>).list as unknown[])
        : []

    return payload.map((item) => normalizeEnterpriseCertificate(item))
  })
}

export function deleteEnterpriseCertificate(enterpriseId: string, certId: string): Promise<boolean> {
  if (!isUseOpenApi()) {
    return Promise.resolve(true)
  }

  return http<boolean>({
    url: `${userApiPrefix}/enterprise/${enterpriseId}/cert/${certId}`,
    method: 'delete',
  })
}

export function upgradeEnterpriseToProvider(
  enterpriseId: string,
  payload: {
    certFileUrl: string
    certNo: string
    certExpiry: string
    certScope?: string
  },
): Promise<boolean> {
  if (!isUseOpenApi()) {
    return Promise.resolve(true)
  }

  return http<void>({
    url: `${userApiPrefix}/enterprise/${enterpriseId}/upgrade-provider`,
    method: 'put',
    params: payload,
  }).then(() => true)
}
