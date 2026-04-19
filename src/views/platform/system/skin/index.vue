<script setup lang="ts">
import { Check, Monitor, RefreshRight, Setting, Sunny, Warning } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

import PageContainer from '@/components/PageContainer.vue'
import SectionCard from '@/components-business/SectionCard/index.vue'
import {
  DEFAULT_THEME_ID,
  applyThemePreset,
  getThemePreset,
  readSavedThemeId,
  resetTheme,
  themePresets,
} from '@/theme'

const selectedThemeId = ref(DEFAULT_THEME_ID)
const appliedThemeId = ref(DEFAULT_THEME_ID)

const selectedTheme = computed(() => getThemePreset(selectedThemeId.value))
const appliedTheme = computed(() => getThemePreset(appliedThemeId.value))
const isDirty = computed(() => selectedThemeId.value !== appliedThemeId.value)

const tokenGroups = computed(() => [
  {
    label: '主色',
    value: selectedTheme.value.tokens.primary,
    color: selectedTheme.value.tokens.primary,
  },
  {
    label: '主色 Hover',
    value: selectedTheme.value.tokens.primaryHover,
    color: selectedTheme.value.tokens.primaryHover,
  },
  {
    label: '页面背景',
    value: selectedTheme.value.tokens.pageBg,
    color: selectedTheme.value.tokens.pageBg,
  },
  {
    label: '卡片背景',
    value: selectedTheme.value.tokens.cardBg,
    color: selectedTheme.value.tokens.cardBg,
  },
  {
    label: '边框色',
    value: selectedTheme.value.tokens.borderColor,
    color: selectedTheme.value.tokens.borderColor,
  },
  {
    label: '主文字色',
    value: selectedTheme.value.tokens.textPrimary,
    color: selectedTheme.value.tokens.textPrimary,
  },
  {
    label: '次文字色',
    value: selectedTheme.value.tokens.textRegular,
    color: selectedTheme.value.tokens.textRegular,
  },
  {
    label: '菜单选中色',
    value: selectedTheme.value.tokens.menuActiveBg,
    color: selectedTheme.value.tokens.primary,
    isBackground: true,
  },
])

const previewStyle = computed(() => ({
  '--preview-primary': selectedTheme.value.tokens.primary,
  '--preview-primary-hover': selectedTheme.value.tokens.primaryHover,
  '--preview-page-bg': selectedTheme.value.tokens.pageBg,
  '--preview-card-bg': selectedTheme.value.tokens.cardBg,
  '--preview-border': selectedTheme.value.tokens.borderColor,
  '--preview-text-primary': selectedTheme.value.tokens.textPrimary,
  '--preview-text-secondary': selectedTheme.value.tokens.textSecondary,
  '--preview-text-regular': selectedTheme.value.tokens.textRegular,
  '--preview-menu-active': selectedTheme.value.tokens.menuActiveBg,
  '--preview-menu-hover': selectedTheme.value.tokens.menuHoverBg,
  '--preview-header-bg': selectedTheme.value.tokens.headerBg,
  '--preview-decoration': selectedTheme.value.tokens.pageDecoration,
  '--preview-decoration-size': selectedTheme.value.tokens.pageDecorationSize,
}))

function syncSelectedWithApplied() {
  const savedThemeId = readSavedThemeId()
  selectedThemeId.value = savedThemeId
  appliedThemeId.value = savedThemeId
}

async function applyCurrentTheme() {
  applyThemePreset(selectedThemeId.value)
  appliedThemeId.value = selectedThemeId.value
  ElMessage.success(`已应用「${selectedTheme.value.name}」主题方案`)
}

async function restoreDefaultTheme() {
  if (appliedThemeId.value === DEFAULT_THEME_ID && selectedThemeId.value === DEFAULT_THEME_ID) {
    ElMessage.info('当前已经是默认主题')
    return
  }

  try {
    await ElMessageBox.confirm('恢复默认后将立即覆盖当前已保存方案，是否继续？', '恢复默认', {
      type: 'warning',
    })
  } catch {
    return
  }

  resetTheme()
  syncSelectedWithApplied()
  ElMessage.success('已恢复默认主题')
}

