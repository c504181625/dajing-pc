<script setup lang="ts">
import { Document } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { getEnterpriseAuditDetail, submitEnterpriseAuditAction } from '@/api/modules/enterprise'
import AttachmentPreview from '@/components-business/AttachmentPreview/index.vue'
import AuditActionBar from '@/components-business/AuditActionBar/index.vue'
import DetailSection from '@/components-business/DetailSection/index.vue'
import EmptyBlock from '@/components-business/EmptyBlock/index.vue'
import PageContainer from '@/components-business/PageContainer/index.vue'
import OperationTimeline from '@/components-business/OperationTimeline/index.vue'
import SectionCard from '@/components-business/SectionCard/index.vue'
import StatusTag from '@/components-business/StatusTag/index.vue'
import { AUDIT_STATUS_MAP, SERVICE_TYPE_OPTIONS } from '@/constants/dicts'
import { AuditAction, AuditStatus } from '@/enum/status'
import type { AttachmentItem, EnterpriseAuditDetail } from '@/types/business'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const actionLoading = ref(false)
const detail = ref<EnterpriseAuditDetail | null>(null)
const previewVisible = ref(false)
const previewFiles = ref<AttachmentItem[]>([])

const canOperate = computed(() => {
  return (
    detail.value?.status === AuditStatus.Pending || detail.value?.status === AuditStatus.Supplement
  )
})

const attachmentGroups = computed(() => {
  if (!detail.value) return []
  return [
    { title: '营业执照', file: detail.value.businessLicense },
    ...detail.value.qualificationFiles.map((file) => ({
      title: '资质附件',
      file,
    })),
  ]
})

const verifyItems = computed(() => {
  if (!detail.value) return []
  return [
    {
      label: '营业执照',
      value: '主体信息已提交',
      status: 'success',
    },
    {
      label: '资质附件',
      value: `${detail.value.qualificationFiles.length} 份待核验`,
      status: detail.value.qualificationFiles.length ? 'warning' : 'danger',
    },
    {
      label: '证书有效期',
      value: detail.value.qualifications.some((item) => item.status === 'expiring')
        ? '存在临期证书'
        : '状态正常',
      status: detail.value.qualifications.some((item) => item.status === 'expiring')
        ? 'warning'
        : 'success',
    },
  ]
})

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

function getServiceLabel(value: string) {
  return SERVICE_TYPE_OPTIONS.find((item) => item.value === value)?.label || value
}

