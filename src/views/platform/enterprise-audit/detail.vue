<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { getEnterpriseAuditDetail, submitAuditAction } from '@/api/modules/audit'
import DictTag from '@/components/DictTag.vue'
import PageContainer from '@/components/PageContainer.vue'
import StatusTag from '@/components/StatusTag.vue'
import AuditActionBar from '@/components-business/AuditActionBar.vue'
import EnterpriseQualificationCard from '@/components-business/EnterpriseQualificationCard.vue'
import EnterpriseSummaryCard from '@/components-business/EnterpriseSummaryCard.vue'
import FilePreview from '@/components-business/FilePreview.vue'
import { AUDIT_STATUS_MAP, SERVICE_TYPE_OPTIONS } from '@/constants/dicts'
import { AuditStatus } from '@/enum/common'
import type { AttachmentItem, EnterpriseAuditDetail } from '@/types/business'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const actionLoading = ref(false)
const detail = ref<EnterpriseAuditDetail>()
const previewVisible = ref(false)
const previewFiles = ref<AttachmentItem[]>([])

const canOperate = computed(() => detail.value?.status === AuditStatus.Pending || detail.value?.status === AuditStatus.Supplement)

async function loadDetail() {
  loading.value = true
  try {
    detail.value = await getEnterpriseAuditDetail(String(route.params.id))
  } finally {
    loading.value = false
  }
}

function openPreview(files: AttachmentItem[]) {
  previewFiles.value = files
  previewVisible.value = true
}

async function handleAudit(action: 'approve' | 'reject' | 'supplement', remark: string) {
  if (!detail.value) return
  actionLoading.value = true
  try {
    await submitAuditAction({
      auditId: detail.value.id,
      action,
      remark: remark || '系统示例提交',
    })
    ElMessage.success('审核动作已提交')
    await loadDetail()
  } finally {
    actionLoading.value = false
  }
}

loadDetail()
</script>

<template>
  <PageContainer
    :title="detail?.enterpriseName || '企业审核详情'"
    subtitle="推荐采用新页面承载审核详情，将企业资料、证照、附件与审核动作放在同一上下文中完成。"
  >
    <template #extra>
      <el-button @click="router.back()">返回列表</el-button>
      <StatusTag v-if="detail" :status="detail.status" :map="AUDIT_STATUS_MAP" />
    </template>

    <el-row v-loading="loading" :gutter="16">
      <el-col :span="16">
        <EnterpriseSummaryCard v-if="detail" :detail="detail" />

        <el-card v-if="detail" shadow="never" class="app-card">
          <template #header>
            <div class="section-header">
              <span>服务范围与附件</span>
              <el-space>
                <el-button text type="primary" @click="openPreview([detail.businessLicense])">营业执照</el-button>
                <el-button text type="primary" @click="openPreview(detail.qualificationFiles)">资质附件</el-button>
              </el-space>
            </div>
          </template>

          <div class="service-tags">
            <DictTag v-for="service in detail.serviceTypes" :key="service" :value="service" :options="SERVICE_TYPE_OPTIONS" />
          </div>

          <el-descriptions :column="2" border class="detail-desc">
            <el-descriptions-item label="企业类型">{{ detail.companyType }}</el-descriptions-item>
            <el-descriptions-item label="注册资本">{{ detail.registeredCapital }}</el-descriptions-item>
            <el-descriptions-item label="营业执照">
              {{ detail.businessLicense.name }}
            </el-descriptions-item>
            <el-descriptions-item label="联系邮箱">{{ detail.email }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <EnterpriseQualificationCard v-if="detail" :qualifications="detail.qualifications" />
      </el-col>

      <el-col :span="8">
        <AuditActionBar
          :loading="actionLoading"
          :disabled="!canOperate"
          @approve="handleAudit('approve', $event)"
          @reject="handleAudit('reject', $event)"
          @supplement="handleAudit('supplement', $event)"
        />

        <el-card v-if="detail" shadow="never" class="app-card history-card">
          <template #header>
            <span>审核记录</span>
          </template>

          <el-timeline>
            <el-timeline-item
              v-for="record in detail.auditRecords"
              :key="record.id"
              :timestamp="record.createdAt"
              type="primary"
              placement="top"
            >
              <div class="history-title">{{ record.action }}</div>
              <div class="history-meta">{{ record.operator }}</div>
              <div class="history-desc">{{ record.remark }}</div>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>

    <FilePreview v-model:visible="previewVisible" :files="previewFiles" />
  </PageContainer>
</template>

<style scoped lang="scss">
.section-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
}

.service-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.detail-desc {
  margin-top: 12px;
}

.history-card {
  margin-top: 16px;
}

.history-title {
  font-weight: 600;
}

.history-meta,
.history-desc {
  margin-top: 4px;
  font-size: 13px;
  color: var(--dj-color-text-regular);
}
</style>
