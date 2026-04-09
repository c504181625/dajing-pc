<script setup lang="ts">
import { ArrowDown, SwitchButton, User } from '@element-plus/icons-vue'

defineProps<{
  name?: string
  roleName?: string
  enterpriseName?: string
}>()

const emit = defineEmits<{
  command: [command: 'profile' | 'logout']
}>()
</script>

<template>
  <el-dropdown
    trigger="click"
    placement="bottom-end"
    popper-class="user-dropdown-popper"
    @command="emit('command', $event)"
  >
    <div class="user-dropdown">
      <div class="avatar">
        <el-icon><User /></el-icon>
      </div>
      <div class="meta">
        <div class="name">{{ name || '未登录用户' }}</div>
        <div class="role">{{ roleName || '未分配身份' }}</div>
        <div v-if="enterpriseName" class="enterprise">{{ enterpriseName }}</div>
      </div>
      <el-icon class="arrow"><ArrowDown /></el-icon>
    </div>

    <template #dropdown>
      <el-dropdown-menu class="user-dropdown-menu">
        <el-dropdown-item command="profile">
          <el-icon><User /></el-icon>
          <span>个人信息</span>
        </el-dropdown-item>
        <el-dropdown-item divided command="logout">
          <el-icon><SwitchButton /></el-icon>
          <span>退出登录</span>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<style scoped lang="scss">
.user-dropdown {
  min-width: 240px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 10px;
  border-radius: 14px;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}

.user-dropdown:hover {
  background: rgb(15 23 42 / 4%);
  box-shadow: inset 0 0 0 1px rgb(15 23 42 / 5%);
}

.avatar {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: var(--dj-color-primary);
  background: rgb(31 94 255 / 10%);
  font-size: 18px;
}

.meta {
  flex: 1;
  min-width: 0;
}

.name {
  font-size: 14px;
  font-weight: 600;
  color: var(--dj-color-text-primary);
}

.role,
.enterprise {
  margin-top: 3px;
  overflow: hidden;
  font-size: 12px;
  color: var(--dj-color-text-regular);
  white-space: nowrap;
  text-overflow: ellipsis;
}

.enterprise {
  color: var(--dj-color-text-secondary);
}

.arrow {
  color: var(--dj-color-text-regular);
  transition: transform 0.2s ease;
}

.user-dropdown:focus-visible {
  outline: none;
}

:global(.user-dropdown-popper.el-popper) {
  padding: 8px;
  border: 1px solid rgb(31 94 255 / 10%);
  border-radius: 16px;
  background: rgb(255 255 255 / 96%);
  box-shadow: 0 18px 38px rgb(15 23 42 / 12%);
}

:global(.user-dropdown-popper .el-popper__arrow::before) {
  border-color: rgb(31 94 255 / 10%);
  background: rgb(255 255 255 / 96%);
}

:global(.user-dropdown-popper .el-dropdown-menu) {
  padding: 0;
  border: 0;
  box-shadow: none;
  min-width: 170px;
  background: transparent;
}

:global(.user-dropdown-popper .el-dropdown-menu__item) {
  height: 44px;
  gap: 10px;
  padding: 0 14px;
  border-radius: 12px;
  font-size: 14px;
  color: #24344f;
}

:global(.user-dropdown-popper .el-dropdown-menu__item:not(.is-disabled):hover) {
  background: linear-gradient(180deg, #f6f9ff 0%, #edf4ff 100%);
  color: #2457d6;
}

:global(.user-dropdown-popper .el-dropdown-menu__item.is-divided) {
  margin-top: 8px;
}

:global(.user-dropdown-popper .el-dropdown-menu__item.is-divided::before) {
  left: 0;
  right: 0;
  top: -4px;
  margin: 0;
  background: rgb(15 23 42 / 6%);
}
</style>
