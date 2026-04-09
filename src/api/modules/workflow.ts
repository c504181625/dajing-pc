import type { PageResult } from '@/types/api'
import type { WorkflowNodeItem, WorkflowQuery, WorkflowRecordItem, WorkflowTemplateItem } from '@/types/business'
import { http } from '@/utils/request'
import { isUseMock } from '../helper'
import { mockGetWorkflowNodes, mockGetWorkflowRecords, mockGetWorkflowTemplates } from '@/mock/modules/workflow'

export function getWorkflowTemplates(params?: WorkflowQuery): Promise<PageResult<WorkflowTemplateItem>> {
  if (isUseMock()) return mockGetWorkflowTemplates(params)
  return http<PageResult<WorkflowTemplateItem>>({ url: '/workflow/template/page', method: 'get', params })
}

export function getWorkflowNodes(params?: WorkflowQuery): Promise<PageResult<WorkflowNodeItem>> {
  if (isUseMock()) return mockGetWorkflowNodes(params)
  return http<PageResult<WorkflowNodeItem>>({ url: '/workflow/node/page', method: 'get', params })
}

export function getWorkflowRecords(params?: WorkflowQuery): Promise<PageResult<WorkflowRecordItem>> {
  if (isUseMock()) return mockGetWorkflowRecords(params)
  return http<PageResult<WorkflowRecordItem>>({ url: '/workflow/record/page', method: 'get', params })
}
