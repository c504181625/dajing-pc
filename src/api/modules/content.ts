import {
  createClientPageResult,
  createEmptyPageResult,
  normalizePageResult,
  resolveEmptyList,
  resolveEmptyValue,
  toRecord,
} from '@/api/helper'
import type { PageResult } from '@/types/api'
import type {
  CommunityArticleItem as LegacyCommunityArticleItem,
  CommunityQuery,
  CommunityQuestionItem as LegacyCommunityQuestionItem,
  ExpertItem,
} from '@/types/business'
import {
  ContentBizType,
  ContentPublishStatus,
  ExpertServiceStatus,
  QuestionSolveStatus,
} from '@/enum/content'
import type {
  CommunityArticleItem,
  CommunityOverviewData,
  CommunityQuestionAnswerItem,
  CommunityQuestionItem,
  ContentArticleForm,
  ContentCategoryItem,
  ContentExpertForm,
  ContentQuery,
  ContentQuestionForm,
  ExpertOnlineItem,
  ExpertQuery,
  QuestionQuery,
} from '@/types/content'
import { ACCOUNT_TYPE } from '@/enum/role'
import { AccountStatus, CommunityContentStatus } from '@/enum/status'
import { formatDateTime } from '@/utils/date'
import { http } from '@/utils/request'

const contentCategories: ContentCategoryItem[] = [
  { id: 'cat-news', code: 'platform_notice', name: '资讯公告', bizType: ContentBizType.News },
  { id: 'cat-knowledge', code: 'quality_knowledge', name: '知识文章', bizType: ContentBizType.Knowledge },
  { id: 'cat-question', code: 'qa_default', name: '问答交流', bizType: ContentBizType.Question },
]

function isOperatorSession() {
  if (typeof window === 'undefined') return false

  try {
    const raw = localStorage.getItem('user')
    if (!raw) return false
    const parsed = JSON.parse(raw) as {
      userInfo?: { accountType?: string | number }
    }
    const accountType = parsed.userInfo?.accountType
    return accountType === ACCOUNT_TYPE.operator || accountType === 4 || accountType === '4'
  } catch {
    return false
  }
}

function findCategoryName(code: string, fallback = '未分类') {
  return contentCategories.find((item) => item.code === code)?.name || code || fallback
}

