<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { getConsultDetail, replyConsult } from '@/api/modules/consult'
import { createDemand } from '@/api/modules/demand'
import AttachmentPreview from '@/components-business/AttachmentPreview/index.vue'
import DetailSection from '@/components-business/DetailSection/index.vue'
import EmptyBlock from '@/components-business/EmptyBlock/index.vue'
import PageContainer from '@/components-business/PageContainer/index.vue'
import OperationTimeline from '@/components-business/OperationTimeline/index.vue'
import PermissionButton from '@/components-business/PermissionButton/index.vue'
import SectionCard from '@/components-business/SectionCard/index.vue'
import StatusTag from '@/components-business/StatusTag/index.vue'
import { CONSULT_STATUS_MAP, SERVICE_TYPE_OPTIONS } from '@/constants/dicts'
import { PERMISSION_CODE } from '@/enum/permission'
import { PublishMode, ServiceType } from '@/enum/status'
import type { AttachmentItem, ConsultDetail } from '@/types/business'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const currentDetail = ref<ConsultDetail | null>(null)
const previewVisible = ref(false)
const previewFiles = ref<AttachmentItem[]>([])
const replyVisible = ref(false)
const transferDemandVisible = ref(false)
const transferCustomerVisible = ref(false)
const replyContent = ref('')
const selectedCustomer = ref('')

const customerOptions = [
  { label: '客服一组 / 王敏', value: 'service-001' },
  { label: '客服二组 / 李娜', value: 'service-002' },
  { label: '客服三组 / 张倩', value: 'service-003' },
]

const transferDemandForm = reactive({
  title: '',
  serviceType: ServiceType.Standard as ServiceType,
  publishMode: PublishMode.PlatformAssign as PublishMode,
  contactName: '',
  contactPhone: '',
  content: '',
})

const isHandleMode = computed(() => route.query.mode === 'handle')

async function loadDetail() {
  loading.value = true
  try {
    currentDetail.value = await getConsultDetail(String(route.params.id))
  } finally {
    loading.value = false
  }
}

function openPreview(files: AttachmentItem[]) {
  previewFiles.value = files
  previewVisible.value = true
}

function handleBackList() {
  router.push('/operator/business/consult')
}

function openReplyDialog() {
  replyContent.value = ''
  replyVisible.value = true
}

function openTransferDemand() {
  if (!currentDetail.value) return
  transferDemandForm.title = currentDetail.value.title
  transferDemandForm.serviceType = ServiceType.Standard
  transferDemandForm.publishMode = PublishMode.PlatformAssign
  transferDemandForm.contactName = currentDetail.value.contactName
  transferDemandForm.contactPhone = currentDetail.value.contactPhone
  transferDemandForm.content = currentDetail.value.content
  transferDemandVisible.value = true
}

async function submitTransferDemand() {
  await createDemand({ ...transferDemandForm })
  ElMessage.success('已转为需求')
  transferDemandVisible.value = false
}

function openTransferCustomer() {
  selectedCustomer.value = ''
  transferCustomerVisible.value = true
}

function submitTransferCustomer() {
  if (!selectedCustomer.value) {
    ElMessage.warning('请选择客服')
    return
  }

  ElMessage.success('已转交客服跟进')
  transferCustomerVisible.value = false
}

async function submitReply() {
  if (!currentDetail.value || !replyContent.value.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }

  await replyConsult(currentDetail.value.id, replyContent.value)
  ElMessage.success('回复成功')
  replyVisible.value = false
  await loadDetail()
}

watch(
  () => [route.params.id, route.query.mode],
  () => {
    void loadDetail()
  },
  { immediate: true },
)
</script>

