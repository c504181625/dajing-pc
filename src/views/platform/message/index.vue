<script setup lang="ts">
import { Delete, Reading, RefreshRight } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, reactive, ref } from 'vue'

import {
  deleteMessage,
  getMessageDetail,
  getMessageList,
  readAllMessages,
  readMessage,
} from '@/api/modules/message'
import ActionToolbar from '@/components-business/ActionToolbar/index.vue'
import DetailSection from '@/components-business/DetailSection/index.vue'
import EmptyBlock from '@/components-business/EmptyBlock/index.vue'
import PageContainer from '@/components-business/PageContainer/index.vue'
import PermissionButton from '@/components-business/PermissionButton/index.vue'
import SectionCard from '@/components-business/SectionCard/index.vue'
import StatusTag from '@/components-business/StatusTag/index.vue'
import { MESSAGE_READ_STATUS_MAP, MESSAGE_TYPE_OPTIONS } from '@/constants/dicts'
import { PERMISSION_CODE } from '@/enum/permission'
import { MessageReadStatus, MessageType } from '@/enum/status'
import { useMessageStore } from '@/store/modules/message'
import type { MessageItem, MessageQuery } from '@/types/business'

const loading = ref(false)
const detailVisible = ref(false)
const activeTab = ref<'all' | MessageType>('all')
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

const tabs = computed(() => [
  { label: '全部消息', value: 'all', count: messageStore.stats.total },
  { label: '系统通知', value: MessageType.System, count: messageStore.stats.system },
  { label: '需求通知', value: MessageType.Demand, count: messageStore.stats.demand },
  { label: '咨询通知', value: MessageType.Consult, count: messageStore.stats.consult },
  { label: '订单通知', value: MessageType.Order, count: messageStore.stats.order },
])

async function loadStats() {
  await messageStore.refreshStats()
}

async function loadData() {
  loading.value = true
  try {
    queryForm.type = activeTab.value === 'all' ? '' : activeTab.value
    const res = await getMessageList(queryForm)
    tableData.value = res.list
  } finally {
    loading.value = false
  }
}

async function refreshPage() {
  await Promise.all([loadStats(), loadData()])
}

async function handleTabChange() {
  queryForm.pageNum = 1
  await loadData()
}

async function handleRead(id: string, silent = false) {
  await readMessage(id)
  if (!silent) ElMessage.success('已标记为已读')
  await refreshPage()
}

async function handleReadAll() {
  if (!messageStore.unreadCount) {
    ElMessage.info('当前没有未读消息')
    return
  }
  await readAllMessages()
  ElMessage.success('全部消息已标记为已读')
  await refreshPage()
}

async function handleDelete(row: MessageItem) {
  try {
    await ElMessageBox.confirm(`确认删除消息“${row.title}”吗？`, '删除确认', {
      type: 'warning',
    })
  } catch {
    return
  }
  await deleteMessage(row.id)
  ElMessage.success('消息已删除')
  if (currentMessage.value?.id === row.id) {
    detailVisible.value = false
    currentMessage.value = null
  }
  await refreshPage()
}

async function openDetail(row: MessageItem) {
  if (row.readStatus === MessageReadStatus.Unread) {
    await handleRead(row.id, true)
  }
  currentMessage.value = await getMessageDetail(row.id)
  detailVisible.value = true
}

function getTypeLabel(type: MessageType) {
  return MESSAGE_TYPE_OPTIONS.find((item) => item.value === type)?.label || type
}

refreshPage()
</script>

