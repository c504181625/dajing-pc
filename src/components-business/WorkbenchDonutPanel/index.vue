<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { init } from '@/utils/echarts'
import type { ECharts, EChartsCoreOption } from '@/utils/echarts'

interface DonutItem {
  label: string
  value: number
  color: string
}

interface DonutFooterItem {
  label: string
  value: string | number
}

const props = withDefaults(
  defineProps<{
    items: DonutItem[]
    footer?: DonutFooterItem[]
    centerTitle?: string
    height?: number
  }>(),
  {
    footer: () => [],
    centerTitle: '总数',
    height: 180,
  },
)

const chartEl = ref<HTMLDivElement>()
let chart: ECharts | null = null
let resizeObserver: ResizeObserver | null = null

const total = computed(() => props.items.reduce((sum, item) => sum + item.value, 0))

function createOption(): EChartsCoreOption {
  return {
    animationDuration: 500,
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(15, 23, 42, 0.88)',
      borderWidth: 0,
      textStyle: {
        color: '#fff',
        fontSize: 12,
      },
    },
    series: [
      {
        type: 'pie',
        radius: ['58%', '80%'],
        center: ['50%', '50%'],
        startAngle: 90,
        padAngle: 2,
        avoidLabelOverlap: false,
        label: {
          show: false,
        },
        labelLine: {
          show: false,
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 4,
          borderRadius: 8,
        },
        data: props.items.length
          ? props.items.map((item) => ({
              value: item.value,
              name: item.label,
              itemStyle: {
                color: item.color,
              },
            }))
          : [
              {
                value: 1,
                name: '暂无数据',
                itemStyle: {
                  color: '#dbe7ff',
                },
              },
            ],
      },
    ],
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
  () => props.items,
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
  <div class="donut-shell">
    <div class="donut-main">
      <div class="donut-chart" :style="{ height: `${height}px` }">
        <div ref="chartEl" class="donut-chart__canvas" />
        <div class="donut-chart__center">
          <div class="donut-chart__title">{{ centerTitle }}</div>
          <strong class="donut-chart__value">{{ total }}</strong>
        </div>
      </div>

      <div class="donut-legend">
        <article v-for="item in items" :key="item.label" class="donut-legend__item">
          <div class="donut-legend__label">
            <span class="donut-legend__dot" :style="{ backgroundColor: item.color }" />
            <span>{{ item.label }}</span>
          </div>
          <strong>{{ item.value }}</strong>
        </article>
      </div>
    </div>

    <div v-if="footer.length" class="donut-footer">
      <div v-for="item in footer" :key="item.label" class="donut-footer__item">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.donut-shell {
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100%;
}

.donut-main {
  display: grid;
  grid-template-columns: minmax(132px, 150px) minmax(140px, 1fr);
  gap: 8px;
  align-items: start;
  min-width: 0;
}

.donut-chart {
  position: relative;
  min-width: 0;
}

.donut-chart__canvas {
  width: 100%;
  height: 100%;
}

.donut-chart__center {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  align-content: center;
  pointer-events: none;
  text-align: center;
}

.donut-chart__title {
  font-size: 12px;
  color: var(--dj-color-text-secondary);
}

.donut-chart__value {
  margin-top: 4px;
  font-size: 22px;
  color: var(--dj-color-text-primary);
}

.donut-legend {
  display: grid;
  gap: 6px;
  align-content: start;
  min-width: 0;
}

.donut-legend__item,
.donut-footer__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.donut-legend__label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--dj-color-text-primary);
  min-width: 0;
}

.donut-legend__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  box-shadow: 0 0 0 4px rgb(31 94 255 / 8%);
}

.donut-footer {
  display: grid;
  gap: 4px;
  padding-top: 8px;
  border-top: 1px solid rgb(15 23 42 / 7%);
}

.donut-footer__item {
  font-size: 12px;
  color: var(--dj-color-text-secondary);
}

.donut-footer__item strong,
.donut-legend__item strong {
  font-size: 14px;
  color: var(--dj-color-text-primary);
}

@media (max-width: 768px) {
  .donut-main {
    grid-template-columns: 1fr;
  }
}
</style>
