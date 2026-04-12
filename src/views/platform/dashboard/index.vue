<script setup lang="ts">
import { ArrowRight, Warning } from '@element-plus/icons-vue'
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
  overviewMetrics: [],
  priorityQueue: [],
  flowBoard: [],
  riskAlerts: [],
})

async function loadData() {
  loading.value = true
  try {
    workbench.value = await getPlatformDashboard()
  } finally {
    loading.value = false
  }
}

function jump(path?: string) {
  if (!path) return
  router.push(path)
}

function getPriorityTag(priority: string) {
  if (priority === 'p1') return 'danger'
  if (priority === 'p2') return 'warning'
  return 'info'
}

loadData()
</script>

<template>
  <PageContainer
    title="平台工作台"
    subtitle="从展示页升级为运营驾驶舱，优先呈现概览指标、待办优先队列、业务流转、风险提醒与最近动态。"
  >
    <section v-loading="loading" class="metric-grid">
      <article
        v-for="metric in workbench.overviewMetrics"
        :key="metric.key"
        class="metric-card"
        @click="jump(metric.path)"
      >
        <div class="metric-top">
          <span class="metric-label">{{ metric.label }}</span>
          <el-tag :type="metric.level || 'info'" effect="light">{{ metric.highlight }}</el-tag>
        </div>
        <div class="metric-value">
          {{ metric.value }}
          <small v-if="metric.unit">{{ metric.unit }}</small>
        </div>
        <p class="metric-desc">{{ metric.description }}</p>
      </article>
    </section>

    <div class="dashboard-grid">
      <div class="dashboard-main">
        <SectionCard
          title="待办优先队列"
          description="把最急的任务前置展示，减少平台运营二次判断成本。"
        >
          <div v-if="workbench.priorityQueue?.length" class="queue-list">
            <article
              v-for="item in workbench.priorityQueue"
              :key="item.id"
              class="queue-item"
              @click="jump(item.path)"
            >
              <div class="queue-copy">
                <div class="queue-head">
                  <h3>{{ item.title }}</h3>
                  <el-tag effect="light">{{ item.businessType }}</el-tag>
                </div>
                <p>{{ item.description }}</p>
                <div class="queue-meta">
                  <span>负责人：{{ item.owner || '待分配' }}</span>
                  <span>{{ item.deadlineText }}</span>
                  <span>{{ item.statusText }}</span>
                </div>
              </div>
              <div class="queue-side">
                <el-tag :type="getPriorityTag(item.priority)" effect="dark">
                  {{ item.priority.toUpperCase() }}
                </el-tag>
                <span class="queue-link">
                  去处理
                  <el-icon><ArrowRight /></el-icon>
                </span>
              </div>
            </article>
          </div>
          <EmptyBlock
            v-else
            title="暂无待办队列"
            description="当前没有高优先任务，后续可接入真实待办接口。"
          />
        </SectionCard>

        <SectionCard
          title="业务流转看板"
          description="把需求、机构、订单、报告四段流转放到同一视角下。"
        >
          <div class="flow-grid">
            <button
              v-for="item in workbench.flowBoard"
              :key="item.id"
              type="button"
              class="flow-card"
              @click="jump(item.path)"
            >
              <span class="flow-label">{{ item.label }}</span>
              <strong class="flow-value">{{ item.value }}</strong>
              <span class="flow-highlight">{{ item.highlight }}</span>
            </button>
          </div>
        </SectionCard>

        <SectionCard
          title="最近动态"
          description="用于运营回看最近 24 小时的重要业务动作和处理结果。"
        >
          <el-timeline>
            <el-timeline-item
              v-for="item in workbench.recentOperations"
              :key="item.id"
              :timestamp="item.createdAt"
              placement="top"
            >
              <div class="timeline-title">{{ item.title }}</div>
              <div class="timeline-desc">{{ item.description }}</div>
              <div class="timeline-operator">{{ item.operator }}</div>
            </el-timeline-item>
          </el-timeline>
        </SectionCard>
      </div>

      <div class="dashboard-side">
        <SectionCard title="风险提醒" description="优先提示超时、异常、积压与待复核事项。">
          <div v-if="workbench.riskAlerts?.length" class="risk-list">
            <button
              v-for="item in workbench.riskAlerts"
              :key="item.id"
              type="button"
              class="risk-item"
              @click="jump(item.path)"
            >
              <div class="risk-title">
                <el-icon><Warning /></el-icon>
                <span>{{ item.title }}</span>
              </div>
              <p>{{ item.description }}</p>
              <el-tag :type="item.level" effect="light">
                {{
                  item.level === 'danger'
                    ? '高风险'
                    : item.level === 'warning'
                      ? '需优先关注'
                      : '提示'
                }}
              </el-tag>
            </button>
          </div>
          <EmptyBlock v-else title="暂无风险提醒" description="当前运营态势平稳。" />
        </SectionCard>

        <SectionCard title="快捷入口" description="保留高频模块，避免与左侧菜单重复堆叠。">
          <div class="shortcut-list">
            <button
              v-for="entry in workbench.quickEntries"
              :key="entry.path"
              type="button"
              class="shortcut-item"
              @click="jump(entry.path)"
            >
              <div class="shortcut-title">{{ entry.title }}</div>
              <div class="shortcut-desc">{{ entry.description }}</div>
            </button>
          </div>
        </SectionCard>
      </div>
    </div>
  </PageContainer>
