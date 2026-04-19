<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, reactive, ref } from 'vue'

import {
  assignDemand,
  closeDemand,
  deleteDemand,
  getDemandDetail,
  getDemandList,
  replyDemand,
  searchDemandInstitutions,
  transferDemand,
  type DemandInstitutionOption,
} from '@/api/modules/demand'
import PageContainer from '@/components/PageContainer.vue'
import AttachmentPreview from '@/components-business/AttachmentPreview/index.vue'
import DetailSection from '@/components-business/DetailSection/index.vue'
import OperationTimeline from '@/components-business/OperationTimeline/index.vue'
import PermissionButton from '@/components-business/PermissionButton/index.vue'
import SearchForm from '@/components-business/SearchForm/index.vue'
import StatusTag from '@/components-business/StatusTag/index.vue'
import TablePanel from '@/components-business/TablePanel/index.vue'
import { DEMAND_STATUS_MAP, SERVICE_TYPE_OPTIONS } from '@/constants/dicts'
import { PERMISSION_CODE } from '@/enum/permission'
import { DemandStatus, PublishMode } from '@/enum/status'
import type { AttachmentItem, DemandDetail, DemandItem, DemandQuery } from '@/types/business'

const loading = ref(false)
const total = ref(0)
const tableData = ref<DemandItem[]>([])
const detailVisible = ref(false)
const handleVisible = ref(false)
const currentDetail = ref<DemandDetail | null>(null)
const previewVisible = ref(false)
const previewFiles = ref<AttachmentItem[]>([])
const replyVisible = ref(false)
const assignVisible = ref(false)
const transferVisible = ref(false)
const invalidVisible = ref(false)
const replyContent = ref('')
const invalidReason = ref('')
const institutionLoading = ref(false)
const institutionOptions = ref<DemandInstitutionOption[]>([])

const assignForm = reactive({
  institutionId: '',
  institutionName: '',
})

const transferForm = reactive({
  title: '',
  content: '',
  contactName: '',
  contactPhone: '',
  serviceType: '',
  sourceRecordId: '',
  sourceAttachments: [] as string[],
  isPublic: true,
  designatedInstitutionId: '',
  designatedInstitutionName: '',
  priority: 'medium',
  remark: '',
})

const priorityOptions = [
  { label: '普通', value: 'medium' },
  { label: '高优先级', value: 'high' },
  { label: '加急', value: 'urgent' },
]

const queryForm = reactive<DemandQuery>({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  status: '',
  serviceType: '',
})

const searchFields = [
  {
    label: '关键词',
    prop: 'keyword',
    placeholder: '需求标题/企业名称/机构名称',
  },
  {
    label: '服务类型',
    prop: 'serviceType',
    component: 'select' as const,
    placeholder: '请选择服务类型',
    options: SERVICE_TYPE_OPTIONS,
  },
  {
    label: '状态',
    prop: 'status',
    component: 'select' as const,
    placeholder: '请选择状态',
    options: Object.values(DEMAND_STATUS_MAP),
  },
]

const demandStats = computed(() => {
  const pending = tableData.value.filter((item) => item.status === DemandStatus.Pending).length
  const processing = tableData.value.filter((item) => item.status === DemandStatus.Processing).length
  const completed = tableData.value.filter((item) => item.status === DemandStatus.Completed).length

  return [
    { key: 'all', label: '全部', value: total.value },
    { key: DemandStatus.Pending, label: '待处理', value: pending },
    { key: DemandStatus.Processing, label: '处理中', value: processing },
    { key: DemandStatus.Completed, label: '已完成', value: completed },
  ]
})