<template>
  <PageContainer
    title="消息中心"
    subtitle="统一查看系统通知、需求通知、咨询通知和订单通知，支持详情查看、已读管理和删除。"
  >
    <SectionCard title="消息分类" description="按消息类型快速筛选，未读数量会与顶部消息入口联动。">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane v-for="tab in tabs" :key="tab.value" :name="tab.value">
          <template #label>
            <span class="tab-label">
              {{ tab.label }}
              <em>{{ tab.count }}</em>
            </span>
          </template>
        </el-tab-pane>
      </el-tabs>

      <ActionToolbar>
        <el-input
          v-model="queryForm.keyword"
          clearable
          placeholder="搜索消息标题或内容摘要"
          style="width: 280px"
          @keyup.enter="loadData"
        />
        <el-select
          v-model="queryForm.readStatus"
          clearable
          placeholder="阅读状态"
          style="width: 160px"
          @change="loadData"
        >
          <el-option
            v-for="option in Object.values(MESSAGE_READ_STATUS_MAP)"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>

        <template #right>
          <el-button :icon="RefreshRight" @click="refreshPage">刷新</el-button>
          <PermissionButton
            :permission="PERMISSION_CODE.messageManageView"
            :icon="Reading"
            @click="handleReadAll"
          >
            全部已读
          </PermissionButton>
        </template>
      </ActionToolbar>
    </SectionCard>

    <SectionCard title="消息列表" description="优先处理未读消息，点击“查看详情”可展开完整内容。">
      <div v-if="tableData.length || loading" v-loading="loading" class="message-list">
        <article
          v-for="item in tableData"
          :key="item.id"
          class="message-item"
          :class="{ unread: item.readStatus === MessageReadStatus.Unread }"
        >
          <div class="message-main" @click="openDetail(item)">
            <div class="message-meta">
              <el-tag effect="plain">{{ getTypeLabel(item.type) }}</el-tag>
              <StatusTag :status="item.readStatus" :map="MESSAGE_READ_STATUS_MAP" />
              <span class="message-time">{{ item.createdAt }}</span>
            </div>
            <h3 class="message-title">{{ item.title }}</h3>
            <p class="message-content">{{ item.content }}</p>
          </div>

          <div class="message-actions">
            <el-button text type="primary" @click="openDetail(item)">查看详情</el-button>
            <PermissionButton
              v-if="item.readStatus === MessageReadStatus.Unread"
              :permission="PERMISSION_CODE.messageManageView"
              text
              @click="handleRead(item.id)"
            >
              标记已读
            </PermissionButton>
            <PermissionButton
              :permission="PERMISSION_CODE.messageManageView"
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
        description="当前筛选条件下没有匹配消息，可以切换分类或清空关键词后重试。"
      />
    </SectionCard>

    <el-drawer v-model="detailVisible" title="消息详情" size="560px">
      <DetailSection
        v-if="currentMessage"
        title="消息内容"
        description="消息详情通过 API 获取，后续可无缝替换为真实接口。"
      >
        <el-descriptions :column="1" border>
          <el-descriptions-item label="消息标题">{{ currentMessage.title }}</el-descriptions-item>
          <el-descriptions-item label="消息类型">{{ getTypeLabel(currentMessage.type) }}</el-descriptions-item>
          <el-descriptions-item label="阅读状态">
            <StatusTag :status="currentMessage.readStatus" :map="MESSAGE_READ_STATUS_MAP" />
          </el-descriptions-item>
          <el-descriptions-item label="发送时间">{{ currentMessage.createdAt }}</el-descriptions-item>
          <el-descriptions-item label="内容详情">{{ currentMessage.content }}</el-descriptions-item>
        </el-descriptions>

        <ActionToolbar>
          <PermissionButton
            v-if="currentMessage.readStatus === MessageReadStatus.Unread"
            :permission="PERMISSION_CODE.messageManageView"
            @click="handleRead(currentMessage.id)"
          >
            标记已读
          </PermissionButton>
          <template #right>
            <PermissionButton
              :permission="PERMISSION_CODE.messageManageView"
              type="danger"
              plain
              :icon="Delete"
              @click="handleDelete(currentMessage)"
            >
              删除消息
            </PermissionButton>
          </template>
        </ActionToolbar>
      </DetailSection>
    </el-drawer>
  </PageContainer>
</template>

<style scoped lang="scss">
.tab-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.tab-label em {
  font-style: normal;
  color: var(--dj-color-text-regular);
}

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
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.message-item.unread {
  border-color: rgb(31 94 255 / 24%);
  background: linear-gradient(90deg, rgb(31 94 255 / 4%) 0%, #fff 22%);
}

.message-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 28px rgb(15 32 64 / 7%);
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
  flex-wrap: wrap;
}

.message-time {
  font-size: 12px;
  color: var(--dj-color-text-regular);
}

.message-title {
  margin: 10px 0 8px;
  font-size: 16px;
  color: var(--dj-color-text-primary);
}

.message-content {
  margin: 0;
  font-size: 13px;
  line-height: 1.7;
  color: var(--dj-color-text-regular);
}

.message-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
