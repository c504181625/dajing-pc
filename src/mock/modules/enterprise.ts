import { ENTERPRISE_CAPABILITY } from '@/enum/role'
import { AuditAction, AuditStatus, OperationStatus, ServiceType } from '@/enum/status'
import type {
  AuditActionPayload,
  EnterpriseAuditDetail,
  EnterpriseAuditItem,
  EnterpriseAuditQuery,
  EnterpriseCapabilityProfile,
  EnterpriseProfile,
} from '@/types/business'

import { getCurrentEnterpriseId, getMockCurrentUser } from '../context'
import { createPageResult, mockPromise } from '../helper'

const enterpriseAuditList: EnterpriseAuditItem[] = [
  {
    id: 'audit-001',
    enterpriseName: '苏州智造检测有限公司',
    socialCreditCode: '91320594MA1Q2A0X1Y',
    contactName: '陈捷',
    contactPhone: '13800001111',
    enterpriseType: '检测机构',
    serviceTypes: [ServiceType.Inspection, ServiceType.Standard],
    status: AuditStatus.Pending,
    submitTime: '2026-04-07 10:20:10',
    reviewerName: '未分配',
  },
  {
    id: 'audit-002',
    enterpriseName: '杭州工研质量技术服务有限公司',
    socialCreditCode: '91330102MA27T6M993',
    contactName: '张凯',
    contactPhone: '13800002222',
    enterpriseType: '基础服务机构',
    serviceTypes: [ServiceType.Training, ServiceType.Diagnosis],
    status: AuditStatus.Supplement,
    submitTime: '2026-04-06 14:05:20',
    reviewerName: '李审核',
  },
]

const enterpriseAuditDetailMap: Record<string, EnterpriseAuditDetail> = {
  'audit-001': {
    ...enterpriseAuditList[0]!,
    email: 'lab@smartlab.cn',
    province: '江苏省',
    city: '苏州市',
    district: '工业园区',
    address: '星湖街 28 号创研产业园 B3 栋',
    registeredCapital: '1000万元',
    companyType: '有限责任公司',
    legalPerson: '陈海涛',
    businessLicense: {
      id: 'file-license-001',
      name: '营业执照.pdf',
      url: '/mock/business-license.pdf',
      fileType: 'pdf',
      size: 520 * 1024,
    },
    qualificationFiles: [
      { id: 'file-qual-001', name: 'CMA资质证书.pdf', url: '/mock/cma.pdf', fileType: 'pdf', size: 860 * 1024 },
      { id: 'file-qual-002', name: 'CNAS认可证书.pdf', url: '/mock/cnas.pdf', fileType: 'pdf', size: 910 * 1024 },
    ],
    qualifications: [
      { id: 'qual-001', name: 'CMA检验检测机构资质认定', number: 'CMA20261234', validUntil: '2028-12-31', status: 'valid' },
      { id: 'qual-002', name: 'CNAS实验室认可', number: 'CNAS-L23456', validUntil: '2027-08-30', status: 'expiring' },
    ],
    auditRecords: [
      {
        id: 'record-001',
        title: '提交入驻申请',
        time: '2026-04-07 10:20:10',
        description: '提交企业基本资料、营业执照与检测资质文件。',
        operator: '企业用户',
        status: OperationStatus.Done,
      },
      {
        id: 'record-002',
        title: '系统分配审核员',
        time: '2026-04-07 10:35:40',
        description: '系统已将该申请分配至企业审核组。',
        operator: '平台系统',
        status: OperationStatus.Done,
      },
      {
        id: 'record-003',
        title: '待人工审核',
        time: '2026-04-07 10:36:00',
        description: '当前等待平台审核员完成资质核验。',
        operator: '平台审核组',
        status: OperationStatus.Processing,
      },
    ],
  },
  'audit-002': {
    ...enterpriseAuditList[1]!,
    email: 'service@hangquality.cn',
    province: '浙江省',
    city: '杭州市',
    district: '上城区',
    address: '钱江路 566 号质量产业中心 8 层',
    registeredCapital: '500万元',
    companyType: '有限责任公司',
    legalPerson: '赵玲',
    businessLicense: {
      id: 'file-license-002',
      name: '营业执照.pdf',
      url: '/mock/business-license-2.pdf',
      fileType: 'pdf',
      size: 508 * 1024,
    },
    qualificationFiles: [
      { id: 'file-qual-003', name: '咨询服务资质.pdf', url: '/mock/consult.pdf', fileType: 'pdf', size: 662 * 1024 },
    ],
    qualifications: [
      { id: 'qual-003', name: '质量诊断咨询资质', number: 'QD-20260218', validUntil: '2028-02-18', status: 'valid' },
    ],
    auditRecords: [
      {
        id: 'record-101',
        title: '提交入驻申请',
        time: '2026-04-06 14:05:20',
        description: '提交基础服务机构材料及联系人信息。',
        operator: '企业用户',
        status: OperationStatus.Done,
      },
      {
        id: 'record-102',
        title: '要求补充材料',
        time: '2026-04-06 16:20:00',
        description: '需要补充服务案例、资质证明和项目规范说明。',
        operator: '李审核',
        status: OperationStatus.Warning,
      },
      {
        id: 'record-103',
        title: '补充材料待复核',
        time: '2026-04-06 16:22:00',
        description: '当前等待企业重新上传补充材料后复核。',
        operator: '平台审核组',
        status: OperationStatus.Processing,
      },
    ],
    remark: '请补充近两年的服务案例、资质说明与人员名单。',
  },
}