async function loadData() {
  loading.value = true
  try {
    const res = await getDemandList(queryForm)
    tableData.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  queryForm.pageNum = 1
  loadData()
}

function handlePageChange() {
  loadData()
}

async function openDetail(id: string) {
  currentDetail.value = await getDemandDetail(id)
  detailVisible.value = true
  handleVisible.value = false
}

async function openHandle(id: string) {
  currentDetail.value = await getDemandDetail(id)
  handleVisible.value = true
  detailVisible.value = false
}

function openPreview(files: AttachmentItem[]) {
  previewFiles.value = files
  previewVisible.value = true
}

function getServiceTypeLabel(serviceType?: string) {
  return (
    SERVICE_TYPE_OPTIONS.find((item) => item.value === serviceType)?.label || serviceType || '-'
  )
}

async function submitReply() {
  if (!currentDetail.value || !replyContent.value.trim()) {
    ElMessage.warning('请输入处理意见')
    return
  }

  await replyDemand(currentDetail.value.id, replyContent.value)
  ElMessage.success('处理完成')
  replyVisible.value = false
  replyContent.value = ''
  currentDetail.value = await getDemandDetail(currentDetail.value.id)
  await loadData()
}

async function submitAssign() {
  if (!currentDetail.value || !assignForm.institutionName.trim()) {
    ElMessage.warning('请选择分配机构')
    return
  }

  await assignDemand(currentDetail.value.id, {
    institutionId: assignForm.institutionId,
    institutionName: assignForm.institutionName,
  })
  ElMessage.success('分配完成')
  assignVisible.value = false
  currentDetail.value = await getDemandDetail(currentDetail.value.id)
  await loadData()
}

async function loadInstitutionOptions(keyword = '') {
  institutionLoading.value = true
  try {
    institutionOptions.value = await searchDemandInstitutions(keyword)
  } finally {
    institutionLoading.value = false
  }
}

function openAssignDialog() {
  assignForm.institutionId = ''
  assignForm.institutionName = ''
  assignVisible.value = true
  void loadInstitutionOptions('')
}

function handleInstitutionChange(value: string) {
  const matched = institutionOptions.value.find((item) => item.value === value)
  assignForm.institutionId = value
  assignForm.institutionName = matched?.label || ''
}

function openTransferDialog() {
  if (!currentDetail.value) return

  transferForm.title = currentDetail.value.title
  transferForm.content = currentDetail.value.content
  transferForm.contactName = currentDetail.value.contactName
  transferForm.contactPhone = currentDetail.value.contactPhone
  transferForm.serviceType = currentDetail.value.serviceType
  transferForm.sourceRecordId = currentDetail.value.id
  transferForm.sourceAttachments = currentDetail.value.attachments.map((item) => item.url)
  transferForm.isPublic = true
  transferForm.designatedInstitutionId = ''
  transferForm.designatedInstitutionName = currentDetail.value.assignedOrg || ''
  transferForm.priority = 'medium'
  transferForm.remark = ''
  transferVisible.value = true
  void loadInstitutionOptions('')
}

function handleTransferInstitutionChange(value: string) {
  const matched = institutionOptions.value.find((item) => item.value === value)
  transferForm.designatedInstitutionId = value
  transferForm.designatedInstitutionName = matched?.label || ''
}

async function submitTransfer() {
  if (!currentDetail.value) return
  if (!transferForm.title.trim() || !transferForm.content.trim()) {
    ElMessage.warning('请补充需求标题和需求内容')
    return
  }
  if (!transferForm.contactName.trim() || !transferForm.contactPhone.trim()) {
    ElMessage.warning('请补充联系人和联系电话')
    return
  }

  const demandId = await transferDemand(currentDetail.value.id, {
    title: transferForm.title,
    content: transferForm.content,
    contactName: transferForm.contactName,
    contactPhone: transferForm.contactPhone,
    publishMode: transferForm.designatedInstitutionId
      ? PublishMode.SelfSelect
      : PublishMode.PlatformAssign,
    serviceType: transferForm.serviceType as DemandDetail['serviceType'],
    sourceRecordId: transferForm.sourceRecordId,
    sourceAttachments: transferForm.sourceAttachments,
    isPublic: transferForm.isPublic,
    priority: transferForm.priority,
    designatedInstitutionId: transferForm.designatedInstitutionId,
    designatedInstitutionName: transferForm.designatedInstitutionName,
    remark: transferForm.remark,
  })

  ElMessage.success(`转需求成功，需求单 ID：${demandId}`)
  transferVisible.value = false
  currentDetail.value = await getDemandDetail(currentDetail.value.id)
  await loadData()
}

function openInvalidDialog() {
  invalidReason.value = ''
  invalidVisible.value = true
}

async function submitInvalid() {
  if (!currentDetail.value) return
  await closeDemand(currentDetail.value.id, invalidReason.value.trim())
  ElMessage.success('当前记录已标记无效')
  invalidVisible.value = false
  currentDetail.value = await getDemandDetail(currentDetail.value.id)
  await loadData()
}

async function handleDelete(row: DemandItem) {
  try {
    await ElMessageBox.confirm(`确认删除需求“${row.title}”吗？`, '删除确认', {
      type: 'warning',
    })
  } catch {
    return
  }

  await deleteDemand(row.id)
  ElMessage.success('需求已删除')
  await loadData()

  if (currentDetail.value?.id === row.id) {
    detailVisible.value = false
    handleVisible.value = false
    currentDetail.value = null
  }
}

loadData()
</script>

<template>
  <PageContainer title="需求管理">
    <SearchForm
      v-model="queryForm"
      :fields="searchFields"
      @search="handleSearch"
      @reset="loadData"
    />

    <TablePanel
      title=""
      :total="total"
      :page-num="queryForm.pageNum"
      :page-size="queryForm.pageSize"
      @update:page-num="queryForm.pageNum = $event"
      @update:page-size="queryForm.pageSize = $event"
      @pageChange="handlePageChange"
    >
      <template #stats>
        <span v-for="item in demandStats" :key="item.key" class="table-stat">
          {{ item.label }}（{{ item.value }}）
        </span>
      </template>

      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column prop="title" label="需求标题" min-width="240" />
        <el-table-column label="服务类型" width="120">
          <template #default="{ row }">
            {{
              SERVICE_TYPE_OPTIONS.find((item) => item.value === row.serviceType)?.label ||
              row.serviceType
            }}
          </template>
        </el-table-column>
        <el-table-column prop="enterpriseName" label="需求企业" min-width="180" />
        <el-table-column label="对接模式" width="130">
          <template #default="{ row }">
            {{ row.publishMode === PublishMode.PlatformAssign ? '平台分配' : '自主选择' }}
          </template>
        </el-table-column>
        <el-table-column prop="assignedOrg" label="当前机构" min-width="180" />
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <StatusTag :status="row.status" :map="DEMAND_STATUS_MAP" />
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="220" fixed="right" align="center" header-align="center">
          <template #default="{ row }">
            <el-space wrap>
              <el-button text type="primary" @click="openDetail(row.id)">查看详情</el-button>
              <PermissionButton
                :permission="PERMISSION_CODE.operatorDemandAssign"
                text
                @click="openHandle(row.id)"
              >
                处理
              </PermissionButton>
              <PermissionButton
                :permission="PERMISSION_CODE.operatorDemandAssign"
                text
                type="danger"
                @click="handleDelete(row)"
              >
                删除
              </PermissionButton>
            </el-space>
          </template>
        </el-table-column>
      </el-table>
    </TablePanel>

    <el-drawer v-model="detailVisible" title="需求详情" size="760px">
      <template v-if="currentDetail">
        <DetailSection title="基础信息">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="需求标题">{{ currentDetail.title }}</el-descriptions-item>
            <el-descriptions-item label="需求企业">{{
              currentDetail.enterpriseName
            }}</el-descriptions-item>
            <el-descriptions-item label="服务类型">
              {{ getServiceTypeLabel(currentDetail?.serviceType) }}
            </el-descriptions-item>
            <el-descriptions-item label="对接模式">
              {{
                currentDetail.publishMode === PublishMode.PlatformAssign ? '平台分配' : '自主选择'
              }}
            </el-descriptions-item>
            <el-descriptions-item label="当前机构">{{
              currentDetail.assignedOrg || '-'
            }}</el-descriptions-item>
            <el-descriptions-item label="联系人">{{
              currentDetail.contactName
            }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{
              currentDetail.contactPhone
            }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{
              currentDetail.createdAt
            }}</el-descriptions-item>
            <el-descriptions-item label="需求内容">{{
              currentDetail.content
            }}</el-descriptions-item>
          </el-descriptions>
        </DetailSection>

        <DetailSection title="附件" style="margin-top: 16px">
          <el-button
            type="primary"
            plain
            @click="currentDetail && openPreview(currentDetail.attachments)"
          >
            查看附件
          </el-button>
        </DetailSection>

        <DetailSection title="处理记录" style="margin-top: 16px">
          <OperationTimeline :nodes="currentDetail.replyRecords" />
        </DetailSection>
      </template>
    </el-drawer>

    <el-drawer v-model="handleVisible" title="处理需求" size="760px">
      <template v-if="currentDetail">
        <DetailSection title="基础信息">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="需求标题">{{ currentDetail.title }}</el-descriptions-item>
            <el-descriptions-item label="需求企业">{{
              currentDetail.enterpriseName
            }}</el-descriptions-item>
            <el-descriptions-item label="服务类型">
              {{ getServiceTypeLabel(currentDetail?.serviceType) }}
            </el-descriptions-item>
            <el-descriptions-item label="当前机构">{{
              currentDetail.assignedOrg || '-'
            }}</el-descriptions-item>
            <el-descriptions-item label="联系人">{{
              currentDetail.contactName
            }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{
              currentDetail.contactPhone
            }}</el-descriptions-item>
            <el-descriptions-item label="需求内容">{{
              currentDetail.content
            }}</el-descriptions-item>
          </el-descriptions>
        </DetailSection>

        <DetailSection title="附件" style="margin-top: 16px">
          <el-button
            type="primary"
            plain
            @click="currentDetail && openPreview(currentDetail.attachments)"
          >
            查看附件
          </el-button>
        </DetailSection>

        <DetailSection title="处理记录" style="margin-top: 16px">
          <OperationTimeline :nodes="currentDetail.replyRecords" />
        </DetailSection>

        <div class="drawer-actions">
          <PermissionButton
            :permission="PERMISSION_CODE.operatorDemandAssign"
            class="drawer-actions__primary"
            @click="openTransferDialog"
          >
            转需求
          </PermissionButton>
          <PermissionButton
            :permission="PERMISSION_CODE.operatorDemandAssign"
            plain
            @click="openAssignDialog"
          >
            分配机构
          </PermissionButton>
          <PermissionButton
            :permission="PERMISSION_CODE.operatorDemandAssign"
            plain
            @click="replyVisible = true"
          >
            回复
          </PermissionButton>
          <PermissionButton
            :permission="PERMISSION_CODE.operatorDemandAssign"
            plain
            type="danger"
            @click="openInvalidDialog"
          >
            标记无效
          </PermissionButton>
        </div>
      </template>
    </el-drawer>

    <el-dialog v-model="assignVisible" title="分配机构" width="520px">
      <el-form label-width="88px">
        <el-form-item label="分配机构">
          <el-select
            v-model="assignForm.institutionId"
            filterable
            remote
            reserve-keyword
            clearable
            placeholder="请输入机构名称搜索"
            style="width: 100%"
            :remote-method="loadInstitutionOptions"
            :loading="institutionLoading"
            @change="handleInstitutionChange"
          >
            <el-option
              v-for="item in institutionOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="assignVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAssign">确认分配</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="replyVisible" title="处理需求" width="520px">
      <el-input v-model="replyContent" type="textarea" :rows="5" placeholder="请输入处理意见" />
      <template #footer>
        <el-button @click="replyVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReply">提交</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="transferVisible" title="转为正式需求" width="720px">
      <el-form label-width="96px" class="transfer-form">
        <el-form-item label="来源记录ID">
          <el-input v-model="transferForm.sourceRecordId" readonly />
        </el-form-item>
        <el-form-item label="需求标题">
          <el-input v-model="transferForm.title" />
        </el-form-item>
        <el-form-item label="需求内容">
          <el-input v-model="transferForm.content" type="textarea" :rows="5" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="联系人">
              <el-input v-model="transferForm.contactName" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话">
              <el-input v-model="transferForm.contactPhone" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="服务类型">
              <el-input :model-value="getServiceTypeLabel(transferForm.serviceType)" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="需求分类">
              <el-select v-model="transferForm.serviceType" style="width: 100%">
                <el-option
                  v-for="item in SERVICE_TYPE_OPTIONS"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="是否公开">
              <el-switch v-model="transferForm.isPublic" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="优先级">
              <el-select v-model="transferForm.priority" style="width: 100%">
                <el-option
                  v-for="item in priorityOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="指定机构">
          <el-select
            v-model="transferForm.designatedInstitutionId"
            filterable
            remote
            reserve-keyword
            clearable
            placeholder="可选：输入机构名称搜索"
            style="width: 100%"
            :remote-method="loadInstitutionOptions"
            :loading="institutionLoading"
            @change="handleTransferInstitutionChange"
          >
            <el-option
              v-for="item in institutionOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="附件">
          <div class="transfer-attachments">
            <template v-if="currentDetail?.attachments.length">
              <div
                v-for="file in currentDetail.attachments"
                :key="file.id"
                class="transfer-attachment-item"
              >
                <span>{{ file.name }}</span>
                <el-button type="primary" link @click="openPreview([file])">预览</el-button>
              </div>
            </template>
            <span v-else class="transfer-empty">暂无附件</span>
          </div>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="transferForm.remark"
            type="textarea"
            :rows="3"
            placeholder="补充转需求说明、内部备注或跟进要求"
          />
        </el-form-item>
        <div class="transfer-tip">
          当前后端“转需求”已接入真实创建需求接口；指定机构、公开范围、来源附件等增强字段暂通过备注与处理记录保留，待后端补充专用转单接口后可直接切换。
        </div>
      </el-form>
      <template #footer>
        <el-button @click="transferVisible = false">取消</el-button>
        <el-button type="primary" @click="submitTransfer">确认转需求</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="invalidVisible" title="标记无效" width="520px">
      <el-input
        v-model="invalidReason"
        type="textarea"
        :rows="4"
        placeholder="可填写无效原因、关闭说明或补充信息要求"
      />
      <template #footer>
        <el-button @click="invalidVisible = false">取消</el-button>
        <el-button type="danger" @click="submitInvalid">确认关闭</el-button>
      </template>
    </el-dialog>

    <AttachmentPreview v-model:visible="previewVisible" :files="previewFiles" />
  </PageContainer>
</template>

<style scoped lang="scss">
.table-stat {
  color: var(--dj-color-text-primary);
  font-size: 16px;
  font-weight: 600;
}

.drawer-actions {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 20px;
}

.drawer-actions__primary {
  min-width: 108px;
}

.transfer-form {
  padding-right: 8px;
}

.transfer-attachments {
  width: 100%;
  display: grid;
  gap: 8px;
}

.transfer-attachment-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid var(--dj-color-border);
  border-radius: 12px;
  background: linear-gradient(180deg, #fff 0%, #fbfcff 100%);
}

.transfer-empty {
  color: var(--dj-color-text-secondary);
}

.transfer-tip {
  margin-top: 6px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgb(84 135 255 / 8%);
  color: var(--dj-color-text-secondary);
  font-size: 13px;
  line-height: 1.7;
}
</style>