</template>

<style scoped lang="scss">
.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.metric-card {
  padding: 20px;
  border: 1px solid rgb(15 23 42 / 7%);
  border-radius: 20px;
  background:
    radial-gradient(circle at top right, rgb(31 94 255 / 8%), transparent 30%),
    linear-gradient(180deg, #fff 0%, #fbfcff 100%);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.metric-card:hover,
.queue-item:hover,
.flow-card:hover,
.risk-item:hover,
.shortcut-item:hover {
  transform: translateY(-2px);
  border-color: rgb(31 94 255 / 18%);
  box-shadow: 0 16px 30px rgb(15 23 42 / 7%);
}

.metric-top,
.queue-head,
.queue-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.metric-label {
  font-size: 14px;
  color: var(--dj-color-text-secondary);
}

.metric-value {
  margin-top: 16px;
  font-size: 36px;
  font-weight: 800;
  color: var(--dj-color-text-primary);
}

.metric-value small {
  margin-left: 6px;
  font-size: 14px;
  color: var(--dj-color-text-regular);
}

.metric-desc,
.queue-copy p,
.risk-item p,
.shortcut-desc,
.timeline-desc {
  margin: 10px 0 0;
  font-size: 13px;
  line-height: 1.7;
  color: var(--dj-color-text-regular);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(320px, 0.9fr);
  gap: 18px;
}

.dashboard-main,
.dashboard-side {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.queue-list,
.risk-list,
.shortcut-list {
  display: grid;
  gap: 12px;
}

.queue-item,
.risk-item,
.shortcut-item,
.flow-card {
  border: 1px solid rgb(15 23 42 / 7%);
  border-radius: 16px;
  background: #fff;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.queue-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 18px;
  cursor: pointer;
}

.queue-copy {
  flex: 1;
  min-width: 0;
}

.queue-head h3,
.timeline-title {
  margin: 0;
  font-size: 16px;
  color: var(--dj-color-text-primary);
}

.queue-meta {
  margin-top: 12px;
  justify-content: flex-start;
}

.queue-meta span,
.timeline-operator {
  font-size: 12px;
  color: var(--dj-color-text-secondary);
}

.queue-side {
  display: grid;
  gap: 12px;
  justify-items: end;
}

.queue-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--dj-color-primary);
  font-size: 13px;
}

.flow-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.flow-card {
  padding: 16px;
  text-align: left;
  cursor: pointer;
}

.flow-label {
  font-size: 13px;
  color: var(--dj-color-text-secondary);
}

.flow-value {
  display: block;
  margin-top: 10px;
  font-size: 28px;
  color: var(--dj-color-text-primary);
}

.flow-highlight {
  display: block;
  margin-top: 10px;
  font-size: 12px;
  color: var(--dj-color-primary);
}

.risk-item,
.shortcut-item {
  padding: 16px;
  text-align: left;
  cursor: pointer;
}

.risk-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  color: var(--dj-color-text-primary);
}

.shortcut-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--dj-color-text-primary);
}

@media (max-width: 1280px) {
  .metric-grid,
  .flow-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .metric-grid,
  .flow-grid {
    grid-template-columns: 1fr;
  }

  .queue-item {
    flex-direction: column;
    align-items: stretch;
  }

  .queue-side {
    justify-items: start;
  }
}
</style>