const enterpriseProfiles: Record<string, EnterpriseProfile> = {
  'ent-100': {
    enterpriseId: 'ent-100',
    enterpriseName: '苏州启航电子股份有限公司',
    enterpriseType: '企业主体',
    capabilities: [ENTERPRISE_CAPABILITY.demander],
    socialCreditCode: '91320508MA2Q0K7M2C',
    legalPerson: '周明',
    contactName: '刘工',
    contactPhone: '13800008888',
    email: 'owner@qihang.cn',
    address: '江苏省苏州市高新区科创路88号',
    intro: '主营汽车电子模组研发与制造，当前重点开展可靠性测试与质量体系提升。',
    serviceTypes: [ServiceType.Inspection, ServiceType.Diagnosis],
    businessLicense: { id: 'ent100-license', name: '启航营业执照.pdf', url: '/mock/qihang-license.pdf', fileType: 'pdf' },
    qualificationFiles: [{ id: 'ent100-cert', name: 'IATF16949.pdf', url: '/mock/iatf.pdf', fileType: 'pdf' }],
  },
  'ent-200': {
    enterpriseId: 'ent-200',
    enterpriseName: '杭州工研质量技术服务有限公司',
    enterpriseType: '企业主体',
    capabilities: [ENTERPRISE_CAPABILITY.serviceProvider],
    socialCreditCode: '91330102MA27T6M993',
    legalPerson: '赵玲',
    contactName: '张凯',
    contactPhone: '13800002222',
    email: 'service@hangquality.cn',
    address: '浙江省杭州市上城区钱江路566号',
    intro: '提供质量诊断、培训、标准化辅导等企业基础服务。',
    serviceTypes: [ServiceType.Standard, ServiceType.Diagnosis, ServiceType.Training],
    businessLicense: { id: 'ent200-license', name: '工研营业执照.pdf', url: '/mock/hangquality-license.pdf', fileType: 'pdf' },
    qualificationFiles: [{ id: 'ent200-cert', name: '咨询资质.pdf', url: '/mock/service-cert.pdf', fileType: 'pdf' }],
  },
  'ent-001': {
    enterpriseId: 'ent-001',
    enterpriseName: '苏州智造检测有限公司',
    enterpriseType: '企业主体',
    capabilities: [ENTERPRISE_CAPABILITY.labProvider],
    socialCreditCode: '91320594MA1Q2A0X1Y',
    legalPerson: '陈海涛',
    contactName: '陈捷',
    contactPhone: '13800001111',
    email: 'lab@smartlab.cn',
    address: '江苏省苏州市工业园区星湖街28号',
    intro: '提供电子元器件、材料与工业品检验检测服务，具备 CMA/CNAS 资质。',
    serviceTypes: [ServiceType.Inspection, ServiceType.Metrology, ServiceType.Standard],
    businessLicense: { id: 'ent001-license', name: '智造营业执照.pdf', url: '/mock/smartlab-license.pdf', fileType: 'pdf' },
    qualificationFiles: [
      { id: 'ent001-cert-1', name: 'CMA资质证书.pdf', url: '/mock/cma.pdf', fileType: 'pdf' },
      { id: 'ent001-cert-2', name: 'CNAS认可证书.pdf', url: '/mock/cnas.pdf', fileType: 'pdf' },
    ],
  },
  'ent-400': {
    enterpriseId: 'ent-400',
    enterpriseName: '宁波协同质量科技有限公司',
    enterpriseType: '企业主体',
    capabilities: [ENTERPRISE_CAPABILITY.demander, ENTERPRISE_CAPABILITY.serviceProvider],
    socialCreditCode: '91330200MA2MIX4001',
    legalPerson: '林卓',
    contactName: '王蕾',
    contactPhone: '13800004444',
    email: 'mix@duoquality.cn',
    address: '浙江省宁波市高新区创新一路99号',
    intro: '既采购外部服务，也对外承接质量诊断与培训类业务。',
    serviceTypes: [ServiceType.Diagnosis, ServiceType.Training],
  },
  'ent-500': {
    enterpriseId: 'ent-500',
    enterpriseName: '上海联测质量科技有限公司',
    enterpriseType: '企业主体',
    capabilities: [ENTERPRISE_CAPABILITY.demander, ENTERPRISE_CAPABILITY.labProvider],
    socialCreditCode: '91310100MA2LAB5001',
    legalPerson: '徐航',
    contactName: '沈哲',
    contactPhone: '13800005500',
    email: 'labmix@duolab.cn',
    address: '上海市闵行区申长路168号',
    intro: '同时具备需求发布和检测机构承接能力，支持双向业务协同。',
    serviceTypes: [ServiceType.Inspection, ServiceType.Metrology],
  },
}

