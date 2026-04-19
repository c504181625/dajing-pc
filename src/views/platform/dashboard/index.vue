<script setup lang="ts">
import type { Component } from 'vue'
import {
  Bell,
  DocumentChecked,
  Money,
  OfficeBuilding,
  Promotion,
  Tickets,
  User,
  WarningFilled,
} from '@element-plus/icons-vue'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import { getPlatformDashboard } from '@/api/modules/dashboard'
import PageContainer from '@/components-business/PageContainer/index.vue'
import SectionCard from '@/components-business/SectionCard/index.vue'
import WorkbenchDonutPanel from '@/components-business/WorkbenchDonutPanel/index.vue'
import WorkbenchTrendPanel from '@/components-business/WorkbenchTrendPanel/index.vue'
import type { PlatformWorkbenchData } from '@/types/business'

interface MetricCard {
  label: string
  value: number
  previous: string
  delta: string
  trend: 'up' | 'down' | 'flat'
  path: string
  icon: Component
}

interface PendingItem {
  title: string
  value: number
  path: string
}

interface ShortcutItem {
  title: string
  path: string
  icon: Component
}

interface TrendStatItem {
  label: string
  value: string | number
  previous: string
  delta: string
  trend: 'up' | 'down' | 'flat'
}

type RangeMode = 'week' | 'month' | 'custom'

const router = useRouter()
const loading = ref(false)

const primaryRangeMode = ref<RangeMode>('week')
const secondaryRangeMode = ref<RangeMode>('week')
const primaryCustomRange = ref<string[]>([])
const secondaryCustomRange = ref<string[]>([])
const userGranularity = ref('day')

const rangeModeOptions = [
  { label: '本周', value: 'week' as const },
  { label: '本月', value: 'month' as const },
  { label: '自定义时间', value: 'custom' as const },
]

const granularityOptions = [
  { label: '日维度', value: 'day' },
  { label: '周维度', value: 'week' },
  { label: '月维度', value: 'month' },
]

const workbench = ref<PlatformWorkbenchData>({
  todos: [],
  recentOperations: [],
  quickEntries: [],
  overviewMetrics: [],
  priorityQueue: [],
  flowBoard: [],
  riskAlerts: [],
})

const trendAxis = buildRecentDates()

const operatorShortcuts: ShortcutItem[] = [
  { title: '企业/机构审核', path: '/operator/business/enterprise-audit', icon: OfficeBuilding },
  { title: '需求审核处理', path: '/operator/business/demand', icon: Tickets },
  { title: '订单异常处理', path: '/operator/business/order', icon: WarningFilled },
  { title: '退款审批处理', path: '/operator/business/order', icon: Money },
  { title: '报告审核发布', path: '/operator/business/report', icon: DocumentChecked },
  { title: '发布平台公告', path: '/operator/business/community-home?tab=news', icon: Bell },
  { title: '新增运营活动', path: '/operator/system/skin', icon: Promotion },
]

function buildRecentDates() {
  const formatter = new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
  })
  const list: string[] = []
  const today = new Date()

  for (let index = 6; index >= 0; index -= 1) {
    const current = new Date(today)
    current.setDate(today.getDate() - index)
    list.push(formatter.format(current).replace('/', '-'))
  }

  return list
}

function normalizeText(value: unknown) {
  return String(value || '').toLowerCase()
}

function matchKeywords(value: unknown, keywords: string[]) {
  const text = normalizeText(value)
  return keywords.some((keyword) => text.includes(keyword.toLowerCase()))
}

function pickOverviewMetric(keywords: string[], fallbackIndex: number) {
  const metrics = workbench.value.overviewMetrics || []
  return (
    metrics.find((item) =>
      [item.key, item.label, item.description, item.highlight].some((field) =>
        matchKeywords(field, keywords),
      ),
    ) || metrics[fallbackIndex]
  )
}

function pickTodoItem(keywords: string[]) {
  return (
    workbench.value.todos.find((item) =>
      [item.code, item.title].some((field) => matchKeywords(field, keywords)),
    ) || null
  )
}

