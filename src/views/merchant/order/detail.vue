<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { getOrderDetail } from '@/api/modules/order'
import PageContainer from '@/components/PageContainer.vue'
import AttachmentPreview from '@/components-business/AttachmentPreview/index.vue'
import DetailSection from '@/components-business/DetailSection/index.vue'
import OperationTimeline from '@/components-business/OperationTimeline/index.vue'
import PermissionButton from '@/components-business/PermissionButton/index.vue'
import StatusTag from '@/components-business/StatusTag/index.vue'
import {
  ORDER_STATUS_MAP,
  PAYMENT_STATUS_MAP,
  REPORT_STATUS_MAP,
  SAMPLE_RECEIVE_STATUS_MAP,
} from '@/constants/dicts'
import { useUserStore } from '@/store/modules/user'
import type { AttachmentItem, OrderDetail } from '@/types/business'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const detail = ref<OrderDetail | null>(null)
const previewVisible = ref(false)
const previewFiles = ref<AttachmentItem[]>([])

const canHandleOrder = computed(() =>
  userStore.hasEnterpriseCapability(['service_provider', 'lab_provider']),
)

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
    :title="detail?.orderNo || '订单详情'"
    subtitle="统一查看基础信息、样品、检测项目、报告和状态时间线。"
  >
    <template #extra>
      <el-button @click="router.back()">返回列表</el-button>
      <StatusTag v-if="detail" :status="detail.status" :map="ORDER_STATUS_MAP" />
    </template>

    <el-row v-if="detail" :gutter="16">
      <el-col :span="16">
        <DetailSection title="基础信息">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="订单号">{{ detail.orderNo }}</el-descriptions-item>
            <el-descriptions-item label="项目名称">{{ detail.projectName }}</el-descriptions-item>
            <el-descriptions-item label="需求企业">{{ detail.enterpriseName }}</el-descriptions-item>
            <el-descriptions-item label="服务机构">{{ detail.orgName }}</el-descriptions-item>
            <el-descriptions-item label="支付状态">
              <StatusTag :status="detail.paymentStatus" :map="PAYMENT_STATUS_MAP" />
            </el-descriptions-item>
            <el-descriptions-item label="收样状态">
              <StatusTag :status="detail.sampleReceiveStatus" :map="SAMPLE_RECEIVE_STATUS_MAP" />
            </el-descriptions-item>
          </el-descriptions>
        </DetailSection>

        <DetailSection title="样品信息" style="margin-top: 16px">
          <el-table :data="detail.sampleItems" border>
            <el-table-column prop="sampleName" label="样品名称" min-width="180" />
            <el-table-column prop="sampleCode" label="样品编号" min-width="180" />
            <el-table-column prop="sampleCount" label="数量" width="80" />
            <el-table-column prop="sampleRemark" label="备注" min-width="180" />
          </el-table>
        </DetailSection>

        <DetailSection title="检测项目" style="margin-top: 16px">
          <el-table :data="detail.projectItems" border>
            <el-table-column prop="projectName" label="项目名称" min-width="180" />
            <el-table-column prop="standardName" label="检测标准" min-width="180" />
            <el-table-column prop="price" label="金额" width="120" />
          </el-table>
        </DetailSection>

        <DetailSection title="寄样 / 收样信息" style="margin-top: 16px">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="送样方式">{{ detail.sampleMode }}</el-descriptions-item>
            <el-descriptions-item label="收样联系人">{{ detail.receiverName }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{ detail.receiverPhone }}</el-descriptions-item>
            <el-descriptions-item label="收样地址">{{ detail.receiverAddress }}</el-descriptions-item>
          </el-descriptions>
        </DetailSection>

        <DetailSection title="异常处理记录" style="margin-top: 16px">
          <OperationTimeline :nodes="detail.exceptionRecords" />
        </DetailSection>

        <DetailSection title="报告信息" style="margin-top: 16px">
          <template #extra>
            <el-button
              text
              type="primary"
              @click="openPreview(detail.reportInfo.reportFile ? [detail.reportInfo.reportFile] : [])"
            >
              预览报告
            </el-button>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="报告编号">{{ detail.reportInfo.reportNo || '-' }}</el-descriptions-item>
            <el-descriptions-item label="报告状态">
              <StatusTag :status="detail.reportInfo.reportStatus" :map="REPORT_STATUS_MAP" />
            </el-descriptions-item>
          </el-descriptions>
        </DetailSection>

        <DetailSection title="评价信息" style="margin-top: 16px">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="评分">{{ detail.commentInfo?.score || '-' }}</el-descriptions-item>
            <el-descriptions-item label="评价内容">{{ detail.commentInfo?.content || '-' }}</el-descriptions-item>
            <el-descriptions-item label="评价时间">{{ detail.commentInfo?.createdAt || '-' }}</el-descriptions-item>
          </el-descriptions>
        </DetailSection>
      </el-col>

      <el-col :span="8">
        <DetailSection title="状态时间线">
          <OperationTimeline :nodes="detail.timeline" />
        </DetailSection>

        <DetailSection title="操作" style="margin-top: 16px">
          <el-button @click="openPreview(detail.attachments)">查看附件</el-button>
          <PermissionButton
            v-if="canHandleOrder"
            permission="enterprise:order:handle"
            plain
            style="margin-left: 12px"
          >
            更新执行记录
          </PermissionButton>
        </DetailSection>
      </el-col>
    </el-row>

    <AttachmentPreview v-model:visible="previewVisible" :files="previewFiles" />
  </PageContainer>
</template>
