import 'vue-router'

import type { RoleCode } from './auth'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    icon?: string
    hidden?: boolean
    alwaysShow?: boolean
    roles?: RoleCode[]
    permissions?: string[]
    activeMenu?: string
  }
}
