<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import { getCommunityExpertList } from '@/api/modules/content'
import PageContainer from '@/components/PageContainer.vue'
import SectionCard from '@/components-business/SectionCard/index.vue'
import { ExpertServiceStatus } from '@/enum/content'
import type { ExpertOnlineItem, ExpertQuery } from '@/types/content'

const router = useRouter()

const loading = ref(false)
const total = ref(0)
const list = ref<ExpertOnlineItem[]>([])

const queryForm = reactive<ExpertQuery>({
  pageNum: 1,
  pageSize: 9,
  keyword: '',
  serviceStatus: '',
})

const recommendedExperts = computed(() => list.value.slice(0, 3))

async function loadList() {
  loading.value = true
  try {
    const res = await getCommunityExpertList(queryForm)
    list.value = res.list
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
  queryForm.serviceStatus = ''
  queryForm.pageNum = 1
  void loadList()
}

function openDetail(id: string) {
  router.push(`/community/experts/${id}`)
}

onMounted(() => {
  void loadList()
})
</script>

<template>
  <PageContainer>
    <section class="community-hero">
      <div>
        <div class="hero-tag">Expert Service</div>
        <h1>专家在线</h1>
      </div>
      <el-button type="primary" plain @click="router.push('/community/qa/ask')"
        >向专家提问</el-button
      >
    </section>

    <SectionCard title="推荐专家">
      <div class="recommend-grid">
        <article
          v-for="item in recommendedExperts"
          :key="item.id"
          class="recommend-card"
          @click="openDetail(item.id)"
        >
          <div class="recommend-head">
            <div>
              <h3>{{ item.name }}</h3>
              <div class="recommend-title">{{ item.title }} / {{ item.organization }}</div>
            </div>
            <el-tag
              :type="item.serviceStatus === ExpertServiceStatus.Online ? 'success' : 'warning'"
              effect="light"
            >
              {{
                item.serviceStatus === ExpertServiceStatus.Online
                  ? '在线可咨询'
                  : item.serviceStatus === ExpertServiceStatus.Busy
                    ? '忙碌中'
                    : '离线'
              }}
            </el-tag>
          </div>
          <div class="tag-row">
            <el-tag v-for="tag in item.specialties" :key="tag" effect="plain">{{ tag }}</el-tag>
          </div>
          <p>{{ item.introduction }}</p>
        </article>
      </div>
    </SectionCard>

    <SectionCard title="筛选专家">
      <div class="filter-bar">
        <el-input
          v-model="queryForm.keyword"
          class="filter-keyword"
          clearable
          placeholder="搜索专家姓名、机构或擅长领域"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="queryForm.serviceStatus" clearable placeholder="全部服务状态">
          <el-option label="在线可咨询" :value="ExpertServiceStatus.Online" />
          <el-option label="忙碌中" :value="ExpertServiceStatus.Busy" />
          <el-option label="离线" :value="ExpertServiceStatus.Offline" />
        </el-select>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </SectionCard>

    <SectionCard title="专家列表">
      <div v-loading="loading" class="expert-grid">
        <article v-for="item in list" :key="item.id" class="expert-card">
          <div class="recommend-head">
            <div>
              <h3>{{ item.name }}</h3>
              <div class="recommend-title">{{ item.title }} / {{ item.organization }}</div>
            </div>
            <el-tag
              :type="item.serviceStatus === ExpertServiceStatus.Online ? 'success' : 'info'"
              effect="light"
            >
              {{
                item.serviceStatus === ExpertServiceStatus.Online
                  ? '在线'
                  : item.serviceStatus === ExpertServiceStatus.Busy
                    ? '忙碌'
                    : '离线'
              }}
            </el-tag>
          </div>
          <div class="tag-row">
            <el-tag v-for="tag in item.specialties" :key="tag" effect="plain">{{ tag }}</el-tag>
          </div>
          <p>{{ item.introduction }}</p>
          <div class="expert-actions">
            <el-button type="primary" plain @click="openDetail(item.id)">查看主页</el-button>
            <el-button
              text
              type="primary"
              @click="router.push(`/community/qa/ask?expert=${item.name}`)"
            >
              向 TA 提问
            </el-button>
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

.recommend-grid,
.expert-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.recommend-card,
.expert-card {
  padding: 22px;
  border: 1px solid var(--dj-color-border);
  border-radius: 20px;
  background: linear-gradient(180deg, #fff 0%, #fbfdff 100%);
}

.recommend-head,
.filter-bar,
.tag-row,
.expert-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: space-between;
  flex-wrap: wrap;
}

.recommend-card h3,
.expert-card h3 {
  margin: 0;
  font-size: 22px;
}

.recommend-title {
  margin-top: 6px;
  color: var(--dj-color-text-secondary);
  font-size: 13px;
}

.tag-row {
  margin-top: 16px;
  justify-content: flex-start;
}

.recommend-card p,
.expert-card p {
  margin: 16px 0 0;
  line-height: 1.85;
  color: var(--dj-color-text-regular);
}

.filter-keyword {
  width: min(420px, 100%);
}

.filter-bar :deep(.el-select) {
  width: 190px;
}

.expert-actions {
  margin-top: 18px;
  justify-content: flex-start;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 1200px) {
  .recommend-grid,
  .expert-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .community-hero {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-keyword,
  .filter-bar :deep(.el-select) {
    width: 100%;
  }
}
</style>
