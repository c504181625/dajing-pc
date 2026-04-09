<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import { getMerchantDashboard } from '@/api/modules/dashboard'
import { getMessageList } from '@/api/modules/message'
import PageContainer from '@/components/PageContainer.vue'
import DetailSection from '@/components-business/DetailSection/index.vue'
import EmptyBlock from '@/components-business/EmptyBlock/index.vue'
import StatusTag from '@/components-business/StatusTag/index.vue'
import {
  ENTERPRISE_CAPABILITY_LABEL_MAP,
  MESSAGE_READ_STATUS_MAP,
} from '@/constants/dicts'
import { useUserStore } from '@/store/modules/user'
import type { MerchantWorkbenchData, MessageItem } from '@/types/business'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const workbench = ref<MerchantWorkbenchData>({
  todos: [],
  recentOperations: [],
  quickEntries: [],
})
const latestMessages = ref<MessageItem[]>([])

const identityTitle = computed(() => {
  const capabilities = userStore.userInfo?.enterpriseCapabilities || []
  if (!capabilities.length) return '企业工作台'
  return `${capabilities.map((item) => ENTERPRISE_CAPABILITY_LABEL_MAP[item] || item).join(' / ')}工作台`
})

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
    subtitle="聚焦当前企业待办、最新消息和常用入口，不展示空图表。"
  >
    <div class="summary-grid" v-loading="loading">
      <el-card
        v-for="item in workbench.todos"
        :key="item.code"
        shadow="never"
        class="summary-card app-card"
        @click="router.push(item.path)"
      >
        <div class="summary-label">{{ item.title }}</div>
        <div class="summary-value">{{ item.value }}</div>
        <div class="summary-link">点击进入处理</div>
      </el-card>
    </div>

    <el-row :gutter="16">
      <el-col :span="14">
        <DetailSection title="最新消息">
          <el-table v-if="latestMessages.length" :data="latestMessages" border>
            <el-table-column prop="title" label="标题" min-width="220" />
            <el-table-column prop="createdAt" label="时间" min-width="160" />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <StatusTag :status="row.readStatus" :map="MESSAGE_READ_STATUS_MAP" />
              </template>
            </el-table-column>
          </el-table>
          <EmptyBlock v-else title="暂无消息" description="当前没有需要关注的业务提醒。" />
        </DetailSection>
      </el-col>

      <el-col :span="10">
        <DetailSection title="快捷入口">
          <div class="quick-entry-list">
            <el-card
              v-for="item in workbench.quickEntries"
              :key="item.path"
              shadow="hover"
              class="quick-entry"
              @click="router.push(item.path)"
            >
              <div class="quick-entry-title">{{ item.title }}</div>
              <div class="quick-entry-desc">{{ item.description }}</div>
            </el-card>
          </div>
        </DetailSection>
      </el-col>
    </el-row>
  </PageContainer>
</template>

<style scoped>
.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.summary-card {
  cursor: pointer;
}

.summary-label {
  color: var(--dj-color-text-secondary);
  font-size: 14px;
}

.summary-value {
  margin-top: 12px;
  font-size: 32px;
  font-weight: 700;
}

.summary-link {
  margin-top: 8px;
  color: var(--dj-color-primary);
  font-size: 13px;
}

.quick-entry-list {
  display: grid;
  gap: 12px;
}

.quick-entry {
  cursor: pointer;
}

.quick-entry-title {
  font-size: 15px;
  font-weight: 600;
}

.quick-entry-desc {
  margin-top: 6px;
  color: var(--dj-color-text-regular);
  font-size: 13px;
}
</style>
