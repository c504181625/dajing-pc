import {
  createClientPageResult,
  normalizePageResult,
  resolveEmptyValue,
  toRecord,
} from '@/api/helper'
import type { PageResult } from '@/types/api'
import type { OrderDetail, OrderItem, OrderUpdatePayload } from '@/types/business'
import { ACCOUNT_TYPE } from '@/enum/role'
import {
  OperationStatus,
  OrderStatus,
  PaymentStatus,
  ReportStatus,
  SampleDeliveryMode,
  SampleReceiveStatus,
} from '@/enum/status'
import { formatDateTime } from '@/utils/date'
import { http } from '@/utils/request'

function isOperatorSession() {
  if (typeof window === 'undefined') return false

  try {
    const raw = localStorage.getItem('user')
    if (!raw) return false
    const parsed = JSON.parse(raw) as { userInfo?: { accountType?: string } }
    return parsed.userInfo?.accountType === ACCOUNT_TYPE.operator
  } catch {
    return false
  }
}

function normalizeOrderStatus(value: unknown): OrderStatus {
  const status = Number(value)
  if (status === 1) return OrderStatus.WaitingPayment
  if (status === 2) return OrderStatus.WaitingSample
  if (status === 3) return OrderStatus.Testing
  if (status === 4) return OrderStatus.Reporting
  if (status === 5) return OrderStatus.Finished
  if (status === 6) return OrderStatus.ForceClosed
  if (status === 7) return OrderStatus.Refunding
  if (status === 8) return OrderStatus.Refunded

  const text = String(value || '').toLowerCase()
  if (text.includes('payment')) return OrderStatus.WaitingPayment
  if (text.includes('sample')) return OrderStatus.WaitingSample
  if (text.includes('test')) return OrderStatus.Testing
  if (text.includes('report')) return OrderStatus.Reporting
  if (text.includes('finish')) return OrderStatus.Finished
  if (text.includes('close')) return OrderStatus.ForceClosed
  if (text.includes('refund')) return OrderStatus.Refunding
  return OrderStatus.Quoting
}

function normalizePaymentStatus(source: Record<string, unknown>): PaymentStatus {
  const payStatus = Number(source.payStatus || source.escrowStatus)
  if (payStatus === 1 || source.payTime) return PaymentStatus.Paid

  const text = String(source.escrowStatusDesc || source.payStatusDesc || '').toLowerCase()
  if (text.includes('refund')) return PaymentStatus.Refunding
  if (text.includes('part')) return PaymentStatus.PartPaid
  if (text.includes('paid')) return PaymentStatus.Paid
  return PaymentStatus.Unpaid
}

function normalizeSampleReceiveStatus(source: Record<string, unknown>): SampleReceiveStatus {
  if (source.receiveRemark || source.receivePhotos) {
    return SampleReceiveStatus.Received
  }
  return SampleReceiveStatus.Pending
}

function normalizeReportStatus(value: unknown): ReportStatus {
  const status = Number(value)
  if (status === 1) return ReportStatus.Reviewing
  if (status === 2) return ReportStatus.Published
  if (status === 3) return ReportStatus.Invalid

  const text = String(value || '').toLowerCase()
  if (text.includes('review')) return ReportStatus.Reviewing
  if (text.includes('publish')) return ReportStatus.Published
  if (text.includes('invalid')) return ReportStatus.Invalid
  return ReportStatus.Pending
}

function normalizeOrderItem(raw: unknown): OrderItem {
  const source = toRecord(raw)
  const demandId = String(source.demandId || '')
  const institutionId = String(source.institutionId || '')
  const demandTitle = String(source.demandTitle || source.projectName || source.serviceName || '')

  return {
    id: String(source.id || source.orderId || ''),
    orderNo: String(source.orderNo || ''),
    enterpriseName: String(
      (source.demandUserName ? `${source.demandUserName}` : '') ||
        source.enterpriseName ||
        source.buyerName ||
        source.contactName ||
        source.buyerContactName,
    ),
    orgName: String(
      source.institutionName ||
        source.orgName ||
        source.providerName ||
        (institutionId ? `机构 #${institutionId}` : ''),
    ),
    projectName: demandTitle || (demandId ? `需求 #${demandId}` : '未命名项目'),
    status: normalizeOrderStatus(source.statusDesc || source.status),
    paymentStatus: normalizePaymentStatus(source),
    sampleReceiveStatus: normalizeSampleReceiveStatus(source),
    amount: Number(source.amount || 0),
    reportNo: source.reportNo ? String(source.reportNo) : undefined,
    createdAt: formatDateTime(source.createTime || source.createdAt, { fallback: '' }),
  }
}

