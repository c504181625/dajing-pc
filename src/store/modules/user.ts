import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { getCurrentUser, loginByEmail, loginByMobile, loginByPassword } from '@/api/modules/auth'
import type {
  CurrentUser,
  LoginEmailCommand,
  LoginMobileCommand,
  LoginPasswordCommand,
} from '@/types/auth'
import { getAccessToken, removeAccessToken, setAccessToken } from '@/utils/auth'

function getDefaultLandingPath(user?: CurrentUser | null) {
  if (!user) return '/login'

  const enterpriseRoles = ['ENTERPRISE_DEMAND', 'ENTERPRISE_SERVICE', 'ENTERPRISE_LAB', 'ENTERPRISE_STAFF']
  return user.roles.some((role) => enterpriseRoles.includes(role)) ? '/enterprise/dashboard' : '/platform/dashboard'
}

export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref(getAccessToken())
    const userInfo = ref<CurrentUser | null>(null)
    const userLoaded = ref(false)

    const isPlatformUser = computed(() => {
      return userInfo.value?.roles.some((role) => ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'AUDITOR'].includes(role)) || false
    })

    async function loginWithPassword(payload: LoginPasswordCommand) {
      const res = await loginByPassword(payload)
      applyLoginResponse(res.accessToken, res.user)
      return res
    }

    async function loginWithMobile(payload: LoginMobileCommand) {
      const res = await loginByMobile(payload)
      applyLoginResponse(res.accessToken, res.user)
      return res
    }

    async function loginWithEmail(payload: LoginEmailCommand) {
      const res = await loginByEmail(payload)
      applyLoginResponse(res.accessToken, res.user)
      return res
    }

    function applyLoginResponse(accessToken: string, user: CurrentUser) {
      token.value = accessToken
      userInfo.value = user
      userLoaded.value = true
      setAccessToken(accessToken)
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
      userLoaded.value = false
      removeAccessToken()
    }

    function logout() {
      resetUser()
    }

    function hasPermissions(permission: string | string[]) {
      const permissions = userInfo.value?.permissions || []
      const permissionList = Array.isArray(permission) ? permission : [permission]
      return permissionList.some((item) => permissions.includes(item) || permissions.includes('*:*:*'))
    }

    return {
      token,
      userInfo,
      userLoaded,
      isPlatformUser,
      landingPath: computed(() => getDefaultLandingPath(userInfo.value)),
      loginWithPassword,
      loginWithMobile,
      loginWithEmail,
      fetchCurrentUser,
      hasPermissions,
      logout,
      resetUser,
    }
  },
  {
    persist: {
      pick: ['token', 'userInfo'],
    },
  },
)
