<script setup lang="ts">
import type { EnterpriseAuditDetail } from '@/types/business'

defineProps<{
  detail: EnterpriseAuditDetail
}>()
</script>

<template>
  <el-card shadow="never" class="app-card">
    <template #header>
      <span>企业信息摘要</span>
    </template>

    <el-descriptions :column="2" border>
      <el-descriptions-item label="企业名称">{{ detail.enterpriseName }}</el-descriptions-item>
      <el-descriptions-item label="统一社会信用代码">{{ detail.socialCreditCode }}</el-descriptions-item>
      <el-descriptions-item label="联系人">{{ detail.contactName }}</el-descriptions-item>
      <el-descriptions-item label="联系电话">{{ detail.contactPhone }}</el-descriptions-item>
      <el-descriptions-item label="联系邮箱">{{ detail.email }}</el-descriptions-item>
      <el-descriptions-item label="法人代表">{{ detail.legalPerson }}</el-descriptions-item>
      <el-descriptions-item label="注册地址" :span="2">
        {{ detail.province }}{{ detail.city }}{{ detail.district }}{{ detail.address }}
      </el-descriptions-item>
    </el-descriptions>
  </el-card>
</template>
