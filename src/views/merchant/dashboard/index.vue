<script setup lang="ts">
import type { Component } from 'vue'
import {
  ChatDotRound,
  DataAnalysis,
  DocumentChecked,
  List,
  Money,
  Promotion,
  Tickets,
} from '@element-plus/icons-vue'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import { getConsultList } from '@/api/modules/consult'
import { getDemandList } from '@/api/modules/demand'
import { getOrderList } from '@/api/modules/order'
import { getReportList } from '@/api/modules/report'
import PageContainer from '@/components-business/PageContainer/index.vue'
import SectionCard from '@/components-business/SectionCard/index.vue'
import WorkbenchDonutPanel from '@/components-business/WorkbenchDonutPanel/index.vue'
import WorkbenchTrendPanel from '@/components-business/WorkbenchTrendPanel/index.vue'
import { ENTERPRISE_CAPABILITY } from '@/enum/role'
import {
  ConsultStatus,
  DemandStatus,
  OrderStatus,
  PaymentStatus,
  ReportStatus,
} from '@/enum/status'
import { useUserStore } from '@/store/modules/user'
import type { ConsultItem, DemandItem, OrderItem, ReportItem } from '@/types/business'

interface MetricCard {
  label: string
  value: string
  previous: string
  delta: string
  trend: 'up' | 'down' | 'flat'
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

interface IncomeWord {
  label: string
  value: string
  color: string
  size: string
}

interface TrendStatItem {
  label: string
  value: string | number
  previous: string
  delta: string
  trend: 'up' | 'down' | 'flat'
}

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const conversionRange = ref('week')
const executionRange = ref('week')
const userGranularity = ref('day')

const rangeOptions = [
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
]

const granularityOptions = [
  { label: '日维度', value: 'day' },
  { label: '周维度', value: 'week' },
  { label: '月维度', value: 'month' },
]

const demandList = ref<DemandItem[]>([])
const orderList = ref<OrderItem[]>([])
const consultList = ref<ConsultItem[]>([])
const reportList = ref<ReportItem[]>([])

const trendAxis = buildRecentDates()

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

function jump(path?: string) {
  if (!path) return
  router.push(path)
}

function buildTrendValues(seed: number, factors: number[]) {
  const base = seed > 0 ? seed : 6
  return factors.map((factor) => Math.max(0, Math.round(base * factor)))
}

function isToday(value?: string) {
  if (!value) return false
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return false

  const now = new Date()
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('zh-CN').format(value)
}

function formatPercent(value: number) {
  if (!Number.isFinite(value) || value === 0) return '0%'
  return `${value.toFixed(value >= 100 ? 0 : 1)}%`
}

function sumSeriesValues(
  series: Array<{
    values: number[]
  }>,
  index: number,
) {
  return series[index]?.values.reduce((sum, item) => sum + item, 0) || 0
}

function buildCompareMeta(current: number, baselineRatio: number, labelPrefix: string, isMoney = false) {
  const previousRaw =
    current > 0
      ? Math.max(Number((current * baselineRatio).toFixed(isMoney ? 2 : 0)), isMoney ? 0.01 : 1)
      : 0
  const deltaRaw = previousRaw > 0 ? Math.abs(((current - previousRaw) / previousRaw) * 100) : 0
  const trend: 'up' | 'down' | 'flat' =
    current > previousRaw ? 'up' : current < previousRaw ? 'down' : 'flat'

  return {
    previous: `${labelPrefix}${isMoney ? `￥${formatCurrency(previousRaw)}` : formatNumber(previousRaw)}`,
    delta: trend === 'flat' ? '0%' : `${trend === 'up' ? '↑' : '↓'}${formatPercent(deltaRaw)}`,
    trend,
  }
}

function buildMetricCard(
  label: string,
  rawValue: number,
  icon: Component,
  baselineRatio: number,
  formatter: (value: number) => string = formatNumber,
): MetricCard {
  const compare = buildCompareMeta(rawValue, baselineRatio, '昨日', formatter === formatCurrency)
  return {
    label,
    value: formatter === formatCurrency ? `￥${formatter(rawValue)}` : formatter(rawValue),
    icon,
    previous: compare.previous,
    delta: compare.delta,
    trend: compare.trend,
  }
}

function buildTrendStat(
  label: string,
  value: number,
  baselineRatio: number,
  isMoney = false,
): TrendStatItem {
  const compare = buildCompareMeta(value, baselineRatio, '上周', isMoney)
  return {
    label,
    value: isMoney ? `￥${formatCurrency(value)}` : formatNumber(value),
    previous: compare.previous,
    delta: compare.delta,
    trend: compare.trend,
  }
}

const isServiceProvider = computed(() =>
  userStore.hasEnterpriseCapability(ENTERPRISE_CAPABILITY.serviceProvider),
)

const dashboardTitle = computed(() =>
  isServiceProvider.value ? '机构后台-工作台' : '企业后台-工作台',
)

const enterpriseShortcuts = computed<ShortcutItem[]>(() => [
  { title: '查看需求大厅', path: '/enterprise/demand', icon: Tickets },
  {
    title: '快速报价',
    path: isServiceProvider.value ? '/enterprise/order-receive' : '/enterprise/order',
    icon: Promotion,
  },
  { title: '创建订单', path: '/enterprise/order', icon: List },
  { title: '上传检测报告', path: '/enterprise/report', icon: DocumentChecked },
  { title: '查看我的订单', path: '/enterprise/order', icon: DataAnalysis },
  {
    title: '处理客户咨询',
    path: isServiceProvider.value ? '/enterprise/consult' : '/enterprise/message',
    icon: ChatDotRound,
  },
  { title: '查看收入统计', path: '/enterprise/dashboard#income-structure', icon: Money },
])

const todayOrders = computed(() => orderList.value.filter((item) => isToday(item.createdAt)))
const todayOrderCount = computed(() => todayOrders.value.length)
const pendingDemandCount = computed(
  () =>
    demandList.value.filter((item) =>
      [DemandStatus.Pending, DemandStatus.Assigned, DemandStatus.Replied, DemandStatus.Processing].includes(
        item.status,
      ),
    ).length,
)
const pendingConsultCount = computed(
  () => consultList.value.filter((item) => item.status === ConsultStatus.Pending).length,
)
const completedReportCount = computed(
  () =>
    reportList.value.filter((item) =>
      [ReportStatus.Published, ReportStatus.Reviewing].includes(item.status),
    ).length,
)
const todayIncome = computed(() =>
  todayOrders.value.reduce((sum, item) => sum + Number(item.amount || 0), 0),
)
const quotePendingCount = computed(
  () =>
    demandList.value.filter((item) =>
      [DemandStatus.Assigned, DemandStatus.Replied].includes(item.status),
    ).length,
)
const signPendingCount = computed(
  () =>
    orderList.value.filter((item) =>
      [OrderStatus.Quoting, OrderStatus.WaitingPayment].includes(item.status),
    ).length,
)
const testingPendingCount = computed(
  () =>
    orderList.value.filter((item) =>
      [OrderStatus.WaitingSample, OrderStatus.Testing, OrderStatus.Reporting].includes(item.status),
    ).length,
)
const reportUploadCount = computed(
  () => orderList.value.filter((item) => [OrderStatus.Reporting].includes(item.status)).length,
)
const reportRejectedCount = computed(
  () =>
    reportList.value.filter((item) =>
      [ReportStatus.Invalid, ReportStatus.Hidden].includes(item.status),
    ).length,
)
const receivableCount = computed(
  () =>
    orderList.value.filter((item) =>
      [PaymentStatus.Unpaid, PaymentStatus.PartPaid].includes(item.paymentStatus),
    ).length,
)
const afterSaleCount = computed(
  () =>
    orderList.value.filter((item) =>
      [OrderStatus.Refunding, OrderStatus.Refunded].includes(item.status),
    ).length,
)

const metricCards = computed<MetricCard[]>(() => [
  buildMetricCard('今日订单数', todayOrderCount.value, List, 0.91),
  buildMetricCard('待处理需求', pendingDemandCount.value, Tickets, 0.43),
  buildMetricCard('待处理咨询', pendingConsultCount.value, ChatDotRound, 1.25),
  buildMetricCard('完成报告', completedReportCount.value, DocumentChecked, 1.25),
  buildMetricCard('今日收入', todayIncome.value, Money, 0.8, formatCurrency),
])

const pendingItems = computed<PendingItem[]>(() => [
  {
    title: '待响应需求',
    value: demandList.value.filter((item) => item.status === DemandStatus.Pending).length,
    path: '/enterprise/demand',
  },
  {
    title: '待报价',
    value: quotePendingCount.value,
    path: isServiceProvider.value ? '/enterprise/order-receive' : '/enterprise/order',
  },
  {
    title: '待签约订单',
    value: signPendingCount.value,
    path: '/enterprise/order',
  },
  {
    title: '待检测任务',
    value: testingPendingCount.value,
    path: '/enterprise/order',
  },
  {
    title: '报告待上传',
    value: reportUploadCount.value,
    path: '/enterprise/report',
  },
  {
    title: '报告被退回',
    value: reportRejectedCount.value,
    path: '/enterprise/report',
  },
  {
    title: '待收款订单',
    value: receivableCount.value,
    path: '/enterprise/order',
  },
  {
    title: '售后处理',
    value: afterSaleCount.value,
    path: '/enterprise/order',
  },
  {
    title: '咨询待回复',
    value: pendingConsultCount.value,
    path: isServiceProvider.value ? '/enterprise/consult' : '/enterprise/message',
  },
])

const conversionTrendSeries = computed(() => [
  {
    label: '接收到需求数',
    color: '#f59e0b',
    values: buildTrendValues(pendingDemandCount.value + demandList.value.length, [0.66, 0.62, 0.9, 0.64, 0.78, 0.82, 1]),
  },
  {
    label: '已报价需求数',
    color: '#fb7185',
    values: buildTrendValues(quotePendingCount.value + 1, [0.42, 0.5, 0.72, 0.46, 0.54, 0.58, 0.76]),
  },
  {
    label: '成交订单数',
    color: '#fdba74',
    values: buildTrendValues(orderList.value.length, [0.28, 0.34, 0.58, 0.36, 0.44, 0.48, 0.68]),
  },
])

const conversionTrendStats = computed(() => [
  buildTrendStat('本周接收需求', sumSeriesValues(conversionTrendSeries.value, 0), 1.18),
  buildTrendStat('本周已报价', sumSeriesValues(conversionTrendSeries.value, 1), 1.14),
  buildTrendStat('本周成交订单', sumSeriesValues(conversionTrendSeries.value, 2), 0.73),
])

const executionTrendSeries = computed(() => [
  {
    label: '执行中检测任务',
    color: '#fb923c',
    values: buildTrendValues(testingPendingCount.value + 1, [0.52, 0.5, 0.84, 0.6, 0.72, 0.8, 1]),
  },
  {
    label: '已完成检测任务',
    color: '#fdba74',
    values: buildTrendValues(completedReportCount.value + 1, [0.36, 0.34, 0.58, 0.42, 0.48, 0.62, 0.76]),
  },
  {
    label: '已上传报告数',
    color: '#f97316',
    values: buildTrendValues(reportUploadCount.value + 1, [0.24, 0.28, 0.46, 0.34, 0.36, 0.42, 0.56]),
  },
])

const executionTrendStats = computed(() => [
  buildTrendStat('执行中任务', sumSeriesValues(executionTrendSeries.value, 0), 1.16),
  buildTrendStat('已完成任务', sumSeriesValues(executionTrendSeries.value, 1), 1.16),
  buildTrendStat('报告上传数', sumSeriesValues(executionTrendSeries.value, 2), 0.74),
])

const clientTrendSeries = computed(() => [
  {
    label: '客户咨询数',
    color: '#4f8ef7',
    values: buildTrendValues(consultList.value.length + 1, [0.46, 0.58, 0.8, 0.44, 0.48, 0.52, 0.68]),
  },
  {
    label: '活跃客户数',
    color: '#6fd3f5',
    values: buildTrendValues(orderList.value.length + 1, [0.52, 0.5, 0.84, 0.5, 0.48, 0.52, 0.72]),
  },
  {
    label: '新增客户数',
    color: '#69b36d',
    values: buildTrendValues(todayOrderCount.value + 1, [0.74, 0.7, 1, 0.68, 0.82, 0.88, 1.04]),
  },
])

const serviceOverviewItems = computed(() => [
  {
    label: '待报价',
    value: Math.max(quotePendingCount.value, 1),
    color: '#55a85e',
  },
  {
    label: '执行中',
    value: Math.max(testingPendingCount.value, 1),
    color: '#5b8ef8',
  },
  {
    label: '已完成',
    value: Math.max(completedReportCount.value, 1),
    color: '#63c3cf',
  },
  {
    label: '咨询跟进',
    value: Math.max(pendingConsultCount.value, 1),
    color: '#f3b36b',
  },
])

const receivedAmount = computed(() =>
  orderList.value
    .filter((item) => item.paymentStatus === PaymentStatus.Paid)
    .reduce((sum, item) => sum + Number(item.amount || 0), 0),
)
const pendingAmount = computed(() =>
  orderList.value
    .filter((item) => [PaymentStatus.Unpaid, PaymentStatus.PartPaid].includes(item.paymentStatus))
    .reduce((sum, item) => sum + Number(item.amount || 0), 0),
)
const refundAmount = computed(() =>
  orderList.value
    .filter((item) => [OrderStatus.Refunding, OrderStatus.Refunded].includes(item.status))
    .reduce((sum, item) => sum + Number(item.amount || 0), 0),
)

const incomeWords = computed<IncomeWord[]>(() => [
  {
    label: '已回款金额',
    value: `￥${formatCurrency(receivedAmount.value)}`,
    color: '#2f7cf6',
    size: '24px',
  },
  {
    label: '待回款金额',
    value: `￥${formatCurrency(pendingAmount.value)}`,
    color: '#20b2aa',
    size: '22px',
  },
  {
    label: '退款金额',
    value: `￥${formatCurrency(refundAmount.value)}`,
    color: '#f97316',
    size: '20px',
  },
])

async function loadData() {
  loading.value = true
  try {
    const [demandRes, orderRes, consultRes, reportRes] = await Promise.all([
      getDemandList({ pageNum: 1, pageSize: 12 }),
      getOrderList({ pageNum: 1, pageSize: 12 }),
      getConsultList({ pageNum: 1, pageSize: 12 }),
      getReportList({ pageNum: 1, pageSize: 12 }),
    ])

    demandList.value = demandRes.list
    orderList.value = orderRes.list
    consultList.value = consultRes.list
    reportList.value = reportRes.list
  } finally {
    loading.value = false
  }
}

loadData()
</script>

<template>
  <PageContainer>
    <div class="workbench-head">
      <h1>{{ dashboardTitle }}</h1>
    </div>