function getMetricValue(keywords: string[], fallbackIndex: number, fallbackValue = 0) {
  const metric = pickOverviewMetric(keywords, fallbackIndex)
  return Number(metric?.value || fallbackValue)
}

function getTodoValue(keywords: string[], fallbackValue = 0) {
  return pickTodoItem(keywords)?.value || fallbackValue
}

function jump(path?: string) {
  if (!path) return
  router.push(path)
}

function buildTrendValues(seed: number, factors: number[]) {
  const base = seed > 0 ? seed : 12
  return factors.map((factor) => Math.max(0, Math.round(base * factor)))
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('zh-CN').format(value)
}

function formatPercent(value: number) {
  if (!Number.isFinite(value) || value === 0) return '0%'
  return `${value.toFixed(value >= 100 ? 0 : 1)}%`
}

function keywordFontSize(value: number) {
  return `${Math.min(22, 14 + value * 1.1)}px`
}

function sumSeriesValues(
  series: Array<{
    values: number[]
  }>,
  index: number,
) {
  return series[index]?.values.reduce((sum, item) => sum + item, 0) || 0
}

function buildCompareMeta(current: number, baselineRatio: number, labelPrefix: string) {
  const previousRaw = current > 0 ? Math.max(Math.round(current * baselineRatio), 1) : 0
  const deltaRaw = previousRaw > 0 ? Math.abs(((current - previousRaw) / previousRaw) * 100) : 0
  const trend: 'up' | 'down' | 'flat' =
    current > previousRaw ? 'up' : current < previousRaw ? 'down' : 'flat'

  return {
    previous: `${labelPrefix}${formatNumber(previousRaw)}`,
    delta: trend === 'flat' ? '0%' : `${trend === 'up' ? '↑' : '↓'}${formatPercent(deltaRaw)}`,
    trend,
  }
}

function buildMetricCard(
  label: string,
  value: number,
  path: string,
  icon: Component,
  baselineRatio: number,
): MetricCard {
  return {
    label,
    value,
    path,
    icon,
    ...buildCompareMeta(value, baselineRatio, '昨日'),
  }
}

function buildTrendStat(
  label: string,
  value: number,
  baselineRatio: number,
  previousPrefix = '上周',
): TrendStatItem {
  const compare = buildCompareMeta(value, baselineRatio, previousPrefix)
  return {
    label,
    value: formatNumber(value),
    previous: compare.previous,
    delta: compare.delta,
    trend: compare.trend,
  }
}

const metricCards = computed<MetricCard[]>(() => {
  const orderMetric = pickOverviewMetric(['订单', 'order'], 0)
  const enterpriseMetric = pickOverviewMetric(['企业', '机构', 'enterprise'], 1)
  const userMetric = pickOverviewMetric(['用户', 'user'], 2)
  const demandMetric = pickOverviewMetric(['需求', 'demand'], 3)
  const reportMetric = pickOverviewMetric(['报告', 'report'], 4)

  return [
    buildMetricCard('今日订单总数', Number(orderMetric?.value || 0), '/operator/business/order', Tickets, 0.91),
    buildMetricCard('今日入驻企业', Number(enterpriseMetric?.value || 0), '/operator/business/enterprise-audit', OfficeBuilding, 0.43),
    buildMetricCard('今日新增用户', Number(userMetric?.value || 0), '/operator/business/user', User, 1.25),
    buildMetricCard('今日新增需求', Number(demandMetric?.value || 0), '/operator/business/demand', Promotion, 1.25),
    buildMetricCard('今日生成报告', Number(reportMetric?.value || 0), '/operator/business/report', DocumentChecked, 0.8),
  ]
})

