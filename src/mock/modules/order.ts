import { ENTERPRISE_CAPABILITY } from '@/enum/role'
import {
  OperationStatus,
  OrderStatus,
  PaymentStatus,
  ReportStatus,
  SampleDeliveryMode,
  SampleReceiveStatus,
} from '@/enum/status'
import type { OrderDetail, OrderUpdatePayload } from '@/types/business'
import {
  getCurrentEnterpriseId,
  getMockCurrentUser,
  hasAnyEnterpriseCapability,
  isPlatformMockUser,
} from '../context'
import { createPageResult, mockPromise } from '../helper'

type OrderRecord = OrderDetail & {
  demanderEnterpriseId: string
  orgEnterpriseId: string
}

const orderRecords: OrderRecord[] = [
  {
    id: 'order-001',
    orderNo: 'QI202604080001',
    enterpriseName: '苏州启航电子股份有限公司',
    orgName: '苏州智造检测有限公司',
    projectName: '电子元器件可靠性检测',
    status: OrderStatus.Testing,
    paymentStatus: PaymentStatus.Paid,
    sampleReceiveStatus: SampleReceiveStatus.Received,
    amount: 26800,
    reportNo: 'BG20260408018',
    createdAt: '2026-04-08 10:03:00',
    sampleMode: SampleDeliveryMode.Mail,
    receiverName: '张工',
    receiverPhone: '13800009999',
    receiverAddress: '江苏省苏州市工业园区东长路 88 号',
    sampleItems: [
      {
        id: 'sample-001',
        sampleName: '芯片模组 A1',
        sampleCode: 'SM-A1-202604',
        sampleCount: 6,
        sampleRemark: '防潮包装',
      },
    ],
    projectItems: [
      { id: 'project-001', projectName: '高低温循环', standardName: 'GB/T 2423', price: 13800 },
      { id: 'project-002', projectName: '振动试验', standardName: 'GB/T 2423.10', price: 13000 },
    ],
    attachments: [
      {
        id: 'order-file-001',
        name: '寄样清单.xlsx',
        url: '/mock/sample-list.xlsx',
        fileType: 'xlsx',
      },
    ],
    timeline: [
      {
        id: 'timeline-001',
        title: '委托已提交',
        time: '2026-04-08 10:03',
        description: '企业提交检验检测委托单',
        operator: '苏州启航电子股份有限公司',
        status: OperationStatus.Done,
      },
      {
        id: 'timeline-002',
        title: '机构已报价',
        time: '2026-04-08 10:40',
        description: '报价金额 26800 元，等待支付',
        operator: '苏州智造检测有限公司',
        status: OperationStatus.Done,
      },
      {
        id: 'timeline-003',
        title: '检测进行中',
        time: '2026-04-10 15:20',
        description: '环境试验与电性能测试并行进行',
        operator: '检测工程师',
        status: OperationStatus.Processing,
      },
    ],
    exceptionRecords: [
      {
        id: 'exception-001',
        title: '样品外包装轻微破损',
        time: '2026-04-09 09:35',
        description: '已拍照留痕，不影响检测，通知企业确认',
        operator: '收样员',
        status: OperationStatus.Warning,
        level: 'warning',
      },
    ],
    reportInfo: {
      reportNo: 'BG20260408018',
      reportStatus: ReportStatus.Reviewing,
      reportFile: {
        id: 'report-file-001',
        name: '检测报告.pdf',
        url: '/mock/report-001.pdf',
        fileType: 'pdf',
      },
    },
    commentInfo: {
      score: 5,
      content: '服务响应及时，检测进度透明。',
      createdAt: '2026-04-16 11:00:00',
    },
    refundRecords: [],
    demanderEnterpriseId: 'ent-100',
    orgEnterpriseId: 'ent-001',
  },
  {
    id: 'order-002',
    orderNo: 'QI202604070014',
    enterpriseName: '无锡锐科装备有限公司',
    orgName: '苏州智造检测有限公司',
    projectName: '计量校准服务',
    status: OrderStatus.WaitingSample,
    paymentStatus: PaymentStatus.Unpaid,
    sampleReceiveStatus: SampleReceiveStatus.Pending,
    amount: 9800,
    createdAt: '2026-04-07 14:36:08',
    sampleMode: SampleDeliveryMode.Pickup,
    receiverName: '周工',
    receiverPhone: '13800006688',
    receiverAddress: '江苏省无锡市锡山区新光路 23 号',
    sampleItems: [
      { id: 'sample-002', sampleName: '量具样件', sampleCode: 'JG-20260407', sampleCount: 2 },
    ],
    projectItems: [
      { id: 'project-003', projectName: '计量校准', standardName: 'JJF 1001', price: 9800 },
    ],
    attachments: [],
    timeline: [
      {
        id: 'timeline-101',
        title: '报价待确认',
        time: '2026-04-07 16:00',
        description: '机构已提交报价，等待支付',
        operator: '苏州智造检测有限公司',
        status: OperationStatus.Done,
      },
    ],
    exceptionRecords: [],
    reportInfo: {
      reportStatus: ReportStatus.Pending,
    },
    refundRecords: [],
    demanderEnterpriseId: 'ent-300',
    orgEnterpriseId: 'ent-001',
  },
]

