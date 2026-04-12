import { MessageReadStatus, MessageType } from '@/enum/status'
import { PLATFORM_ROLE } from '@/enum/role'
import type { MessageItem, MessageQuery, MessageStats } from '@/types/business'
import type { PlatformRole } from '@/types/auth'

import { getCurrentEnterpriseId, getMockCurrentUser, isPlatformMockUser } from '../context'
import { createPageResult, mockPromise } from '../helper'

type MessageRecord = MessageItem & {
  receiverEnterpriseId?: string
  receiverPlatformRoles?: PlatformRole[]
}

let messageRecords: MessageRecord[] = [
  {
    id: 'message-001',
    title: '系统升级维护通知',
    type: MessageType.System,
    category: 'other',
    priority: 'medium',
    readStatus: MessageReadStatus.Unread,
    content: '平台将于 2026-04-10 23:00 至 24:00 进行例行维护，请提前保存正在处理的审核与订单信息。',
    createdAt: '2026-04-08 09:00:00',
    receiverPlatformRoles: [PLATFORM_ROLE.superAdmin, PLATFORM_ROLE.platformAdmin, PLATFORM_ROLE.auditor],
  },
  {
    id: 'message-002',
    title: '新增机构待审核',
    type: MessageType.System,
    category: 'audit',
    priority: 'high',
    readStatus: MessageReadStatus.Unread,
    content: '当前有 3 家新机构提交入驻申请，请尽快完成资料审核与资质核验。',
    createdAt: '2026-04-08 09:18:00',
    receiverPlatformRoles: [PLATFORM_ROLE.superAdmin, PLATFORM_ROLE.platformAdmin, PLATFORM_ROLE.auditor],
  },
  {
    id: 'message-003',
    title: '订单状态已更新',
    type: MessageType.Order,
    category: 'order',
    priority: 'medium',
    readStatus: MessageReadStatus.Read,
    content: '订单 QI202604080001 已进入检测阶段，可查看样品收样与检测进度。',
    createdAt: '2026-04-08 11:10:00',
    receiverEnterpriseId: 'ent-100',
  },
  {
    id: 'message-004',
    title: '咨询待回复提醒',
    type: MessageType.Consult,
    category: 'other',
    priority: 'medium',
    readStatus: MessageReadStatus.Unread,
    content: '当前有 2 条企业咨询待处理，请及时联系客户并补充回复内容。',
    createdAt: '2026-04-08 10:30:00',
    receiverEnterpriseId: 'ent-200',
  },
  {
    id: 'message-005',
    title: '报告抽查告警',
    type: MessageType.System,
    category: 'alert',
    priority: 'high',
    readStatus: MessageReadStatus.Unread,
    content: '发现 1 条报告签章异常，请在今日内完成复核处理。',
    createdAt: '2026-04-08 13:15:00',
    receiverPlatformRoles: [PLATFORM_ROLE.superAdmin, PLATFORM_ROLE.platformAdmin, PLATFORM_ROLE.auditor],
  },
  {
    id: 'message-006',
    title: '订单待付款提醒',
    type: MessageType.Order,
    category: 'order',
    priority: 'low',
    readStatus: MessageReadStatus.Read,
    content: '订单 QI202604070014 仍待付款，请关注客户支付进展。',
    createdAt: '2026-04-08 14:00:00',
    receiverPlatformRoles: [PLATFORM_ROLE.superAdmin, PLATFORM_ROLE.platformAdmin],
  },
]

function getScopedMessageRecords() {
  if (isPlatformMockUser()) {
    const role = getMockCurrentUser().platformRole
    return messageRecords.filter(
      (item) =>
        !item.receiverEnterpriseId &&
        (!item.receiverPlatformRoles || (role ? item.receiverPlatformRoles.includes(role) : true)),
    )
  }

  const enterpriseId = getCurrentEnterpriseId()
  return messageRecords.filter((item) => item.receiverEnterpriseId === enterpriseId)
}

function buildStats(list: MessageRecord[]): MessageStats {
  return {
    total: list.length,
    unread: list.filter((item) => item.readStatus === MessageReadStatus.Unread).length,
    system: list.filter((item) => item.type === MessageType.System).length,
    demand: list.filter((item) => item.type === MessageType.Demand).length,
    consult: list.filter((item) => item.type === MessageType.Consult).length,
    order: list.filter((item) => item.type === MessageType.Order).length,
    audit: list.filter((item) => item.category === 'audit').length,
    orderNotice: list.filter((item) => item.category === 'order').length,
    alert: list.filter((item) => item.category === 'alert').length,
  }
}

export function mockGetMessageList(params?: MessageQuery) {
  let list = [...getScopedMessageRecords()]
  const keyword = String(params?.keyword || '').trim()
  const type = String(params?.type || '')
  const readStatus = String(params?.readStatus || '')
  const priority = String(params?.priority || '')
  const pageNum = Number(params?.pageNum || 1)
  const pageSize = Number(params?.pageSize || 10)

  if (keyword) {
    list = list.filter((item) =>
      [item.title, item.content].some((field) => field.includes(keyword)),
    )
  }
  if (type) list = list.filter((item) => item.type === type)
  if (readStatus) list = list.filter((item) => item.readStatus === readStatus)
  if (priority) list = list.filter((item) => item.priority === priority)

  return mockPromise(createPageResult(list, pageNum, pageSize))
}

export function mockGetMessageStats(): Promise<MessageStats> {
  return mockPromise(buildStats(getScopedMessageRecords()))
}

export function mockGetMessageDetail(id: string): Promise<MessageItem> {
  const scopedRecords = getScopedMessageRecords()
  const row = scopedRecords.find((item) => item.id === id) ?? scopedRecords[0] ?? messageRecords[0]!
  return mockPromise(row)
}

export function mockReadMessage(id: string): Promise<boolean> {
  const row = messageRecords.find((item) => item.id === id)
  if (row) row.readStatus = MessageReadStatus.Read
  return mockPromise(true)
}

export function mockReadAllMessages(): Promise<boolean> {
  const scopedIds = new Set(getScopedMessageRecords().map((item) => item.id))
  messageRecords = messageRecords.map((item) =>
    scopedIds.has(item.id)
      ? {
          ...item,
          readStatus: MessageReadStatus.Read,
        }
      : item,
  )
  return mockPromise(true)
}

export function mockDeleteMessage(id: string): Promise<boolean> {
  messageRecords = messageRecords.filter((item) => item.id !== id)
  return mockPromise(true)
}
