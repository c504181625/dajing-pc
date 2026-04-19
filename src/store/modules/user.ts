import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import {
  getCurrentUser,
  loginByCreditCode,
  loginByEmail,
  loginByMobile,
  loginByPassword,
} from '@/api/modules/auth'
import { MENU_CODE, PERMISSION_CODE } from '@/enum/permission'
import {
  ACCOUNT_TYPE,
  ENTERPRISE_CAPABILITY,
  isOperatorAccountType,
  normalizeAccountType,
  normalizeCurrentIdentity,
  normalizeEnterpriseTags,
} from '@/enum/role'
import type {
  AuthLoginResponse,
  CurrentUser,
  EnterpriseCapability,
  LoginCreditCodeCommand,
  LoginEmailCommand,
  LoginMobileCommand,
  LoginPasswordCommand,
  LoginResponse,
} from '@/types/auth'
import { getAccessToken, removeAccessToken, setAccessToken } from '@/utils/auth'

function getDefaultLandingPath(user?: CurrentUser | null) {
  if (!user) return '/login'
  // if (user.homeRoute) return user.homeRoute // Ignore backend route, use account type defaults

  if (user.accountType === ACCOUNT_TYPE.operator) return '/operator/dashboard'
  if (user.accountType === ACCOUNT_TYPE.enterprise) return '/enterprise/dashboard'
  return '/personal/dashboard'
}

function getDefaultMenuCodes(user: Pick<CurrentUser, 'accountType' | 'enterpriseTags'>) {
  if (user.accountType === ACCOUNT_TYPE.operator) {
    return [
      MENU_CODE.operatorDashboard,
      MENU_CODE.operatorBusiness,
      MENU_CODE.operatorUser,
      MENU_CODE.operatorEnterpriseAudit,
      MENU_CODE.operatorDemand,
      MENU_CODE.operatorConsult,
      MENU_CODE.operatorOrder,
      MENU_CODE.operatorReport,
      MENU_CODE.operatorComment,
      MENU_CODE.operatorMessage,
      MENU_CODE.operatorCommunity,
      MENU_CODE.operatorSystem,
      MENU_CODE.operatorRole,
      MENU_CODE.operatorSkin,
    ]
  }

  if (user.accountType === ACCOUNT_TYPE.enterprise) {
    const baseMenuCodes = [
      MENU_CODE.enterpriseDashboard,
      MENU_CODE.enterpriseProfile,
      MENU_CODE.enterpriseDemand,
      MENU_CODE.enterpriseOrder,
      MENU_CODE.enterpriseReport,
      MENU_CODE.enterpriseMessage,
      MENU_CODE.enterpriseAccountSettings,
    ]

    if (!user.enterpriseTags.includes(ENTERPRISE_CAPABILITY.serviceProvider)) {
      return baseMenuCodes
    }

    return [
      ...baseMenuCodes,
      MENU_CODE.enterpriseServiceCapability,
      MENU_CODE.enterpriseServiceProject,
      MENU_CODE.enterpriseOrderReceive,
      MENU_CODE.enterpriseQualification,
    ]
  }

  return [
    MENU_CODE.personalDashboard,
    MENU_CODE.personalDemand,
    MENU_CODE.personalOrder,
    MENU_CODE.personalMessage,
    MENU_CODE.personalProfile,
    MENU_CODE.personalEnterpriseUpgrade,
  ]
}