async function loadOrderProgress(orderId: string) {
  try {
    return await http<unknown[]>({
      url: `/api/trade/order-progress/${orderId}`,
      method: 'get',
    })
  } catch {
    return []
  }
}

async function loadOrderEvaluation(orderId: string) {
  try {
    return await http<unknown>({
      url: `/api/trade/order/evaluate/${orderId}`,
      method: 'get',
    })
  } catch {
    return null
  }
}

async function loadOrderReport(orderId: string) {
  try {
    return await http<unknown>({
      url: `/api/trade/report/order/${orderId}`,
      method: 'get',
    })
  } catch {
    return null
  }
}

function buildOrderDetail(
  raw: unknown,
  id = '',
  progressList: unknown[] = [],
  reportRaw: unknown = null,
  evaluationRaw: unknown = null,
): OrderDetail {
  const source = toRecord(raw)
  const order = normalizeOrderItem(raw)
  const report = toRecord(reportRaw)
  const evaluation = toRecord(evaluationRaw)

  return {
    ...order,
    id: order.id || id,
    sampleMode: SampleDeliveryMode.Mail,
    receiverName: String(source.pickupContact || source.receiverName || ''),
    receiverPhone: String(source.pickupPhone || source.receiverPhone || ''),
    receiverAddress: String(source.pickupAddress || source.receiverAddress || ''),
    sampleItems: [
      {
        id: `${order.id || id}-sample`,
        sampleName: String(source.sampleName || source.demandTitle || '样品'),
        sampleCode: String(source.expressNo || source.entrustNo || ''),
        sampleCount: Number(source.sampleCount || 1),
        sampleRemark: String(source.sampleDesc || source.receiveRemark || ''),
      },
    ],
    projectItems: [
      {
        id: `${order.id || id}-project`,
        projectName: String(source.demandTitle || source.projectName || ''),
        standardName: String(source.testStandard || ''),
        price: Number(source.amount || 0),
      },
    ],
    attachments: String(source.shippingVoucher || '')
      ? [
          {
            id: `${order.id || id}-shipping-voucher`,
            name: '寄样凭证',
            url: String(source.shippingVoucher),
            fileType: String(source.shippingVoucher).split('.').pop() || 'file',
          },
        ]
      : [],
    timeline: progressList.length
      ? progressList.map((item, index) => {
          const record = toRecord(item)
          return {
            id: String(record.id || `${order.id || id}-progress-${index + 1}`),
            title: String(record.node || `进度节点 ${index + 1}`),
            time: formatDateTime(record.createTime || record.operatedAt, { fallback: '' }),
            description: String(record.remark || ''),
            status: OperationStatus.Done,
            operator: record.operatorId ? `用户 ${record.operatorId}` : undefined,
          }
        })
      : [
          {
            id: `${order.id || id}-create`,
            title: '订单已创建',
            time: order.createdAt,
            description: '',
            status: OperationStatus.Done,
          },
        ],
    exceptionRecords: [],
    reportInfo: {
      reportNo: String(report.reportNo || order.reportNo || ''),
      reportStatus: normalizeReportStatus(report.status),
      reportFile: report.fileUrl
        ? {
            id: `${order.id || id}-report`,
            name: '检测报告',
            url: String(report.fileUrl),
            fileType: String(report.fileUrl).split('.').pop() || 'pdf',
          }
        : undefined,
    },
    commentInfo: evaluation.id
      ? {
          score: Number(evaluation.score || 0),
          content: String(evaluation.content || ''),
          createdAt: formatDateTime(evaluation.createTime, { fallback: '' }),
        }
      : undefined,
    refundRecords: [],
  }
}

