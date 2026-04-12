<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, reactive, ref } from 'vue'

import {
  deleteConsult,
  getConsultDetail,
  getConsultList,
  replyConsult,
} from '@/api/modules/consult'
import { createDemand } from '@/api/modules/demand'
import PageContainer from '@/components/PageContainer.vue'
import AttachmentPreview from '@/components-business/AttachmentPreview/index.vue'
import DetailSection from '@/components-business/DetailSection/index.vue'
import OperationTimeline from '@/components-business/OperationTimeline/index.vue'
import PermissionButton from '@/components-business/PermissionButton/index.vue'
import SearchForm from '@/components-business/SearchForm/index.vue'
import StatsPanel from '@/components-business/StatsPanel/index.vue'
import StatusTag from '@/components-business/StatusTag/index.vue'
import TablePanel from '@/components-business/TablePanel/index.vue'
import { CONSULT_STATUS_MAP, SERVICE_TYPE_OPTIONS } from '@/constants/dicts'
import { PERMISSION_CODE } from '@/enum/permission'
import { ConsultStatus, PublishMode, ServiceType } from '@/enum/status'
import type { AttachmentItem, ConsultDetail, ConsultItem, ConsultQuery } from '@/types/business'

const loading = ref(false)
const total = ref(0)
const tableData = ref<ConsultItem[]>([])
const detailVisible = ref(false)
const handleVisible = ref(false)
const replyVisible = ref(false)
const transferDemandVisible = ref(false)
const transferCustomerVisible = ref(false)
const currentDetail = ref<ConsultDetail | null>(null)
const previewVisible = ref(false)
const previewFiles = ref<AttachmentItem[]>([])
const replyContent = ref('')
const selectedCustomer = ref('')

