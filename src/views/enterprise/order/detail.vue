<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { getOrderDetail } from '@/api/modules/order'
import PageContainer from '@/components/PageContainer.vue'
import StatusTag from '@/components/StatusTag.vue'
import FilePreview from '@/components-business/FilePreview.vue'
import OrderTimeline from '@/components-business/OrderTimeline.vue'
import { ORDER_STATUS_MAP } from '@/constants/dicts'
import type { AttachmentItem, OrderDetail } from '@/types/business'

const route = useRoute()
const router = useRouter()
const detail = ref<OrderDetail>()
const previewVisible = ref(false)
const previewFiles = ref<AttachmentItem[]>([])

async function loadDetail() {
  detail.value = await getOrderDetail(String(route.params.id))
}

function openPreview(files: AttachmentItem[]) {
  previewFiles.value = files
  previewVisible.value = true
}

loadDetail()
</script>

<template>
  <PageContainer
    :title="detail?.projectName || '企业订单详情'"
    subtitle="订单详情推荐采用左信息右时间线布局，让状态流、附件、物流和报告入口始终在一页内闭环。"
  >
    <template #extra>
      <el-button @click="router.back()">返回列表</el-button>
      <StatusTag v-if="detail" :status="detail.status" :map="ORDER_STATUS_MAP" />
    </template>

    <el-row :gutter="16">
      <el-col :span="16">
        <el-card v-if="detail" shadow="never" class="app-card">
          <template #header>
            <span>订单基础信息</span>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="订单号">{{ detail.orderNo }}</el-descriptions-item>
            <el-descriptions-item label="报告编号">{{ detail.reportNo || '待生成' }}</el-descriptions-item>
            <el-descriptions-item label="样品名称">{{ detail.sampleName }}</el-descriptions-item>
            <el-descriptions-item label="样品编号">{{ detail.sampleCode }}</el-descriptions-item>
            <el-descriptions-item label="收样联系人">{{ detail.receiverName }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{ detail.receiverPhone }}</el-descriptions-item>
            <el-descriptions-item label="收样地址" :span="2">{{ detail.receiverAddress }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <el-card v-if="detail" shadow="never" class="app-card" style="margin-top: 16px">
          <template #header>
            <div class="section-header">
              <span>订单附件</span>
              <el-button text type="primary" @click="openPreview(detail.attachments)">查看附件</el-button>
            </div>
          </template>
          <el-empty description="当前示例仅展示附件预览入口，后续可扩展寄样凭证、付款凭证、报告文件。" />
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card v-if="detail" shadow="never" class="app-card">
          <template #header>
            <span>订单状态时间线</span>
          </template>
          <OrderTimeline :nodes="detail.timeline" />
        </el-card>
      </el-col>
    </el-row>

    <FilePreview v-model:visible="previewVisible" :files="previewFiles" />
  </PageContainer>
</template>

<style scoped>
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