function buildStatusQuery(status?: string) {
  if (!status) return undefined
  return status
}

export function getOrderList(params?: Record<string, unknown>): Promise<PageResult<OrderItem>> {
  if (isOperatorSession()) {
    return http<unknown>({
      url: '/api/admin/admin/order/list',
      method: 'get',
      params: {
        page: Number(params?.pageNum || 1),
        size: Number(params?.pageSize || 10),
      },
    }).then((res) => {
      const page = normalizePageResult(res, normalizeOrderItem, params)
      const keyword = String(params?.keyword || '')
        .trim()
        .toLowerCase()
      const filtered = page.list.filter((item: OrderItem) => {
        const matchKeyword =
          !keyword ||
          [item.orderNo, item.enterpriseName, item.orgName, item.projectName]
            .filter(Boolean)
            .some((field) => String(field).toLowerCase().includes(keyword))
        const matchStatus = !params?.status || item.status === params.status
        const matchPayment = !params?.paymentStatus || item.paymentStatus === params.paymentStatus
        const matchSample =
          !params?.sampleReceiveStatus || item.sampleReceiveStatus === params.sampleReceiveStatus

        return matchKeyword && matchStatus && matchPayment && matchSample
      })

      return keyword || params?.status || params?.paymentStatus || params?.sampleReceiveStatus
        ? createClientPageResult(filtered, params)
        : page
    })
  }

  return http<unknown>({
    url: '/api/trade/order/my',
    method: 'get',
    params: {
      page: Number(params?.pageNum || 1),
      size: Number(params?.pageSize || 10),
      status: buildStatusQuery(String(params?.status || '')),
    },
  }).then((res) => {
    const page = normalizePageResult(res, normalizeOrderItem, params)
    const keyword = String(params?.keyword || '')
      .trim()
      .toLowerCase()
    const filtered = page.list.filter((item: OrderItem) => {
      const matchKeyword =
        !keyword ||
        [item.orderNo, item.enterpriseName, item.orgName, item.projectName]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(keyword))
      const matchPayment = !params?.paymentStatus || item.paymentStatus === params.paymentStatus
      const matchSample =
        !params?.sampleReceiveStatus || item.sampleReceiveStatus === params.sampleReceiveStatus

      return matchKeyword && matchPayment && matchSample
    })

    return keyword || params?.paymentStatus || params?.sampleReceiveStatus
      ? createClientPageResult(filtered, params)
      : page
  })
}

export async function getOrderDetail(id: string): Promise<OrderDetail> {
  const detailRaw = await http<unknown>({
    url: isOperatorSession() ? `/api/admin/admin/order/${id}` : `/api/trade/order/${id}`,
    method: 'get',
  })

  const [progress, report, evaluation] = await Promise.all([
    loadOrderProgress(id),
    loadOrderReport(id),
    loadOrderEvaluation(id),
  ])

  return buildOrderDetail(detailRaw, id, progress, report, evaluation)
}

export function forceCloseOrder(id: string, reason: string): Promise<boolean> {
  return http<boolean>({
    url: `/api/admin/admin/order/${id}/force-close`,
    method: 'put',
    params: { reason },
  }).then(() => true)
}

export function updateOrderDetail(_id: string, _data: OrderUpdatePayload): Promise<boolean> {
  return resolveEmptyValue(true)
}

export function acceptOrder(_id: string): Promise<boolean> {
  return resolveEmptyValue(true)
}

export function rejectOrder(_id: string, _reason: string): Promise<boolean> {
  return resolveEmptyValue(true)
}

export function deleteOrder(_id: string): Promise<boolean> {
  return resolveEmptyValue(true)
}

export interface TradeOrderConfirmPayload extends Record<string, unknown> {}

export interface TradeOrderShippingPayload extends Record<string, unknown> {}

export interface TradeOrderReceiveConfirmPayload extends Record<string, unknown> {}

export interface TradeOrderEvaluationPayload extends Record<string, unknown> {}

