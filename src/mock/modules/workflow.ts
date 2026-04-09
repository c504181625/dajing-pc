import { WorkflowNodeType, WorkflowTemplateStatus } from '@/enum/status'
import type { WorkflowNodeItem, WorkflowQuery, WorkflowRecordItem, WorkflowTemplateItem } from '@/types/business'
import { createPageResult, mockPromise } from '../helper'

const templateList: WorkflowTemplateItem[] = [
  { id: 'wf-tpl-001', templateCode: 'ORDER_INSPECT', templateName: '检验检测订单标准流程', businessType: 'inspection_order', version: 'v1.0', status: WorkflowTemplateStatus.Enabled, updatedAt: '2026-04-08 09:00:00' },
  { id: 'wf-tpl-002', templateCode: 'REPORT_REVIEW', templateName: '报告审核流程', businessType: 'report_review', version: 'v1.0', status: WorkflowTemplateStatus.Disabled, updatedAt: '2026-04-07 15:00:00' },
]

const nodeList: WorkflowNodeItem[] = [
  { id: 'wf-node-001', templateCode: 'ORDER_INSPECT', nodeCode: 'SUBMIT', nodeName: '提交委托', nodeType: WorkflowNodeType.Submit, approverType: '申请人', sort: 1 },
  { id: 'wf-node-002', templateCode: 'ORDER_INSPECT', nodeCode: 'REVIEW', nodeName: '机构审核', nodeType: WorkflowNodeType.Review, approverType: '机构业务员', sort: 2 },
  { id: 'wf-node-003', templateCode: 'ORDER_INSPECT', nodeCode: 'ARCHIVE', nodeName: '结果归档', nodeType: WorkflowNodeType.Archive, approverType: '系统', sort: 3 },
]

const recordList: WorkflowRecordItem[] = [
  { id: 'wf-record-001', businessNo: 'QI202604080001', templateName: '检验检测订单标准流程', currentNodeName: '机构审核', result: 'processing', operator: '苏州智造检测有限公司', operatedAt: '2026-04-08 10:50:00' },
  { id: 'wf-record-002', businessNo: 'BG20260408018', templateName: '报告审核流程', currentNodeName: '报告复核', result: 'completed', operator: '平台审核员', operatedAt: '2026-04-08 09:30:00' },
]

export function mockGetWorkflowTemplates(params?: WorkflowQuery) {
  let list = [...templateList]
  const keyword = String(params?.keyword || '').trim()
  if (keyword) list = list.filter((item) => [item.templateCode, item.templateName, item.businessType].some((field) => field.includes(keyword)))
  return mockPromise(createPageResult(list))
}

export function mockGetWorkflowNodes(params?: WorkflowQuery) {
  let list = [...nodeList]
  const keyword = String(params?.keyword || '').trim()
  if (keyword) list = list.filter((item) => [item.templateCode, item.nodeCode, item.nodeName].some((field) => field.includes(keyword)))
  return mockPromise(createPageResult(list))
}

export function mockGetWorkflowRecords(params?: WorkflowQuery) {
  let list = [...recordList]
  const keyword = String(params?.keyword || '').trim()
  if (keyword) list = list.filter((item) => [item.businessNo, item.templateName, item.currentNodeName].some((field) => field.includes(keyword)))
  return mockPromise(createPageResult(list))
}
