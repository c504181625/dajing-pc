import {
  createClientPageResult,
  getRecordValue,
  normalizePageResult,
  resolveEmptyValue,
  toRecord,
} from '@/api/helper'
import type { EnterpriseUpgradeForm, EnterpriseUpgradeSummary } from '@/types/auth'
import type { PageResult } from '@/types/api'
import type { UserDetail, UserItem, UserQuery } from '@/types/business'
import { ACCOUNT_TYPE, normalizeAccountType } from '@/enum/role'
import { AccountStatus, UserType } from '@/enum/status'
import { http } from '@/utils/request'

const adminApiPrefix = '/api/admin'

function normalizeUserStatus(value: unknown) {
  return Number(value) === 1 ? AccountStatus.Disabled : AccountStatus.Enabled
}

function normalizeCertificationStatus(value: unknown): UserItem['certificationStatus'] {
  const status = Number(value)
  if (status === 1) return 'approved'
  if (status === 2) return 'rejected'
  if (status === 0) return 'reviewing'
  return 'not_started'
}

function normalizeUserGroup(
  source: Record<string, unknown>,
  accountType: UserItem['accountType'],
): UserItem['accountGroup'] {
  const rawUserType = Number(
    getRecordValue(source, ['userType', 'user_type', 'accountType', 'account_type']) ?? -1,
  )

  if (accountType === ACCOUNT_TYPE.operator || rawUserType === 4) {
    return 'operator'
  }

  if (accountType === ACCOUNT_TYPE.enterprise || [1, 2, 3].includes(rawUserType)) {
    return 'enterprise'
  }

  return 'personal'
}

function isPersonalAccount(item: UserItem) {
  return item.accountGroup === 'personal'
}

function isEnterpriseAccount(item: UserItem) {
  return item.accountGroup === 'enterprise'
}

function normalizeUserItem(raw: unknown): UserItem {
  const source = toRecord(raw)
  const accountType = normalizeAccountType(
    getRecordValue(source, ['accountType', 'account_type', 'userType', 'user_type']) as
      | string
      | number
      | null
      | undefined,
  )
  const enterpriseTags = Array.isArray(source.enterpriseTags)
    ? (source.enterpriseTags as UserItem['enterpriseCapabilities'])
    : []
  const roleNames = Array.isArray(source.roleNames)
    ? (source.roleNames as string[])
    : Array.isArray(source.roleCodes)
      ? (source.roleCodes as string[])
      : Array.isArray(source.roles)
        ? (source.roles as string[])
        : []
  const accountGroup = normalizeUserGroup(source, accountType)

  return {
    id: String(getRecordValue(source, ['id', 'userId']) || ''),
    userType: accountGroup === 'enterprise' ? UserType.Enterprise : UserType.Personal,
    accountGroup,
    accountType,
    currentIdentity: source.currentIdentity as UserItem['currentIdentity'],
    name: String(getRecordValue(source, ['name', 'nickname', 'username', 'phone']) || ''),
    mobile: String(getRecordValue(source, ['mobile', 'phone']) || ''),
    email: source.email ? String(source.email) : undefined,
    enterpriseName: source.enterpriseName ? String(source.enterpriseName) : undefined,
    socialCreditCode: getRecordValue(source, ['socialCreditCode', 'unifiedCreditCode'])
      ? String(getRecordValue(source, ['socialCreditCode', 'unifiedCreditCode']))
      : undefined,
    enterpriseCapabilities: enterpriseTags,
    certificationStatus: normalizeCertificationStatus(source.certStatus),
    sourceLabel: source.sourceLabel ? String(source.sourceLabel) : undefined,
    riskLabel: source.riskLabel ? String(source.riskLabel) : undefined,
    roleNames,
    status: normalizeUserStatus(source.status),
    createdAt: String(getRecordValue(source, ['createdAt', 'createTime']) || ''),
    lastLoginTime: source.lastLoginTime ? String(source.lastLoginTime) : undefined,
  }
}

export function getUserList(params?: UserQuery): Promise<PageResult<UserItem>> {
  const shouldUseClientFilter = Boolean(params?.userType)
  const pageNum = Number(params?.pageNum || 1)
  const pageSize = Number(params?.pageSize || 10)

  return http<unknown>({
    url: `${adminApiPrefix}/admin/user/list`,
    method: 'get',
    params: {
      keyword: params?.keyword || undefined,
      status:
        params?.accountStatus === AccountStatus.Enabled
          ? 0
          : params?.accountStatus === AccountStatus.Disabled
            ? 1
            : undefined,
      page: shouldUseClientFilter ? 1 : pageNum,
      size: shouldUseClientFilter ? Math.max(pageSize * 10, 200) : pageSize,
    },
  }).then((res) => {
    const page = normalizePageResult(res, normalizeUserItem, params)
    const filtered = params?.userType
      ? page.list.filter((item) =>
          params.userType === UserType.Personal ? isPersonalAccount(item) : isEnterpriseAccount(item),
        )
      : page.list

    if (!shouldUseClientFilter) return page

    return createClientPageResult(filtered, params)
  })
}

export function getUserDetail(id: string): Promise<UserDetail> {
  return http<unknown>({
    url: `${adminApiPrefix}/admin/user/${id}`,
    method: 'get',
  })
    .then((res) => ({
      ...normalizeUserItem(res),
      id,
      remark: String(toRecord(res).remark || ''),
    }))
    .catch(() =>
      resolveEmptyValue<UserDetail>({
        ...normalizeUserItem({ id }),
        remark: '',
      }),
    )
}

export function toggleUserStatus(id: string, currentStatus?: string): Promise<boolean> {
  const action =
    currentStatus === AccountStatus.Enabled ? 'disable' : 'enable'

  return http<boolean>({
    url: `${adminApiPrefix}/admin/user/${id}/${action}`,
    method: 'put',
  }).then(() => true)
}

export function updateUser(_payload: Partial<UserDetail> & { id: string }): Promise<boolean> {
  return resolveEmptyValue(false)
}

export function deleteUser(_id: string): Promise<boolean> {
  return resolveEmptyValue(false)
}

export function getEnterpriseUpgradeSummary(): Promise<EnterpriseUpgradeSummary> {
  return resolveEmptyValue<EnterpriseUpgradeSummary>({
    canUpgrade: false,
    hasPendingApplication: false,
    currentStatus: 'not_started',
  })
}

export function submitEnterpriseUpgrade(_payload: EnterpriseUpgradeForm): Promise<boolean> {
  return resolveEmptyValue(true)
}