function handleBeforeUnload(event: BeforeUnloadEvent) {
  if (!isDirty.value) return
  event.preventDefault()
  event.returnValue = ''
}

onMounted(() => {
  syncSelectedWithApplied()
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

onBeforeRouteLeave(async () => {
  if (!isDirty.value) return true

  try {
    await ElMessageBox.confirm('当前主题方案有未保存变更，离开后将丢失，是否仍然离开？', '未保存变更', {
      type: 'warning',
      confirmButtonText: '仍然离开',
      cancelButtonText: '继续编辑',
    })
    return true
  } catch {
    return false
  }
})
</script>

<template>
  <PageContainer title="系统皮肤">
    <SectionCard title="主题配置">
      <div class="skin-layout">
        <div class="skin-main">
          <div class="scheme-row">
            <button
              v-for="item in themePresets"
              :key="item.id"
              type="button"
              class="scheme-card"
              :class="{
                'is-selected': selectedThemeId === item.id,
                'is-applied': appliedThemeId === item.id,
              }"
              @click="selectedThemeId = item.id"
            >
              <div class="scheme-card__header">
                <div>
                  <div class="scheme-card__title">{{ item.name }}</div>
                  <div class="scheme-card__desc">{{ item.description }}</div>
                </div>
                <span v-if="selectedThemeId === item.id" class="scheme-card__status">
                  <el-icon><Check /></el-icon>
                </span>
              </div>

              <div class="scheme-card__preview">
                <span
                  class="scheme-card__swatch scheme-card__swatch--primary"
                  :style="{ background: item.tokens.primary }"
                />
                <span
                  class="scheme-card__swatch scheme-card__swatch--menu"
                  :style="{ background: item.tokens.menuActiveBg }"
                />
                <span
                  class="scheme-card__swatch scheme-card__swatch--bg"
                  :style="{
                    backgroundColor: item.tokens.pageBg,
                    backgroundImage: item.tokens.pageDecoration,
                    backgroundSize: item.tokens.pageDecorationSize,
                  }"
                />
              </div>

              <div class="scheme-card__tags">
                <el-tag v-for="tag in item.tags" :key="tag" effect="light" round>{{ tag }}</el-tag>
              </div>
            </button>
          </div>

          <div class="token-panel">
            <div class="token-panel__title">当前方案明细</div>
            <div class="token-grid">
              <article
                v-for="item in tokenGroups"
                :key="item.label"
                class="token-card"
                :class="{ 'is-background': item.isBackground }"
              >
                <div class="token-card__meta">
                  <span class="token-card__label">{{ item.label }}</span>
                  <strong class="token-card__value">{{ item.value }}</strong>
                </div>
                <span
                  class="token-card__color"
                  :style="{ background: item.isBackground ? item.value : item.color }"
                />
              </article>
            </div>
          </div>
        </div>

        <aside class="skin-side">
          <div v-if="isDirty" class="skin-alert">
            <el-icon><Warning /></el-icon>
            <div>
              <strong>存在未保存变更</strong>
              <p>当前已切换到「{{ selectedTheme.name }}」预览方案，点击“应用当前方案”后才会正式生效。</p>
            </div>
          </div>

          <div class="meta-card">
            <div class="meta-card__title">方案概览</div>
            <div class="meta-list">
              <div class="meta-list__item">
                <span>当前已应用</span>
                <strong>{{ appliedTheme.name }}</strong>
              </div>
              <div class="meta-list__item">
                <span>当前预览</span>
                <strong>{{ selectedTheme.name }}</strong>
              </div>
              <div class="meta-list__item">
                <span>背景风格</span>
                <strong>{{ selectedTheme.backgroundLabel }}</strong>
              </div>
            </div>
          </div>

          <div class="action-card">
            <el-button type="primary" :icon="Check" @click="applyCurrentTheme">
              应用当前方案
            </el-button>
            <el-button :icon="RefreshRight" @click="restoreDefaultTheme">恢复默认</el-button>
          </div>
        </aside>
      </div>
    </SectionCard>

    <SectionCard title="效果预览">
      <div class="preview-shell" :style="previewStyle">
        <div class="preview-sidebar">
          <div class="preview-brand">
            <span class="preview-brand__logo">Q</span>
            <div>
              <strong>质量创新中心</strong>
              <small>主题缩略预览</small>
            </div>
          </div>

          <div class="preview-menu">
            <span class="preview-menu__item is-active">
              <el-icon><Monitor /></el-icon>
              工作台
            </span>
            <span class="preview-menu__item">
              <el-icon><Sunny /></el-icon>
              平台业务
            </span>
            <span class="preview-menu__item">
              <el-icon><Setting /></el-icon>
              系统配置
            </span>
          </div>
        </div>

        <div class="preview-main">
          <header class="preview-header">
            <div class="preview-breadcrumb">平台运营后台 / 工作台</div>
            <div class="preview-header__right">
              <span class="preview-tag is-outline">消息中心</span>
              <span class="preview-avatar">运</span>
            </div>
          </header>

          <div class="preview-content">
            <section class="preview-board preview-board--metrics">
              <article class="preview-stat">
                <label>今日订单</label>
                <strong>128</strong>
                <span>较昨日 +12%</span>
              </article>
              <article class="preview-stat">
                <label>待处理事项</label>
                <strong>24</strong>
                <span>高优先级 6 项</span>
              </article>
              <article class="preview-stat">
                <label>平台公告</label>
                <strong>08</strong>
                <span>今日新增 2 篇</span>
              </article>
            </section>

            <section class="preview-grid">
              <article class="preview-board">
                <div class="preview-board__header">
                  <strong>待处理事项</strong>
                  <span class="preview-text-link">查看全部</span>
                </div>
                <div class="preview-list">
                  <div class="preview-list__item">
                    <span>企业/机构审核</span>
                    <strong>12</strong>
                  </div>
                  <div class="preview-list__item">
                    <span>需求审核处理</span>
                    <strong>8</strong>
                  </div>
                  <div class="preview-list__item">
                    <span>退款审批处理</span>
                    <strong>3</strong>
                  </div>
                </div>
              </article>

              <article class="preview-board">
                <div class="preview-board__header">
                  <strong>操作与标签</strong>
                  <span class="preview-badge">已选中</span>
                </div>
                <div class="preview-actions">
                  <button class="preview-button is-primary">主按钮</button>
                  <button class="preview-button">次按钮</button>
                  <span class="preview-tag">进行中</span>
                  <span class="preview-tag is-soft">待审核</span>
                </div>
              </article>
            </section>
          </div>
        </div>
      </div>
    </SectionCard>
  </PageContainer>
