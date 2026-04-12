<script setup lang="ts">
import { Search, Star } from '@element-plus/icons-vue'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import {
  getCommunityArticleList,
  getCommunityOverview,
  getContentCategories,
} from '@/api/modules/content'
import PageContainer from '@/components/PageContainer.vue'
import SectionCard from '@/components-business/SectionCard/index.vue'
import { ContentBizType, ContentPublishStatus } from '@/enum/content'
import type {
  CommunityArticleItem,
  CommunityOverviewData,
  ContentCategoryItem,
  ContentQuery,
} from '@/types/content'

const router = useRouter()

const loading = ref(false)
const total = ref(0)
const list = ref<CommunityArticleItem[]>([])
const categories = ref<ContentCategoryItem[]>([])
const overview = ref<CommunityOverviewData | null>(null)

const queryForm = reactive<ContentQuery>({
  pageNum: 1,
  pageSize: 9,
  keyword: '',
  categoryCode: '',
  bizType: '',
  status: ContentPublishStatus.Published,
})

const categoryOptions = computed(() =>
  categories.value.filter(
    (item) => item.bizType === ContentBizType.News || item.bizType === ContentBizType.Knowledge,
  ),
)

const featuredArticle = computed(() => overview.value?.featuredNews?.[0] || list.value[0] || null)
const sideFeaturedList = computed(() => overview.value?.featuredNews?.slice(1, 4) || [])

async function loadBaseData() {
  categories.value = await getContentCategories()
  overview.value = await getCommunityOverview()
}

async function loadList() {
  loading.value = true
  try {
    const res = await getCommunityArticleList(queryForm)
    list.value = res.list.filter((item) => item.status === ContentPublishStatus.Published)
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  queryForm.pageNum = 1
  void loadList()
}

function handleReset() {
  queryForm.keyword = ''
  queryForm.categoryCode = ''
  queryForm.bizType = ''
  queryForm.pageNum = 1
  void loadList()
}

function openDetail(id: string) {
  router.push(`/community/news/${id}`)
}

onMounted(() => {
  void Promise.all([loadBaseData(), loadList()])
})
</script>

<template>
  <PageContainer>
    <section class="community-hero">
      <div>
        <div class="hero-tag">Quality Community</div>
        <h1>资讯中心</h1>
      </div>
      <el-button type="primary" plain @click="router.push('/community/qa/ask')">我要提问</el-button>
    </section>

    <SectionCard title="推荐资讯" description="优先展示已发布且推荐的社区内容。">
      <div class="featured-layout">
        <article
          v-if="featuredArticle"
          class="featured-main"
          @click="openDetail(featuredArticle.id)"
        >
          <div class="featured-badge">
            <el-icon><Star /></el-icon>
            推荐内容
          </div>
          <h2>{{ featuredArticle.title }}</h2>
          <p>{{ featuredArticle.summary }}</p>
          <div class="meta-row">
            <span>{{ featuredArticle.categoryName }}</span>
            <span>{{ featuredArticle.author.name }}</span>
            <span>{{ featuredArticle.publishTime }}</span>
          </div>
        </article>

        <div class="featured-side">
          <button
            v-for="item in sideFeaturedList"
            :key="item.id"
            type="button"
            class="side-item"
            @click="openDetail(item.id)"
          >
            <div class="side-title">{{ item.title }}</div>
            <div class="side-summary">{{ item.summary }}</div>
            <div class="meta-row">
              <span>{{ item.categoryName }}</span>
              <span>{{ item.publishTime }}</span>
            </div>
          </button>
        </div>
      </div>
    </SectionCard>

    <SectionCard title="分类筛选">
      <div class="filter-bar">
        <el-input
          v-model="queryForm.keyword"
          placeholder="搜索标题、摘要或作者"
          clearable
          class="filter-keyword"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="queryForm.categoryCode" clearable placeholder="全部分类">
          <el-option
            v-for="item in categoryOptions"
            :key="item.code"
            :label="item.name"
            :value="item.code"
          />
        </el-select>
        <el-select v-model="queryForm.bizType" clearable placeholder="全部类型">
          <el-option label="资讯公告" :value="ContentBizType.News" />
          <el-option label="知识文章" :value="ContentBizType.Knowledge" />
        </el-select>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </SectionCard>

    <SectionCard title="最新资讯" description="仅展示已发布内容，支持普通用户直接浏览。">
      <div v-loading="loading" class="news-grid">
        <article v-for="item in list" :key="item.id" class="news-card" @click="openDetail(item.id)">
          <div class="card-top">
            <el-tag effect="plain">{{ item.categoryName }}</el-tag>
            <el-tag v-if="item.featured" type="warning" effect="light">推荐</el-tag>
          </div>
          <h3>{{ item.title }}</h3>
          <p>{{ item.summary }}</p>
          <div class="meta-row">
            <span>{{ item.author.name }}</span>
            <span>{{ item.publishTime }}</span>
            <span>{{ item.viewCount }} 浏览</span>
          </div>
        </article>
      </div>

      <div v-if="total > 0" class="pagination-wrap">
        <el-pagination
          background
          layout="total, prev, pager, next"
          :total="total"
          :current-page="queryForm.pageNum"
          :page-size="queryForm.pageSize"
          @current-change="
            (page: number) => {
              queryForm.pageNum = page
              loadList()
            }
          "
        />
      </div>
    </SectionCard>
  </PageContainer>
</template>

<style scoped lang="scss">
.community-hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  padding: 28px 32px;
  border: 1px solid rgb(31 94 255 / 10%);
  border-radius: 24px;
  background:
    radial-gradient(circle at top left, rgb(92 162 255 / 14%), transparent 28%),
    linear-gradient(135deg, #f8fbff 0%, #fff 58%);
}

.community-hero h1 {
  margin: 8px 0 0;
  font-size: 34px;
}

.community-hero p {
  margin: 12px 0 0;
  max-width: 760px;
  line-height: 1.8;
  color: var(--dj-color-text-regular);
}

.hero-tag {
  color: var(--dj-color-primary);
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.featured-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(300px, 0.85fr);
  gap: 16px;
}

.featured-main,
.side-item,
.news-card {
  border: 1px solid var(--dj-color-border);
  border-radius: 20px;
  background: linear-gradient(180deg, #fff 0%, #fbfdff 100%);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.featured-main,
.news-card {
  padding: 24px;
  cursor: pointer;
}

.side-item {
  width: 100%;
  padding: 18px;
  cursor: pointer;
  text-align: left;
}

.featured-main:hover,
.side-item:hover,
.news-card:hover {
  transform: translateY(-2px);
  border-color: rgb(31 94 255 / 24%);
  box-shadow: 0 18px 30px rgb(15 23 42 / 8%);
}

.featured-badge,
.meta-row,
.card-top,
.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.featured-main h2,
.news-card h3 {
  margin: 16px 0 0;
  line-height: 1.5;
}

.featured-main p,
.side-summary,
.news-card p {
  margin: 14px 0 0;
  color: var(--dj-color-text-regular);
  line-height: 1.8;
}

.featured-side {
  display: grid;
  gap: 14px;
}

.side-title {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.6;
  color: var(--dj-color-text-primary);
}

.filter-keyword {
  width: min(420px, 100%);
}

.filter-bar :deep(.el-select) {
  width: 180px;
}

.news-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.meta-row {
  margin-top: 14px;
  color: var(--dj-color-text-secondary);
  font-size: 13px;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 1200px) {
  .featured-layout,
  .news-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .community-hero {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-bar :deep(.el-select),
  .filter-keyword {
    width: 100%;
  }
}
</style>
