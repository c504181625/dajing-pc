<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'

import {
  deleteMessage,
  getMessageDetail,
  getMessageList,
  getMessageStats,
  readAllMessages,
  readMessage,
} from '@/api/modules/message'
import DetailSection from '@/components-business/DetailSection/index.vue'
import EmptyBlock from '@/components-business/EmptyBlock/index.vue'
import PageContainer from '@/components-business/PageContainer/index.vue'
import PermissionButton from '@/components-business/PermissionButton/index.vue'
import SearchForm from '@/components-business/SearchForm/index.vue'
import SectionCard from '@/components-business/SectionCard/index.vue'
import StatsPanel from '@/components-business/StatsPanel/index.vue'
import StatusTag from '@/components-business/StatusTag/index.vue'
import { MESSAGE_READ_STATUS_MAP } from '@/constants/dicts'
import { PERMISSION_CODE } from '@/enum/permission'
import { MessageReadStatus, MessageType } from '@/enum/status'
import type { MessageItem, MessageQuery, MessageStats } from '@/types/business'

const loading = ref(false)
const total = ref(0)
const list = ref<MessageItem[]>([])
const detailVisible = ref(false)
const currentMessage = ref<MessageItem | null>(null)

const stats = ref<MessageStats>({
  total: 0,
  unread: 0,
  system: 0,
  demand: 0,
  consult: 0,
  order: 0,
  audit: 0,
  orderNotice: 0,
  alert: 0,
})

const queryForm = reactive<MessageQuery>({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  readStatus: '',
  priority: '',
  type: '',
})

const searchFields = [
  {
    label: '关键词',
    prop: 'keyword',
    placeholder: '消息标题 / 内容摘要',
  },
  {
    label: '阅读状态',
    prop: 'readStatus',
    component: 'select' as const,
    placeholder: '请选择阅读状态',
    options: Object.values(MESSAGE_READ_STATUS_MAP),
  },
  {
    label: '优先级',
    prop: 'priority',
    component: 'select' as const,
    placeholder: '请选择优先级',
    options: [
      { label: '高', value: 'high' },
      { label: '中', value: 'medium' },
      { label: '低', value: 'low' },
    ],
  },
]

const statCards = computed(() => [
  {
    title: '全部消息',
    value: stats.value.total,
    hint: '当前消息中心汇总的全部站内通知数量',
  },
  {
    title: '审核通知',
    value: stats.value.audit,
    hint: '机构审核、资质审核与流程节点提醒',
  },
  {
    title: '订单通知',
    value: stats.value.orderNotice,
    hint: '订单状态变化、支付节点与履约提醒',
  },
  {
    title: '告警通知',
    value: stats.value.alert,
    hint: '异常风险、超时预警与系统告警消息',
  },
])

const messageTypeText = computed<Record<string, string>>(() => ({
  [MessageType.Order]: '订单通知',
  [MessageType.System]: '系统通知',
  [MessageType.Consult]: '咨询通知',
  [MessageType.Demand]: '需求通知',
}))

async function loadStats() {
  stats.value = await getMessageStats()
}

