<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { reactive, ref } from 'vue'

import { deleteMessage, getMessageList, readMessage } from '@/api/modules/message'
import PageContainer from '@/components/PageContainer.vue'
import DetailSection from '@/components-business/DetailSection/index.vue'
import SearchForm from '@/components-business/SearchForm/index.vue'
import StatusTag from '@/components-business/StatusTag/index.vue'
import TablePanel from '@/components-business/TablePanel/index.vue'
import { MESSAGE_READ_STATUS_MAP, MESSAGE_TYPE_OPTIONS } from '@/constants/dicts'
import { MessageReadStatus } from '@/enum/status'
import { useMessageStore } from '@/store/modules/message'
import type { MessageItem, MessageQuery } from '@/types/business'

const loading = ref(false)
const detailVisible = ref(false)
const tableData = ref<MessageItem[]>([])
const currentMessage = ref<MessageItem | null>(null)
const messageStore = useMessageStore()

const queryForm = reactive<MessageQuery>({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  type: '',
  readStatus: '',
})

const searchFields = [
  { label: '关键词', prop: 'keyword', placeholder: '标题/内容' },
  {
    label: '消息类型',
    prop: 'type',
    component: 'select' as const,
    placeholder: '请选择类型',
    options: MESSAGE_TYPE_OPTIONS,
  },
  {
    label: '阅读状态',
    prop: 'readStatus',
    component: 'select' as const,
    placeholder: '请选择状态',
    options: Object.values(MESSAGE_READ_STATUS_MAP),
  },
]

function resetQuery() {
  Object.assign(queryForm, {
    pageNum: 1,
    pageSize: 10,
    keyword: '',
    type: '',
    readStatus: '',
  })
  loadData()
}

async function loadData() {
  loading.value = true
  try {
    const res = await getMessageList(queryForm)
    tableData.value = res.list
  } finally {
    loading.value = false
  }
}

async function openDetail(row: MessageItem) {
  currentMessage.value = row
  detailVisible.value = true
  if (row.readStatus === MessageReadStatus.Unread) {
    await handleRead(row.id, true)
  }
}

async function handleRead(id: string, silent = false) {
  await readMessage(id)
  if (!silent) ElMessage.success('已标记为已读')
  await Promise.all([loadData(), messageStore.refreshStats()])
}

async function handleDelete(id: string) {
  await deleteMessage(id)
  ElMessage.success('消息已删除')
  await Promise.all([loadData(), messageStore.refreshStats()])
}

Promise.all([loadData(), messageStore.refreshStats()])
</script>

<template>
  <PageContainer title="消息中心" subtitle="统一处理系统通知、需求通知、咨询通知和订单通知。">
    <SearchForm v-model="queryForm" :fields="searchFields" @search="loadData" @reset="resetQuery" />

    <TablePanel title="消息列表">
      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column prop="title" label="标题" min-width="220" />
        <el-table-column label="类型" width="120">
          <template #default="{ row }">
            {{ MESSAGE_TYPE_OPTIONS.find((item) => item.value === row.type)?.label || row.type }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <StatusTag :status="row.readStatus" :map="MESSAGE_READ_STATUS_MAP" />
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="时间" min-width="130" />
        <el-table-column label="操作" min-width="180" align="center" header-align="center">
          <template #default="{ row }">
            <el-button text type="primary" @click="openDetail(row)">查看</el-button>
            <el-button text type="primary" @click="handleRead(row.id)">已读</el-button>
            <el-button text type="danger" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </TablePanel>

    <el-drawer v-model="detailVisible" title="消息详情" size="520px">
      <DetailSection v-if="currentMessage" title="消息内容">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="标题">{{ currentMessage.title }}</el-descriptions-item>
          <el-descriptions-item label="内容">{{ currentMessage.content }}</el-descriptions-item>
          <el-descriptions-item label="时间">{{ currentMessage.createdAt }}</el-descriptions-item>
        </el-descriptions>
      </DetailSection>
    </el-drawer>
  </PageContainer>
</template>