<template>
  <PageContainer :title="isHandleMode ? '处理咨询' : '咨询详情'">
    <template #extra>
      <el-button @click="handleBackList">返回列表</el-button>
    </template>

    <EmptyBlock
      v-if="!loading && !currentDetail"
      title="未找到咨询记录"
      description="当前咨询记录不存在，可能已被关闭或删除。"
    />

    <div v-else v-loading="loading" class="detail-stack">
      <DetailSection title="咨询信息">
        <el-descriptions v-if="currentDetail" :column="2" border>
          <el-descriptions-item label="咨询标题">{{ currentDetail.title }}</el-descriptions-item>
          <el-descriptions-item label="企业名称">
            {{ currentDetail.enterpriseName }}
          </el-descriptions-item>
          <el-descriptions-item label="联系人">{{ currentDetail.contactName }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">
            {{ currentDetail.contactPhone }}
          </el-descriptions-item>
          <el-descriptions-item label="提交时间" :span="2">
            {{ currentDetail.createdAt }}
          </el-descriptions-item>
          <el-descriptions-item label="咨询内容" :span="2">
            {{ currentDetail.content || '暂无咨询内容' }}
          </el-descriptions-item>
        </el-descriptions>
      </DetailSection>

      <DetailSection title="附件预览">
        <div v-if="currentDetail?.attachments.length" class="attachment-list">
          <div v-for="file in currentDetail.attachments" :key="file.id" class="attachment-card">
            <div>
              <div class="attachment-name">{{ file.name }}</div>
              <div class="attachment-meta">{{ file.fileType.toUpperCase() }}</div>
            </div>
            <el-button type="primary" link @click="openPreview([file])">预览文件</el-button>
          </div>
        </div>
        <EmptyBlock
          v-else
          title="暂无附件"
          description="当前咨询未上传附件，可直接处理文字内容。"
        />
      </DetailSection>

      <SectionCard v-if="isHandleMode" title="操作区">
        <div class="top-layout">
          <el-descriptions v-if="currentDetail" :column="2" border class="operate-summary">
            <el-descriptions-item label="当前状态">
              <StatusTag :status="currentDetail.status" :map="CONSULT_STATUS_MAP" />
            </el-descriptions-item>
            <el-descriptions-item label="附件数量">
              {{ currentDetail.attachments.length }}
            </el-descriptions-item>
            <el-descriptions-item label="企业名称">
              {{ currentDetail.enterpriseName || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="提交时间">
              {{ currentDetail.createdAt || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="联系人">
              {{ currentDetail.contactName || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="联系电话">
              {{ currentDetail.contactPhone || '-' }}
            </el-descriptions-item>
          </el-descriptions>

          <div class="action-stack">
            <PermissionButton
              :permission="PERMISSION_CODE.operatorConsultHandle"
              class="action-button action-button--primary"
              @click="openReplyDialog"
            >
              咨询回复
            </PermissionButton>
            <PermissionButton
              :permission="PERMISSION_CODE.operatorConsultHandle"
              class="action-button action-button--soft"
              @click="openTransferDemand"
            >
              转为需求
            </PermissionButton>
            <PermissionButton
              :permission="PERMISSION_CODE.operatorConsultHandle"
              class="action-button action-button--soft"
              @click="openTransferCustomer"
            >
              转交客服
            </PermissionButton>
            <el-button class="action-button action-button--muted" @click="handleBackList">
              返回列表
            </el-button>
          </div>
        </div>
      </SectionCard>

      <DetailSection title="处理记录">
        <div class="timeline-wrap">
          <OperationTimeline v-if="currentDetail" :nodes="currentDetail.replyRecords" />
        </div>
      </DetailSection>
    </div>

    <el-dialog v-model="replyVisible" title="咨询回复" width="520px">
      <el-input v-model="replyContent" type="textarea" :rows="5" placeholder="请输入回复内容" />
      <template #footer>
        <el-button @click="replyVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReply">提交回复</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="transferDemandVisible" title="转为需求" width="620px">
      <el-form label-width="92px">
        <el-form-item label="需求标题">
          <el-input v-model="transferDemandForm.title" />
        </el-form-item>
        <el-form-item label="服务类型">
          <el-select v-model="transferDemandForm.serviceType" style="width: 100%">
            <el-option
              v-for="item in SERVICE_TYPE_OPTIONS"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="发布方式">
          <el-radio-group v-model="transferDemandForm.publishMode">
            <el-radio :value="PublishMode.PlatformAssign">平台分配</el-radio>
            <el-radio :value="PublishMode.SelfSelect">自主选择</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="联系人">
          <el-input v-model="transferDemandForm.contactName" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="transferDemandForm.contactPhone" />
        </el-form-item>
        <el-form-item label="需求内容">
          <el-input v-model="transferDemandForm.content" type="textarea" :rows="5" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="transferDemandVisible = false">取消</el-button>
        <el-button type="primary" @click="submitTransferDemand">确认转为需求</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="transferCustomerVisible" title="转交客服" width="520px">
      <el-select
        v-model="selectedCustomer"
        filterable
        style="width: 100%"
        placeholder="请输入或选择客服"
      >
        <el-option
          v-for="item in customerOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <template #footer>
        <el-button @click="transferCustomerVisible = false">取消</el-button>
        <el-button type="primary" @click="submitTransferCustomer">确认转交</el-button>
      </template>
    </el-dialog>

    <AttachmentPreview v-model:visible="previewVisible" :files="previewFiles" />
  </PageContainer>
</template>

<style scoped lang="scss">
.detail-stack {
  display: grid;
  gap: 18px;
}

.top-layout {
  display: grid;
  gap: 16px;
  align-items: start;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 340px);
}

.action-stack {
  display: grid;
  gap: 12px;
  align-content: start;
}

.operate-summary {
  height: 100%;
}

.action-button {
  width: 100%;
  height: 42px;
  margin: 0;
  border-radius: 12px;
}

.action-button--primary {
  background: linear-gradient(180deg, #5ca2ff 0%, #3f8ff5 100%);
  border-color: transparent;
  color: #fff;
}

.action-button--soft {
  border-color: rgb(84 135 255 / 24%);
  background: linear-gradient(180deg, #f8fbff 0%, #edf4ff 100%);
  color: var(--dj-color-primary);
}

.action-button--muted {
  border-color: rgb(84 135 255 / 18%);
  background: #fff;
  color: var(--dj-color-text-primary);
}

.attachment-list {
  display: grid;
  gap: 12px;
}

.attachment-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  border: 1px solid var(--dj-color-border);
  border-radius: 14px;
  background: linear-gradient(180deg, #fff 0%, #fbfcff 100%);
}

.attachment-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--dj-color-text-primary);
}

.attachment-meta {
  margin-top: 4px;
  font-size: 12px;
  color: var(--dj-color-text-secondary);
}

.timeline-wrap {
  max-height: 720px;
  overflow: auto;
  padding-right: 8px;
}

@media (max-width: 960px) {
  .top-layout {
    grid-template-columns: 1fr;
  }

  .attachment-card {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
