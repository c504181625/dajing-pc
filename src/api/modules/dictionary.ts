import { mockPromise } from '../mock'

import { SERVICE_TYPE_OPTIONS } from '@/constants/dicts'

export function getDictByCode(code: string) {
  if (code === 'service_type') {
    return mockPromise(SERVICE_TYPE_OPTIONS)
  }

  return mockPromise([])
}