function getDefaultPermissionCodes(user: Pick<CurrentUser, 'accountType' | 'enterpriseTags'>) {
  if (user.accountType === ACCOUNT_TYPE.operator) {
    return [
      PERMISSION_CODE.operatorDashboardView,
      PERMISSION_CODE.operatorUserView,
      PERMISSION_CODE.operatorUserEdit,
      PERMISSION_CODE.operatorEnterpriseAuditView,
      PERMISSION_CODE.operatorEnterpriseAuditApprove,
      PERMISSION_CODE.operatorDemandView,
      PERMISSION_CODE.operatorDemandAssign,
      PERMISSION_CODE.operatorConsultView,
      PERMISSION_CODE.operatorConsultHandle,
      PERMISSION_CODE.operatorOrderView,
      PERMISSION_CODE.operatorOrderHandle,
      PERMISSION_CODE.operatorReportView,
      PERMISSION_CODE.operatorReportAudit,
      PERMISSION_CODE.operatorCommentView,
      PERMISSION_CODE.operatorCommentHandle,
      PERMISSION_CODE.operatorMessageView,
      PERMISSION_CODE.operatorRoleView,
      PERMISSION_CODE.operatorRoleEdit,
      PERMISSION_CODE.operatorSkinView,
      PERMISSION_CODE.operatorSkinEdit,
      PERMISSION_CODE.contentManageView,
      PERMISSION_CODE.dictionaryManageView,
      PERMISSION_CODE.operationLogView,
    ]
  }

  if (user.accountType === ACCOUNT_TYPE.enterprise) {
    const basePermissions = [
      PERMISSION_CODE.enterpriseDashboardView,
      PERMISSION_CODE.enterpriseProfileView,
      PERMISSION_CODE.enterpriseProfileEdit,
      PERMISSION_CODE.enterpriseDemandView,
      PERMISSION_CODE.enterpriseDemandPublish,
      PERMISSION_CODE.enterpriseDemandEdit,
      PERMISSION_CODE.enterpriseOrderView,
      PERMISSION_CODE.enterpriseReportView,
      PERMISSION_CODE.enterpriseMessageView,
      PERMISSION_CODE.enterpriseAccountSettingsView,
    ]

    if (!user.enterpriseTags.includes(ENTERPRISE_CAPABILITY.serviceProvider)) {
      return basePermissions
    }

    return [
      ...basePermissions,
      PERMISSION_CODE.enterpriseDemandHandle,
      PERMISSION_CODE.enterpriseOrderReceive,
      PERMISSION_CODE.enterpriseOrderHandle,
      PERMISSION_CODE.enterpriseReportHandle,
      PERMISSION_CODE.enterpriseServiceCapabilityView,
      PERMISSION_CODE.enterpriseServiceCapabilityEdit,
      PERMISSION_CODE.enterpriseServiceProjectView,
      PERMISSION_CODE.enterpriseServiceProjectManage,
      PERMISSION_CODE.enterpriseQualificationView,
      PERMISSION_CODE.enterpriseQualificationSubmit,
      PERMISSION_CODE.enterpriseProviderQualificationSubmit,
      PERMISSION_CODE.enterpriseServiceShelf,
    ]
  }

  return [
    PERMISSION_CODE.personalDashboardView,
    PERMISSION_CODE.personalDemandView,
    PERMISSION_CODE.personalDemandPublish,
    PERMISSION_CODE.personalDemandEdit,
    PERMISSION_CODE.personalOrderView,
    PERMISSION_CODE.personalMessageView,
    PERMISSION_CODE.personalProfileView,
    PERMISSION_CODE.personalProfileEdit,
    PERMISSION_CODE.personalEnterpriseUpgradeView,
    PERMISSION_CODE.personalEnterpriseUpgradeSubmit,
  ]
}

function normalizeUserInfo(user: CurrentUser) {
  const accountType = normalizeAccountType(user.accountType)
  const enterpriseTags = normalizeEnterpriseTags(
    user.enterpriseTags?.length ? user.enterpriseTags : user.enterpriseCapabilities,
  )
  const permissionCodes = Array.from(
    new Set(
      [
        ...getDefaultPermissionCodes({ accountType, enterpriseTags }),
        ...(user.permissionCodes || []),
      ],
    ),
  )
  const menuCodes = Array.from(
    new Set([
      ...getDefaultMenuCodes({ accountType, enterpriseTags }),
      ...(user.menuCodes || []),
    ]),
  )
  const homeRoute = getDefaultLandingPath({ ...user, accountType, enterpriseTags } as CurrentUser)

  return {
    ...user,
    accountType,
    currentIdentity: normalizeCurrentIdentity(user.currentIdentity, accountType),
    availableIdentities: user.availableIdentities?.map((item) =>
      normalizeCurrentIdentity(item, accountType),
    ),
    enterpriseTags,
    enterpriseCapabilities: enterpriseTags,
    permissionCodes,
    menuCodes,
    homeRoute,
  } satisfies CurrentUser
}