</template>

<style scoped lang="scss">
.skin-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(300px, 0.72fr);
  gap: 18px;
}

.skin-main,
.skin-side {
  display: grid;
  gap: 16px;
}

.scheme-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.scheme-card {
  display: grid;
  gap: 14px;
  padding: 16px;
  border: 1px solid var(--dj-color-border);
  border-radius: 18px;
  background: var(--dj-color-bg-card);
  text-align: left;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.scheme-card:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--dj-color-primary) 24%, white);
  box-shadow: 0 12px 24px rgb(15 23 42 / 8%);
}

.scheme-card.is-selected {
  border-color: color-mix(in srgb, var(--dj-color-primary) 30%, white);
  box-shadow:
    0 14px 28px rgb(15 23 42 / 8%),
    inset 0 0 0 1px color-mix(in srgb, var(--dj-color-primary) 16%, white);
}

.scheme-card.is-applied {
  position: relative;
}

.scheme-card.is-applied::after {
  content: '已应用';
  position: absolute;
  top: 14px;
  right: 14px;
  padding: 3px 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--dj-color-primary) 10%, white);
  color: var(--dj-color-primary);
  font-size: 12px;
  font-weight: 600;
}

.scheme-card__header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.scheme-card__title {
  font-size: 16px;
  font-weight: 700;
  color: var(--dj-color-text-primary);
}

