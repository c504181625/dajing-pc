import { AccountStatus, CommunityContentStatus } from '@/enum/status'
import {
  ContentBizType,
  ContentPublishStatus,
  ExpertServiceStatus,
  QuestionSolveStatus,
} from '@/enum/content'
import type {
  CommunityArticleItem as CommunityArticleCard,
  CommunityOverviewData,
  CommunityQuestionItem as CommunityQuestionCard,
  ContentArticleForm,
  ContentCategoryItem,
  ContentExpertForm,
  ContentQuery,
  ContentQuestionForm,
  ExpertOnlineItem,
  ExpertQuery,
  QuestionQuery,
} from '@/types/content'
import type {
  CommunityArticleItem,
  CommunityQuery,
  CommunityQuestionItem,
  ExpertItem,
} from '@/types/business'

import { createPageResult, mockPromise } from '../helper'

const categories: ContentCategoryItem[] = [
  { id: 'cat-news-001', code: 'platform_notice', name: '平台公告', bizType: ContentBizType.News },
  { id: 'cat-news-002', code: 'policy_news', name: '政策快讯', bizType: ContentBizType.News },
  {
    id: 'cat-knowledge-001',
    code: 'testing_method',
    name: '检测方法',
    bizType: ContentBizType.Knowledge,
  },
  {
    id: 'cat-knowledge-002',
    code: 'quality_tool',
    name: '质量工具',
    bizType: ContentBizType.Knowledge,
  },
  {
    id: 'cat-question-001',
    code: 'order_consult',
    name: '订单咨询',
    bizType: ContentBizType.Question,
  },
  {
    id: 'cat-question-002',
    code: 'report_issue',
    name: '报告解读',
    bizType: ContentBizType.Question,
  },
]

let articles: CommunityArticleCard[] = [
  {
    id: 'article-001',
    bizType: ContentBizType.News,
    title: '质量创新中心平台一期上线公告',
    summary: '平台正式开放企业注册、机构入驻、需求协同、订单跟进与社区互动能力。',
    categoryCode: 'platform_notice',
    categoryName: '平台公告',
    status: ContentPublishStatus.Published,
    author: { id: 'author-001', name: '平台运营中心', accountType: 'platform_admin' },
    publishTime: '2026-04-08 10:00:00',
    viewCount: 1280,
    likeCount: 96,
    commentCount: 14,
    featured: true,
  },
  {
    id: 'article-002',
    bizType: ContentBizType.Knowledge,
    title: '实验室报告抽查规则与高风险项识别',
    summary: '围绕版本留痕、签章完整性、标准引用一致性给出一线抽查判断方法。',
    categoryCode: 'testing_method',
    categoryName: '检测方法',
    status: ContentPublishStatus.Published,
    author: { id: 'author-002', name: '监管专员', accountType: 'platform_admin' },
    publishTime: '2026-04-07 16:20:00',
    viewCount: 860,
    likeCount: 67,
    commentCount: 8,
  },
  {
    id: 'article-003',
    bizType: ContentBizType.Knowledge,
    title: '企业如何构建任务优先的质量改进看板',
    summary: '从需求池、异常工单、闭环复盘三条线整理企业内部质量运营台账。',
    categoryCode: 'quality_tool',
    categoryName: '质量工具',
    status: ContentPublishStatus.Draft,
    author: {
      id: 'author-003',
      name: '质量研究院',
      accountType: 'enterprise',
      organization: '省质量研究院',
    },
    publishTime: '2026-04-06 13:10:00',
    viewCount: 320,
    likeCount: 18,
    commentCount: 2,
  },
]

