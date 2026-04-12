import type { EnterpriseUpgradeForm, EnterpriseUpgradeSummary } from '@/types/auth'
import { ACCOUNT_TYPE, ENTERPRISE_CAPABILITY } from '@/enum/role'
import { AccountStatus, UserType } from '@/enum/status'
import type { UserDetail, UserItem, UserQuery } from '@/types/business'
import { createPageResult, mockPromise } from '../helper'

const userList: UserItem[] = [
  {
    id: 'user-001',
    userType: UserType.Personal,
    accountType: ACCOUNT_TYPE.personal,
    currentIdentity: 'personal',
    name: '张晓宇',
    mobile: '13800001001',
    email: 'zhangxy@163.com',
    certificationStatus: 'approved',
    sourceLabel: '个人注册',
    roleNames: ['个人用户'],
    status: AccountStatus.Enabled,
    createdAt: '2026-03-21 10:20:00',
    lastLoginTime: '2026-04-08 08:12:00',
  },
  {
    id: 'user-002',
    userType: UserType.Personal,
    accountType: ACCOUNT_TYPE.personal,
    currentIdentity: 'personal',
    name: '李婷',
    mobile: '13800001002',
    email: 'liting@qq.com',
    certificationStatus: 'not_started',
    sourceLabel: '个人注册',
    riskLabel: '30 天未登录',
    roleNames: ['个人用户'],
    status: AccountStatus.Disabled,
    createdAt: '2026-03-18 09:10:00',
    lastLoginTime: '2026-04-07 14:32:00',
  },
  {
    id: 'user-101',
    userType: UserType.Enterprise,
    accountType: ACCOUNT_TYPE.enterprise,
    currentIdentity: 'enterprise_service_provider',
    name: '陈璐',
    mobile: '13800001111',
    email: 'service@smartlab.cn',
    enterpriseName: '苏州智造检测有限公司',
    socialCreditCode: '91320594MA1Q2A0X1Y',
    enterpriseCapabilities: [ENTERPRISE_CAPABILITY.serviceProvider],
    certificationStatus: 'approved',
    sourceLabel: '机构入驻',
    riskLabel: '资质证书临期',
    roleNames: ['企业主账号', '服务提供方 / 检测机构'],
    status: AccountStatus.Enabled,
    createdAt: '2026-03-08 11:20:00',
    lastLoginTime: '2026-04-08 08:40:00',
  },
  {
    id: 'user-102',
    userType: UserType.Enterprise,
    accountType: ACCOUNT_TYPE.enterprise,
    currentIdentity: 'enterprise_service_provider',
    name: '刘峰',
    mobile: '13800001112',
    email: 'market@hangquality.cn',
    enterpriseName: '杭州工研质量技术服务有限公司',
    socialCreditCode: '91330102MA27T6M993',
    enterpriseCapabilities: [ENTERPRISE_CAPABILITY.serviceProvider],
    certificationStatus: 'reviewing',
    sourceLabel: '服务方入驻',
    riskLabel: '补材待复核',
    roleNames: ['企业主账号', '服务提供方'],
    status: AccountStatus.Enabled,
    createdAt: '2026-03-03 16:45:00',
    lastLoginTime: '2026-04-07 17:15:00',
  },
  {
    id: 'user-103',
    userType: UserType.Enterprise,
    accountType: ACCOUNT_TYPE.enterprise,
    currentIdentity: 'enterprise_demander',
    name: '王蕾',
    mobile: '13800004444',
    email: 'mix@duoquality.cn',
    enterpriseName: '宁波协同质量科技有限公司',
    socialCreditCode: '91330200MA2MIX4001',
    enterpriseCapabilities: [ENTERPRISE_CAPABILITY.demander, ENTERPRISE_CAPABILITY.serviceProvider],
    certificationStatus: 'approved',
    sourceLabel: '企业注册升级',
    roleNames: ['企业主账号', '需求发布方', '服务提供方'],
    status: AccountStatus.Enabled,
    createdAt: '2026-03-01 09:20:00',
    lastLoginTime: '2026-04-08 09:50:00',
  },
]

const userDetailMap: Record<string, UserDetail> = {
  'user-101': {
    ...userList[2]!,
    contactName: '陈璐',
    contactPhone: '13800001111',
    remark: '检测机构主账号',
  },
  'user-102': {
    ...userList[3]!,
    contactName: '刘峰',
    contactPhone: '13800001112',
    remark: '当前补充材料已提交，等待平台复核。',
  },
}

function syncUserDetail(payload: UserItem) {
  if (userDetailMap[payload.id]) {
    userDetailMap[payload.id] = {
      ...userDetailMap[payload.id],
      ...payload,
    }
  }
}

let enterpriseUpgradeSummary: EnterpriseUpgradeSummary = {
  canUpgrade: true,
  hasPendingApplication: false,
  currentStatus: 'not_started',
}

export function mockGetUserList(params?: UserQuery) {
  let list = [...userList]
  const keyword = String(params?.keyword || '').trim()
  const userType = String(params?.userType || '')
  const accountStatus = String(params?.accountStatus || '')
  const pageNum = Number(params?.pageNum || 1)
  const pageSize = Number(params?.pageSize || 10)

  if (keyword) {
    list = list.filter((item) => {
      return [item.name, item.mobile, item.enterpriseName, item.socialCreditCode].some((field) =>
        String(field || '').includes(keyword),
      )
    })
  }

  if (userType) list = list.filter((item) => item.userType === userType)
  if (accountStatus) list = list.filter((item) => item.status === accountStatus)

  return mockPromise(createPageResult(list, pageNum, pageSize))
}

export function mockGetUserDetail(id: string): Promise<UserDetail> {
  return mockPromise(
    userDetailMap[id] || ({ ...userList.find((item) => item.id === id)! } as UserDetail),
  )
}

export function mockToggleUserStatus(id: string): Promise<boolean> {
  const target = userList.find((item) => item.id === id)
  if (target) {
    target.status =
      target.status === AccountStatus.Enabled ? AccountStatus.Disabled : AccountStatus.Enabled
    syncUserDetail(target)
  }
  return mockPromise(true)
}

export function mockUpdateUser(payload: Partial<UserDetail> & { id: string }): Promise<boolean> {
  const target = userList.find((item) => item.id === payload.id)
  if (!target) {
    return Promise.reject(new Error('未找到对应用户'))
  }

  Object.assign(target, payload)
  syncUserDetail(target)
  return mockPromise(true)
}

export function mockDeleteUser(id: string): Promise<boolean> {
  const index = userList.findIndex((item) => item.id === id)
  if (index === -1) {
    return Promise.reject(new Error('未找到对应用户'))
  }

  userList.splice(index, 1)
  delete userDetailMap[id]
  return mockPromise(true)
}

export function mockGetEnterpriseUpgradeSummary(): Promise<EnterpriseUpgradeSummary> {
  return mockPromise(enterpriseUpgradeSummary)
}

export function mockSubmitEnterpriseUpgrade(_payload: EnterpriseUpgradeForm): Promise<boolean> {
  enterpriseUpgradeSummary = {
    canUpgrade: true,
    hasPendingApplication: true,
    currentStatus: 'reviewing',
    lastApplyTime: '2026-04-10 11:20:00',
    remark: '申请已进入企业认证审核队列，请等待平台完成主体核验。',
  }
  return mockPromise(true)
}