function splitTags(value: unknown) {
  return String(value || '')
    .split(/[、,，/|]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function normalizeContentStatus(value: unknown): ContentPublishStatus {
  const status = Number(value)
  if (status === 1) return ContentPublishStatus.Published
  if (status === 2) return ContentPublishStatus.Offline
  return ContentPublishStatus.Draft
}

function normalizeQuestionSolveStatus(source: Record<string, unknown>): QuestionSolveStatus {
  if (Number(source.acceptedAnswerId || 0) > 0) return QuestionSolveStatus.Solved
  const status = Number(source.status || -1)
  if (status === 2) return QuestionSolveStatus.Closed
  return QuestionSolveStatus.Open
}

function normalizeExpertServiceStatus(value: unknown): ExpertServiceStatus {
  const status = Number(value)
  if (status === 1) return ExpertServiceStatus.Online
  if (status === 2) return ExpertServiceStatus.Busy
  return ExpertServiceStatus.Offline
}

function normalizeArticleBizType(source: Record<string, unknown>): CommunityArticleItem['bizType'] {
  const tokens = [source.category, source.categoryCode, source.tags]
    .map((item) => String(item || '').toLowerCase())
    .join(' ')

  return tokens.includes('knowledge') ? ContentBizType.Knowledge : ContentBizType.News
}

function normalizeArticleItem(raw: unknown): CommunityArticleItem {
  const source = toRecord(raw)
  const categoryCode = String(source.category || source.categoryCode || '')

  return {
    id: String(source.id || ''),
    bizType: normalizeArticleBizType(source),
    title: String(source.title || ''),
    summary: String(source.summary || source.content || ''),
    cover: source.coverUrl ? String(source.coverUrl) : undefined,
    categoryCode,
    categoryName: findCategoryName(categoryCode),
    status: normalizeContentStatus(source.status),
    author: {
      id: String(source.authorId || ''),
      name: String(source.authorName || source.nickname || '平台运营中心'),
      accountType: 'platform_admin',
    },
    publishTime: formatDateTime(source.createTime || source.updateTime, { fallback: '' }),
    viewCount: Number(source.viewCount || 0),
    likeCount: Number(source.likeCount || 0),
    commentCount: Number(source.commentCount || 0),
    featured: Number(source.isTop || 0) === 1,
  }
}

function normalizeAnswerItem(raw: unknown): CommunityQuestionAnswerItem {
  const source = toRecord(raw)

  return {
    id: String(source.id || ''),
    author: {
      id: String(source.authorId || ''),
      name: String(source.authorName || source.nickname || '社区答主'),
      accountType: 'personal',
      organization: source.organization ? String(source.organization) : undefined,
    },
    publishTime: formatDateTime(source.createTime || source.updateTime, { fallback: '' }),
    content: String(source.content || ''),
    likeCount: Number(source.likeCount || 0),
    accepted: Number(source.isAccepted || 0) === 1,
  }
}

function normalizeQuestionItem(raw: unknown): CommunityQuestionItem {
  const source = toRecord(raw)
  const categoryCode = String(source.category || source.categoryCode || '')

  return {
    id: String(source.id || ''),
    title: String(source.title || ''),
    summary: String(source.summary || source.content || ''),
    categoryCode,
    categoryName: findCategoryName(categoryCode),
    status: normalizeContentStatus(source.status),
    solveStatus: normalizeQuestionSolveStatus(source),
    asker: {
      id: String(source.authorId || ''),
      name: String(source.authorName || source.nickname || '社区用户'),
      accountType: 'personal',
    },
    publishTime: formatDateTime(source.createTime || source.updateTime, { fallback: '' }),
    answerCount: Number(source.answerCount || 0),
    viewCount: Number(source.viewCount || 0),
    rewardText: source.rewardText ? String(source.rewardText) : undefined,
    featured: Number(source.isTop || 0) === 1,
    answers: [],
  }
}

function normalizeExpertItem(raw: unknown): ExpertOnlineItem {
  const source = toRecord(raw)

  return {
    id: String(source.id || ''),
    name: String(source.name || ''),
    title: String(source.title || ''),
    organization: String(source.organization || ''),
    specialties: splitTags(source.expertise),
    serviceStatus: normalizeExpertServiceStatus(source.status),
    introduction: String(source.introduction || ''),
    consultationPriceText: source.consultationPriceText
      ? String(source.consultationPriceText)
      : undefined,
    onlineTimeText: source.onlineTimeText ? String(source.onlineTimeText) : undefined,
    publishTime: formatDateTime(source.createTime || source.updateTime, { fallback: '' }),
  }
}

function buildEmptyArticle(id = ''): CommunityArticleItem {
  return {
    id,
    bizType: ContentBizType.News,
    title: '',
    summary: '',
    categoryCode: '',
    categoryName: '未分类',
    status: ContentPublishStatus.Draft,
    author: {
      id: '',
      name: '',
      accountType: 'platform_admin',
    },
    publishTime: '',
    viewCount: 0,
    likeCount: 0,
    commentCount: 0,
  }
}

function buildEmptyQuestion(id = ''): CommunityQuestionItem {
  return {
    id,
    title: '',
    summary: '',
    categoryCode: '',
    categoryName: '未分类',
    status: ContentPublishStatus.Draft,
    solveStatus: QuestionSolveStatus.Open,
    asker: {
      id: '',
      name: '',
      accountType: 'personal',
    },
    publishTime: '',
    answerCount: 0,
    viewCount: 0,
    answers: [],
  }
}

function buildEmptyExpert(id = ''): ExpertOnlineItem {
  return {
    id,
    name: '',
    title: '',
    organization: '',
    specialties: [],
    serviceStatus: ExpertServiceStatus.Offline,
    introduction: '',
    publishTime: '',
  }
}

function buildArticleListParams(params?: ContentQuery) {
  return {
    page: params?.pageNum || 1,
    size: params?.pageSize || 10,
    category: params?.categoryCode || undefined,
    keyword: params?.keyword || undefined,
  }
}

function buildQuestionListParams(params?: QuestionQuery) {
  return {
    page: params?.pageNum || 1,
    size: params?.pageSize || 10,
    category: params?.categoryCode || undefined,
    keyword: params?.keyword || undefined,
  }
}

function buildExpertListParams(params?: ExpertQuery) {
  return {
    page: params?.pageNum || 1,
    size: params?.pageSize || 10,
    expertise: params?.keyword || undefined,
  }
}

function filterArticleList(items: CommunityArticleItem[], params?: ContentQuery) {
  const keyword = String(params?.keyword || '').trim().toLowerCase()
  return items.filter((item) => {
    const matchKeyword =
      !keyword ||
      [item.title, item.summary, item.author.name]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(keyword))
    const matchCategory = !params?.categoryCode || item.categoryCode === params.categoryCode
    const matchBizType = !params?.bizType || item.bizType === params.bizType
    const matchStatus = !params?.status || item.status === params.status

    return matchKeyword && matchCategory && matchBizType && matchStatus
  })
}

function filterQuestionList(items: CommunityQuestionItem[], params?: QuestionQuery) {
  const keyword = String(params?.keyword || '').trim().toLowerCase()
  return items.filter((item) => {
    const matchKeyword =
      !keyword ||
      [item.title, item.summary, item.asker.name, item.categoryName]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(keyword))
    const matchCategory = !params?.categoryCode || item.categoryCode === params.categoryCode
    const matchSolveStatus = !params?.solveStatus || item.solveStatus === params.solveStatus
    const matchStatus = !params?.status || item.status === params.status

    return matchKeyword && matchCategory && matchSolveStatus && matchStatus
  })
}