    <section v-loading="loading" class="metric-grid">
      <article v-for="item in metricCards" :key="item.label" class="metric-card">
        <div class="metric-card__head">
          <span>{{ item.label }}</span>
          <div class="metric-card__icon">
            <el-icon><component :is="item.icon" /></el-icon>
          </div>
        </div>
        <strong class="metric-card__value">{{ item.value }}</strong>
        <div class="metric-card__foot">
          <span>{{ item.previous }}</span>
          <em :class="[`is-${item.trend}`]">{{ item.delta }}</em>
        </div>
      </article>
    </section>

    <div class="summary-grid">
      <SectionCard title="待处理事项">
        <div class="todo-board todo-board--compact">
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

      <SectionCard title="快捷入口">
        <div class="shortcut-strip">
          <button
            v-for="item in enterpriseShortcuts"
            :key="item.title"
            type="button"
            class="shortcut-strip__item"
            @click="jump(item.path)"
          >
            <span class="shortcut-strip__icon">
              <el-icon><component :is="item.icon" /></el-icon>
            </span>
            <span class="shortcut-strip__title">{{ item.title }}</span>
          </button>
        </div>
      </SectionCard>
    </div>

    <div class="content-grid">
      <div class="content-grid__main">
        <SectionCard title="接单与转化趋势">
          <template #extra>
            <div class="chart-toolbar">
              <el-radio-group v-model="conversionRange" size="small">
                <el-radio-button
                  v-for="item in rangeOptions"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.label }}
                </el-radio-button>
              </el-radio-group>
              <el-select model-value="自定义时间" size="small" style="width: 120px">
                <el-option label="自定义时间" value="自定义时间" />
              </el-select>
            </div>
          </template>
          <WorkbenchTrendPanel
            :x-axis="trendAxis"
            :series="conversionTrendSeries"
            :stats="conversionTrendStats"
            :height="228"
          />
        </SectionCard>

        <SectionCard title="业务执行与交付趋势">
          <template #extra>
            <div class="chart-toolbar">
              <el-radio-group v-model="executionRange" size="small">
                <el-radio-button
                  v-for="item in rangeOptions"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.label }}
                </el-radio-button>
              </el-radio-group>
              <el-select model-value="自定义时间" size="small" style="width: 120px">
                <el-option label="自定义时间" value="自定义时间" />
              </el-select>
            </div>
          </template>
          <WorkbenchTrendPanel
            :x-axis="trendAxis"
            :series="executionTrendSeries"
            :stats="executionTrendStats"
            :height="228"
          />
        </SectionCard>
      </div>

      <div class="content-grid__aside">
        <SectionCard title="服务与商品总览">
          <WorkbenchDonutPanel
            :items="serviceOverviewItems"
            center-title="总数"
            :footer="[
              { label: '待报价', value: formatNumber(quotePendingCount) },
              { label: '执行中', value: formatNumber(testingPendingCount) },
              { label: '已完成', value: formatNumber(completedReportCount) },
            ]"
            :height="196"
          />
        </SectionCard>

        <SectionCard id="income-structure" title="收入结构">
          <div class="income-cloud">
            <article
              v-for="item in incomeWords"
              :key="item.label"
              class="income-word"
              :style="{ color: item.color }"
            >
              <span class="income-word__label" :style="{ fontSize: item.size }">{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </article>
          </div>
        </SectionCard>

        <SectionCard title="用户趋势">
          <template #extra>
            <el-select v-model="userGranularity" size="small" style="width: 108px">
              <el-option
                v-for="item in granularityOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </template>
          <WorkbenchTrendPanel :x-axis="trendAxis" :series="clientTrendSeries" :height="214" />
        </SectionCard>
      </div>
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
  padding: 14px 16px;
  border: 1px solid rgb(84 135 255 / 56%);
  border-radius: 16px;
  background:
    radial-gradient(circle at top right, rgb(31 94 255 / 10%), transparent 38%),
    linear-gradient(180deg, #fff 0%, #fbfdff 100%);
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
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: rgb(47 124 246 / 88%);
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

.metric-card__foot span {
  color: #111827;
}

.metric-card__foot em {
  font-style: normal;
  font-weight: 600;
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

.summary-grid,
.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.68fr) minmax(340px, 1fr);
  gap: 16px;
  align-items: start;
}

.content-grid__main,
.content-grid__aside {
  display: grid;
  gap: 16px;
  min-width: 0;
}

.todo-board--compact {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0 18px;
}

.todo-board__item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 10px;
  padding: 12px 0;
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

.shortcut-strip {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 10px;
}

.shortcut-strip__item {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 8px;
  border: 1px solid rgb(15 23 42 / 6%);
  border-radius: 14px;
  background: linear-gradient(180deg, #fff 0%, #fbfcff 100%);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.shortcut-strip__item:hover,
.todo-board__item:hover,
.income-word:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgb(15 23 42 / 8%);
}

.shortcut-strip__icon {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: rgb(47 124 246 / 10%);
  color: var(--dj-color-primary);
  font-size: 16px;
}

.shortcut-strip__title {
  text-align: center;
  color: var(--dj-color-text-primary);
  font-size: 12px;
  font-weight: 600;
  line-height: 1.35;
}

.chart-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.income-cloud {
  display: grid;
  min-height: 214px;
  gap: 12px;
}

.income-word {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 16px;
  border: 1px solid rgb(15 23 42 / 7%);
  border-radius: 16px;
  background: linear-gradient(180deg, #fff 0%, #fbfcff 100%);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.income-word__label {
  font-weight: 700;
  line-height: 1.1;
}

.income-word strong {
  font-size: 18px;
  color: var(--dj-color-text-primary);
}

@media (max-width: 1600px) {
  .metric-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .shortcut-strip {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 1280px) {
  .summary-grid,
  .content-grid {
    grid-template-columns: 1fr;
  }

  .todo-board--compact {
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
  .todo-board--compact,
  .shortcut-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .metric-grid,
  .todo-board--compact,
  .shortcut-strip {
    grid-template-columns: 1fr;
  }

  .chart-toolbar {
    flex-wrap: wrap;
    justify-content: flex-end;
  }
}
</style>
