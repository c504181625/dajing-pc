import type { PageResult } from '@/types/api'
import type { MessageItem, MessageQuery, MessageStats } from '@/types/business'
import { http } from '@/utils/request'
import { isUseMock } from '../helper'
import {
  mockDeleteMessage,
  mockGetMessageDetail,
  mockGetMessageList,
  mockGetMessageStats,
  mockReadAllMessages,
  mockReadMessage,
} from '@/mock/modules/message'

export function getMessageList(params?: MessageQuery): Promise<PageResult<MessageItem>> {
  if (isUseMock()) return mockGetMessageList(params)
  return http<PageResult<MessageItem>>({ url: '/message/page', method: 'get', params })
}

export function getMessageStats(): Promise<MessageStats> {
  if (isUseMock()) return mockGetMessageStats()
  return http<MessageStats>({ url: '/message/stats', method: 'get' })
}

export function getMessageDetail(id: string): Promise<MessageItem> {
  if (isUseMock()) return mockGetMessageDetail(id)
  return http<MessageItem>({ url: `/message/${id}`, method: 'get' })
}

export function readMessage(id: string): Promise<boolean> {
  if (isUseMock()) return mockReadMessage(id)
  return http<boolean>({ url: `/message/${id}/read`, method: 'post' })
}

export const markMessageRead = readMessage

export function readAllMessages(): Promise<boolean> {
  if (isUseMock()) return mockReadAllMessages()
  return http<boolean>({ url: '/message/read-all', method: 'post' })
}

export function deleteMessage(id: string): Promise<boolean> {
  if (isUseMock()) return mockDeleteMessage(id)
  return http<boolean>({ url: `/message/${id}`, method: 'delete' })
}
