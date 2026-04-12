<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { getCommunityArticleDetail, getCommunityArticleList } from '@/api/modules/content'
import PageContainer from '@/components/PageContainer.vue'
import SectionCard from '@/components-business/SectionCard/index.vue'
import { ContentPublishStatus } from '@/enum/content'
import type { CommunityArticleItem } from '@/types/content'

const route = useRoute()
const router = useRouter()

const detail = ref<CommunityArticleItem | null>(null)
const relatedList = ref<CommunityArticleItem[]>([])

const previewSections = computed(() => {
  if (!detail.value) return []
  return [
    { title: '内容导读', content: detail.value.summary },
    {
      title: '关键看点',
      content: `围绕“${detail.value.categoryName}”主题，帮助用户快速理解内容重点，并沉淀为社区知识卡片。`,
    },
    {
      title: '适用场景',
      content: '适合个人用户、企业需求方与服务机构在前台社区态中浏览、收藏和转发。',
    },
  ]
})

async function loadDetail() {
  detail.value = await getCommunityArticleDetail(String(route.params.id))
  const related = await getCommunityArticleList({
    pageNum: 1,
    pageSize: 4,
    status: ContentPublishStatus.Published,
  })
  relatedList.value = related.list.filter((item) => item.id !== String(route.params.id)).slice(0, 3)
}

function openRelated(id: string) {
  router.push(`/community/news/${id}`)
}

function handleCollect() {
  ElMessage.success('已加入收藏示例')
}

function handleShare() {
  ElMessage.success('已生成分享示例')
}

onMounted(() => {
  void loadDetail()
})
</script>

<template>
  <PageContainer>
    <el-row v-if="detail" :gutter="16">
      <el-col :span="16">
        <SectionCard>
          <div class="article-head">
            <div class="article-tags">
              <el-tag effect="plain">{{ detail.categoryName }}</el-tag>
              <el-tag v-if="detail.featured" type="warning" effect="light">推荐</el-tag>
            </div>
            <h1>{{ detail.title }}</h1>
            <div class="article-meta">
              <span>{{ detail.author.name }}</span>
              <span>{{ detail.publishTime }}</span>
              <span>{{ detail.viewCount }} 浏览</span>
            </div>
            <p class="article-summary">{{ detail.summary }}</p>
          </div>
        </SectionCard>

        <SectionCard title="正文拆解" description="按前台详情页形式展示内容结构。">
          <div class="section-list">
            <article v-for="item in previewSections" :key="item.title" class="content-block">
              <h3>{{ item.title }}</h3>
              <p>{{ item.content }}</p>
            </article>
          </div>
        </SectionCard>

        <SectionCard title="相关推荐" description="继续浏览同类型的社区资讯内容。">
          <div class="related-list">
            <button
              v-for="item in relatedList"
              :key="item.id"
              type="button"
              class="related-item"
              @click="openRelated(item.id)"
            >
              <strong>{{ item.title }}</strong>
              <span>{{ item.summary }}</span>
            </button>
          </div>
        </SectionCard>
      </el-col>

      <el-col :span="8">
        <SectionCard title="互动操作">
          <div class="side-actions">
            <el-button type="primary" @click="handleCollect">收藏资讯</el-button>
            <el-button plain @click="handleShare">分享内容</el-button>
            <el-button plain @click="router.push('/community/qa/ask')">围绕内容提问</el-button>
          </div>
        </SectionCard>

        <SectionCard title="内容信息" style="margin-top: 16px">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="内容分类">{{ detail.categoryName }}</el-descriptions-item>
            <el-descriptions-item label="作者">{{ detail.author.name }}</el-descriptions-item>
            <el-descriptions-item label="发布时间">{{ detail.publishTime }}</el-descriptions-item>
            <el-descriptions-item label="互动数据">
              {{ detail.likeCount }} 点赞 / {{ detail.commentCount }} 评论
            </el-descriptions-item>
          </el-descriptions>
        </SectionCard>
      </el-col>
    </el-row>
  </PageContainer>
</template>

<style scoped lang="scss">
.article-head h1 {
  margin: 16px 0 0;
  font-size: 34px;
  line-height: 1.45;
}

.article-tags,
.article-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.article-meta {
  margin-top: 14px;
  color: var(--dj-color-text-secondary);
  font-size: 13px;
}

.article-summary {
  margin: 18px 0 0;
  line-height: 1.9;
  color: var(--dj-color-text-regular);
}

.section-list,
.related-list,
.side-actions {
  display: grid;
  gap: 14px;
}

.content-block,
.related-item {
  padding: 20px;
  border: 1px solid var(--dj-color-border);
  border-radius: 18px;
  background: linear-gradient(180deg, #fff 0%, #fbfdff 100%);
}

.content-block h3,
.related-item strong {
  display: block;
  margin: 0 0 10px;
  font-size: 18px;
}

.content-block p,
.related-item span {
  margin: 0;
  line-height: 1.9;
  color: var(--dj-color-text-regular);
}

.related-item {
  cursor: pointer;
  text-align: left;
}

.side-actions :deep(.el-button) {
  width: 100%;
  height: 42px;
  margin: 0;
}
</style>