const pendingItems = computed<PendingItem[]>(() => [
  {
    title: '企业审核',
    value: getTodoValue(['企业', '机构', '审核'], getMetricValue(['企业', '机构'], 1)),
    path: '/operator/business/enterprise-audit',
  },
  {
    title: '需求审核',
    value: getTodoValue(['需求', '审核'], getMetricValue(['需求'], 3)),
    path: '/operator/business/demand',
  },
  {
    title: '订单异常',
    value: getTodoValue(['订单', '异常'], (workbench.value.riskAlerts || []).length),
    path: '/operator/business/order',
  },
  {
    title: '报告审核',
    value: getTodoValue(['报告', '审核'], getMetricValue(['报告'], 4)),
    path: '/operator/business/report',
  },
  {
    title: '投诉举报',
    value: getTodoValue(['投诉', '举报'], Math.max(workbench.value.todos.length - 1, 0)),
    path: '/operator/business/comment',
  },
  {
    title: '退款申请',
    value: getTodoValue(['退款', '审批'], 0),
    path: '/operator/business/order',
  },
  {
    title: '内容审核',
    value: getTodoValue(['内容', '公告'], Math.min(workbench.value.recentOperations.length, 9)),
    path: '/operator/business/community-home?tab=news',
  },
  {
    title: '咨询监管',
    value: getTodoValue(['咨询'], Math.min(workbench.value.todos.length, 9)),
    path: '/operator/business/consult',
  },
  {
    title: '系统异常',
    value: getTodoValue(
      ['系统', '异常'],
      (workbench.value.riskAlerts || []).filter((item) => item.level === 'danger').length,
    ),
    path: '/operator/system/role',
  },
])

const primaryTrendSeries = computed(() => {
  const demandSeed = getMetricValue(['需求'], 3, 18)
  const orderSeed = getMetricValue(['订单'], 0, 15)
  const reportSeed = getMetricValue(['报告'], 4, 8)

  return [
    {
      label: '发布需求数',
      color: '#f59e0b',
      values: buildTrendValues(demandSeed, [0.58, 0.54, 0.82, 0.6, 0.74, 0.8, 1]),
    },
    {
      label: '响应需求数',
      color: '#fb7185',
      values: buildTrendValues(orderSeed, [0.4, 0.46, 0.72, 0.44, 0.52, 0.5, 0.7]),
    },
    {
      label: '完成检测数',
      color: '#fdba74',
      values: buildTrendValues(reportSeed, [0.3, 0.34, 0.56, 0.36, 0.4, 0.48, 0.62]),
    },
  ]
})

const primaryTrendStats = computed(() => [
  buildTrendStat('发布需求数', sumSeriesValues(primaryTrendSeries.value, 0), 1.18),
  buildTrendStat('响应需求数', sumSeriesValues(primaryTrendSeries.value, 1), 1.14),
  buildTrendStat('完成检测数', sumSeriesValues(primaryTrendSeries.value, 2), 0.73),
])

const serviceTrendSeries = computed(() => {
  const orderSeed = getMetricValue(['订单'], 0, 16)
  const reportSeed = getMetricValue(['报告'], 4, 10)
  const userSeed = getMetricValue(['用户'], 2, 12)

  return [
    {
      label: '成交金额',
      color: '#fb923c',
      values: buildTrendValues(orderSeed, [0.56, 0.54, 0.9, 0.62, 0.74, 0.82, 1.02]),
    },
    {
      label: '已完成服务金额',
      color: '#fdba74',
      values: buildTrendValues(reportSeed, [0.44, 0.42, 0.72, 0.52, 0.58, 0.72, 0.86]),
    },
    {
      label: '平台收入',
      color: '#f97316',
      values: buildTrendValues(userSeed, [0.28, 0.4, 0.62, 0.36, 0.42, 0.4, 0.58]),
    },
  ]
})

const serviceTrendStats = computed(() => [
  buildTrendStat('成交金额', sumSeriesValues(serviceTrendSeries.value, 0), 1.16),
  buildTrendStat('已完成服务金额', sumSeriesValues(serviceTrendSeries.value, 1), 1.16),
  buildTrendStat('平台收入', sumSeriesValues(serviceTrendSeries.value, 2), 0.74),
])

const userTrendSeries = computed(() => {
  const userSeed = getMetricValue(['用户'], 2, 12)
  const enterpriseSeed = getMetricValue(['企业', '机构'], 1, 8)
  const operatorSeed = Math.max((workbench.value.recentOperations || []).length, 3)

  return [
    {
      label: '新增用户',
      color: '#4f8ef7',
      values: buildTrendValues(userSeed, [0.46, 0.58, 0.86, 0.4, 0.5, 0.46, 0.72]),
    },
    {
      label: '在线机构数',
      color: '#6fd3f5',
      values: buildTrendValues(enterpriseSeed, [0.54, 0.52, 0.88, 0.52, 0.5, 0.52, 0.76]),
    },
    {
      label: '在线专家数',
      color: '#69b36d',
      values: buildTrendValues(operatorSeed, [0.72, 0.68, 1, 0.66, 0.82, 0.86, 1.06]),
    },
  ]
})

