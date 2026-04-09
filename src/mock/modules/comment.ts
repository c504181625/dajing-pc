import { ENTERPRISE_CAPABILITY } from '@/enum/role'
import { CommentStatus } from '@/enum/status'
import type { CommentItem, CommentQuery } from '@/types/business'
import {
  getCurrentEnterpriseId,
  hasAnyEnterpriseCapability,
  isPlatformMockUser,
} from '../context'
import { createPageResult, mockPromise } from '../helper'

type CommentRecord = CommentItem & {
  authorEnterpriseId: string
  targetEnterpriseId: string
}

const commentRecords: CommentRecord[] = [
  {
    id: 'comment-001',
    orderNo: 'QI202604080001',
    enterpriseName: '苏州启航电子股份有限公司',
    projectName: '电子元器件可靠性检测',
    score: 5,
    content: '服务响应及时，检测进度透明。',
    status: CommentStatus.Normal,
    createdAt: '2026-04-16 11:00:00',
    authorEnterpriseId: 'ent-100',
    targetEnterpriseId: 'ent-001',
  },
  {
    id: 'comment-002',
    orderNo: 'QI202604070014',
    enterpriseName: '无锡锐科装备有限公司',
    projectName: '计量校准服务',
    score: 4,
    content: '收样沟通顺畅，报告交付较快。',
    status: CommentStatus.Normal,
    createdAt: '2026-04-12 10:00:00',
    authorEnterpriseId: 'ent-300',
    targetEnterpriseId: 'ent-001',
  },
  {
    id: 'comment-003',
    orderNo: 'BASE20260406003',
    enterpriseName: '苏州启航电子股份有限公司',
    projectName: 'ISO9001 质量诊断辅导',
    score: 5,
    content: '诊断建议很有针对性，服务老师沟通顺畅。',
    status: CommentStatus.Normal,
    createdAt: '2026-04-11 09:20:00',
    authorEnterpriseId: 'ent-100',
    targetEnterpriseId: 'ent-200',
  },
]

function filterCommentRecords(list: CommentRecord[]) {
  if (isPlatformMockUser()) return list

  const enterpriseId = getCurrentEnterpriseId()
  const visible = new Set<CommentRecord>()

  if (hasAnyEnterpriseCapability([ENTERPRISE_CAPABILITY.demander])) {
    list.filter((item) => item.authorEnterpriseId === enterpriseId).forEach((item) => visible.add(item))
  }

  if (hasAnyEnterpriseCapability([ENTERPRISE_CAPABILITY.serviceProvider, ENTERPRISE_CAPABILITY.labProvider])) {
    list.filter((item) => item.targetEnterpriseId === enterpriseId).forEach((item) => visible.add(item))
  }

  return [...visible]
}

export function mockGetCommentList(params?: CommentQuery) {
  let list = filterCommentRecords([...commentRecords])
  const keyword = String(params?.keyword || '').trim()
  const score = String(params?.score || '')

  if (keyword) {
    list = list.filter((item) => [item.orderNo, item.enterpriseName, item.projectName, item.content].some((field) => field.includes(keyword)))
  }
  if (score) list = list.filter((item) => String(item.score) === score)

  return mockPromise(createPageResult(list))
}

export function mockDeleteComment(id: string): Promise<boolean> {
  const row = commentRecords.find((item) => item.id === id)
  if (row) row.status = CommentStatus.Deleted
  return mockPromise(true)
}
