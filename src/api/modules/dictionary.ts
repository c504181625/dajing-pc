import type { OptionItem } from '@/types/api'
import { http } from '@/utils/request'
import { mockGetDictionary } from '@/mock/modules/dictionary'
import { isUseMock } from '../helper'

export function getDictByCode(code: string) {
  if (isUseMock()) return mockGetDictionary(code)
  return http<OptionItem[]>({ url: `/system/dictionary/${code}`, method: 'get' })
}
