<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps<{
  current: 'news' | 'qa' | 'experts'
  singlePage?: boolean
  basePath?: string
}>()

const router = useRouter()

const tabs = computed(() => [
  { key: 'news' as const, label: '资讯管理', path: '/operator/business/community/news' },
  { key: 'qa' as const, label: '问答管理', path: '/operator/business/community/qa' },
  { key: 'experts' as const, label: '专家管理', path: '/operator/business/community/experts' },
])

function handleSelect(path: string, key: 'news' | 'qa' | 'experts') {
  if (props.singlePage) {
    router.replace({
      path: props.basePath || '/operator/business/community',
      query: { tab: key },
    })
    return
  }

  router.push(path)
}
</script>

<template>
  <div class="community-tabs">
    <button
      v-for="item in tabs"
      :key="item.key"
      type="button"
      class="community-tabs__item"
      :class="{ 'is-active': current === item.key }"
      @click="handleSelect(item.path, item.key)"
    >
      {{ item.label }}
    </button>
  </div>
</template>

<style scoped lang="scss">
.community-tabs {
  display: inline-flex;
  align-items: center;
  gap: 0;
  padding: 6px;
  border-radius: 18px;
  background: linear-gradient(180deg, #f4f8ff 0%, #eef4ff 100%);
}

.community-tabs__item {
  min-width: 132px;
  height: 44px;
  padding: 0 20px;
  border: 0;
  border-radius: 14px;
  background: transparent;
  color: var(--dj-color-text-primary);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    box-shadow 0.2s ease,
    color 0.2s ease;
}

.community-tabs__item.is-active {
  background: linear-gradient(180deg, #e6efff 0%, #dbe8ff 100%);
  color: var(--dj-color-primary);
  box-shadow: inset 0 0 0 1px rgb(84 135 255 / 24%);
}

@media (max-width: 768px) {
  .community-tabs {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr;
    gap: 6px;
  }

  .community-tabs__item {
    width: 100%;
  }
}
</style>
