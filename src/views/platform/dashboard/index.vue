<script setup lang="ts">
import { ArrowRight } from '@element-plus/icons-vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { getPlatformDashboard } from '@/api/modules/dashboard'
import EmptyBlock from '@/components-business/EmptyBlock/index.vue'
import PageContainer from '@/components-business/PageContainer/index.vue'
import SectionCard from '@/components-business/SectionCard/index.vue'
import type { PlatformWorkbenchData } from '@/types/business'

const router = useRouter()
const loading = ref(false)
const workbench = ref<PlatformWorkbenchData>({
  todos: [],
  recentOperations: [],
  quickEntries: [],
})

async function loadData() {
  loading.value = true
  try {
    workbench.value = await getPlatformDashboard()
  } finally {
    loading.value = false
  }
}

function jump(path: string) {
  router.push(path)
}

loadData()
</script>

<template>
  <PageContainer
    title="平台工作台"
    subtitle="聚焦待审核、待处理和待跟进事项，不展示空图表，只保留平台运营高频入口。"
  >
    <section v-loading="loading" class="summary-grid">
      <el-card
        v-for="todo in workbench.todos"
        :key="todo.code"
        shadow="never"
        class="summary-card app-card dashboard-metric"
        @click="jump(todo.path)"
      >
        <div class="metric-head">
          <span class="summary-label">{{ todo.title }}</span>
          <el-tag :type="todo.level" effect="light">优先处理</el-tag>
        </div>
        <div class="summary-value">{{ todo.value }}</div>
        <div class="metric-footer">
          <span>查看详情</span>
          <el-icon><ArrowRight /></el-icon>
        </div>
      </el-card>
    </section>

    <el-row :gutter="18">
      <el-col :span="14">
        <SectionCard title="最近操作" description="帮助平台快速回看近 24 小时内的关键审核、分配和抽查动作。">
          <el-table :data="workbench.recentOperations" border>
            <el-table-column prop="title" label="操作事项" min-width="180" />
            <el-table-column prop="description" label="说明" min-width="280" />
            <el-table-column prop="operator" label="操作人" width="120" />
            <el-table-column prop="createdAt" label="时间" width="180" />
          </el-table>
        </SectionCard>
      </el-col>

      <el-col :span="10">
        <SectionCard title="快捷入口" description="直达一期高频模块，让工作台成为真正的导航起点。">
          <div v-if="workbench.quickEntries.length" class="quick-entry-list">
            <button
              v-for="entry in workbench.quickEntries"
              :key="entry.path"
              type="button"
              class="quick-entry-item"
              @click="jump(entry.path)"
            >
              <div class="entry-title">{{ entry.title }}</div>
              <div class="entry-desc">{{ entry.description }}</div>
              <span class="entry-link">
                进入模块
                <el-icon><ArrowRight /></el-icon>
              </span>
            </button>
          </div>

          <EmptyBlock
            v-else
            title="暂无快捷入口"
            description="请检查工作台接口是否返回快捷入口配置。"
          />
        </SectionCard>
      </el-col>
    </el-row>
  </PageContainer>
</template>

<style scoped lang="scss">
.dashboard-metric {
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.dashboard-metric:hover {
  transform: translateY(-2px);
}

.metric-head,
.metric-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.metric-footer {
  margin-top: 18px;
  font-size: 13px;
  color: var(--dj-color-primary);
}

.quick-entry-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}

.quick-entry-item {
  padding: 18px;
  border: 1px solid var(--dj-color-border);
  border-radius: 16px;
  background: linear-gradient(180deg, #fff 0%, #fbfcff 100%);
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.quick-entry-item:hover {
  border-color: rgb(31 94 255 / 26%);
  box-shadow: 0 14px 30px rgb(31 94 255 / 8%);
  transform: translateY(-1px);
}

.entry-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--dj-color-text-primary);
}

.entry-desc {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.7;
  color: var(--dj-color-text-regular);
}

.entry-link {
  margin-top: 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--dj-color-primary);
  font-size: 13px;
}
</style>
