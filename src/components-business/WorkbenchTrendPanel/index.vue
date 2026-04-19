<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { graphic, init } from '@/utils/echarts'
import type { ECharts, EChartsCoreOption } from '@/utils/echarts'

interface TrendSeriesItem {
  label: string
  color: string
  values: number[]
}

interface TrendStatItem {
  label: string
  value: string | number
  previous?: string
  delta?: string
  compare?: string
  trend?: 'up' | 'down' | 'flat'
}

const props = withDefaults(
  defineProps<{
    xAxis?: string[]
    series: TrendSeriesItem[]
    stats?: TrendStatItem[]
    height?: number
  }>(),
  {
    xAxis: () => [],
    stats: () => [],
    height: 156,
  },
)

const chartEl = ref<HTMLDivElement>()
let chart: ECharts | null = null
let resizeObserver: ResizeObserver | null = null

const xAxisData = computed(() => {
  if (props.xAxis.length) return props.xAxis
  const maxLength = Math.max(...props.series.map((item) => item.values.length), 0)
  return Array.from({ length: maxLength }, (_, index) => `${index + 1}`)
})

function getAreaColor(color: string) {
  return new graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: `${color}55` },
    { offset: 1, color: `${color}05` },
  ])
}

function createOption(): EChartsCoreOption {
  return {
    animationDuration: 500,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      confine: false,
      renderMode: 'html',
      extraCssText: 'z-index: 9999;',
      backgroundColor: 'rgba(15, 23, 42, 0.88)',
      borderWidth: 0,
      textStyle: {
        color: '#fff',
        fontSize: 12,
      },
    },
    legend: {
      top: 0,
      left: 0,
      itemWidth: 10,
      itemHeight: 10,
      icon: 'circle',
      textStyle: {
        color: '#6b7280',
        fontSize: 12,
      },
      data: props.series.map((item) => item.label),
    },
    grid: {
      top: 26,
      left: 0,
      right: 0,
      bottom: 6,
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xAxisData.value,
      axisLine: {
        lineStyle: {
          color: 'rgba(15, 23, 42, 0.08)',
        },
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: '#6b7280',
        fontSize: 12,
      },
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        show: false,
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(15, 23, 42, 0.08)',
          type: 'dashed',
        },
      },
    },
    series: props.series.map((item) => ({
      type: 'line',
      name: item.label,
      smooth: true,
      data: item.values,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: {
        width: 2.5,
        color: item.color,
      },
      itemStyle: {
        color: item.color,
        borderColor: '#fff',
        borderWidth: 2,
      },
      areaStyle: {
        color: getAreaColor(item.color),
      },
    })),
  }
}

function renderChart() {
  if (!chartEl.value) return

  if (!chart) {
    chart = init(chartEl.value)
  }

  chart.setOption(createOption(), true)
  chart.resize()
}

function handleResize() {
  chart?.resize()
}

onMounted(async () => {
  await nextTick()
  renderChart()
  window.addEventListener('resize', handleResize)

  if (typeof ResizeObserver !== 'undefined' && chartEl.value) {
    resizeObserver = new ResizeObserver(() => {
      chart?.resize()
    })
    resizeObserver.observe(chartEl.value)
  }
})

watch(
  () => [props.series, props.xAxis],
  async () => {
    await nextTick()
    renderChart()
  },
  { deep: true },
)

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  resizeObserver?.disconnect()
  resizeObserver = null
  chart?.dispose()
  chart = null
})
</script>

<template>
  <div class="trend-shell" :class="{ 'is-single': !stats.length }">
    <div class="trend-chart" :style="{ minHeight: `${height}px` }">
      <div ref="chartEl" class="trend-chart__canvas" />
    </div>

    <div v-if="stats.length" class="trend-stats">
      <article v-for="item in stats" :key="item.label" class="trend-stat">
        <div class="trend-stat__label">{{ item.label }}</div>
        <strong class="trend-stat__value">{{ item.value }}</strong>
        <div v-if="item.previous || item.delta" class="trend-stat__meta">
          <span v-if="item.previous" class="trend-stat__previous">{{ item.previous }}</span>
          <span
            v-if="item.delta"
            class="trend-stat__delta"
            :class="{
              'is-up': item.trend === 'up',
              'is-down': item.trend === 'down',
            }"
          >
            {{ item.delta }}
          </span>
        </div>
        <div v-else-if="item.compare" class="trend-stat__compare">
          {{ item.compare }}
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped lang="scss">
.trend-shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(122px, 138px);
  gap: 6px;
  height: 100%;
  min-width: 0;
  overflow: visible;
  align-items: stretch;
}

.trend-shell.is-single {
  grid-template-columns: 1fr;
  grid-template-rows: minmax(0, 1fr);
}

.trend-chart {
  min-width: 0;
  height: 100%;
  overflow: visible;
  padding: 2px 0 0;
  border-radius: 14px;
  background:
    linear-gradient(180deg, rgb(247 250 255 / 88%) 0%, rgb(255 255 255 / 94%) 100%),
    #fff;
}

.trend-chart__canvas {
  width: 100%;
  height: 100%;
}

.trend-shell.is-single .trend-chart {
  min-height: 100%;
}

.trend-stats {
  display: grid;
  height: 100%;
  min-width: 0;
  gap: 6px;
  align-content: stretch;
}

.trend-stat {
  display: flex;
  min-height: 0;
  flex-direction: column;
  justify-content: center;
  padding: 8px 10px;
  border: 1px solid rgb(15 23 42 / 7%);
  border-radius: 12px;
  background: linear-gradient(180deg, #fff 0%, #fbfcff 100%);
}

.trend-stat__label {
  font-size: 11px;
  color: var(--dj-color-text-secondary);
}

.trend-stat__value {
  display: block;
  margin-top: 4px;
  font-size: 16px;
  line-height: 1;
  color: var(--dj-color-text-primary);
}

.trend-stat__meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
}

.trend-stat__previous,
.trend-stat__compare {
  font-size: 10px;
}

.trend-stat__previous,
.trend-stat__compare {
  color: var(--dj-color-text-regular);
}

.trend-stat__delta {
  font-size: 10px;
  font-weight: 600;
  color: var(--dj-color-text-regular);
}

.trend-stat__delta.is-up {
  color: #f04438;
}

.trend-stat__delta.is-down {
  color: #16a34a;
}

@media (max-width: 1280px) {
  .trend-shell {
    grid-template-columns: 1fr;
  }
}
</style>
