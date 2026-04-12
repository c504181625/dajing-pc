<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { computed, reactive } from 'vue'
import { useRouter } from 'vue-router'

import { createDemand } from '@/api/modules/demand'
import PageContainer from '@/components/PageContainer.vue'
import ActionPanel from '@/components-business/ActionPanel/index.vue'
import DetailSection from '@/components-business/DetailSection/index.vue'
import { SERVICE_TYPE_OPTIONS } from '@/constants/dicts'
import { ACCOUNT_TYPE } from '@/enum/role'
import { PublishMode, ServiceType } from '@/enum/status'
import { useUserStore } from '@/store/modules/user'
import type { DemandForm } from '@/types/business'

const router = useRouter()
const userStore = useUserStore()

const form = reactive<DemandForm>({
  title: '',
  serviceType: ServiceType.Standard,
  publishMode: PublishMode.PlatformAssign,
  contactName: userStore.userInfo?.name || '',
  contactPhone: userStore.userInfo?.mobile || '',
  content: '',
})

const currentAccountType = computed(() => userStore.userInfo?.accountType)
const backPath = computed(() =>
  currentAccountType.value === ACCOUNT_TYPE.personal ? '/personal/demand' : '/enterprise/demand',
)

const serviceTypeLabel = computed(
  () => SERVICE_TYPE_OPTIONS.find((item) => item.value === form.serviceType)?.label || '-',
)

const publishModeLabel = computed(() =>
  form.publishMode === PublishMode.SelfSelect ? '自主选择机构' : '平台分配机构',
)

const pageTitle = computed(() => '发布需求')
const pageSubtitle = computed(() =>
  currentAccountType.value === ACCOUNT_TYPE.personal
    ? '个人用户可直接提交检测、培训、标准化等服务需求，由平台或机构继续跟进。'
    : '企业与服务机构均可在统一后台创建需求，形成完整的询单、下单和服务协同链路。',
)

async function handleSubmit() {
  if (!form.title.trim() || !form.contactName.trim() || !form.contactPhone.trim() || !form.content.trim()) {
    ElMessage.warning('请完整填写需求标题、联系人、联系电话和需求说明')
    return
  }

  await createDemand(form)
  ElMessage.success('需求已提交')
  router.push(backPath.value)
}
</script>

<template>
  <PageContainer :title="pageTitle" :subtitle="pageSubtitle">
    <el-row :gutter="16">
      <el-col :span="16">
        <DetailSection title="基础信息">
          <el-form label-position="top" class="publish-form">
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="需求标题">
                  <el-input v-model="form.title" placeholder="请输入本次委托需求标题" />
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
              <el-col :span="24">
                <el-form-item label="对接方式">
                  <el-radio-group v-model="form.publishMode">
                    <el-radio-button :value="PublishMode.PlatformAssign">平台分配机构</el-radio-button>
                    <el-radio-button :value="PublishMode.SelfSelect">自主选择机构</el-radio-button>
                  </el-radio-group>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </DetailSection>

        <DetailSection title="联系人信息" style="margin-top: 16px">
          <el-form label-position="top" class="publish-form">
            <el-row :gutter="16">
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
            </el-row>
          </el-form>
        </DetailSection>

        <DetailSection title="需求说明" style="margin-top: 16px">
          <el-form label-position="top" class="publish-form">
            <el-form-item label="服务描述">
              <el-input
                v-model="form.content"
                type="textarea"
                :rows="8"
                maxlength="1000"
                show-word-limit
                placeholder="请描述服务目标、样品或资料情况、期望周期及特别说明"
              />
            </el-form-item>
          </el-form>
        </DetailSection>
      </el-col>

      <el-col :span="8">
        <div class="side-stack">
          <DetailSection title="需求摘要">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="服务类型">{{ serviceTypeLabel }}</el-descriptions-item>
              <el-descriptions-item label="对接方式">{{ publishModeLabel }}</el-descriptions-item>
              <el-descriptions-item label="联系人">{{ form.contactName || '-' }}</el-descriptions-item>
              <el-descriptions-item label="联系电话">{{ form.contactPhone || '-' }}</el-descriptions-item>
            </el-descriptions>
          </DetailSection>

          <DetailSection title="提交说明" style="margin-top: 16px">
            <ul class="submit-tips">
              <li>提交后会同步进入需求管理列表，便于继续跟进。</li>
              <li>选择“平台分配机构”时，平台会自动进入受理与派单流程。</li>
              <li>选择“自主选择机构”时，服务机构也可在统一后台接单处理。</li>
            </ul>
          </DetailSection>

          <ActionPanel style="margin-top: 16px">
            <el-button
              type="primary"
              class="action-panel-button action-panel-button--primary"
              @click="handleSubmit"
            >
              提交需求
            </el-button>
            <el-button
              class="action-panel-button action-panel-button--soft"
              @click="router.push(backPath)"
            >
              返回需求列表
            </el-button>
          </ActionPanel>
        </div>
      </el-col>
    </el-row>
  </PageContainer>
</template>

<style scoped lang="scss">
.publish-form {
  max-width: 100%;
}

.side-stack {
  position: sticky;
  top: 0;
}

.submit-tips {
  margin: 0;
  padding-left: 18px;
  color: var(--dj-color-text-regular);
  line-height: 1.8;
}

</style>