export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref(getAccessToken())
    const userInfo = ref<CurrentUser | null>(null)
    const userLoaded = ref(false)
    const needResetPassword = ref(false)

    const isPlatformUser = computed(() => isOperatorAccountType(userInfo.value?.accountType))
    const isEnterpriseUser = computed(() => userInfo.value?.accountType === ACCOUNT_TYPE.enterprise)

    function hasEnterpriseCapability(capability: EnterpriseCapability | EnterpriseCapability[]) {
      const capabilities = userInfo.value?.enterpriseTags || []
      const capabilityList = Array.isArray(capability) ? capability : [capability]
      const normalizedTargets = normalizeEnterpriseTags(capabilityList)
      return normalizedTargets.some((item) => capabilities.includes(item))
    }

    function applyLoginResult(response: AuthLoginResponse | LoginResponse) {
      token.value = response.accessToken
      userInfo.value = normalizeUserInfo(response.profile)
      needResetPassword.value = !!response.needResetPassword
      userLoaded.value = true
      setAccessToken(response.accessToken)
      return userInfo.value
    }

    async function loginWithPassword(payload: LoginPasswordCommand) {
      const res = await loginByPassword(payload)
      applyLoginResult(res)
      return res
    }

    async function loginWithMobile(payload: LoginMobileCommand) {
      const res = await loginByMobile(payload)
      applyLoginResult(res)
      return res
    }

    async function loginWithCreditCode(payload: LoginCreditCodeCommand) {
      const res = await loginByCreditCode(payload)
      applyLoginResult(res)
      return res
    }

    async function loginWithEmail(payload: LoginEmailCommand) {
      const res = await loginByEmail(payload)
      applyLoginResult(res)
      return res
    }

    async function fetchCurrentUser(force = false) {
      if (!token.value) return null
      if (userInfo.value && !force) {
        userInfo.value = normalizeUserInfo(userInfo.value)
        userLoaded.value = true
        return userInfo.value
      }

      const res = await getCurrentUser(token.value)
      userInfo.value = normalizeUserInfo(res)
      userLoaded.value = true
      return userInfo.value
    }

    function resetUser() {
      token.value = ''
      userInfo.value = null
      needResetPassword.value = false
      userLoaded.value = false
      removeAccessToken()
    }

    function logout() {
      resetUser()
    }

    function patchUserInfo(payload: Partial<CurrentUser>) {
      if (!userInfo.value) return
      userInfo.value = normalizeUserInfo({
        ...userInfo.value,
        ...payload,
      })
    }

    function hasPermissions(permission: string | string[]) {
      const permissions = userInfo.value?.permissionCodes || []
      const permissionList = Array.isArray(permission) ? permission : [permission]
      return permissionList.some(
        (item) => permissions.includes(item) || permissions.includes('*:*:*'),
      )
    }

    function completeFirstLoginReset() {
      needResetPassword.value = false
    }

    return {
      token,
      userInfo,
      userLoaded,
      needResetPassword,
      isPlatformUser,
      isEnterpriseUser,
      landingPath: computed(() => getDefaultLandingPath(userInfo.value)),
      enterpriseCapabilityTags: computed(() => userInfo.value?.enterpriseTags || []),
      isEnterpriseDemander: computed(() => hasEnterpriseCapability(ENTERPRISE_CAPABILITY.demander)),
      isEnterpriseServiceProvider: computed(() =>
        hasEnterpriseCapability(ENTERPRISE_CAPABILITY.serviceProvider),
      ),
      applyLoginResult,
      loginWithPassword,
      loginWithMobile,
      loginWithCreditCode,
      loginWithEmail,
      fetchCurrentUser,
      hasPermissions,
      hasEnterpriseCapability,
      completeFirstLoginReset,
      patchUserInfo,
      logout,
      resetUser,
    }
  },
  {
    persist: {
      pick: ['token', 'userInfo', 'needResetPassword'],
    },
  },
)
