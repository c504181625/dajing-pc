import { resolveEmptyPageResult } from '@/api/helper'
import type { PageResult } from '@/types/api'
import type {
  WorkflowNodeItem,
  WorkflowQuery,
  WorkflowRecordItem,
  WorkflowTemplateItem,
} from '@/types/business'

export function getWorkflowTemplates(
  params?: WorkflowQuery,
): Promise<PageResult<WorkflowTemplateItem>> {
  return resolveEmptyPageResult<WorkflowTemplateItem>(params)
}

export function getWorkflowNodes(params?: WorkflowQuery): Promise<PageResult<WorkflowNodeItem>> {
  return resolveEmptyPageResult<WorkflowNodeItem>(params)
}

export function getWorkflowRecords(
  params?: WorkflowQuery,
): Promise<PageResult<WorkflowRecordItem>> {
  return resolveEmptyPageResult<WorkflowRecordItem>(params)
}