function filterExpertList(items: ExpertOnlineItem[], params?: ExpertQuery) {
  const keyword = String(params?.keyword || '').trim().toLowerCase()
  return items.filter((item) => {
    const matchKeyword =
      !keyword ||
      [item.name, item.title, item.organization, ...item.specialties]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(keyword))
    const matchStatus = !params?.serviceStatus || item.serviceStatus === params.serviceStatus
    return matchKeyword && matchStatus
  })
}

function mapArticlePayload(data: ContentArticleForm) {
  return {
    title: data.title.trim(),
    summary: data.summary.trim(),
    content: data.summary.trim(),
    category:
      data.categoryCode || (data.bizType === ContentBizType.Knowledge ? 'quality_knowledge' : 'platform_notice'),
    tags: data.bizType,
    status: 0,
    isTop: data.featured ? 1 : 0,
  }
}

function mapQuestionPayload(data: ContentQuestionForm) {
  return {
    title: data.title.trim(),
    content: data.summary.trim(),
    category: data.categoryCode || 'qa_default',
    status: data.solveStatus === QuestionSolveStatus.Closed ? 2 : 0,
  }
}

function mapExpertPayload(data: ContentExpertForm) {
  return {
    name: data.name.trim(),
    title: data.title.trim(),
    organization: data.organization.trim(),
    expertise: data.specialties.join('、'),
    introduction: data.introduction.trim(),
    status:
      data.serviceStatus === ExpertServiceStatus.Online
        ? 1
        : data.serviceStatus === ExpertServiceStatus.Busy
          ? 2
          : 0,
  }
}

export function getContentCategories(): Promise<ContentCategoryItem[]> {
  return resolveEmptyList(contentCategories)
}

export async function getCommunityOverview(): Promise<CommunityOverviewData> {
  const [articles, questions, experts] = await Promise.all([
    getCommunityArticleList({ pageNum: 1, pageSize: 20, status: ContentPublishStatus.Published }),
    getCommunityQuestionList({ pageNum: 1, pageSize: 20, status: ContentPublishStatus.Published }),
    getCommunityExpertList({ pageNum: 1, pageSize: 12 }),
  ])

  return {
    articleTotal: articles.total,
    questionTotal: questions.total,
    expertTotal: experts.total,
    featuredNews: articles.list.filter((item) => item.featured).slice(0, 4),
    hotQuestions: questions.list
      .filter((item) => item.answerCount > 0 || item.solveStatus === QuestionSolveStatus.Solved)
      .slice(0, 4),
  }
}