async function handleSubmit(payload: { action: AuditAction; remark: string }) {
  if (!detail.value) return
  if (payload.action === AuditAction.Reject && !payload.remark.trim()) {
    ElMessage.warning('驳回原因必填')
    return
  }

  actionLoading.value = true
  try {
    await submitEnterpriseAuditAction({
      auditId: detail.value.id,
      action: payload.action,
      remark: payload.remark || '系统示例提交',
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
    title="机构审核详情"
    :subtitle="
      detail
        ? `${detail.enterpriseName} · 请重点核验企业基础资料、服务范围和资质附件。`
        : '加载审核详情中...'
    "
  >
    <template #extra>
      <el-button @click="router.back()">返回列表</el-button>
      <StatusTag v-if="detail" :status="detail.status" :map="AUDIT_STATUS_MAP" />
    </template>

    <EmptyBlock
      v-if="!loading && !detail"
      title="未找到审核信息"
      description="当前审核记录不存在，可能已失效或被删除。"
    />

    <div v-else v-loading="loading" class="detail-grid-2">
      <div class="left-column">
        <SectionCard
          title="企业信息摘要"
          description="用于快速确认企业主体、联系人和地址等基础信息。"
        >
          <el-descriptions v-if="detail" :column="2" border>
            <el-descriptions-item label="企业名称">{{
              detail.enterpriseName
            }}</el-descriptions-item>
            <el-descriptions-item label="企业类型">{{
              detail.enterpriseType
            }}</el-descriptions-item>
            <el-descriptions-item label="统一社会信用代码">{{
              detail.socialCreditCode
            }}</el-descriptions-item>
            <el-descriptions-item label="注册资本">{{
              detail.registeredCapital
            }}</el-descriptions-item>
            <el-descriptions-item label="公司性质">{{ detail.companyType }}</el-descriptions-item>
            <el-descriptions-item label="法定代表人">{{ detail.legalPerson }}</el-descriptions-item>
            <el-descriptions-item label="联系人">{{ detail.contactName }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{ detail.contactPhone }}</el-descriptions-item>
            <el-descriptions-item label="联系邮箱">{{ detail.email }}</el-descriptions-item>
            <el-descriptions-item label="提交时间">{{ detail.submitTime }}</el-descriptions-item>
            <el-descriptions-item label="办公地址" :span="2">
              {{ detail.province }}{{ detail.city }}{{ detail.district }}{{ detail.address }}
            </el-descriptions-item>
          </el-descriptions>
        </SectionCard>

        <DetailSection
          title="服务范围与附件"
          description="集中展示机构申请的服务范围以及营业执照、资质材料。"
        >
          <div v-if="detail" class="service-tags">
            <el-tag v-for="service in detail.serviceTypes" :key="service" effect="plain">
              {{ getServiceLabel(service) }}
            </el-tag>
          </div>

          <div class="attachment-grid">
            <div
              v-for="item in attachmentGroups"
              :key="item.file.id"
              class="attachment-card"
              @click="openPreview([item.file])"
            >
              <div class="attachment-icon">
                <el-icon><Document /></el-icon>
              </div>
              <div class="attachment-copy">
                <strong>{{ item.file.name }}</strong>
                <span>{{ item.title }} · {{ item.file.fileType.toUpperCase() }}</span>
              </div>
              <span class="attachment-link">预览文件</span>
            </div>
          </div>
        </DetailSection>

        <DetailSection
          title="证照核验摘要"
          description="把审核最关心的证照与附件核验结论前置展示。"
        >
          <div class="verify-grid">
            <article v-for="item in verifyItems" :key="item.label" class="verify-card">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
              <el-tag :type="item.status" effect="light">
                {{
                  item.status === 'success'
                    ? '已就绪'
                    : item.status === 'warning'
                      ? '需重点核验'
                      : '待补充'
                }}
              </el-tag>
            </article>
          </div>
        </DetailSection>

        <DetailSection title="资质证书" description="重点关注证书有效期、编号和适用服务范围。">
          <div v-if="detail?.qualifications.length" class="qualification-list">
            <div
              v-for="qualification in detail.qualifications"
              :key="qualification.id"
              class="qualification-item"
            >
              <div>
                <div class="qualification-name">{{ qualification.name }}</div>
                <div class="qualification-no">证书编号：{{ qualification.number }}</div>
              </div>
              <div class="qualification-meta">
                <el-tag
                  :type="
                    qualification.status === 'valid'
                      ? 'success'
                      : qualification.status === 'expiring'
                        ? 'warning'
                        : 'danger'
                  "
                >
                  {{
                    qualification.status === 'valid'
                      ? '有效'
                      : qualification.status === 'expiring'
                        ? '即将到期'
                        : '已过期'
                  }}
                </el-tag>
                <span>有效期至 {{ qualification.validUntil }}</span>
              </div>
            </div>
          </div>
          <EmptyBlock
            v-else
            title="暂无资质证书"
            description="企业暂未上传资质证书，请结合审核意见要求其补充材料。"
          />
        </DetailSection>
      </div>

      <div class="right-column">
        <div class="sticky-panel">
          <AuditActionBar :loading="actionLoading" :disabled="!canOperate" @submit="handleSubmit" />

          <SectionCard
            title="审核说明"
            description="审核状态、审核人和补充意见会集中展示在右侧，便于连续处理。"
          >
            <el-descriptions v-if="detail" :column="1" border>
              <el-descriptions-item label="当前状态">
                <StatusTag :status="detail.status" :map="AUDIT_STATUS_MAP" />
              </el-descriptions-item>
              <el-descriptions-item label="当前审核人">{{
                detail.reviewerName || '未分配'
              }}</el-descriptions-item>
              <el-descriptions-item label="最新备注">{{
                detail.remark || '暂无备注'
              }}</el-descriptions-item>
            </el-descriptions>
          </SectionCard>
          <DetailSection
            title="审核记录"
            description="时间线记录每次提交、分配、补充材料和最终审核动作。"
          >
            <OperationTimeline v-if="detail" :nodes="detail.auditRecords" />
          </DetailSection>
        </div>
      </div>
    </div>

    <AttachmentPreview v-model:visible="previewVisible" :files="previewFiles" />
  </PageContainer>
</template>

<style scoped lang="scss">
.left-column,
.right-column {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.sticky-panel {
  position: sticky;
  top: 0;
  z-index: 10;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.service-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.attachment-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.attachment-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--dj-color-border);
  border-radius: 14px;
  background: linear-gradient(180deg, #fff 0%, #fbfcff 100%);
  cursor: pointer;
  text-align: left;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.attachment-card:hover {
  border-color: rgb(31 94 255 / 30%);
  box-shadow: 0 10px 22px rgb(31 94 255 / 8%);
}

.attachment-icon {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: rgb(31 94 255 / 10%);
  color: var(--dj-color-primary);
  font-size: 18px;
}

.attachment-copy {
  flex: 1;
  min-width: 0;
}

.attachment-copy strong {
  display: block;
  font-size: 14px;
  color: var(--dj-color-text-primary);
}

.attachment-copy span {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: var(--dj-color-text-regular);
}

.attachment-link {
  color: var(--dj-color-primary);
  font-size: 13px;
  white-space: nowrap;
}

.qualification-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.verify-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.verify-card {
  padding: 16px;
  border: 1px solid var(--dj-color-border);
  border-radius: 14px;
  background: linear-gradient(180deg, #fff 0%, #fbfcff 100%);
}

.verify-card span {
  font-size: 12px;
  color: var(--dj-color-text-secondary);
}

.verify-card strong {
  display: block;
  margin: 10px 0;
  font-size: 16px;
  color: var(--dj-color-text-primary);
}

.qualification-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  border: 1px solid var(--dj-color-border);
  border-radius: 14px;
  background: linear-gradient(180deg, #fff 0%, #fbfcff 100%);
}

.qualification-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--dj-color-text-primary);
}

.qualification-no,
.qualification-meta span {
  margin-top: 6px;
  font-size: 13px;
  color: var(--dj-color-text-regular);
}

.qualification-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

@media (max-width: 1280px) {
  .attachment-grid {
    grid-template-columns: 1fr;
  }

  .verify-grid {
    grid-template-columns: 1fr;
  }

  .sticky-panel {
    position: static;
  }
}
</style>
