import 'vue-router'

import type { AccountType, EnterpriseCapability, PlatformRole } from './auth'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    icon?: string
    hidden?: boolean
    alwaysShow?: boolean
    accountTypes?: AccountType[]
    platformRoles?: PlatformRole[]
    enterpriseCapabilities?: EnterpriseCapability[]
    permissions?: string[]
    activeMenu?: string
  }
}
