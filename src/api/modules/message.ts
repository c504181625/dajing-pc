import type { PageResult } from '@/types/api'
import type { MessageItem, MessageQuery, MessageStats } from '@/types/business'
import { createEmptyPageResult, resolveEmptyValue } from '@/api/helper'
import { MessageReadStatus, MessageType } from '@/enum/status'

export function getMessageList(params?: MessageQuery): Promise<PageResult<MessageItem>> {
  return Promise.resolve(createEmptyPageResult<MessageItem>(params))
}

export function getMessageStats(): Promise<MessageStats> {
  return resolveEmptyValue<MessageStats>({
    total: 0,
    unread: 0,
    system: 0,
    demand: 0,
    consult: 0,
    order: 0,
    audit: 0,
    orderNotice: 0,
    alert: 0,
  })
}

export function getMessageDetail(id: string): Promise<MessageItem> {
  return resolveEmptyValue<MessageItem>({
    id,
    title: '',
    type: MessageType.System,
    readStatus: MessageReadStatus.Unread,
    content: '',
    createdAt: '',
  })
}

export function readMessage(id: string): Promise<boolean> {
  return resolveEmptyValue(true)
}

export const markMessageRead = readMessage

export function readAllMessages(): Promise<boolean> {
  return resolveEmptyValue(true)
}

export function deleteMessage(id: string): Promise<boolean> {
  return resolveEmptyValue(true)
}
