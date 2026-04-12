<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { reactive, ref } from 'vue'
import { useRoute } from 'vue-router'

import { forceCloseOrder, getOrderDetail, updateOrderDetail } from '@/api/modules/order'
import PageContainer from '@/components/PageContainer.vue'
import ActionPanel from '@/components-business/ActionPanel/index.vue'
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
import type { AttachmentItem, OrderDetail, OrderUpdatePayload } from '@/types/business'

const route = useRoute()

const detail = ref<OrderDetail | null>(null)
const previewVisible = ref(false)
const previewFiles = ref<AttachmentItem[]>([])
const forceCloseVisible = ref(false)
const closeReason = ref('')
const saving = ref(false)

const editForm = reactive<OrderUpdatePayload>({
  orgName: '',
  projectName: '',
  amount: 0,
  receiverName: '',
  receiverPhone: '',
  receiverAddress: '',
})

function syncEditForm(source: OrderDetail) {
  editForm.orgName = source.orgName
  editForm.projectName = source.projectName
  editForm.amount = source.amount
  editForm.receiverName = source.receiverName
  editForm.receiverPhone = source.receiverPhone
  editForm.receiverAddress = source.receiverAddress
}

async function loadDetail() {
  detail.value = await getOrderDetail(String(route.params.id))
  if (detail.value) syncEditForm(detail.value)
}

function openPreview(files: AttachmentItem[]) {
  previewFiles.value = files
  previewVisible.value = true
}

async function handleSave() {
  if (!detail.value) return

  saving.value = true
  try {
    await updateOrderDetail(detail.value.id, {
      orgName: editForm.orgName.trim(),
      projectName: editForm.projectName.trim(),
      amount: Number(editForm.amount),
      receiverName: editForm.receiverName.trim(),
      receiverPhone: editForm.receiverPhone.trim(),
      receiverAddress: editForm.receiverAddress.trim(),
    })
    ElMessage.success('订单信息已保存')
    await loadDetail()
  } finally {
    saving.value = false
  }
}

async function submitForceClose() {
  if (!detail.value || !closeReason.value.trim()) {
    ElMessage.warning('请输入强制关闭原因')
    return
  }

  await forceCloseOrder(detail.value.id, closeReason.value)
  ElMessage.success('订单已强制关闭')
  forceCloseVisible.value = false
  closeReason.value = ''
  await loadDetail()
}

loadDetail()
</script>

<template>
  <PageContainer>
    <el-row v-if="detail" :gutter="16">
      <el-col :span="16">
        <DetailSection title="订单基础信息" description="进入编辑页后可直接修改订单基础信息并保存。">
          <el-form label-position="top" class="edit-form">
            <div class="edit-grid">
              <el-form-item label="订单号">
                <el-input :model-value="detail.orderNo" disabled />
              </el-form-item>
              <el-form-item label="需求企业">
                <el-input :model-value="detail.enterpriseName" disabled />
              </el-form-item>
              <el-form-item label="服务机构">
                <el-input v-model="editForm.orgName" placeholder="请输入服务机构" />
              </el-form-item>
              <el-form-item label="项目名称">
                <el-input v-model="editForm.projectName" placeholder="请输入项目名称" />
              </el-form-item>
              <el-form-item label="订单金额">
                <el-input-number
                  v-model="editForm.amount"
                  :min="0"
                  :precision="2"
                  controls-position="right"
                  class="full-width"
                />
              </el-form-item>
              <el-form-item label="订单状态">
                <div class="status-wrap">
                  <StatusTag :status="detail.status" :map="ORDER_STATUS_MAP" />
                </div>
              </el-form-item>
              <el-form-item label="支付状态">
                <div class="status-wrap">
                  <StatusTag :status="detail.paymentStatus" :map="PAYMENT_STATUS_MAP" />
                </div>
              </el-form-item>
              <el-form-item label="样品状态">
                <div class="status-wrap">
                  <StatusTag :status="detail.sampleReceiveStatus" :map="SAMPLE_RECEIVE_STATUS_MAP" />
                </div>
              </el-form-item>
            </div>
          </el-form>
        </DetailSection>

        <DetailSection title="收样信息" class="section-gap">
          <el-form label-position="top">
            <div class="edit-grid">
              <el-form-item label="收样人">
                <el-input v-model="editForm.receiverName" placeholder="请输入收样人" />
              </el-form-item>
              <el-form-item label="联系电话">
                <el-input v-model="editForm.receiverPhone" placeholder="请输入联系电话" />
              </el-form-item>
              <el-form-item label="收样地址" class="edit-grid-span-2">
                <el-input v-model="editForm.receiverAddress" placeholder="请输入收样地址" />
              </el-form-item>
            </div>
          </el-form>
        </DetailSection>

        <DetailSection title="样品信息" class="section-gap">
          <el-table :data="detail.sampleItems" border>
            <el-table-column prop="sampleName" label="样品名称" min-width="180" />
            <el-table-column prop="sampleCode" label="样品编号" min-width="180" />
            <el-table-column prop="sampleCount" label="数量" width="80" />
            <el-table-column prop="sampleRemark" label="备注" min-width="180" />
          </el-table>
        </DetailSection>

        <DetailSection title="检测项目" class="section-gap">
          <el-table :data="detail.projectItems" border>
            <el-table-column prop="projectName" label="项目名称" min-width="180" />
            <el-table-column prop="standardName" label="检测标准" min-width="180" />
            <el-table-column prop="price" label="金额" width="120" />
          </el-table>
        </DetailSection>

        <DetailSection title="报告信息" class="section-gap">
          <template #extra>
            <el-button
              text
              type="primary"
              @click="openPreview(detail.reportInfo.reportFile ? [detail.reportInfo.reportFile] : [])"
            >
              预览报告文件
            </el-button>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="报告编号">
              {{ detail.reportInfo.reportNo || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="报告状态">
              <StatusTag :status="detail.reportInfo.reportStatus" :map="REPORT_STATUS_MAP" />
            </el-descriptions-item>
          </el-descriptions>
        </DetailSection>

        <DetailSection title="异常处理记录" class="section-gap">
          <OperationTimeline :nodes="detail.exceptionRecords" />
        </DetailSection>
      </el-col>

      <el-col :span="8">
        <DetailSection title="订单状态流">
          <OperationTimeline :nodes="detail.timeline" />
        </DetailSection>

        <ActionPanel class="section-gap">
          <el-button
            type="primary"
            class="action-panel-button action-panel-button--primary"
            :loading="saving"
            @click="handleSave"
          >
            保存修改
          </el-button>
          <PermissionButton
            permission="order:manage:view"
            type="danger"
            plain
            class="action-panel-button action-panel-button--danger"
            @click="forceCloseVisible = true"
          >
            强制关闭
          </PermissionButton>
          <el-button class="action-panel-button action-panel-button--soft" @click="openPreview(detail.attachments)">
            查看附件
          </el-button>
        </ActionPanel>
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

<style scoped lang="scss">
.section-gap {
  margin-top: 16px;
}

.edit-form :deep(.el-form-item) {
  margin-bottom: 0;
}

.edit-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.edit-grid-span-2 {
  grid-column: span 2;
}

.full-width {
  width: 100%;
}

.status-wrap {
  min-height: 32px;
  display: flex;
  align-items: center;
}

@media (max-width: 900px) {
  .edit-grid {
    grid-template-columns: 1fr;
  }

  .edit-grid-span-2 {
    grid-column: span 1;
  }
}
</style>