async function loadData() {
  loading.value = true
  try {
    const res = await getMessageList(queryForm)
    list.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

async function refreshAll() {
  await Promise.all([loadStats(), loadData()])
}

function handleSearch() {
  queryForm.pageNum = 1
  void refreshAll()
}

function handlePageChange(page: number) {
  queryForm.pageNum = page
  void loadData()
}

function handleSizeChange(size: number) {
  queryForm.pageSize = size
  queryForm.pageNum = 1
  void loadData()
}

async function openDetail(item: MessageItem) {
  if (item.readStatus === MessageReadStatus.Unread) {
    await readMessage(item.id)
    item.readStatus = MessageReadStatus.Read
    await loadStats()
  }

  currentMessage.value = await getMessageDetail(item.id)
  detailVisible.value = true
}

async function handleReadAll() {
  await readAllMessages()
  ElMessage.success('已全部标记为已读')
  await refreshAll()
}

async function handleDelete(item: MessageItem) {
  try {
    await ElMessageBox.confirm(`确认删除消息“${item.title}”吗？`, '删除确认', {
      type: 'warning',
    })
  } catch {
    return
  }

  await deleteMessage(item.id)
  ElMessage.success('消息已删除')
  await refreshAll()

  if (currentMessage.value?.id === item.id) {
    currentMessage.value = null
    detailVisible.value = false
  }
}

onMounted(() => {
  void refreshAll()
})
</script>

<template>
  <PageContainer title="消息中心" subtitle="统一查看审核、订单、告警与系统通知消息。">
    <StatsPanel :items="statCards" />

    <SearchForm v-model="queryForm" :fields="searchFields" @search="handleSearch" @reset="refreshAll">
      <template #actions>
        <PermissionButton :permission="PERMISSION_CODE.operatorMessageView" @click="handleReadAll">
          全部已读
        </PermissionButton>
      </template>
    </SearchForm>

    <SectionCard title="消息列表" description="保留卡片式消息展示，下方补充分页器。">
      <div v-if="list.length || loading" v-loading="loading" class="message-list">
        <article
          v-for="item in list"
          :key="item.id"
          class="message-item"
          :class="{ unread: item.readStatus === MessageReadStatus.Unread }"
        >
          <div class="message-main" @click="openDetail(item)">
            <div class="message-meta">
              <el-tag effect="plain">
                {{ messageTypeText[item.type] || item.type }}
              </el-tag>
              <StatusTag :status="item.readStatus" :map="MESSAGE_READ_STATUS_MAP" />
              <span class="message-time">{{ item.createdAt }}</span>
            </div>
            <h3 class="message-title">{{ item.title }}</h3>
            <p class="message-content">{{ item.content }}</p>
          </div>

          <div class="message-actions">
            <el-button text type="primary" @click="openDetail(item)">查看详情</el-button>
            <PermissionButton
              :permission="PERMISSION_CODE.operatorMessageView"
              text
              type="danger"
              @click="handleDelete(item)"
            >
              删除
            </PermissionButton>
          </div>
        </article>
      </div>

      <EmptyBlock
        v-else
        title="暂无消息"
        description="当前筛选条件下没有匹配消息，可以清空筛选条件后重试。"
      />

      <div v-if="total > 0" class="pagination-wrap">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          prev-text="上一页"
          next-text="下一页"
          :total="total"
          :current-page="queryForm.pageNum"
          :page-size="queryForm.pageSize"
          :page-sizes="[10, 20, 50]"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </SectionCard>

    <el-drawer v-model="detailVisible" title="消息详情" size="560px">
      <DetailSection v-if="currentMessage" title="消息内容">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="消息标题">{{ currentMessage.title }}</el-descriptions-item>
          <el-descriptions-item label="消息类型">
            {{ messageTypeText[currentMessage.type] || currentMessage.type }}
          </el-descriptions-item>
          <el-descriptions-item label="发送时间">{{ currentMessage.createdAt }}</el-descriptions-item>
          <el-descriptions-item label="消息内容">{{ currentMessage.content }}</el-descriptions-item>
        </el-descriptions>
      </DetailSection>
    </el-drawer>
  </PageContainer>
</template>

<style scoped lang="scss">
.message-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.message-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 18px 20px;
  border: 1px solid var(--dj-color-border);
  border-radius: 16px;
  background: #fff;
}

.message-item.unread {
  border-color: rgb(31 94 255 / 24%);
  background: linear-gradient(90deg, rgb(31 94 255 / 4%) 0%, #fff 22%);
}

.message-main {
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.message-time {
  font-size: 12px;
  color: var(--dj-color-text-secondary);
}

.message-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--dj-color-text-primary);
}

.message-content {
  margin: 8px 0 0;
  color: var(--dj-color-text-regular);
  line-height: 1.7;
}

.message-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

@media (max-width: 900px) {
  .message-item {
    flex-direction: column;
    align-items: stretch;
  }

  .message-actions,
  .pagination-wrap {
    justify-content: flex-start;
    flex-wrap: wrap;
  }
}
</style>
