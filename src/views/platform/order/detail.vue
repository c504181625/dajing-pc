<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { forceCloseOrder, getOrderDetail } from '@/api/modules/order'
import PageContainer from '@/components/PageContainer.vue'
import AttachmentPreview from '@/components-business/AttachmentPreview/index.vue'
import DetailSection from '@/components-business/DetailSection/index.vue'
import OperationTimeline from '@/components-business/OperationTimeline/index.vue'
import PermissionButton from '@/components-business/PermissionButton/index.vue'
import StatusTag from '@/components-business/StatusTag/index.vue'
import { ORDER_STATUS_MAP, PAYMENT_STATUS_MAP, REPORT_STATUS_MAP, SAMPLE_RECEIVE_STATUS_MAP } from '@/constants/dicts'
import type { AttachmentItem, OrderDetail } from '@/types/business'

const route = useRoute()
const router = useRouter()
const detail = ref<OrderDetail | null>(null)
const previewVisible = ref(false)
const previewFiles = ref<AttachmentItem[]>([])
const forceCloseVisible = ref(false)
const closeReason = ref('')

async function loadDetail() {
  detail.value = await getOrderDetail(String(route.params.id))
}

function openPreview(files: AttachmentItem[]) {
  previewFiles.value = files
  previewVisible.value = true
}

async function submitForceClose() {
  if (!detail.value || !closeReason.value.trim()) {
    ElMessage.warning('请输入关闭原因')
    return
  }
  await forceCloseOrder(detail.value.id, closeReason.value)
  ElMessage.success('订单已强制关闭')
  forceCloseVisible.value = false
}

loadDetail()
</script>

<template>
  <PageContainer :title="detail?.orderNo || '订单详情'" subtitle="订单详情统一承载基础信息、样品、检测项目、状态流、异常记录、报告和评价信息。">
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

        <DetailSection title="寄样 / 上门取样信息" style="margin-top: 16px">
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
            <el-button text type="primary" @click="openPreview(detail.reportInfo.reportFile ? [detail.reportInfo.reportFile] : [])">
              预览报告文件
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

        <DetailSection title="退款记录（预留）" style="margin-top: 16px">
          <el-empty description="一期先预留字段和区域，后续接入退款记录接口。" />
        </DetailSection>
      </el-col>

      <el-col :span="8">
        <DetailSection title="订单状态流">
          <OperationTimeline :nodes="detail.timeline" />
        </DetailSection>

        <DetailSection title="操作" style="margin-top: 16px">
          <PermissionButton permission="order:manage:view" type="danger" plain @click="forceCloseVisible = true">
            强制关闭
          </PermissionButton>
          <el-button style="margin-left: 12px" @click="openPreview(detail.attachments)">查看附件</el-button>
        </DetailSection>
      </el-col>
    </el-row>

    <el-dialog v-model="forceCloseVisible" title="强制关闭订单" width="520px">
      <el-input v-model="closeReason" type="textarea" :rows="5" placeholder="请输入强制关闭原因" />
      <template #footer>
        <el-button @click="forceCloseVisible = false">取消</el-button>
        <el-button type="danger" @click="submitForceClose">确认关闭</el-button>
      </template>
    </el-dialog>

    <AttachmentPreview v-model:visible="previewVisible" :files="previewFiles" />
  </PageContainer>
</template>
