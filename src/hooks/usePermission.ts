import { computed } from 'vue'

import { useUserStore } from '@/store/modules/user'

export function usePermission() {
  const userStore = useUserStore()

  function hasPermission(permission: string | string[]) {
    return userStore.hasPermissions(permission)
  }

  return {
    permissions: computed(() => userStore.userInfo?.permissionCodes || []),
    hasPermission,
  }
}