const customerOptions = [
  { label: '客服一组 / 王敏', value: 'service-001' },
  { label: '客服二组 / 李婷', value: 'service-002' },
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

const queryForm = reactive<ConsultQuery>({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  status: '',
})

const searchFields = [
  {
    label: '关键词',
    prop: 'keyword',
    placeholder: '咨询标题/企业名称/联系人',
  },
  {
    label: '状态',
    prop: 'status',
    component: 'select' as const,
    placeholder: '请选择状态',
    options: Object.values(CONSULT_STATUS_MAP),
  },
]

const statCards = computed(() => [
  {
    title: '待回复',
    value: tableData.value.filter((item) => item.status === ConsultStatus.Pending).length,
  },
  {
    title: '处理中',
    value: tableData.value.filter((item) => item.status === ConsultStatus.Closed).length,
  },
  {
    title: '已回复',
    value: tableData.value.filter((item) => item.status === ConsultStatus.Replied).length,
  },
  {
    title: '全部咨询',
    value: total.value,
  },
])

const displayStatCards = computed(() => [
  {
    ...statCards.value[0],
    hint: '等待平台或客服团队给出首次回复',
  },
  {
    ...statCards.value[1],
    hint: '已进入流转处理或关闭归档阶段',
  },
  {
    ...statCards.value[2],
    hint: '已经完成回复并同步给企业的咨询',
  },
  {
    ...statCards.value[3],
    hint: '当前筛选条件下的全部咨询数量',
  },
])

async function loadData() {
  loading.value = true
  try {
    const res = await getConsultList(queryForm)
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
  currentDetail.value = await getConsultDetail(id)
  detailVisible.value = true
  handleVisible.value = false
}

async function openHandle(id: string) {
  currentDetail.value = await getConsultDetail(id)
  handleVisible.value = true
  detailVisible.value = false
}

function openPreview(files: AttachmentItem[]) {
  previewFiles.value = files
  previewVisible.value = true
}

async function submitReply() {
  if (!currentDetail.value || !replyContent.value.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }

  await replyConsult(currentDetail.value.id, replyContent.value)
  ElMessage.success('回复成功')
  replyVisible.value = false
  replyContent.value = ''
  currentDetail.value = await getConsultDetail(currentDetail.value.id)
  await loadData()
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

async function handleDelete(row: ConsultItem) {
  try {
    await ElMessageBox.confirm(`确认删除咨询“${row.title}”吗？`, '删除确认', {
      type: 'warning',
    })
  } catch {
    return
  }

  await deleteConsult(row.id)
  ElMessage.success('咨询已删除')
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
  <PageContainer
    title="咨询管理"
    subtitle="按列表 + 详情抽屉方式管理企业咨询，支持状态筛选与快速回复。"
  >
    <StatsPanel :items="displayStatCards" />

    <SearchForm
      v-model="queryForm"
      :fields="searchFields"
      @search="handleSearch"
      @reset="loadData"
    />

    <TablePanel
      title="咨询列表"
      :total="total"
      :page-num="queryForm.pageNum"
      :page-size="queryForm.pageSize"
      @update:page-num="queryForm.pageNum = $event"
      @update:page-size="queryForm.pageSize = $event"
      @pageChange="handlePageChange"
    >
      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column prop="title" label="咨询标题" min-width="260" />
        <el-table-column prop="enterpriseName" label="企业名称" min-width="180" />
        <el-table-column prop="contactName" label="联系人" width="120" />
        <el-table-column prop="contactPhone" label="联系电话" width="140" />
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <StatusTag :status="row.status" :map="CONSULT_STATUS_MAP" />
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="提交时间" min-width="160" />
        <el-table-column label="操作" min-width="220" fixed="right" align="center" header-align="center">
          <template #default="{ row }">
            <el-space wrap>
              <el-button text type="primary" @click="openDetail(row.id)">查看详情</el-button>
              <PermissionButton
                :permission="PERMISSION_CODE.operatorConsultHandle"
                text
                @click="openHandle(row.id)"
              >
                处理
              </PermissionButton>
              <PermissionButton
                :permission="PERMISSION_CODE.operatorConsultHandle"
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

    <el-drawer v-model="detailVisible" title="咨询详情" size="760px">
      <template v-if="currentDetail">
        <DetailSection title="咨询信息">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="咨询标题">{{ currentDetail.title }}</el-descriptions-item>
            <el-descriptions-item label="企业名称">{{
              currentDetail.enterpriseName
            }}</el-descriptions-item>
            <el-descriptions-item label="联系人">{{
              currentDetail.contactName
            }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{
              currentDetail.contactPhone
            }}</el-descriptions-item>
            <el-descriptions-item label="提交时间">{{
              currentDetail.createdAt
            }}</el-descriptions-item>
            <el-descriptions-item label="咨询内容">{{
              currentDetail.content
            }}</el-descriptions-item>
          </el-descriptions>
        </DetailSection>

        <DetailSection title="附件" style="margin-top: 16px">
          <el-button type="primary" plain @click="openPreview(currentDetail.attachments)">
            查看附件
          </el-button>
        </DetailSection>

        <DetailSection title="处理记录" style="margin-top: 16px">
          <OperationTimeline :nodes="currentDetail.replyRecords" />
        </DetailSection>
      </template>
    </el-drawer>

    <el-drawer v-model="handleVisible" title="处理咨询" size="760px">
      <template v-if="currentDetail">
        <DetailSection title="咨询信息">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="咨询标题">{{ currentDetail.title }}</el-descriptions-item>
            <el-descriptions-item label="企业名称">{{
              currentDetail.enterpriseName
            }}</el-descriptions-item>
            <el-descriptions-item label="联系人">{{
              currentDetail.contactName
            }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{
              currentDetail.contactPhone
            }}</el-descriptions-item>
            <el-descriptions-item label="提交时间">{{
              currentDetail.createdAt
            }}</el-descriptions-item>
            <el-descriptions-item label="咨询内容">{{
              currentDetail.content
            }}</el-descriptions-item>
          </el-descriptions>
        </DetailSection>

        <DetailSection title="附件" style="margin-top: 16px">
          <el-button type="primary" plain @click="openPreview(currentDetail.attachments)">
            查看附件
          </el-button>
        </DetailSection>

        <DetailSection title="处理记录" style="margin-top: 16px">
          <OperationTimeline :nodes="currentDetail.replyRecords" />
        </DetailSection>

        <div class="drawer-actions">
          <PermissionButton
            :permission="PERMISSION_CODE.operatorConsultHandle"
            plain
            @click="openTransferDemand"
          >
            转需求
          </PermissionButton>
          <PermissionButton
            :permission="PERMISSION_CODE.operatorConsultHandle"
            plain
            @click="openTransferCustomer"
          >
            转客服
          </PermissionButton>
          <PermissionButton
            :permission="PERMISSION_CODE.operatorConsultHandle"
            @click="replyVisible = true"
          >
            咨询回复
          </PermissionButton>
        </div>
      </template>
    </el-drawer>

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
        <el-button type="primary" @click="submitTransferDemand">确认转需求</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="transferCustomerVisible" title="转客服" width="520px">
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
.drawer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}
</style>