const structureItems = computed(() => [
  { label: '检验检测', value: Math.max(getMetricValue(['订单'], 0, 32), 1), color: '#5b8ef8' },
  { label: '认证认可', value: Math.max(getMetricValue(['企业', '机构'], 1, 20), 1), color: '#63c3cf' },
  { label: '计量服务', value: Math.max(getMetricValue(['报告'], 4, 16), 1), color: '#55a85e' },
  { label: '质量培训', value: Math.max(getMetricValue(['用户'], 2, 14), 1), color: '#9fc6ff' },
  { label: '质量咨询', value: Math.max(getTodoValue(['咨询'], 6), 1), color: '#f3b36b' },
])

const structureTotal = computed(() =>
  structureItems.value.reduce((sum, item) => sum + item.value, 0),
)

const keywordItems = computed(() => [
  { label: '企业审核', value: pendingItems.value[0]?.value || 0, color: '#2f7cf6' },
  { label: '需求审核', value: pendingItems.value[1]?.value || 0, color: '#7a63f1' },
  { label: '订单异常', value: pendingItems.value[2]?.value || 0, color: '#f97316' },
  { label: '报告审核', value: pendingItems.value[3]?.value || 0, color: '#20b2aa' },
  { label: '投诉举报', value: pendingItems.value[4]?.value || 0, color: '#fb7185' },
  { label: '退款申请', value: pendingItems.value[5]?.value || 0, color: '#ef4444' },
  { label: '内容审核', value: pendingItems.value[6]?.value || 0, color: '#2563eb' },
  { label: '咨询监管', value: pendingItems.value[7]?.value || 0, color: '#14b8a6' },
  { label: '系统异常', value: pendingItems.value[8]?.value || 0, color: '#64748b' },
])

async function loadData() {
  loading.value = true
  try {
    workbench.value = await getPlatformDashboard()
  } finally {
    loading.value = false
  }
}

loadData()
</script>

