import type { PageResult } from '@/types/api'
import type {
  CommunityArticleItem,
  CommunityQuery,
  CommunityQuestionItem,
  ExpertItem,
} from '@/types/business'
import type {
  CommunityArticleItem as CommunityArticleCard,
  ContentArticleForm,
  CommunityOverviewData,
  CommunityQuestionItem as CommunityQuestionCard,
  ContentExpertForm,
  ContentCategoryItem,
  ContentQuestionForm,
  ContentQuery,
  ExpertOnlineItem,
  ExpertQuery,
  QuestionQuery,
} from '@/types/content'
import { http } from '@/utils/request'
import { isUseMock } from '../helper'
import {
  mockGetCommunityArticleDetail,
  mockDeleteArticle,
  mockDeleteExpert,
  mockDeleteQuestion,
  mockGetArticleList,
  mockGetCommunityArticleList,
  mockGetCommunityExpertDetail,
  mockGetCommunityExpertList,
  mockGetCommunityOverview,
  mockGetCommunityQuestionDetail,
  mockGetCommunityQuestionList,
  mockGetContentCategories,
  mockGetExpertList,
  mockGetQuestionList,
  mockSaveCommunityArticle,
  mockSaveCommunityExpert,
  mockSaveCommunityQuestion,
} from '@/mock/modules/content'

export function getContentCategories(): Promise<ContentCategoryItem[]> {
  if (isUseMock()) return mockGetContentCategories()
  return http<ContentCategoryItem[]>({ url: '/community/category/list', method: 'get' })
}

export function getCommunityOverview(): Promise<CommunityOverviewData> {
  if (isUseMock()) return mockGetCommunityOverview()
  return http<CommunityOverviewData>({ url: '/community/overview', method: 'get' })
}

export function getCommunityArticleList(
  params?: ContentQuery,
): Promise<PageResult<CommunityArticleCard>> {
  if (isUseMock()) return mockGetCommunityArticleList(params)
  return http<PageResult<CommunityArticleCard>>({
    url: '/community/content/page',
    method: 'get',
    params,
  })
}

export function getCommunityArticleDetail(id: string): Promise<CommunityArticleCard> {
  if (isUseMock()) return mockGetCommunityArticleDetail(id)
  return http<CommunityArticleCard>({
    url: `/community/content/${id}`,
    method: 'get',
  })
}

export function getCommunityQuestionList(
  params?: QuestionQuery,
): Promise<PageResult<CommunityQuestionCard>> {
  if (isUseMock()) return mockGetCommunityQuestionList(params)
  return http<PageResult<CommunityQuestionCard>>({
    url: '/community/question/page',
    method: 'get',
    params,
  })
}

export function getCommunityQuestionDetail(id: string): Promise<CommunityQuestionCard> {
  if (isUseMock()) return mockGetCommunityQuestionDetail(id)
  return http<CommunityQuestionCard>({
    url: `/community/question/${id}`,
    method: 'get',
  })
}

export function getCommunityExpertList(
  params?: ExpertQuery,
): Promise<PageResult<ExpertOnlineItem>> {
  if (isUseMock()) return mockGetCommunityExpertList(params)
  return http<PageResult<ExpertOnlineItem>>({
    url: '/community/expert/page',
    method: 'get',
    params,
  })
}

export function getCommunityExpertDetail(id: string): Promise<ExpertOnlineItem> {
  if (isUseMock()) return mockGetCommunityExpertDetail(id)
  return http<ExpertOnlineItem>({
    url: `/community/expert/${id}`,
    method: 'get',
  })
}

export function getArticleList(params?: CommunityQuery): Promise<PageResult<CommunityArticleItem>> {
  if (isUseMock()) return mockGetArticleList(params)
  return http<PageResult<CommunityArticleItem>>({
    url: '/community/article/page',
    method: 'get',
    params,
  })
}

export function getQuestionList(
  params?: CommunityQuery,
): Promise<PageResult<CommunityQuestionItem>> {
  if (isUseMock()) return mockGetQuestionList(params)
  return http<PageResult<CommunityQuestionItem>>({
    url: '/community/question/page',
    method: 'get',
    params,
  })
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

export function saveCommunityArticle(
  data: ContentArticleForm & { id?: string },
): Promise<boolean> {
  if (isUseMock()) return mockSaveCommunityArticle(data)
  return http<boolean>({
    url: data.id ? `/community/content/${data.id}` : '/community/content',
    method: data.id ? 'put' : 'post',
    data,
  })
}

export function saveCommunityQuestion(
  data: ContentQuestionForm & { id?: string },
): Promise<boolean> {
  if (isUseMock()) return mockSaveCommunityQuestion(data)
  return http<boolean>({
    url: data.id ? `/community/question/${data.id}` : '/community/question',
    method: data.id ? 'put' : 'post',
    data,
  })
}

export function saveCommunityExpert(
  data: ContentExpertForm & { id?: string },
): Promise<boolean> {
  if (isUseMock()) return mockSaveCommunityExpert(data)
  return http<boolean>({
    url: data.id ? `/community/expert/${data.id}` : '/community/expert',
    method: data.id ? 'put' : 'post',
    data,
  })
}
