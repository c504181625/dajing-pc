<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { reactive, ref } from 'vue'

import { createDemand, getDemandList } from '@/api/modules/demand'
import PageContainer from '@/components/PageContainer.vue'
import SearchForm from '@/components-business/SearchForm/index.vue'
import StatusTag from '@/components-business/StatusTag/index.vue'
import TablePanel from '@/components-business/TablePanel/index.vue'
import { DEMAND_STATUS_MAP, SERVICE_TYPE_OPTIONS } from '@/constants/dicts'
import { PublishMode, ServiceType } from '@/enum/status'
import type { DemandForm, DemandItem, DemandQuery } from '@/types/business'

const loading = ref(false)
const dialogVisible = ref(false)
const tableData = ref<DemandItem[]>([])

const queryForm = reactive<DemandQuery>({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  status: '',
  serviceType: '',
})

const form = reactive<DemandForm>({
  title: '',
  serviceType: ServiceType.Standard,
  publishMode: PublishMode.PlatformAssign,
  contactName: '',
  contactPhone: '',
  content: '',
})

const searchFields = [
  { label: '关键词', prop: 'keyword', placeholder: '需求标题/企业名称/机构名称' },
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

const publishModeOptions = [
  { label: '平台分配机构', value: PublishMode.PlatformAssign },
  { label: '自主选择机构', value: PublishMode.SelfSelect },
]

function resetQuery() {
  Object.assign(queryForm, {
    pageNum: 1,
    pageSize: 10,
    keyword: '',
    status: '',
    serviceType: '',
  })
  loadData()
}

function resetForm() {
  Object.assign(form, {
    title: '',
    serviceType: ServiceType.Standard,
    publishMode: PublishMode.PlatformAssign,
    contactName: '',
    contactPhone: '',
    content: '',
  })
}

async function loadData() {
  loading.value = true
  try {
    const res = await getDemandList(queryForm)
    tableData.value = res.list
  } finally {
    loading.value = false
  }
}

async function submitDemand() {
  if (!form.title || !form.contactName || !form.contactPhone || !form.content) {
    ElMessage.warning('请补全需求标题、联系人、联系电话和需求说明')
    return
  }
  await createDemand(form)
  ElMessage.success('需求已提交')
  dialogVisible.value = false
  resetForm()
  loadData()
}

loadData()
</script>

<template>
  <PageContainer title="发布需求" subtitle="创建新需求并查看本企业已提交的需求记录。">
    <SearchForm v-model="queryForm" :fields="searchFields" @search="loadData" @reset="resetQuery" />

    <TablePanel title="我的委托需求">
      <template #toolbar>
        <el-button type="primary" @click="dialogVisible = true">新建需求</el-button>
      </template>

      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column prop="title" label="需求标题" min-width="240" />
        <el-table-column prop="enterpriseName" label="企业名称" min-width="180" />
        <el-table-column label="服务类型" width="140">
          <template #default="{ row }">
            {{ SERVICE_TYPE_OPTIONS.find((item) => item.value === row.serviceType)?.label || row.serviceType }}
          </template>
        </el-table-column>
        <el-table-column prop="assignedOrg" label="承接机构" min-width="180" />
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <StatusTag :status="row.status" :map="DEMAND_STATUS_MAP" />
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="提交时间" min-width="160" />
      </el-table>
    </TablePanel>

    <el-dialog v-model="dialogVisible" title="新建需求" width="640px" @closed="resetForm">
      <el-form label-position="top">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="需求标题">
              <el-input v-model="form.title" placeholder="请输入需求标题" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="服务类型">
              <el-select v-model="form.serviceType" placeholder="请选择服务类型">
                <el-option
                  v-for="item in SERVICE_TYPE_OPTIONS"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="对接模式">
              <el-radio-group v-model="form.publishMode">
                <el-radio-button
                  v-for="item in publishModeOptions"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.label }}
                </el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系人">
              <el-input v-model="form.contactName" placeholder="请输入联系人姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话">
              <el-input v-model="form.contactPhone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="需求说明">
              <el-input v-model="form.content" type="textarea" :rows="5" placeholder="请输入需求说明" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitDemand">提交需求</el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>