let questions: CommunityQuestionCard[] = [
  {
    id: 'question-001',
    title: '检测订单是否支持加急与并行检测？',
    summary: '电子元器件可靠性测试项目较多，想了解平台是否支持多项目并发排期。',
    categoryCode: 'order_consult',
    categoryName: '订单咨询',
    status: ContentPublishStatus.Published,
    solveStatus: QuestionSolveStatus.Open,
    asker: {
      id: 'asker-001',
      name: '启航电子',
      accountType: 'enterprise',
      organization: '苏州启航电子股份有限公司',
    },
    publishTime: '2026-04-08 09:40:00',
    answerCount: 2,
    viewCount: 218,
    rewardText: '悬赏 50 积分',
    featured: true,
    answers: [
      {
        id: 'answer-001',
        author: { id: 'expert-001', name: '平台运营中心', accountType: 'platform_admin' },
        publishTime: '2026-04-08 11:00:00',
        content:
          '平台支持按项目拆分排期，并可在样品齐套后安排并行检测。若涉及加急，请在下单前备注时限要求，我们会优先匹配具备产能的机构。',
        likeCount: 18,
        accepted: true,
      },
      {
        id: 'answer-002',
        author: {
          id: 'expert-002',
          name: '智造检测有限公司',
          accountType: 'enterprise',
          organization: '智造检测有限公司',
        },
        publishTime: '2026-04-08 13:20:00',
        content:
          '如果多个测试项目共用同一批样品，建议在需求描述中提前写明并行测试关系，便于机构统一安排收样和测试计划。',
        likeCount: 9,
      },
    ],
  },
  {
    id: 'question-002',
    title: '质量培训能否支持企业内训和驻场辅导？',
    summary: '希望针对生产线班组长做定制内训，是否可以结合诊断服务一起做。',
    categoryCode: 'order_consult',
    categoryName: '订单咨询',
    status: ContentPublishStatus.Published,
    solveStatus: QuestionSolveStatus.Solved,
    asker: {
      id: 'asker-002',
      name: '锐科装备',
      accountType: 'enterprise',
      organization: '无锡锐科装备有限公司',
    },
    publishTime: '2026-04-07 14:10:00',
    answerCount: 4,
    viewCount: 176,
    answers: [
      {
        id: 'answer-003',
        author: {
          id: 'expert-003',
          name: '省质量研究院',
          accountType: 'enterprise',
          organization: '省质量研究院',
        },
        publishTime: '2026-04-07 15:00:00',
        content:
          '可以支持企业内训与驻场辅导组合交付，通常会先做一次需求访谈，再输出课程计划和驻场安排。',
        likeCount: 14,
        accepted: true,
      },
      {
        id: 'answer-004',
        author: { id: 'author-001', name: '平台运营中心', accountType: 'platform_admin' },
        publishTime: '2026-04-07 17:30:00',
        content:
          '如需打包到订单中，可以在咨询回复后直接转需求，由平台协助匹配服务机构并跟进排期。',
        likeCount: 7,
      },
    ],
  },
  {
    id: 'question-003',
    title: '报告中的 CNAS 标识适用范围如何理解？',
    summary: '想确认报告附页中的认可范围是否等同于整份报告都在认可范围内。',
    categoryCode: 'report_issue',
    categoryName: '报告解读',
    status: ContentPublishStatus.Published,
    solveStatus: QuestionSolveStatus.Open,
    asker: { id: 'asker-003', name: '个人用户', accountType: 'personal' },
    publishTime: '2026-04-06 19:30:00',
    answerCount: 1,
    viewCount: 132,
    answers: [
      {
        id: 'answer-005',
        author: {
          id: 'expert-004',
          name: '实验室资深顾问',
          accountType: 'enterprise',
          organization: '标准化服务中心',
        },
        publishTime: '2026-04-06 20:40:00',
        content:
          '需要结合报告附件中的认可范围说明一起判断。若正文项目不在认可范围内，报告中通常会有明确备注，不可直接按整份报告全部认可理解。',
        likeCount: 11,
      },
    ],
  },
]

let experts: ExpertOnlineItem[] = [
  {
    id: 'expert-001',
    name: '王建国',
    title: '高级工程师',
    organization: '省质量研究院',
    specialties: ['标准化', '质量诊断'],
    serviceStatus: ExpertServiceStatus.Online,
    introduction: '长期从事企业标准体系建设与质量诊断咨询，可提供轻咨询与专题答疑。',
    consultationPriceText: '一期试运行免费',
    onlineTimeText: '工作日 09:00-18:00',
    publishTime: '2026-04-08 09:00:00',
  },
  {
    id: 'expert-002',
    name: '李晓峰',
    title: '研究员',
    organization: '智造检测有限公司',
    specialties: ['检验检测', '实验室管理'],
    serviceStatus: ExpertServiceStatus.Busy,
    introduction: '关注实验室能力验证、报告规范与检测方法适配。',
    consultationPriceText: '图文问答 99 元 / 次',
    onlineTimeText: '周二、周四在线',
    publishTime: '2026-04-07 18:20:00',
  },
]

