import 'vue-router'

import type { AccountType, EnterpriseCapability, EnterpriseTag, PlatformRole } from './auth'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    icon?: string
    hidden?: boolean
    alwaysShow?: boolean
    accountTypes?: AccountType[]
    platformRoles?: PlatformRole[]
    enterpriseCapabilities?: EnterpriseCapability[]
    enterpriseTags?: EnterpriseTag[]
    permissions?: string[]
    menuCode?: string
    activeMenu?: string
    pageMode?: string
    pageTitle?: string
    pageSubtitle?: string
  }
}
