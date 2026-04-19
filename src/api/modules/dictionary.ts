import { resolveEmptyList, toRecord } from '@/api/helper'
import type { OptionItem } from '@/types/api'
import { http } from '@/utils/request'

const adminApiPrefix = '/api/admin'

function normalizeOptionItem(raw: unknown): OptionItem {
  const source = toRecord(raw)
  return {
    label: String(source.label || source.dictLabel || source.name || ''),
    value: (source.value ?? source.dictValue ?? source.code ?? '') as OptionItem['value'],
    disabled: !!source.disabled,
  }
}

export function getDictionaryTypes(): Promise<string[]> {
  return http<unknown>({
    url: `${adminApiPrefix}/dict/types`,
    method: 'get',
  }).then((res) => (Array.isArray(res) ? res.map((item) => String(item)) : []))
}

export function getDictionaryOptions(code: string): Promise<OptionItem[]> {
  if (!code) return resolveEmptyList<OptionItem>()

  return http<unknown>({
    url: `${adminApiPrefix}/dict/list/${code}`,
    method: 'get',
  }).then((res) => {
    const payload = Array.isArray(res)
      ? res
      : Array.isArray((res as Record<string, unknown>)?.list)
        ? ((res as Record<string, unknown>).list as unknown[])
        : []

    return payload.map((item) => normalizeOptionItem(item))
  })
}