<template>
  <PageContainer>
    <div class="workbench-head">
      <h1>平台运营后台-工作台</h1>
    </div>

    <section v-loading="loading" class="metric-grid">
      <article
        v-for="item in metricCards"
        :key="item.label"
        class="metric-card"
        @click="jump(item.path)"
      >
        <div class="metric-card__head">
          <span>{{ item.label }}</span>
          <div class="metric-card__icon">
            <el-icon><component :is="item.icon" /></el-icon>
          </div>
        </div>
        <strong class="metric-card__value">{{ formatNumber(item.value) }}</strong>
        <div class="metric-card__foot">
          <span>{{ item.previous }}</span>
          <em :class="[`is-${item.trend}`]">{{ item.delta }}</em>
        </div>
      </article>
    </section>

    <div class="summary-grid">
      <SectionCard title="待处理事项" class="summary-card" body-class="summary-card__body">
        <div class="todo-board">
          <button
            v-for="item in pendingItems"
            :key="item.title"
            type="button"
            class="todo-board__item"
            @click="jump(item.path)"
          >
            <span class="todo-board__title">{{ item.title }}</span>
            <span class="todo-board__value">{{ item.value }}</span>
            <span class="todo-board__arrow">›</span>
          </button>
        </div>
      </SectionCard>

      <SectionCard title="快捷入口" class="summary-card" body-class="summary-card__body">
        <div class="shortcut-board">
          <button
            v-for="item in operatorShortcuts"
            :key="item.title"
            type="button"
            class="shortcut-board__item"
            @click="jump(item.path)"
          >
            <span class="shortcut-board__icon">
              <el-icon><component :is="item.icon" /></el-icon>
            </span>
            <span class="shortcut-board__title">{{ item.title }}</span>
          </button>
        </div>
      </SectionCard>
    </div>

    <div class="analytics-grid">
      <SectionCard title="检测业务趋势" class="grid-span-6" body-class="panel-body panel-body--trend">
        <template #extra>
          <div class="chart-toolbar">
            <div class="range-switch">
              <button
                v-for="item in rangeModeOptions"
                :key="item.value"
                type="button"
                class="range-switch__item"
                :class="{ 'is-active': primaryRangeMode === item.value }"
                @click="primaryRangeMode = item.value"
              >
                {{ item.label }}
              </button>
            </div>
            <el-date-picker
              v-if="primaryRangeMode === 'custom'"
              v-model="primaryCustomRange"
              type="daterange"
              size="small"
              unlink-panels
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
            />
          </div>
        </template>
        <WorkbenchTrendPanel
          :x-axis="trendAxis"
          :series="primaryTrendSeries"
          :stats="primaryTrendStats"
          :height="118"
        />
      </SectionCard>

      <SectionCard title="质量服务结构分布" class="grid-span-3" body-class="panel-body panel-body--small">
        <WorkbenchDonutPanel
          :items="structureItems"
          center-title="总数"
          :footer="[
            { label: '总服务数', value: formatNumber(structureTotal) },
            { label: '在线服务', value: formatNumber(metricCards[0]?.value || 0) },
            { label: '本周新增', value: formatNumber(metricCards[3]?.value || 0) },
          ]"
          :height="118"
        />
      </SectionCard>

      <SectionCard title="关键词搜索" class="grid-span-3" body-class="panel-body panel-body--small">
        <div class="keyword-cloud">
          <span
            v-for="item in keywordItems"
            :key="item.label"
            class="keyword-item"
            :style="{ color: item.color, fontSize: keywordFontSize(item.value) }"
          >
            {{ item.label }}
          </span>
        </div>
      </SectionCard>

      <SectionCard title="服务交易与质量产出趋势" class="grid-span-8" body-class="panel-body panel-body--trend">
        <template #extra>
          <div class="chart-toolbar">
            <div class="range-switch">
              <button
                v-for="item in rangeModeOptions"
                :key="item.value"
                type="button"
                class="range-switch__item"
                :class="{ 'is-active': secondaryRangeMode === item.value }"
                @click="secondaryRangeMode = item.value"
              >
                {{ item.label }}
              </button>
            </div>
            <el-date-picker
              v-if="secondaryRangeMode === 'custom'"
              v-model="secondaryCustomRange"
              type="daterange"
              size="small"
              unlink-panels
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
            />
          </div>
        </template>
        <WorkbenchTrendPanel
          :x-axis="trendAxis"
          :series="serviceTrendSeries"
          :stats="serviceTrendStats"
          :height="118"
        />
      </SectionCard>

      <SectionCard title="用户趋势" class="grid-span-4" body-class="panel-body panel-body--trend panel-body--user">
        <template #extra>
          <el-select v-model="userGranularity" size="small" style="width: 110px">
            <el-option
              v-for="item in granularityOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </template>
        <WorkbenchTrendPanel :x-axis="trendAxis" :series="userTrendSeries" :height="118" />
      </SectionCard>
    </div>
  </PageContainer>
</template>

<style scoped lang="scss">
.workbench-head h1 {
  margin: 0;
  font-size: 20px;
  line-height: 1.2;
  color: var(--dj-color-text-primary);
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
}

