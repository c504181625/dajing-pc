<script setup lang="ts">
import { ArrowRight, Warning } from '@element-plus/icons-vue'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import { getMerchantDashboard } from '@/api/modules/dashboard'
import { getMessageList } from '@/api/modules/message'
import PageContainer from '@/components-business/PageContainer/index.vue'
import SectionCard from '@/components-business/SectionCard/index.vue'
import { MESSAGE_READ_STATUS_MAP } from '@/constants/dicts'
import { ENTERPRISE_CAPABILITY_LABEL_MAP } from '@/enum/role'
import { useUserStore } from '@/store/modules/user'
import type { MerchantWorkbenchData, MessageItem } from '@/types/business'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const workbench = ref<MerchantWorkbenchData>({
  todos: [],
  recentOperations: [],
  quickEntries: [],
  overviewMetrics: [],
  priorityQueue: [],
  flowBoard: [],
  riskAlerts: [],
})
const latestMessages = ref<MessageItem[]>([])

const identityTitle = computed(() => {
  const capabilities =
    userStore.userInfo?.enterpriseTags || userStore.userInfo?.enterpriseCapabilities || []
  if (!capabilities.length) return '企业工作台'
  return `${capabilities.map((item) => ENTERPRISE_CAPABILITY_LABEL_MAP[item] || item).join(' / ')}工作台`
})

function jump(path?: string) {
  if (!path) return
  router.push(path)
}

function getPriorityTag(priority: string) {
  if (priority === 'p1') return 'danger'
  if (priority === 'p2') return 'warning'
  return 'info'
}

async function loadData() {
  loading.value = true
  try {
    const [workbenchRes, messageRes] = await Promise.all([
      getMerchantDashboard(),
      getMessageList({ pageNum: 1, pageSize: 4 }),
    ])
    workbench.value = workbenchRes
    latestMessages.value = messageRes.list
  } finally {
    loading.value = false
  }
}

loadData()
</script>

<template>
  <PageContainer
    :title="identityTitle"
    subtitle="统一企业端工作台体验，围绕概览指标、优先任务、业务流转、风险提醒和消息联动展开。"
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
        <div class="metric-value">{{ metric.value }}</div>
        <p class="metric-desc">{{ metric.description }}</p>
      </article>
    </section>

    <div class="dashboard-grid">
      <div class="dashboard-main">
        <SectionCard
          title="待办优先队列"
          description="把企业当前最需要处理的需求、订单和报告节点前置展示。"
        >
          <div class="queue-list">
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
        </SectionCard>

        <SectionCard title="业务流转看板" description="把需求、服务、订单与报告节点串成统一视图。">
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

        <SectionCard title="最近动态" description="帮助企业快速回看平台反馈、需求对接与履约进展。">
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
        <SectionCard title="风险提醒" description="优先表达超时、待上传和未处理消息。">
          <div class="risk-list">
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
                {{ item.level === 'danger' ? '高风险' : '需关注' }}
              </el-tag>
            </button>
          </div>
        </SectionCard>

        <SectionCard title="最新消息" description="消息中心与工作台联动，便于直接切换处理。">
          <div class="message-list">
            <article
              v-for="item in latestMessages"
              :key="item.id"
              class="message-card"
              @click="jump('/enterprise/message')"
            >
              <div class="message-head">
                <strong>{{ item.title }}</strong>
                <el-tag :type="item.readStatus === 'unread' ? 'warning' : 'success'" effect="light">
                  {{ MESSAGE_READ_STATUS_MAP[item.readStatus]?.label || item.readStatus }}
                </el-tag>
              </div>
              <p>{{ item.content }}</p>
              <span class="message-time">{{ item.createdAt }}</span>
            </article>
          </div>
        </SectionCard>

        <SectionCard title="快捷入口" description="保留企业端高频业务入口，并与共享社区衔接。">
          <div class="shortcut-list">
            <button
              v-for="item in workbench.quickEntries"
              :key="item.path"
              type="button"
              class="shortcut-item"
              @click="jump(item.path)"
            >
              <div class="shortcut-title">{{ item.title }}</div>
              <div class="shortcut-desc">{{ item.description }}</div>
            </button>
            <button type="button" class="shortcut-item" @click="jump('/community/news')">
              <div class="shortcut-title">质量社区</div>
              <div class="shortcut-desc">浏览资讯、知识文章、问答和专家在线内容。</div>
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

.metric-card,
.queue-item,
.flow-card,
.risk-item,
.message-card,
.shortcut-item {
  border: 1px solid rgb(15 23 42 / 7%);
  border-radius: 18px;
  background: linear-gradient(180deg, #fff 0%, #fbfcff 100%);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.metric-card,
.risk-item,
.message-card,
.shortcut-item,
.flow-card {
  padding: 18px;
}

.metric-card,
.queue-item,
.flow-card,
.risk-item,
.message-card,
.shortcut-item {
  cursor: pointer;
}

.metric-card:hover,
.queue-item:hover,
.flow-card:hover,
.risk-item:hover,
.message-card:hover,
.shortcut-item:hover {
  transform: translateY(-2px);
  border-color: rgb(31 94 255 / 18%);
  box-shadow: 0 16px 30px rgb(15 23 42 / 7%);
}

.metric-top,
.queue-head,
.queue-meta,
.risk-title,
.message-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.metric-label,
.flow-label {
  font-size: 13px;
  color: var(--dj-color-text-secondary);
}

.metric-value,
.flow-value {
  display: block;
  margin-top: 12px;
  font-size: 32px;
  font-weight: 800;
  color: var(--dj-color-text-primary);
}

.metric-desc,
.queue-copy p,
.risk-item p,
.message-card p,
.shortcut-desc,
.timeline-desc {
  margin: 10px 0 0;
  font-size: 13px;
  line-height: 1.7;
  color: var(--dj-color-text-regular);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(320px, 0.95fr);
  gap: 18px;
}

.dashboard-main,
.dashboard-side,
.queue-list,
.message-list,
.risk-list,
.shortcut-list {
  display: grid;
  gap: 14px;
}

.queue-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 18px;
}

.queue-copy {
  flex: 1;
  min-width: 0;
}

.queue-head h3,
.timeline-title,
.shortcut-title {
  margin: 0;
  font-size: 16px;
  color: var(--dj-color-text-primary);
}

.queue-meta {
  margin-top: 12px;
  justify-content: flex-start;
}

.queue-meta span,
.timeline-operator,
.message-time {
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
  text-align: left;
}

.flow-highlight {
  display: block;
  margin-top: 10px;
  font-size: 12px;
  color: var(--dj-color-primary);
}

.risk-title {
  justify-content: flex-start;
  font-size: 14px;
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
