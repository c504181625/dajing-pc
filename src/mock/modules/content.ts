import { AccountStatus, CommunityContentStatus } from '@/enum/status'
import type { CommunityArticleItem, CommunityQuery, CommunityQuestionItem, ExpertItem } from '@/types/business'
import { createPageResult, mockPromise } from '../helper'

let articles: CommunityArticleItem[] = [
  { id: 'article-001', title: '质量创新中心一期平台使用指南', authorName: '平台运营', categoryName: '平台公告', status: CommunityContentStatus.Published, createdAt: '2026-04-08 10:00:00' },
  { id: 'article-002', title: '实验室报告抽查规则解读', authorName: '监管专员', categoryName: '政策解读', status: CommunityContentStatus.Draft, createdAt: '2026-04-07 16:20:00' },
]

let questions: CommunityQuestionItem[] = [
  { id: 'question-001', title: '检测订单是否支持加急？', askerName: '启航电子', answerCount: 2, status: CommunityContentStatus.Published, createdAt: '2026-04-08 09:40:00' },
  { id: 'question-002', title: '质量培训如何申请企业内训？', askerName: '锐科装备', answerCount: 1, status: CommunityContentStatus.Published, createdAt: '2026-04-07 14:10:00' },
]

let experts: ExpertItem[] = [
  { id: 'expert-001', name: '王建国', title: '高级工程师', organization: '省质量研究院', specialties: ['标准化', '质量诊断'], status: AccountStatus.Enabled, updatedAt: '2026-04-08 09:00:00' },
  { id: 'expert-002', name: '李晓峰', title: '研究员', organization: '智造检测有限公司', specialties: ['检验检测', '实验室管理'], status: AccountStatus.Enabled, updatedAt: '2026-04-07 18:20:00' },
]

function filterByKeyword<T>(list: T[], keyword: string, fields: string[]) {
  if (!keyword) return list
  return list.filter((item) => fields.some((field) => String((item as Record<string, unknown>)[field] || '').includes(keyword)))
}

export function mockGetArticleList(params?: CommunityQuery) {
  const list = filterByKeyword([...articles], String(params?.keyword || '').trim(), ['title', 'authorName', 'categoryName'])
  return mockPromise(createPageResult(list))
}

export function mockGetQuestionList(params?: CommunityQuery) {
  const list = filterByKeyword([...questions], String(params?.keyword || '').trim(), ['title', 'askerName'])
  return mockPromise(createPageResult(list))
}

export function mockGetExpertList(params?: CommunityQuery) {
  const list = filterByKeyword([...experts], String(params?.keyword || '').trim(), ['name', 'organization'])
  return mockPromise(createPageResult(list))
}

export function mockDeleteArticle(id: string) {
  articles = articles.filter((item) => item.id !== id)
  return mockPromise(true)
}

export function mockDeleteQuestion(id: string) {
  questions = questions.filter((item) => item.id !== id)
  return mockPromise(true)
}

export function mockDeleteExpert(id: string) {
  experts = experts.filter((item) => item.id !== id)
  return mockPromise(true)
}