.scheme-card__desc {
  margin-top: 6px;
  color: var(--dj-color-text-regular);
  font-size: 13px;
  line-height: 1.5;
}

.scheme-card__status {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: color-mix(in srgb, var(--dj-color-primary) 12%, white);
  color: var(--dj-color-primary);
}

.scheme-card__preview {
  display: grid;
  grid-template-columns: 52px 1fr 1.25fr;
  gap: 10px;
  align-items: stretch;
}

.scheme-card__swatch {
  border-radius: 14px;
  border: 1px solid rgb(255 255 255 / 70%);
  box-shadow: inset 0 0 0 1px rgb(15 23 42 / 4%);
}

.scheme-card__swatch--primary,
.scheme-card__swatch--menu {
  min-height: 56px;
}

.scheme-card__swatch--bg {
  min-height: 56px;
}

.scheme-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.token-panel {
  padding: 18px;
  border: 1px solid var(--dj-color-border);
  border-radius: 18px;
  background: color-mix(in srgb, var(--dj-color-bg-card) 94%, var(--dj-color-primary) 6%);
}

.token-panel__title {
  margin-bottom: 14px;
  font-size: 15px;
  font-weight: 700;
  color: var(--dj-color-text-primary);
}

.token-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.token-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid var(--dj-color-border);
  border-radius: 14px;
  background: var(--dj-color-bg-card);
}

.token-card__meta {
  display: grid;
  gap: 6px;
}

.token-card__label {
  color: var(--dj-color-text-secondary);
  font-size: 13px;
}

.token-card__value {
  color: var(--dj-color-text-primary);
  font-size: 13px;
  line-height: 1.4;
  word-break: break-all;
}

.token-card__color {
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  border-radius: 12px;
  border: 1px solid rgb(15 23 42 / 8%);
}

.skin-alert,
.meta-card,
.action-card {
  padding: 16px;
  border: 1px solid var(--dj-color-border);
  border-radius: 18px;
  background: var(--dj-color-bg-card);
}

.skin-alert {
  display: flex;
  gap: 12px;
  background: color-mix(in srgb, #fff 90%, #fff6df 10%);
}

.skin-alert .el-icon {
  margin-top: 2px;
  color: #e19a0c;
  font-size: 18px;
}

.skin-alert strong,
.meta-card__title {
  color: var(--dj-color-text-primary);
  font-size: 15px;
  font-weight: 700;
}

.skin-alert p {
  margin: 6px 0 0;
  color: var(--dj-color-text-regular);
  font-size: 13px;
  line-height: 1.6;
}

.meta-list {
  display: grid;
  gap: 12px;
  margin-top: 14px;
}

.meta-list__item {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  color: var(--dj-color-text-regular);
  font-size: 13px;
}

.meta-list__item strong {
  color: var(--dj-color-text-primary);
  text-align: right;
}

.action-card {
  display: grid;
  gap: 12px;
}

.action-card :deep(.el-button) {
  width: 100%;
  height: 42px;
  border-radius: 12px;
}

.preview-shell {
  display: grid;
  grid-template-columns: 230px minmax(0, 1fr);
  min-height: 520px;
  border: 1px solid var(--preview-border);
  border-radius: 24px;
  background-color: var(--preview-page-bg);
  background-image: var(--preview-decoration);
  background-size: var(--preview-decoration-size);
  overflow: hidden;
}

.preview-sidebar {
  display: grid;
  gap: 18px;
  align-content: start;
  padding: 20px 18px;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--preview-card-bg) 96%, var(--preview-primary) 4%) 0%,
    color-mix(in srgb, var(--preview-card-bg) 90%, var(--preview-primary) 10%) 100%
  );
  border-right: 1px solid var(--preview-border);
}