export function confirmTradeOrder(payload: TradeOrderConfirmPayload): Promise<string> {
  return http<number>({
    url: '/api/trade/order/confirm',
    method: 'post',
    data: payload,
  }).then((res) => String(res || ''))
}

export function confirmTradeOrderByBid(bidId: string): Promise<string> {
  return http<number>({
    url: `/api/trade/order/confirm/${bidId}`,
    method: 'post',
  }).then((res) => String(res || ''))
}

export function createDirectTradeOrder(payload: TradeOrderConfirmPayload): Promise<string> {
  return http<number>({
    url: '/api/trade/order/direct',
    method: 'post',
    data: payload,
  }).then((res) => String(res || ''))
}

export function submitOrderEvaluation(payload: TradeOrderEvaluationPayload): Promise<boolean> {
  return http<void>({
    url: '/api/trade/order/evaluate',
    method: 'post',
    data: payload,
  }).then(() => true)
}

export function deleteOrderEvaluation(evaluationId: string): Promise<boolean> {
  return http<void>({
    url: `/api/trade/order/evaluate/${evaluationId}`,
    method: 'delete',
  }).then(() => true)
}

export function addOrderProgressNode(
  orderId: string,
  payload: { node: string; remark?: string; photos?: string },
): Promise<boolean> {
  return http<void>({
    url: `/api/trade/order-progress/${orderId}/add`,
    method: 'post',
    params: payload,
  }).then(() => true)
}

export function submitOrderShipping(payload: TradeOrderShippingPayload): Promise<boolean> {
  return http<void>({
    url: '/api/trade/order/shipping',
    method: 'post',
    data: payload,
  }).then(() => true)
}

export function confirmOrderReceive(payload: TradeOrderReceiveConfirmPayload): Promise<boolean> {
  return http<void>({
    url: '/api/trade/order/receive-confirm',
    method: 'post',
    data: payload,
  }).then(() => true)
}

export function cancelTradeOrder(orderId: string, reason: string): Promise<boolean> {
  return http<void>({
    url: `/api/trade/order/${orderId}/cancel`,
    method: 'put',
    params: { reason },
  }).then(() => true)
}

export function amendTradeEntrust(
  orderId: string,
  payload: { testProject: string; testStandard?: string; remark?: string },
): Promise<boolean> {
  return http<void>({
    url: `/api/trade/order/${orderId}/amend-entrust`,
    method: 'put',
    params: payload,
  }).then(() => true)
}

export function uploadOfflinePaymentVoucher(orderId: string, voucherUrl: string): Promise<boolean> {
  return http<void>({
    url: `/api/trade/order/${orderId}/offline-payment`,
    method: 'put',
    params: { voucherUrl },
  }).then(() => true)
}

export function confirmOfflinePayment(orderId: string): Promise<boolean> {
  return http<void>({
    url: `/api/trade/order/${orderId}/confirm-offline-payment`,
    method: 'put',
  }).then(() => true)
}

export function triggerOrderPayCallback(
  orderId: string,
  payload: { payChannel?: string; outTradeNo?: string },
): Promise<boolean> {
  return http<void>({
    url: `/api/trade/order/${orderId}/pay-callback`,
    method: 'put',
    params: payload,
  }).then(() => true)
}

export function confirmTradeReport(orderId: string): Promise<boolean> {
  return http<void>({
    url: `/api/trade/order/${orderId}/confirm-report`,
    method: 'put',
  }).then(() => true)
}

export function releaseOrderEscrow(orderId: string): Promise<boolean> {
  return http<void>({
    url: `/api/trade/order/${orderId}/release-escrow`,
    method: 'put',
  }).then(() => true)
}

export function applySampleReturn(orderId: string, reason: string): Promise<boolean> {
  return http<void>({
    url: `/api/trade/order/${orderId}/sample-return`,
    method: 'post',
    params: { reason },
  }).then(() => true)
}

export function applySampleSupplement(
  orderId: string,
  payload: { expressNo: string; expressCompany?: string },
): Promise<boolean> {
  return http<void>({
    url: `/api/trade/order/${orderId}/sample-supplement`,
    method: 'post',
    params: payload,
  }).then(() => true)
}
