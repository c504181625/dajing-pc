import type { App, Directive } from 'vue'

import { useUserStore } from '@/store/modules/user'

const permissionDirective: Directive<HTMLElement, string | string[]> = {
  mounted(el, binding) {
    const store = useUserStore()
    if (!store.hasPermissions(binding.value)) {
      el.parentNode?.removeChild(el)
    }
  },
}

export function setupPermissionDirective(app: App) {
  app.directive('permission', permissionDirective)
}
