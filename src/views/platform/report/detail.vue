<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { ref } from 'vue'
import { useRoute } from 'vue-router'

import { getReportDetail, invalidateReport, toggleReportHidden } from '@/api/modules/report'
import PageContainer from '@/components/PageContainer.vue'
import ActionPanel from '@/components-business/ActionPanel/index.vue'
import AttachmentPreview from '@/components-business/AttachmentPreview/index.vue'
import DetailSection from '@/components-business/DetailSection/index.vue'
import OperationTimeline from '@/components-business/OperationTimeline/index.vue'
import PermissionButton from '@/components-business/PermissionButton/index.vue'
import StatusTag from '@/components-business/StatusTag/index.vue'
import { REPORT_STATUS_MAP } from '@/constants/dicts'
import type { AttachmentItem, ReportDetail } from '@/types/business'

const route = useRoute()

const detail = ref<ReportDetail | null>(null)
const previewVisible = ref(false)
const previewFiles = ref<AttachmentItem[]>([])
const invalidateVisible = ref(false)
const invalidateReason = ref('')

async function loadDetail() {
  detail.value = await getReportDetail(String(route.params.id))
}

function openPreview() {
  if (!detail.value) return
  previewFiles.value = [detail.value.reportFile]
  previewVisible.value = true
}

async function submitInvalidate() {
  if (!detail.value || !invalidateReason.value.trim()) {
    ElMessage.warning('请输入作废原因')
    return
  }

  await invalidateReport(detail.value.id, invalidateReason.value.trim())
  ElMessage.success('报告已作废')
  invalidateVisible.value = false
  invalidateReason.value = ''
  await loadDetail()
}

async function handleToggleHidden() {
  if (!detail.value) return
  await toggleReportHidden(detail.value.id)
  ElMessage.success(detail.value.hidden ? '已取消隐藏' : '已隐藏报告')
  await loadDetail()
}

void loadDetail()
</script>

<template>
  <PageContainer>
    <el-row v-if="detail" :gutter="16">
      <el-col :span="16">
        <DetailSection title="报告基础信息">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="报告编号">{{ detail.reportNo }}</el-descriptions-item>
            <el-descriptions-item label="关联订单">{{ detail.orderNo }}</el-descriptions-item>
            <el-descriptions-item label="企业名称">{{ detail.enterpriseName }}</el-descriptions-item>
            <el-descriptions-item label="项目名称">{{ detail.projectName }}</el-descriptions-item>
            <el-descriptions-item label="发布时间">{{ detail.publishAt }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <StatusTag :status="detail.status" :map="REPORT_STATUS_MAP" />
            </el-descriptions-item>
            <el-descriptions-item label="隐藏状态">
              {{ detail.hidden ? '已隐藏' : '可见' }}
            </el-descriptions-item>
          </el-descriptions>
        </DetailSection>

        <DetailSection title="抽查记录" style="margin-top: 16px">
          <OperationTimeline :nodes="detail.extractRecords" />
        </DetailSection>
      </el-col>

      <el-col :span="8">
        <ActionPanel>
          <el-button
            type="primary"
            class="action-panel-button action-panel-button--primary"
            @click="openPreview"
          >
            预览
          </el-button>
          <el-button
            tag="a"
            :href="detail.reportFile.url"
            target="_blank"
            class="action-panel-button action-panel-button--soft"
          >
            下载
          </el-button>
          <PermissionButton
            permission="report:manage:view"
            type="danger"
            plain
            class="action-panel-button action-panel-button--danger"
            @click="invalidateVisible = true"
          >
            作废
          </PermissionButton>
          <PermissionButton
            permission="report:manage:view"
            plain
            class="action-panel-button action-panel-button--muted"
            @click="handleToggleHidden"
          >
            {{ detail.hidden ? '取消隐藏' : '隐藏报告' }}
          </PermissionButton>
        </ActionPanel>
      </el-col>
    </el-row>

    <el-dialog v-model="invalidateVisible" title="作废报告" width="520px">
      <el-input
        v-model="invalidateReason"
        type="textarea"
        :rows="5"
        placeholder="请输入作废原因"
      />
      <template #footer>
        <el-button @click="invalidateVisible = false">取消</el-button>
        <el-button type="danger" @click="submitInvalidate">确认作废</el-button>
      </template>
    </el-dialog>

    <AttachmentPreview v-model:visible="previewVisible" :files="previewFiles" />
  </PageContainer>
</template>
