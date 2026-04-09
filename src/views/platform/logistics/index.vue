<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { reactive, ref } from 'vue'

import {
  deleteLogisticsAddress,
  getLogisticsAddressList,
  getLogisticsTrackList,
  saveLogisticsAddress,
} from '@/api/modules/logistics'
import PageContainer from '@/components/PageContainer.vue'
import PermissionButton from '@/components-business/PermissionButton/index.vue'
import TablePanel from '@/components-business/TablePanel/index.vue'
import type { LogisticsAddressItem, LogisticsTrackItem } from '@/types/business'

const loading = ref(false)
const activeTab = ref('track')
const tracks = ref<LogisticsTrackItem[]>([])
const addresses = ref<LogisticsAddressItem[]>([])
const dialogVisible = ref(false)
const form = reactive<LogisticsAddressItem>({
  id: '',
  contactName: '',
  contactPhone: '',
  province: '',
  city: '',
  district: '',
  detailAddress: '',
})

async function loadData() {
  loading.value = true
  try {
    const [trackRes, addressRes] = await Promise.all([getLogisticsTrackList(), getLogisticsAddressList()])
    tracks.value = trackRes.list
    addresses.value = addressRes.list
  } finally {
    loading.value = false
  }
}

function openDialog(row?: LogisticsAddressItem) {
  Object.assign(form, row || { id: '', contactName: '', contactPhone: '', province: '', city: '', district: '', detailAddress: '', postalCode: '', thirdPartyWarehouseCode: '', remark: '' })
  dialogVisible.value = true
}

async function submitAddress() {
  await saveLogisticsAddress({ ...form })
  ElMessage.success('地址已保存')
  dialogVisible.value = false
  loadData()
}

async function handleDelete(id: string) {
  await deleteLogisticsAddress(id)
  ElMessage.success('地址已删除')
  loadData()
}

loadData()
</script>

<template>
  <PageContainer title="物流信息" subtitle="一期只做物流展示和地址维护，同时预留第三方物流接口字段。">
    <el-card shadow="never" class="app-card">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="物流信息展示" name="track">
          <TablePanel title="物流轨迹列表">
            <el-table v-loading="loading" :data="tracks" border>
              <el-table-column prop="orderNo" label="订单号" min-width="160" />
              <el-table-column prop="trackingNo" label="物流单号" min-width="160" />
              <el-table-column prop="logisticsCompany" label="物流公司" min-width="140" />
              <el-table-column prop="receiverName" label="收件人" width="120" />
              <el-table-column prop="address" label="物流地址" min-width="220" />
              <el-table-column prop="thirdPartyCode" label="第三方编码" width="120" />
              <el-table-column prop="thirdPartyStatus" label="第三方状态" width="120" />
              <el-table-column prop="latestNode" label="最新节点" min-width="220" />
            </el-table>
          </TablePanel>
        </el-tab-pane>
        <el-tab-pane label="物流地址维护" name="address">
          <TablePanel title="地址列表">
            <template #toolbar>
              <PermissionButton permission="logistics:manage:view" @click="openDialog()">新增地址</PermissionButton>
            </template>
            <el-table v-loading="loading" :data="addresses" border>
              <el-table-column prop="contactName" label="联系人" width="120" />
              <el-table-column prop="contactPhone" label="联系电话" width="140" />
              <el-table-column label="地址" min-width="260">
                <template #default="{ row }">{{ row.province }}{{ row.city }}{{ row.district }}{{ row.detailAddress }}</template>
              </el-table-column>
              <el-table-column prop="thirdPartyWarehouseCode" label="仓库编码" min-width="140" />
              <el-table-column prop="remark" label="备注" min-width="160" />
              <el-table-column label="操作" width="180">
                <template #default="{ row }">
                  <PermissionButton permission="logistics:manage:view" text @click="openDialog(row)">编辑</PermissionButton>
                  <PermissionButton permission="logistics:manage:view" text type="danger" @click="handleDelete(row.id)">删除</PermissionButton>
                </template>
              </el-table-column>
            </el-table>
          </TablePanel>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog v-model="dialogVisible" title="物流地址" width="640px">
      <el-form label-width="100px">
        <el-form-item label="联系人"><el-input v-model="form.contactName" /></el-form-item>
        <el-form-item label="联系电话"><el-input v-model="form.contactPhone" /></el-form-item>
        <el-form-item label="省市区">
          <el-input v-model="form.province" placeholder="省" />
          <el-input v-model="form.city" placeholder="市" style="margin: 0 8px" />
          <el-input v-model="form.district" placeholder="区" />
        </el-form-item>
        <el-form-item label="详细地址"><el-input v-model="form.detailAddress" /></el-form-item>
        <el-form-item label="仓库编码"><el-input v-model="form.thirdPartyWarehouseCode" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="form.remark" type="textarea" :rows="3" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAddress">保存</el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>
