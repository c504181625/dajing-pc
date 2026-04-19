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
import { formatDateTime } from '@/utils/date'
import { http } from '@/utils/request'
import { getCurrentUser as getCurrentAuthUser } from './auth'
import { uploadLicenseFile } from './file'

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
    createdAt: formatDateTime(getRecordValue(source, ['createdAt', 'createTime']), { fallback: '' }),
    lastLoginTime: source.lastLoginTime ? formatDateTime(source.lastLoginTime) : undefined,
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
  return getCurrentAuthUser()
    .then(async (currentUser) => {
      const accountType = normalizeAccountType(currentUser.accountType)

      if (accountType === ACCOUNT_TYPE.operator) {
        return {
          canUpgrade: false,
          hasPendingApplication: false,
          currentStatus: 'approved',
          remark: '平台运营方账号无需发起企业升级申请。',
        } satisfies EnterpriseUpgradeSummary
      }

      if (accountType === ACCOUNT_TYPE.enterprise) {
        return {
          canUpgrade: false,
          hasPendingApplication: false,
          currentStatus: 'approved',
          remark: currentUser.enterpriseName
            ? `当前账号已绑定企业：${currentUser.enterpriseName}`
            : '当前账号已升级为企业账号。',
        } satisfies EnterpriseUpgradeSummary
      }

      try {
        const enterprise = await http<unknown>({
          url: '/api/user/enterprise/my',
          method: 'get',
        })
        const source = toRecord(enterprise)
        const certStatus = Number(getRecordValue(source, ['certStatus']) ?? -1)
        const currentStatus: EnterpriseUpgradeSummary['currentStatus'] =
          certStatus === 1 ? 'approved' : certStatus === 2 ? 'rejected' : 'reviewing'

        return {
          canUpgrade: currentStatus !== 'reviewing' && currentStatus !== 'approved',
          hasPendingApplication: currentStatus === 'reviewing',
          currentStatus,
          lastApplyTime: formatDateTime(
            getRecordValue(source, ['createTime', 'submitTime']),
            { fallback: '' },
          ),
          remark: String(
            getRecordValue(source, ['rejectReason', 'reviewRemark', 'remark']) ||
              (currentStatus === 'approved'
                ? '企业升级申请已通过。'
                : currentStatus === 'reviewing'
                  ? '企业升级申请正在审核中。'
                  : '企业升级申请未通过，请根据审核意见调整后重新提交。'),
          ),
        } satisfies EnterpriseUpgradeSummary
      } catch (error) {
        const source = toRecord(error)
        const code = Number(source.code || 0)
        const message = String(source.message || '')

        if (code === 42001 || message.includes('企业不存在')) {
          return {
            canUpgrade: true,
            hasPendingApplication: false,
            currentStatus: 'not_started',
            remark: '当前账号尚未发起企业升级申请。',
          } satisfies EnterpriseUpgradeSummary
        }

        throw error
      }
    })
}

async function ensureEnterpriseLicenseObjectName(
  item: EnterpriseUpgradeForm['businessLicense'][number] | undefined,
) {
  if (!item) return ''
  if (item.raw) {
    const uploaded = await uploadLicenseFile(item.raw)
    return String(uploaded.objectName || uploaded.fileKey || uploaded.url || '')
  }
  return String(item.url || '')
}

export async function submitEnterpriseUpgrade(payload: EnterpriseUpgradeForm): Promise<boolean> {
  const businessLicense = await ensureEnterpriseLicenseObjectName(payload.businessLicense[0])
  const enterpriseType = payload.enterpriseTags.includes('provider') ? 2 : 1

  return http<boolean>({
    url: '/api/user/enterprise/register',
    method: 'post',
    data: {
      enterpriseName: payload.enterpriseName,
      unifiedCreditCode: payload.unifiedSocialCode || undefined,
      businessLicense,
      legalPerson: payload.contactName,
      contactName: payload.contactName,
      contactPhone: payload.contactMobile,
      enterpriseType,
      region: payload.region.join(''),
      address: payload.registeredAddress,
      serviceRange: payload.businessScope,
      introduction: payload.enterpriseIntro || undefined,
      qualification: payload.enterpriseCapabilities?.join(' / ') || undefined,
    },
  }).then(() => true)
}
