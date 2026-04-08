<script setup lang="ts">
import { ref } from 'vue'

import { getEnterpriseProfile } from '@/api/modules/enterprise'
import PageContainer from '@/components/PageContainer.vue'

const profile = ref<Record<string, string>>({})

async function loadProfile() {
  profile.value = await getEnterpriseProfile()
}

loadProfile()
</script>

<template>
  <PageContainer title="企业信息管理" subtitle="企业主账号维护本企业基础信息、联系人、证照和对外展示信息，员工账号仅可读或按授权编辑。">
    <el-card shadow="never" class="app-card">
      <el-form label-width="120px" class="profile-form">
        <el-form-item label="企业名称">
          <el-input :model-value="profile.enterpriseName" />
        </el-form-item>
        <el-form-item label="统一社会信用代码">
          <el-input :model-value="profile.socialCreditCode" disabled />
        </el-form-item>
        <el-form-item label="法人代表">
          <el-input :model-value="profile.legalPerson" />
        </el-form-item>
        <el-form-item label="联系人">
          <el-input :model-value="profile.contactName" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input :model-value="profile.contactPhone" />
        </el-form-item>
        <el-form-item label="联系地址">
          <el-input :model-value="profile.address" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary">保存信息</el-button>
          <el-button>提交变更审核</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </PageContainer>
</template>

<style scoped>
.profile-form {
  max-width: 760px;
}
</style>