function formatNow() {
  return new Date().toLocaleString('zh-CN', { hour12: false })
}

function includeKeyword(source: string[], keyword: string) {
  return source.some((item) => item.includes(keyword))
}

function findCategoryName(code: string) {
  return categories.find((item) => item.code === code)?.name || code
}

function filterArticles(params?: ContentQuery) {
  let list = [...articles]
  const keyword = String(params?.keyword || '').trim()
  const bizType = String(params?.bizType || '')
  const categoryCode = String(params?.categoryCode || '')
  const status = String(params?.status || '')

  if (keyword) {
    list = list.filter((item) =>
      includeKeyword([item.title, item.summary, item.author.name, item.categoryName], keyword),
    )
  }
  if (bizType) list = list.filter((item) => item.bizType === bizType)
  if (categoryCode) list = list.filter((item) => item.categoryCode === categoryCode)
  if (status) list = list.filter((item) => item.status === status)

  return list
}

function filterQuestions(params?: QuestionQuery) {
  let list = [...questions]
  const keyword = String(params?.keyword || '').trim()
  const categoryCode = String(params?.categoryCode || '')
  const solveStatus = String(params?.solveStatus || '')
  const status = String(params?.status || '')

  if (keyword) {
    list = list.filter((item) =>
      includeKeyword([item.title, item.summary, item.asker.name, item.categoryName], keyword),
    )
  }
  if (categoryCode) list = list.filter((item) => item.categoryCode === categoryCode)
  if (solveStatus) list = list.filter((item) => item.solveStatus === solveStatus)
  if (status) list = list.filter((item) => item.status === status)

  return list
}

function filterExperts(params?: ExpertQuery) {
  let list = [...experts]
  const keyword = String(params?.keyword || '').trim()
  const serviceStatus = String(params?.serviceStatus || '')

  if (keyword) {
    list = list.filter((item) =>
      includeKeyword([item.name, item.organization, item.specialties.join(' ')], keyword),
    )
  }
  if (serviceStatus) list = list.filter((item) => item.serviceStatus === serviceStatus)

  return list
}

export function mockGetContentCategories() {
  return mockPromise(categories)
}

export function mockGetCommunityArticleList(params?: ContentQuery) {
  return mockPromise(
    createPageResult(
      filterArticles(params),
      Number(params?.pageNum || 1),
      Number(params?.pageSize || 10),
    ),
  )
}

export function mockGetCommunityArticleDetail(id: string) {
  return mockPromise(articles.find((item) => item.id === id) as CommunityArticleCard)
}

export function mockGetCommunityQuestionList(params?: QuestionQuery) {
  return mockPromise(
    createPageResult(
      filterQuestions(params),
      Number(params?.pageNum || 1),
      Number(params?.pageSize || 10),
    ),
  )
}

export function mockGetCommunityQuestionDetail(id: string) {
  return mockPromise(questions.find((item) => item.id === id) as CommunityQuestionCard)
}

export function mockGetCommunityExpertList(params?: ExpertQuery) {
  return mockPromise(
    createPageResult(
      filterExperts(params),
      Number(params?.pageNum || 1),
      Number(params?.pageSize || 10),
    ),
  )
}

export function mockGetCommunityExpertDetail(id: string) {
  return mockPromise(experts.find((item) => item.id === id) as ExpertOnlineItem)
}

export function mockGetCommunityOverview(): Promise<CommunityOverviewData> {
  return mockPromise({
    articleTotal: articles.length,
    questionTotal: questions.length,
    expertTotal: experts.length,
    featuredNews: articles.filter((item) => item.featured).slice(0, 3),
    hotQuestions: questions.filter((item) => item.featured || item.answerCount > 1).slice(0, 4),
  })
}

function toLegacyArticle(item: CommunityArticleCard): CommunityArticleItem {
  return {
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
  }
}

function toLegacyQuestion(item: CommunityQuestionCard): CommunityQuestionItem {
  return {
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
  }
}