export function mockGetEnterpriseAuditList(params?: EnterpriseAuditQuery) {
  let list = [...enterpriseAuditList]
  const keyword = String(params?.keyword || '').trim()
  const status = String(params?.status || '')
  const serviceType = String(params?.serviceType || '')

  if (keyword) {
    list = list.filter((item) =>
      [item.enterpriseName, item.socialCreditCode].some((field) => field.includes(keyword)),
    )
  }
  if (status) list = list.filter((item) => item.status === status)
  if (serviceType) list = list.filter((item) => item.serviceTypes.includes(serviceType as ServiceType))

  return mockPromise(createPageResult(list))
}

export function mockGetEnterpriseAuditDetail(id: string): Promise<EnterpriseAuditDetail> {
  return mockPromise(enterpriseAuditDetailMap[id] || enterpriseAuditDetailMap['audit-001']!)
}

export function mockSubmitEnterpriseAuditAction(payload: AuditActionPayload): Promise<boolean> {
  const detail = enterpriseAuditDetailMap[payload.auditId]
  if (!detail) return mockPromise(true)

  detail.status =
    payload.action === AuditAction.Approve
      ? AuditStatus.Approved
      : payload.action === AuditAction.Reject
        ? AuditStatus.Rejected
        : AuditStatus.Supplement

  detail.auditRecords.unshift({
    id: `record-${Date.now()}`,
    title:
      payload.action === AuditAction.Approve
        ? '审核通过'
        : payload.action === AuditAction.Reject
          ? '审核驳回'
          : '要求补充材料',
    time: new Date().toLocaleString('zh-CN', { hour12: false }),
    description: payload.remark,
    operator: '当前审核员',
    status: OperationStatus.Done,
  })
  detail.remark = payload.remark

  const row = enterpriseAuditList.find((item) => item.id === payload.auditId)
  if (row) {
    row.status = detail.status
    row.reviewerName = '当前审核员'
  }

  return mockPromise(true)
}

export function mockGetEnterpriseProfile(enterpriseId?: string): Promise<EnterpriseProfile> {
  const currentEnterpriseId = enterpriseId || getCurrentEnterpriseId() || 'ent-001'
  return mockPromise(enterpriseProfiles[currentEnterpriseId] ?? enterpriseProfiles['ent-001']!)
}

export function mockGetEnterpriseCapabilities(enterpriseId?: string): Promise<EnterpriseCapabilityProfile> {
  const profile =
    enterpriseProfiles[enterpriseId || getCurrentEnterpriseId() || 'ent-001'] ??
    enterpriseProfiles['ent-001']!
  return mockPromise({
    enterpriseId: profile.enterpriseId,
    enterpriseName: profile.enterpriseName,
    capabilities: profile.capabilities || getMockCurrentUser().enterpriseCapabilities || [],
  })
}

export function mockUpdateEnterpriseProfile(payload: EnterpriseProfile): Promise<boolean> {
  enterpriseProfiles[payload.enterpriseId] = {
    ...payload,
  }
  return mockPromise(true)
}

export function mockSubmitEnterpriseProfile(): Promise<boolean> {
  return mockPromise(true)
}
