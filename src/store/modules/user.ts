import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { getCurrentUser, loginByEmail, loginByMobile, loginByPassword } from '@/api/modules/auth'
import { ACCOUNT_TYPE, ENTERPRISE_CAPABILITY } from '@/enum/role'
import type {
  AuthLoginResponse,
  CurrentUser,
  EnterpriseCapability,
  LoginEmailCommand,
  LoginMobileCommand,
  LoginPasswordCommand,
  LoginResponse,
} from '@/types/auth'
import { getAccessToken, removeAccessToken, setAccessToken } from '@/utils/auth'

function getDefaultLandingPath(user?: CurrentUser | null) {
  if (!user) return '/login'
  if (user.accountType === ACCOUNT_TYPE.platformAdmin) return '/platform/dashboard'
  if (user.accountType === ACCOUNT_TYPE.personal) return '/personal/dashboard'
  if (user.accountType === ACCOUNT_TYPE.enterprise || user.accountType === ACCOUNT_TYPE.institution) {
    return '/enterprise/dashboard'
  }
  return '/auth-result?status=approved&title=登录成功&description=个人账号已验证，PC 端后台能力当前仅做预留。'
}

export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref(getAccessToken())
    const userInfo = ref<CurrentUser | null>(null)
    const userLoaded = ref(false)
    const needResetPassword = ref(false)

    const isPlatformUser = computed(() => userInfo.value?.accountType === ACCOUNT_TYPE.platformAdmin)
    const isEnterpriseUser = computed(() => {
      const accountType = userInfo.value?.accountType
      return accountType === ACCOUNT_TYPE.enterprise || accountType === ACCOUNT_TYPE.institution
    })

    function hasEnterpriseCapability(capability: EnterpriseCapability | EnterpriseCapability[]) {
      const capabilities = userInfo.value?.enterpriseCapabilities || []
      const capabilityList = Array.isArray(capability) ? capability : [capability]
      return capabilityList.some((item) => capabilities.includes(item))
    }

    function applyLoginResult(response: AuthLoginResponse | LoginResponse) {
      token.value = response.accessToken
      userInfo.value = response.profile
      needResetPassword.value = !!response.needResetPassword
      userLoaded.value = true
      setAccessToken(response.accessToken)
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

    async function loginWithEmail(payload: LoginEmailCommand) {
      const res = await loginByEmail(payload)
      applyLoginResult(res)
      return res
    }

    async function fetchCurrentUser() {
      if (!token.value) return null
      if (userInfo.value) {
        userLoaded.value = true
        return userInfo.value
      }

      const res = await getCurrentUser(token.value)
      userInfo.value = res
      userLoaded.value = true
      return res
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
      userInfo.value = {
        ...userInfo.value,
        ...payload,
      }
    }

    function hasPermissions(permission: string | string[]) {
      const permissions = userInfo.value?.permissionCodes || []
      const permissionList = Array.isArray(permission) ? permission : [permission]
      return permissionList.some((item) => permissions.includes(item) || permissions.includes('*:*:*'))
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
      enterpriseCapabilityTags: computed(() => userInfo.value?.enterpriseCapabilities || []),
      isEnterpriseDemander: computed(() => hasEnterpriseCapability(ENTERPRISE_CAPABILITY.demander)),
      isEnterpriseServiceProvider: computed(() => hasEnterpriseCapability(ENTERPRISE_CAPABILITY.serviceProvider)),
      isEnterpriseLabProvider: computed(() => hasEnterpriseCapability(ENTERPRISE_CAPABILITY.labProvider)),
      applyLoginResult,
      loginWithPassword,
      loginWithMobile,
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