.preview-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.preview-brand strong {
  display: block;
  color: var(--preview-text-primary);
  font-size: 15px;
}

.preview-brand small {
  margin-top: 4px;
  display: block;
  color: var(--preview-text-regular);
}

.preview-brand__logo {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: var(--preview-primary);
  color: #fff;
  font-size: 18px;
  font-weight: 700;
}

.preview-menu {
  display: grid;
  gap: 10px;
}

.preview-menu__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 14px;
  color: var(--preview-text-secondary);
  font-weight: 600;
}

.preview-menu__item.is-active {
  color: var(--preview-primary);
  background: var(--preview-menu-active);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--preview-primary) 14%, white);
}

.preview-main {
  display: grid;
  grid-template-rows: auto 1fr;
  min-width: 0;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;
  background: var(--preview-header-bg);
  border-bottom: 1px solid var(--preview-border);
}

.preview-breadcrumb {
  color: var(--preview-text-secondary);
  font-size: 13px;
  font-weight: 600;
}

.preview-header__right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.preview-avatar {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: color-mix(in srgb, var(--preview-primary) 12%, white);
  color: var(--preview-primary);
  font-size: 14px;
  font-weight: 700;
}

.preview-content {
  display: grid;
  gap: 18px;
  padding: 20px;
}

.preview-board {
  padding: 16px;
  border: 1px solid var(--preview-border);
  border-radius: 18px;
  background: rgb(255 255 255 / 88%);
}

.preview-board--metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.preview-stat {
  padding: 16px;
  border: 1px solid var(--preview-border);
  border-radius: 16px;
  background: linear-gradient(
    180deg,
    var(--preview-card-bg) 0%,
    color-mix(in srgb, var(--preview-card-bg) 88%, var(--preview-primary) 12%) 100%
  );
}

.preview-stat label {
  color: var(--preview-text-secondary);
  font-size: 13px;
}

.preview-stat strong {
  display: block;
  margin-top: 12px;
  color: var(--preview-text-primary);
  font-size: 26px;
  line-height: 1;
}

.preview-stat span {
  display: block;
  margin-top: 8px;
  color: var(--preview-text-regular);
  font-size: 12px;
}

.preview-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(260px, 0.9fr);
  gap: 16px;
}

.preview-board__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.preview-board__header strong {
  color: var(--preview-text-primary);
}

.preview-text-link {
  color: var(--preview-primary);
  font-size: 12px;
  font-weight: 600;
}

.preview-list {
  display: grid;
  gap: 10px;
}

.preview-list__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid color-mix(in srgb, var(--preview-border) 72%, white);
  color: var(--preview-text-secondary);
}

.preview-list__item:last-child {
  border-bottom: 0;
}

.preview-list__item strong {
  color: var(--preview-primary);
}

.preview-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.preview-button {
  min-width: 104px;
  height: 36px;
  padding: 0 16px;
  border: 1px solid var(--preview-border);
  border-radius: 12px;
  background: var(--preview-card-bg);
  color: var(--preview-text-secondary);
  font-weight: 600;
}

.preview-button.is-primary {
  border-color: var(--preview-primary);
  background: var(--preview-primary);
  color: #fff;
}

.preview-tag,
.preview-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--preview-primary) 10%, white);
  color: var(--preview-primary);
  font-size: 12px;
  font-weight: 600;
}

.preview-tag.is-outline {
  background: transparent;
  border: 1px solid color-mix(in srgb, var(--preview-primary) 20%, white);
}

.preview-tag.is-soft {
  background: color-mix(in srgb, var(--preview-primary) 8%, white);
  color: var(--preview-text-secondary);
}

@media (max-width: 1280px) {
  .skin-layout,
  .scheme-row,
  .token-grid,
  .preview-shell,
  .preview-board--metrics,
  .preview-grid {
    grid-template-columns: 1fr;
  }
}
</style>