export function getCommunityArticleList(
  params?: ContentQuery,
): Promise<PageResult<CommunityArticleItem>> {
  if (isOperatorSession()) {
    const shouldUseClientFilter = Boolean(
      params?.keyword || params?.categoryCode || params?.bizType,
    )

    return http<unknown>({
      url: '/api/admin/admin/content/articles',
      method: 'get',
      params: {
        page: shouldUseClientFilter ? 1 : params?.pageNum || 1,
        size: shouldUseClientFilter ? Math.max(Number(params?.pageSize || 10) * 10, 200) : params?.pageSize || 10,
        status:
          params?.status === ContentPublishStatus.Published
            ? 1
            : params?.status === ContentPublishStatus.Offline
              ? 2
              : params?.status === ContentPublishStatus.Draft
                ? 0
                : undefined,
      },
    }).then((res) => {
      const page = normalizePageResult(res, normalizeArticleItem, params)
      const filtered = filterArticleList(page.list, params)
      return shouldUseClientFilter ? createClientPageResult(filtered, params) : page
    })
  }

  return http<unknown>({
    url: '/api/community/article/list',
    method: 'get',
    params: buildArticleListParams(params),
  }).then((res) => {
    const page = normalizePageResult(res, normalizeArticleItem, params)
    const filtered = filterArticleList(page.list, params)
    return params?.bizType || params?.status ? createClientPageResult(filtered, params) : page
  })
}

export async function getCommunityArticleDetail(id: string): Promise<CommunityArticleItem> {
  const request = isOperatorSession()
    ? http<unknown>({
        url: `/api/admin/admin/content/article/${id}`,
        method: 'get',
      }).catch(() =>
        http<unknown>({
          url: `/api/community/article/${id}`,
          method: 'get',
        }),
      )
    : http<unknown>({
        url: `/api/community/article/${id}`,
        method: 'get',
      })

  return request.then((res) => normalizeArticleItem(res)).catch(() => buildEmptyArticle(id))
}

export function getCommunityQuestionList(
  params?: QuestionQuery,
): Promise<PageResult<CommunityQuestionItem>> {
  if (isOperatorSession()) {
    const shouldUseClientFilter = Boolean(params?.keyword || params?.categoryCode || params?.solveStatus)

    return http<unknown>({
      url: '/api/admin/admin/content/questions',
      method: 'get',
      params: {
        page: shouldUseClientFilter ? 1 : params?.pageNum || 1,
        size: shouldUseClientFilter ? Math.max(Number(params?.pageSize || 10) * 10, 200) : params?.pageSize || 10,
      },
    }).then((res) => {
      const page = normalizePageResult(res, normalizeQuestionItem, params)
      const filtered = filterQuestionList(page.list, params)
      return shouldUseClientFilter ? createClientPageResult(filtered, params) : page
    })
  }

  return http<unknown>({
    url: '/api/community/question/list',
    method: 'get',
    params: buildQuestionListParams(params),
  }).then((res) => {
    const page = normalizePageResult(res, normalizeQuestionItem, params)
    const filtered = filterQuestionList(page.list, params)
    return params?.solveStatus || params?.status ? createClientPageResult(filtered, params) : page
  })
}

export async function getCommunityQuestionDetail(id: string): Promise<CommunityQuestionItem> {
  const detailRequest = isOperatorSession()
    ? http<unknown>({
        url: `/api/admin/admin/content/question/${id}`,
        method: 'get',
      }).catch(() =>
        http<unknown>({
          url: `/api/community/question/${id}`,
          method: 'get',
        }),
      )
    : http<unknown>({
        url: `/api/community/question/${id}`,
        method: 'get',
      })

  const [detailRes, answerRes] = await Promise.all([
    detailRequest.catch(() => null),
    http<unknown[]>({
      url: `/api/community/question/${id}/answers`,
      method: 'get',
    }).catch(() => []),
  ])

  if (!detailRes) return buildEmptyQuestion(id)

  const detail = normalizeQuestionItem(detailRes)
  detail.answers = Array.isArray(answerRes) ? answerRes.map((item) => normalizeAnswerItem(item)) : []
  return detail
}

export function getCommunityExpertList(
  params?: ExpertQuery,
): Promise<PageResult<ExpertOnlineItem>> {
  return http<unknown>({
    url: '/api/community/expert/list',
    method: 'get',
    params: buildExpertListParams(params),
  }).then((res) => {
    const page = normalizePageResult(res, normalizeExpertItem, params)
    const filtered = filterExpertList(page.list, params)
    return params?.serviceStatus ? createClientPageResult(filtered, params) : page
  })
}

