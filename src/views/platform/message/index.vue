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
import StatusTag from '@/components-business/StatusTag/index.vue'
import TablePanel from '@/components-business/TablePanel/index.vue'
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

const messageTypeText = computed<Record<string, string>>(() => ({
  [MessageType.Order]: '订单通知',
  [MessageType.System]: '系统通知',
  [MessageType.Consult]: '咨询通知',
  [MessageType.Demand]: '需求通知',
}))

const messageStats = computed(() => [
  { key: 'all', label: '全部', value: stats.value.total },
  { key: 'unread', label: '未读', value: stats.value.unread },
  { key: 'system', label: '系统通知', value: stats.value.system },
  { key: 'demand', label: '需求通知', value: stats.value.demand },
  { key: 'consult', label: '咨询通知', value: stats.value.consult },
  { key: 'order', label: '订单通知', value: stats.value.order + stats.value.orderNotice },
  { key: 'audit', label: '审核通知', value: stats.value.audit },
  { key: 'alert', label: '预警通知', value: stats.value.alert },
])

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

function handlePageChange() {
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
  <PageContainer title="消息中心">
    <SearchForm v-model="queryForm" :fields="searchFields" @search="handleSearch" @reset="refreshAll">
      <template #actions>
        <PermissionButton :permission="PERMISSION_CODE.operatorMessageView" @click="handleReadAll">
          全部已读
        </PermissionButton>
      </template>
    </SearchForm>

    <TablePanel
      title=""
      :total="total"
      :page-num="queryForm.pageNum"
      :page-size="queryForm.pageSize"
      @update:page-num="queryForm.pageNum = $event"
      @update:page-size="queryForm.pageSize = $event"
      @pageChange="handlePageChange"
    >
      <template #stats>
        <span v-for="item in messageStats" :key="item.key" class="table-stat">
          {{ item.label }}（{{ item.value }}）
        </span>
      </template>

      <div v-if="list.length || loading" v-loading="loading">
        <el-table :data="list" border>
          <el-table-column label="消息类型" width="120">
            <template #default="{ row }">
              {{ messageTypeText[row.type] || row.type }}
            </template>
          </el-table-column>
          <el-table-column prop="title" label="消息标题" min-width="220" />
          <el-table-column prop="content" label="消息内容" min-width="320" show-overflow-tooltip />
          <el-table-column label="阅读状态" width="120">
            <template #default="{ row }">
              <StatusTag :status="row.readStatus" :map="MESSAGE_READ_STATUS_MAP" />
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="发送时间" min-width="160" />
          <el-table-column label="操作" min-width="160" fixed="right" align="center" header-align="center">
            <template #default="{ row }">
              <el-space wrap>
                <el-button text type="primary" @click="openDetail(row)">查看详情</el-button>
                <PermissionButton
                  :permission="PERMISSION_CODE.operatorMessageView"
                  text
                  type="danger"
                  @click="handleDelete(row)"
                >
                  删除
                </PermissionButton>
              </el-space>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <EmptyBlock
        v-else
        title="暂无消息"
        description="当前筛选条件下没有匹配消息，可以清空筛选条件后重试。"
      />
    </TablePanel>

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
