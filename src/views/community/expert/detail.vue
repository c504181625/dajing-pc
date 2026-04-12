<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { getCommunityExpertDetail, getCommunityQuestionList } from '@/api/modules/content'
import PageContainer from '@/components/PageContainer.vue'
import SectionCard from '@/components-business/SectionCard/index.vue'
import { ContentPublishStatus } from '@/enum/content'
import type { CommunityQuestionItem, ExpertOnlineItem } from '@/types/content'

const route = useRoute()
const router = useRouter()

const detail = ref<ExpertOnlineItem | null>(null)
const recentQuestions = ref<CommunityQuestionItem[]>([])

const statusText = computed(() => {
  if (!detail.value) return '-'
  if (detail.value.serviceStatus === 'online') return '在线可咨询'
  if (detail.value.serviceStatus === 'busy') return '忙碌中'
  return '离线'
})

async function loadData() {
  detail.value = await getCommunityExpertDetail(String(route.params.id))
  const res = await getCommunityQuestionList({
    pageNum: 1,
    pageSize: 3,
    status: ContentPublishStatus.Published,
  })
  recentQuestions.value = res.list.slice(0, 3)
}

function handleConsult() {
  ElMessage.success('已发起咨询示例')
}

onMounted(() => {
  void loadData()
})
</script>

<template>
  <PageContainer>
    <el-row v-if="detail" :gutter="16">
      <el-col :span="16">
        <SectionCard>
          <div class="expert-hero">
            <div>
              <div class="expert-name">{{ detail.name }}</div>
              <div class="expert-title">{{ detail.title }} / {{ detail.organization }}</div>
            </div>
            <el-tag :type="detail.serviceStatus === 'online' ? 'success' : 'warning'" effect="light">
              {{ statusText }}
            </el-tag>
          </div>
          <div class="tag-row">
            <el-tag v-for="tag in detail.specialties" :key="tag" effect="plain">{{ tag }}</el-tag>
          </div>
          <p class="expert-intro">{{ detail.introduction }}</p>
        </SectionCard>

        <SectionCard title="服务方向" description="以专家主页形态展示擅长领域和咨询入口。">
          <div class="service-grid">
            <article class="service-block">
              <h3>擅长领域</h3>
              <p>{{ detail.specialties.join(' / ') }}</p>
            </article>
            <article class="service-block">
              <h3>咨询说明</h3>
              <p>{{ detail.consultationPriceText || '当前未设置咨询说明' }}</p>
            </article>
            <article class="service-block">
              <h3>在线时段</h3>
              <p>{{ detail.onlineTimeText || '当前未设置在线时段' }}</p>
            </article>
          </div>
        </SectionCard>

        <SectionCard title="近期互动" description="复用社区问答数据，展示专家侧可能关注的问题主题。">
          <div class="related-list">
            <button
              v-for="item in recentQuestions"
              :key="item.id"
              type="button"
              class="related-item"
              @click="router.push(`/community/qa/${item.id}`)"
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
            <el-button type="primary" @click="router.push(`/community/qa/ask?expert=${detail.name}`)">
              向专家提问
            </el-button>
            <el-button plain @click="handleConsult">发起咨询</el-button>
            <el-button plain @click="ElMessage.success('已加入收藏示例')">收藏专家</el-button>
          </div>
        </SectionCard>

        <SectionCard title="专家信息" style="margin-top: 16px">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="所属机构">{{ detail.organization }}</el-descriptions-item>
            <el-descriptions-item label="当前状态">{{ statusText }}</el-descriptions-item>
            <el-descriptions-item label="上线时间">{{ detail.publishTime }}</el-descriptions-item>
            <el-descriptions-item label="擅长数量">
              {{ detail.specialties.length }}
            </el-descriptions-item>
          </el-descriptions>
        </SectionCard>
      </el-col>
    </el-row>
  </PageContainer>
</template>

<style scoped lang="scss">
.expert-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.expert-name {
  font-size: 34px;
  font-weight: 700;
}

.expert-title {
  margin-top: 8px;
  color: var(--dj-color-text-secondary);
}

.tag-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 18px;
}

.expert-intro {
  margin: 20px 0 0;
  line-height: 1.9;
  color: var(--dj-color-text-regular);
}

.service-grid,
.related-list,
.side-actions {
  display: grid;
  gap: 16px;
}

.service-block,
.related-item {
  padding: 20px;
  border: 1px solid var(--dj-color-border);
  border-radius: 18px;
  background: linear-gradient(180deg, #fff 0%, #fbfdff 100%);
}

.service-block h3,
.related-item strong {
  display: block;
  margin: 0 0 10px;
  font-size: 18px;
}

.service-block p,
.related-item span {
  margin: 0;
  line-height: 1.85;
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

@media (max-width: 900px) {
  .expert-hero {
    flex-direction: column;
  }
}
</style>