export async function getCommunityExpertDetail(id: string): Promise<ExpertOnlineItem> {
  return http<unknown>({
    url: `/api/community/expert/${id}`,
    method: 'get',
  })
    .then((res) => normalizeExpertItem(res))
    .catch(() => buildEmptyExpert(id))
}

export async function getArticleList(
  params?: CommunityQuery,
): Promise<PageResult<LegacyCommunityArticleItem>> {
  const res = await getCommunityArticleList({
    pageNum: params?.pageNum || 1,
    pageSize: params?.pageSize || 10,
    keyword: params?.keyword,
    categoryCode: params?.categoryCode,
  })

  const list = res.list.map((item) => ({
    id: item.id,
    title: item.title,
    authorName: item.author.name,
    categoryName: item.categoryName,
    status:
      item.status === ContentPublishStatus.Published
        ? CommunityContentStatus.Published
        : item.status === ContentPublishStatus.Offline
          ? CommunityContentStatus.Offline
          : CommunityContentStatus.Draft,
    createdAt: item.publishTime,
  }))

  return {
    ...res,
    list,
    records: list,
  }
}

export async function getQuestionList(
  params?: CommunityQuery,
): Promise<PageResult<LegacyCommunityQuestionItem>> {
  const res = await getCommunityQuestionList({
    pageNum: params?.pageNum || 1,
    pageSize: params?.pageSize || 10,
    keyword: params?.keyword,
    categoryCode: params?.categoryCode,
  })

  const list = res.list.map((item) => ({
    id: item.id,
    title: item.title,
    askerName: item.asker.name,
    answerCount: item.answerCount,
    status:
      item.status === ContentPublishStatus.Published
        ? CommunityContentStatus.Published
        : item.status === ContentPublishStatus.Offline
          ? CommunityContentStatus.Offline
          : CommunityContentStatus.Draft,
    createdAt: item.publishTime,
  }))

  return {
    ...res,
    list,
    records: list,
  }
}

export async function getExpertList(params?: CommunityQuery): Promise<PageResult<ExpertItem>> {
  const res = await getCommunityExpertList({
    pageNum: params?.pageNum || 1,
    pageSize: params?.pageSize || 10,
    keyword: params?.keyword,
  })

  const list = res.list.map((item) => ({
    id: item.id,
    name: item.name,
    title: item.title,
    organization: item.organization,
    specialties: item.specialties,
    status: item.serviceStatus === ExpertServiceStatus.Offline ? AccountStatus.Disabled : AccountStatus.Enabled,
    updatedAt: item.publishTime,
  }))

  return {
    ...res,
    list,
    records: list,
  }
}

export function deleteArticle(id: string): Promise<boolean> {
  return http<void>({
    url: `/api/community/article/${id}`,
    method: 'delete',
  }).then(() => true)
}

export function deleteQuestion(id: string): Promise<boolean> {
  return http<void>({
    url: `/api/community/question/${id}`,
    method: 'delete',
  }).then(() => true)
}

export function deleteExpert(_id: string): Promise<boolean> {
  return resolveEmptyValue(false)
}

export function saveCommunityArticle(
  data: ContentArticleForm & { id?: string },
): Promise<boolean> {
  const payload = mapArticlePayload(data)

  if (data.id) {
    return http<void>({
      url: `/api/community/article/${data.id}`,
      method: 'put',
      data: payload,
    }).then(() => true)
  }

  return http<void>({
    url: '/api/community/article',
    method: 'post',
    data: payload,
  }).then(() => true)
}

export function saveCommunityQuestion(
  data: ContentQuestionForm & { id?: string },
): Promise<boolean> {
  if (data.id) {
    return resolveEmptyValue(false)
  }

  return http<void>({
    url: '/api/community/question',
    method: 'post',
    data: mapQuestionPayload(data),
  }).then(() => true)
}

export function saveCommunityExpert(
  data: ContentExpertForm & { id?: string },
): Promise<boolean> {
  if (data.id) {
    return resolveEmptyValue(false)
  }

  return http<void>({
    url: '/api/community/expert',
    method: 'post',
    data: mapExpertPayload(data),
  }).then(() => true)
}

export function getEmptyCommunityPage() {
  return createEmptyPageResult<CommunityArticleItem>()
}
