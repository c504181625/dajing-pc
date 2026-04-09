import {
  GOODS_STATUS_MAP,
  MESSAGE_TYPE_OPTIONS,
  SAMPLE_DELIVERY_MODE_OPTIONS,
  SERVICE_TYPE_OPTIONS,
  USER_TYPE_OPTIONS,
  WORKFLOW_NODE_TYPE_OPTIONS,
} from '@/constants/dicts'
import type { OptionItem } from '@/types/api'
import { mockPromise } from '../helper'

const mockDictionaryMap: Record<string, OptionItem[]> = {
  serviceType: SERVICE_TYPE_OPTIONS,
  userType: USER_TYPE_OPTIONS,
  messageType: MESSAGE_TYPE_OPTIONS,
  sampleMode: SAMPLE_DELIVERY_MODE_OPTIONS,
  goodsStatus: Object.values(GOODS_STATUS_MAP),
  workflowNodeType: WORKFLOW_NODE_TYPE_OPTIONS,
}

export function mockGetDictionary(code: string) {
  return mockPromise(mockDictionaryMap[code] ?? [])
}