function filterOrderRecords(list: OrderRecord[]) {
  if (isPlatformMockUser()) return list

  const enterpriseId = getCurrentEnterpriseId()
  const visible = new Set<OrderRecord>()

  if (hasAnyEnterpriseCapability([ENTERPRISE_CAPABILITY.demander])) {
    list
      .filter((item) => item.demanderEnterpriseId === enterpriseId)
      .forEach((item) => visible.add(item))
  }

  if (hasAnyEnterpriseCapability([ENTERPRISE_CAPABILITY.serviceProvider])) {
    list
      .filter((item) => item.orgEnterpriseId === enterpriseId)
      .forEach((item) => visible.add(item))
  }

  return [...visible]
}

export function mockGetOrderList(params?: Record<string, unknown>) {
  let list = filterOrderRecords([...orderRecords])
  const keyword = String(params?.keyword || '').trim()
  const status = String(params?.status || '')
  const paymentStatus = String(params?.paymentStatus || '')
  const sampleReceiveStatus = String(params?.sampleReceiveStatus || '')
  const pageNum = Number(params?.pageNum || 1)
  const pageSize = Number(params?.pageSize || 10)

  if (keyword) {
    list = list.filter((item) =>
      [item.orderNo, item.enterpriseName, item.orgName, item.projectName].some((field) =>
        field.includes(keyword),
      ),
    )
  }
  if (status) list = list.filter((item) => item.status === status)
  if (paymentStatus) list = list.filter((item) => item.paymentStatus === paymentStatus)
  if (sampleReceiveStatus) {
    list = list.filter((item) => item.sampleReceiveStatus === sampleReceiveStatus)
  }

  return mockPromise(createPageResult(list, pageNum, pageSize))
}

export function mockGetOrderDetail(id: string): Promise<OrderDetail> {
  const visible = filterOrderRecords(orderRecords)
  return mockPromise(visible.find((item) => item.id === id) || visible[0] || orderRecords[0]!)
}

export function mockForceCloseOrder(id: string, reason: string): Promise<boolean> {
  const row = orderRecords.find((item) => item.id === id)
  if (row) {
    row.status = OrderStatus.ForceClosed
    row.timeline.unshift({
      id: `timeline-${Date.now()}`,
      title: '订单强制关闭',
      time: new Date().toLocaleString('zh-CN', { hour12: false }),
      description: reason,
      operator: getMockCurrentUser().name,
      status: OperationStatus.Warning,
    })
  }
  return mockPromise(true)
}

export function mockUpdateOrderDetail(id: string, payload: OrderUpdatePayload): Promise<boolean> {
  const row = orderRecords.find((item) => item.id === id)
  if (row) {
    row.orgName = payload.orgName
    row.projectName = payload.projectName
    row.amount = payload.amount
    row.receiverName = payload.receiverName
    row.receiverPhone = payload.receiverPhone
    row.receiverAddress = payload.receiverAddress
    row.timeline.unshift({
      id: `timeline-${Date.now()}`,
      title: '订单信息已更新',
      time: new Date().toLocaleString('zh-CN', { hour12: false }),
      description: `已更新服务机构、项目名称、金额和收样信息`,
      operator: getMockCurrentUser().name,
      status: OperationStatus.Done,
    })
  }
  return mockPromise(true)
}

export function mockAcceptOrder(id: string): Promise<boolean> {
  const row = orderRecords.find((item) => item.id === id)
  if (row) {
    row.status = row.paymentStatus === PaymentStatus.Paid ? OrderStatus.WaitingSample : OrderStatus.WaitingPayment
    row.timeline.unshift({
      id: `timeline-${Date.now()}`,
      title: '服务机构已接单',
      time: new Date().toLocaleString('zh-CN', { hour12: false }),
      description: '服务机构已确认承接订单，进入后续收样与执行阶段。',
      operator: getMockCurrentUser().enterpriseName || getMockCurrentUser().name,
      status: OperationStatus.Done,
    })
  }
  return mockPromise(true)
}

export function mockRejectOrder(id: string, reason: string): Promise<boolean> {
  const row = orderRecords.find((item) => item.id === id)
  if (row) {
    row.status = OrderStatus.ForceClosed
    row.timeline.unshift({
      id: `timeline-${Date.now()}`,
      title: '服务机构暂不接单',
      time: new Date().toLocaleString('zh-CN', { hour12: false }),
      description: reason,
      operator: getMockCurrentUser().enterpriseName || getMockCurrentUser().name,
      status: OperationStatus.Warning,
    })
  }
  return mockPromise(true)
}

export function mockDeleteOrder(id: string): Promise<boolean> {
  const index = orderRecords.findIndex((item) => item.id === id)
  if (index >= 0) {
    orderRecords.splice(index, 1)
  }
  return mockPromise(true)
}
