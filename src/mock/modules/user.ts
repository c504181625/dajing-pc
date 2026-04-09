import { AccountStatus, UserType } from '@/enum/status'
import type { UserDetail, UserItem, UserQuery } from '@/types/business'
import { createPageResult, mockPromise } from '../helper'

const userList: UserItem[] = [
  {
    id: 'user-001',
    userType: UserType.Personal,
    name: '张晓宇',
    mobile: '13800001001',
    email: 'zhangxy@163.com',
    roleNames: ['个人用户'],
    status: AccountStatus.Enabled,
    createdAt: '2026-03-21 10:20:00',
    lastLoginTime: '2026-04-08 08:12:00',
  },
  {
    id: 'user-002',
    userType: UserType.Personal,
    name: '李婷',
    mobile: '13800001002',
    email: 'liting@qq.com',
    roleNames: ['个人用户'],
    status: AccountStatus.Disabled,
    createdAt: '2026-03-18 09:10:00',
    lastLoginTime: '2026-04-07 14:32:00',
  },
  {
    id: 'user-101',
    userType: UserType.Enterprise,
    name: '陈璐',
    mobile: '13800001111',
    email: 'service@smartlab.cn',
    enterpriseName: '苏州智造检测有限公司',
    socialCreditCode: '91320594MA1Q2A0X1Y',
    roleNames: ['企业主账号', '检测机构'],
    status: AccountStatus.Enabled,
    createdAt: '2026-03-08 11:20:00',
    lastLoginTime: '2026-04-08 08:40:00',
  },
  {
    id: 'user-102',
    userType: UserType.Enterprise,
    name: '刘峰',
    mobile: '13800001112',
    email: 'market@hangquality.cn',
    enterpriseName: '杭州工研质量技术服务有限公司',
    socialCreditCode: '91330102MA27T6M993',
    roleNames: ['企业主账号', '服务机构'],
    status: AccountStatus.Enabled,
    createdAt: '2026-03-03 16:45:00',
    lastLoginTime: '2026-04-07 17:15:00',
  },
]

const userDetailMap: Record<string, UserDetail> = {
  'user-101': {
    ...userList[2]!,
    contactName: '陈璐',
    contactPhone: '13800001111',
    remark: '检测机构主账号',
  },
}

export function mockGetUserList(params?: UserQuery) {
  let list = [...userList]
  const keyword = String(params?.keyword || '').trim()
  const userType = String(params?.userType || '')
  const accountStatus = String(params?.accountStatus || '')

  if (keyword) {
    list = list.filter((item) => {
      return [item.name, item.mobile, item.enterpriseName, item.socialCreditCode].some((field) =>
        String(field || '').includes(keyword),
      )
    })
  }

  if (userType) list = list.filter((item) => item.userType === userType)
  if (accountStatus) list = list.filter((item) => item.status === accountStatus)

  return mockPromise(createPageResult(list))
}

export function mockGetUserDetail(id: string): Promise<UserDetail> {
  return mockPromise(userDetailMap[id] || ({ ...userList.find((item) => item.id === id)! } as UserDetail))
}

export function mockToggleUserStatus(id: string): Promise<boolean> {
  const target = userList.find((item) => item.id === id)
  if (target) target.status = target.status === AccountStatus.Enabled ? AccountStatus.Disabled : AccountStatus.Enabled
  return mockPromise(true)
}
