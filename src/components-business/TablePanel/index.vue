<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    title?: string
    description?: string
    total?: number
    pageNum?: number
    pageSize?: number
    pageSizes?: number[]
    showPagination?: boolean
  }>(),
  {
    description: '',
    total: 0,
    pageNum: 1,
    pageSize: 10,
    pageSizes: () => [10, 20, 50],
    showPagination: true,
  },
)

const emit = defineEmits<{
  (e: 'update:pageNum', value: number): void
  (e: 'update:pageSize', value: number): void
  (e: 'pageChange'): void
}>()

const shouldShowPagination = computed(() => props.showPagination && props.total > 0)

function handleCurrentChange(page: number) {
  emit('update:pageNum', page)
  emit('pageChange')
}

function handleSizeChange(size: number) {
  emit('update:pageSize', size)
  emit('update:pageNum', 1)
  emit('pageChange')
}
</script>

<template>
  <el-card shadow="never" class="app-card">
    <template #header>
      <div class="panel-header">
        <div class="panel-main">
          <div v-if="title" class="title">{{ title }}</div>
          <div v-if="$slots.stats" class="stats-row">
            <slot name="stats" />
          </div>
        </div>
        <div class="toolbar">
          <slot name="toolbar" />
        </div>
      </div>
    </template>

    <slot />

    <div v-if="shouldShowPagination" class="pagination-wrap">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next, jumper"
        prev-text="上一页"
        next-text="下一页"
        :current-page="pageNum"
        :page-size="pageSize"
        :page-sizes="pageSizes"
        :total="total"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
      />
    </div>
  </el-card>
</template>

<style scoped lang="scss">
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.panel-main {
  min-width: 0;
}

.title {
  font-size: 16px;
  font-weight: 600;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stats-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 2px;
  min-height: 28px;
  align-items: center;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
  padding-top: 4px;
}

@media (max-width: 900px) {
  .panel-header {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar,
  .pagination-wrap {
    justify-content: flex-start;
    flex-wrap: wrap;
  }
}
</style>
