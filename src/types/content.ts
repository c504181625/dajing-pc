import type { ListQuery } from './api'

import type {
  ContentBizType,
  ContentPublishStatus,
  ExpertServiceStatus,
  QuestionSolveStatus,
} from '@/enum/content'

export interface ContentCategoryItem {
  id: string
  code: string
  name: string
  bizType: ContentBizType
}

export interface ContentAuthorInfo {
  id: string
  name: string
  accountType: 'personal' | 'enterprise' | 'platform_admin'
  organization?: string
}

export interface CommunityArticleItem {
  id: string
  bizType: Extract<ContentBizType, 'news' | 'knowledge'>
  title: string
  summary: string
  cover?: string
  categoryCode: string
  categoryName: string
  status: ContentPublishStatus
  author: ContentAuthorInfo
  publishTime: string
  viewCount: number
  likeCount: number
  commentCount: number
  featured?: boolean
}

export interface CommunityQuestionItem {
  id: string
  title: string
  summary: string
  categoryCode: string
  categoryName: string
  status: ContentPublishStatus
  solveStatus: QuestionSolveStatus
  asker: ContentAuthorInfo
  publishTime: string
  answerCount: number
  viewCount: number
  rewardText?: string
  featured?: boolean
  answers?: CommunityQuestionAnswerItem[]
}

export interface CommunityQuestionAnswerItem {
  id: string
  author: ContentAuthorInfo
  publishTime: string
  content: string
  likeCount?: number
  accepted?: boolean
}

export interface ExpertOnlineItem {
  id: string
  name: string
  title: string
  organization: string
  specialties: string[]
  serviceStatus: ExpertServiceStatus
  introduction: string
  consultationPriceText?: string
  onlineTimeText?: string
  publishTime: string
}

export interface ContentQuery extends ListQuery {
  bizType?: ContentBizType | ''
  categoryCode?: string
  status?: ContentPublishStatus | ''
}

export interface ContentArticleForm {
  bizType: Extract<ContentBizType, 'news' | 'knowledge'>
  title: string
  summary: string
  categoryCode: string
  featured?: boolean
}

export interface QuestionQuery extends ListQuery {
  categoryCode?: string
  solveStatus?: QuestionSolveStatus | ''
  status?: ContentPublishStatus | ''
}

export interface ContentQuestionForm {
  title: string
  summary: string
  categoryCode: string
  solveStatus: QuestionSolveStatus
  featured?: boolean
}

export interface ExpertQuery extends ListQuery {
  keyword?: string
  serviceStatus?: ExpertServiceStatus | ''
}

export interface ContentExpertForm {
  name: string
  title: string
  organization: string
  specialties: string[]
  serviceStatus: ExpertServiceStatus
  introduction: string
  consultationPriceText?: string
  onlineTimeText?: string
}

export interface CommunityOverviewData {
  articleTotal: number
  questionTotal: number
  expertTotal: number
  featuredNews: CommunityArticleItem[]
  hotQuestions: CommunityQuestionItem[]
}