function toLegacyExpert(item: ExpertOnlineItem): ExpertItem {
  return {
    id: item.id,
    name: item.name,
    title: item.title,
    organization: item.organization,
    specialties: item.specialties,
    status:
      item.serviceStatus === ExpertServiceStatus.Offline
        ? AccountStatus.Disabled
        : AccountStatus.Enabled,
    updatedAt: item.publishTime,
  }
}

export function mockGetArticleList(params?: CommunityQuery) {
  return mockPromise(
    createPageResult(
      filterArticles({
        ...params,
        bizType: String(params?.categoryCode || '').includes('news')
          ? ContentBizType.News
          : undefined,
      } as ContentQuery).map(toLegacyArticle),
      Number(params?.pageNum || 1),
      Number(params?.pageSize || 10),
    ),
  )
}

export function mockGetQuestionList(params?: CommunityQuery) {
  return mockPromise(
    createPageResult(
      filterQuestions(params as QuestionQuery).map(toLegacyQuestion),
      Number(params?.pageNum || 1),
      Number(params?.pageSize || 10),
    ),
  )
}

export function mockGetExpertList(params?: CommunityQuery) {
  return mockPromise(
    createPageResult(
      filterExperts(params as ExpertQuery).map(toLegacyExpert),
      Number(params?.pageNum || 1),
      Number(params?.pageSize || 10),
    ),
  )
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

export function mockSaveCommunityArticle(data: ContentArticleForm & { id?: string }) {
  const categoryName = findCategoryName(data.categoryCode)
  if (data.id) {
    articles = articles.map((item) =>
      item.id === data.id
        ? {
            ...item,
            bizType: data.bizType,
            title: data.title,
            summary: data.summary,
            categoryCode: data.categoryCode,
            categoryName,
            featured: data.featured,
          }
        : item,
    )
  } else {
    articles.unshift({
      id: `article-${Date.now()}`,
      bizType: data.bizType,
      title: data.title,
      summary: data.summary,
      categoryCode: data.categoryCode,
      categoryName,
      status: ContentPublishStatus.Published,
      author: { id: 'author-001', name: '平台运营中心', accountType: 'platform_admin' },
      publishTime: formatNow(),
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      featured: data.featured,
    })
  }
  return mockPromise(true)
}

export function mockSaveCommunityQuestion(data: ContentQuestionForm & { id?: string }) {
  const categoryName = findCategoryName(data.categoryCode)
  if (data.id) {
    questions = questions.map((item) =>
      item.id === data.id
        ? {
            ...item,
            title: data.title,
            summary: data.summary,
            categoryCode: data.categoryCode,
            categoryName,
            solveStatus: data.solveStatus,
            featured: data.featured,
          }
        : item,
    )
  } else {
    questions.unshift({
      id: `question-${Date.now()}`,
      title: data.title,
      summary: data.summary,
      categoryCode: data.categoryCode,
      categoryName,
      status: ContentPublishStatus.Published,
      solveStatus: data.solveStatus,
      asker: { id: 'asker-001', name: '平台运营中心', accountType: 'platform_admin' },
      publishTime: formatNow(),
      answerCount: 0,
      viewCount: 0,
      featured: data.featured,
    })
  }
  return mockPromise(true)
}

export function mockSaveCommunityExpert(data: ContentExpertForm & { id?: string }) {
  if (data.id) {
    experts = experts.map((item) =>
      item.id === data.id
        ? {
            ...item,
            name: data.name,
            title: data.title,
            organization: data.organization,
            specialties: data.specialties,
            serviceStatus: data.serviceStatus,
            introduction: data.introduction,
            consultationPriceText: data.consultationPriceText,
            onlineTimeText: data.onlineTimeText,
          }
        : item,
    )
  } else {
    experts.unshift({
      id: `expert-${Date.now()}`,
      name: data.name,
      title: data.title,
      organization: data.organization,
      specialties: data.specialties,
      serviceStatus: data.serviceStatus,
      introduction: data.introduction,
      consultationPriceText: data.consultationPriceText,
      onlineTimeText: data.onlineTimeText,
      publishTime: formatNow(),
    })
  }
  return mockPromise(true)
}
