<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { computed, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { getEnterpriseUpgradeSummary, submitEnterpriseUpgrade } from '@/api/modules/user'
import PageContainer from '@/components/PageContainer.vue'
import DetailSection from '@/components-business/DetailSection/index.vue'
import { ACCOUNT_TYPE_LABEL_MAP, ENTERPRISE_CAPABILITY_LABEL_MAP } from '@/enum/role'
import { ENTERPRISE_CAPABILITY } from '@/enum/role'
import { useUserStore } from '@/store/modules/user'
import type { EnterpriseUpgradeForm, EnterpriseUpgradeSummary } from '@/types/auth'

const route = useRoute()
const userStore = useUserStore()
const loading = ref(false)
const upgradeLoading = ref(false)

const upgradeSummary = ref<EnterpriseUpgradeSummary>({
  canUpgrade: true,
  hasPendingApplication: false,
  currentStatus: 'not_started',
})

const upgradeForm = reactive<EnterpriseUpgradeForm>({
  enterpriseName: '',
  unifiedSocialCode: '',
  contactName: '',
  contactMobile: '',
  region: [],
  registeredAddress: '',
  enterpriseTags: [ENTERPRISE_CAPABILITY.demander],
  enterpriseCapabilities: [ENTERPRISE_CAPABILITY.demander],
  businessScope: '',
  enterpriseIntro: '',
  remark: '',
  businessLicense: [],
})

watch(
  () => userStore.userInfo,
  (user) => {
    upgradeForm.contactName = user?.name || ''
    upgradeForm.contactMobile = user?.mobile || ''
  },
  { immediate: true },
)

const pageTitle = computed(() => String(route.meta.title || '企业升级'))
const pageSubtitle = computed(
  () => '复用企业认证资料页结构，个人账号提交企业主体申请后即可按审核进度逐步升级为企业账号。',
)

async function loadUpgradeSummary() {
  upgradeSummary.value = await getEnterpriseUpgradeSummary()
}

async function handleUpgradeSubmit() {
  if (!upgradeForm.enterpriseName || !upgradeForm.unifiedSocialCode) {
    ElMessage.warning('请先填写企业名称和统一社会信用代码')
    return
  }
  if (!upgradeForm.enterpriseTags.length) {
    ElMessage.warning('请至少选择一个企业身份标签')
    return
  }

  upgradeLoading.value = true
  try {
    upgradeForm.enterpriseCapabilities = upgradeForm.enterpriseTags
    await submitEnterpriseUpgrade(upgradeForm)
    await loadUpgradeSummary()
    ElMessage.success('企业升级申请已提交')
  } finally {
    upgradeLoading.value = false
  }
}

async function init() {
  loading.value = true
  try {
    await loadUpgradeSummary()
  } finally {
    loading.value = false
  }
}

init()
</script>

<template>
  <PageContainer :title="pageTitle" :subtitle="pageSubtitle">
    <el-row :gutter="18" v-loading="loading">
      <el-col :span="15">
        <DetailSection title="企业升级申请">
          <el-form label-width="126px" class="upgrade-form">
            <el-form-item label="企业名称">
              <el-input v-model="upgradeForm.enterpriseName" placeholder="请输入企业名称" />
            </el-form-item>
            <el-form-item label="统一社会信用代码">
              <el-input
                v-model="upgradeForm.unifiedSocialCode"
                placeholder="请输入统一社会信用代码"
              />
            </el-form-item>
            <el-form-item label="联系人">
              <el-input v-model="upgradeForm.contactName" placeholder="请输入联系人" />
            </el-form-item>
            <el-form-item label="联系人手机号">
              <el-input v-model="upgradeForm.contactMobile" placeholder="请输入联系人手机号" />
            </el-form-item>
            <el-form-item label="注册地址">
              <el-input v-model="upgradeForm.registeredAddress" placeholder="请输入注册地址" />
            </el-form-item>
            <el-form-item label="企业身份标签">
              <el-checkbox-group v-model="upgradeForm.enterpriseTags">
                <el-checkbox :value="ENTERPRISE_CAPABILITY.demander">
                  {{ ENTERPRISE_CAPABILITY_LABEL_MAP[ENTERPRISE_CAPABILITY.demander] }}
                </el-checkbox>
                <el-checkbox :value="ENTERPRISE_CAPABILITY.serviceProvider">
                  {{ ENTERPRISE_CAPABILITY_LABEL_MAP[ENTERPRISE_CAPABILITY.serviceProvider] }}
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="业务范围">
              <el-input
                v-model="upgradeForm.businessScope"
                type="textarea"
                :rows="4"
                placeholder="请描述企业主营业务与希望开通的平台能力"
              />
            </el-form-item>
            <el-form-item label="企业简介">
              <el-input
                v-model="upgradeForm.enterpriseIntro"
                type="textarea"
                :rows="3"
                placeholder="选填"
              />
            </el-form-item>
          </el-form>

          <div class="upgrade-actions">
            <el-button type="primary" :loading="upgradeLoading" @click="handleUpgradeSubmit">
              提交企业升级申请
            </el-button>
          </div>
        </DetailSection>
      </el-col>

      <el-col :span="9">
        <div class="side-stack">
          <DetailSection title="账号摘要">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="账号主体">
                {{ ACCOUNT_TYPE_LABEL_MAP[userStore.userInfo?.accountType || 'personal'] }}
              </el-descriptions-item>
              <el-descriptions-item label="最近登录">
                {{ userStore.userInfo?.lastLoginTime || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="当前状态">
                {{
                  upgradeSummary.currentStatus === 'not_started'
                    ? '未发起'
                    : upgradeSummary.currentStatus === 'reviewing'
                      ? '审核中'
                      : upgradeSummary.currentStatus === 'approved'
                        ? '已通过'
                        : upgradeSummary.currentStatus === 'rejected'
                          ? '已驳回'
                          : '待激活'
                }}
              </el-descriptions-item>
            </el-descriptions>
          </DetailSection>

          <DetailSection title="审核进度" style="margin-top: 16px">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="最近申请时间">
                {{ upgradeSummary.lastApplyTime || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="处理说明">
                {{ upgradeSummary.remark || '当前尚未发起企业升级申请。' }}
              </el-descriptions-item>
            </el-descriptions>
          </DetailSection>
        </div>
      </el-col>
    </el-row>
  </PageContainer>
</template>

<style scoped>
.upgrade-form {
  max-width: 760px;
}

.side-stack {
  position: sticky;
  top: 0;
}

.upgrade-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
</style>
