import type { PageResult } from '@/types/api'
import type { CommunityArticleItem, CommunityQuery, CommunityQuestionItem, ExpertItem } from '@/types/business'
import { http } from '@/utils/request'
import { isUseMock } from '../helper'
import {
  mockDeleteArticle,
  mockDeleteExpert,
  mockDeleteQuestion,
  mockGetArticleList,
  mockGetExpertList,
  mockGetQuestionList,
} from '@/mock/modules/content'

export function getArticleList(params?: CommunityQuery): Promise<PageResult<CommunityArticleItem>> {
  if (isUseMock()) return mockGetArticleList(params)
  return http<PageResult<CommunityArticleItem>>({ url: '/community/article/page', method: 'get', params })
}

export function getQuestionList(params?: CommunityQuery): Promise<PageResult<CommunityQuestionItem>> {
  if (isUseMock()) return mockGetQuestionList(params)
  return http<PageResult<CommunityQuestionItem>>({ url: '/community/question/page', method: 'get', params })
}

export function getExpertList(params?: CommunityQuery): Promise<PageResult<ExpertItem>> {
  if (isUseMock()) return mockGetExpertList(params)
  return http<PageResult<ExpertItem>>({ url: '/community/expert/page', method: 'get', params })
}

export function deleteArticle(id: string): Promise<boolean> {
  if (isUseMock()) return mockDeleteArticle(id)
  return http<boolean>({ url: `/community/article/${id}`, method: 'delete' })
}

export function deleteQuestion(id: string): Promise<boolean> {
  if (isUseMock()) return mockDeleteQuestion(id)
  return http<boolean>({ url: `/community/question/${id}`, method: 'delete' })
}

export function deleteExpert(id: string): Promise<boolean> {
  if (isUseMock()) return mockDeleteExpert(id)
  return http<boolean>({ url: `/community/expert/${id}`, method: 'delete' })
}