.metric-card {
  padding: 12px 14px;
  border: 1px solid color-mix(in srgb, var(--dj-color-primary) 32%, white);
  border-radius: 16px;
  background:
    radial-gradient(circle at top right, color-mix(in srgb, var(--dj-color-primary) 10%, transparent), transparent 38%),
    linear-gradient(180deg, #fff 0%, #fbfdff 100%);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.metric-card:hover,
.todo-board__item:hover,
.shortcut-board__item:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgb(15 23 42 / 8%);
}

.metric-card__head,
.metric-card__foot {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.metric-card__head span {
  font-size: 13px;
  color: var(--dj-color-text-primary);
}

.metric-card__icon {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: var(--dj-color-primary);
  color: #fff;
  font-size: 15px;
}

.metric-card__value {
  display: block;
  margin-top: 10px;
  font-size: 28px;
  line-height: 1;
  color: var(--dj-color-text-primary);
}

.metric-card__foot {
  margin-top: 12px;
  align-items: center;
}

.metric-card__foot span,
.metric-card__foot em {
  font-size: 12px;
  line-height: 1.4;
}

.metric-card__foot em {
  font-style: normal;
  font-weight: 700;
}

.is-up {
  color: #ef4444;
}

.is-down {
  color: #16a34a;
}

.is-flat {
  color: var(--dj-color-text-regular);
}

.summary-grid {
  display: grid;
  grid-template-columns: minmax(0, 11fr) minmax(0, 8fr);
  gap: 14px;
  align-items: stretch;
}

.summary-card {
  height: 100%;
}

.summary-card:deep(.el-card__body) {
  height: calc(100% - 57px);
}

.summary-card__body {
  height: 100%;
}

.todo-board {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0 14px;
  height: 100%;
  align-content: start;
}

.todo-board__item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 10px;
  padding: 9px 0;
  border: 0;
  border-bottom: 1px solid rgb(15 23 42 / 6%);
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.todo-board__item:nth-last-child(-n + 3) {
  border-bottom: 0;
}

.todo-board__title {
  overflow: hidden;
  color: var(--dj-color-text-primary);
  font-size: 15px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.todo-board__value {
  color: #ef4444;
  font-size: 15px;
  font-weight: 700;
}

.todo-board__arrow {
  color: #c0c6d4;
  font-size: 16px;
}

.shortcut-board {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  align-content: start;
  height: 100%;
}

.shortcut-board__item {
  display: flex;
  min-width: 0;
  min-height: 70px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 6px;
  border: 1px solid rgb(15 23 42 / 6%);
  border-radius: 14px;
  background: linear-gradient(180deg, #fff 0%, #fbfcff 100%);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.shortcut-board__icon {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: color-mix(in srgb, var(--dj-color-primary) 10%, white);
  color: var(--dj-color-primary);
  font-size: 16px;
}

.shortcut-board__title {
  text-align: center;
  color: var(--dj-color-text-primary);
  font-size: 12px;
  font-weight: 600;
  line-height: 1.35;
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 14px;
  align-items: stretch;
}

.grid-span-6 {
  grid-column: span 6;
}

.grid-span-4 {
  grid-column: span 4;
}

.grid-span-8 {
  grid-column: span 8;
}

.grid-span-3 {
  grid-column: span 3;
}

.panel-body {
  height: 100%;
}

.panel-body--trend {
  min-height: 176px;
}

.panel-body--small {
  min-height: 176px;
}

.panel-body--user {
  display: flex;
  flex-direction: column;
  justify-content: stretch;
}

.chart-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.range-switch {
  display: inline-flex;
  align-items: center;
  padding: 4px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--dj-color-primary) 7%, white);
}

.range-switch__item {
  min-width: 66px;
  height: 30px;
  padding: 0 12px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--dj-color-text-secondary);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.range-switch__item.is-active {
  background: var(--dj-color-primary);
  color: #fff;
}

.keyword-cloud {
  display: flex;
  min-height: 100%;
  flex-wrap: wrap;
  align-content: flex-start;
  justify-content: flex-start;
  gap: 8px 10px;
  padding: 0;
}

.keyword-item {
  font-weight: 700;
  line-height: 1.1;
}

@media (max-width: 1600px) {
  .metric-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 1280px) {
  .summary-grid,
  .analytics-grid {
    grid-template-columns: 1fr;
  }

  .grid-span-6,
  .grid-span-8,
  .grid-span-4,
  .grid-span-3,
  .grid-span-2 {
    grid-column: span 1;
  }

  .todo-board {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .todo-board__item:nth-last-child(-n + 3) {
    border-bottom: 1px solid rgb(15 23 42 / 6%);
  }

  .todo-board__item:nth-last-child(-n + 2) {
    border-bottom: 0;
  }
}

@media (max-width: 900px) {
  .metric-grid,
  .todo-board,
  .shortcut-board {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .metric-grid,
  .todo-board,
  .shortcut-board {
    grid-template-columns: 1fr;
  }
}
</style>
