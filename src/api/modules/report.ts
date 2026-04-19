import { createClientPageResult, normalizePageResult, resolveEmptyValue, toRecord } from '@/api/helper'
import type { PageResult } from '@/types/api'
import type { ReportDetail, ReportItem, ReportQuery } from '@/types/business'
import { ACCOUNT_TYPE } from '@/enum/role'
import { OperationStatus, ReportStatus } from '@/enum/status'
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

function normalizeReportStatus(value: unknown): ReportStatus {
  const status = Number(value)
  if (status === 1) return ReportStatus.Reviewing
  if (status === 2) return ReportStatus.Published
  if (status === 3) return ReportStatus.Invalid

  const text = String(value || '').toLowerCase()
  if (text.includes('review')) return ReportStatus.Reviewing
  if (text.includes('publish')) return ReportStatus.Published
  if (text.includes('invalid')) return ReportStatus.Invalid
  if (text.includes('hidden')) return ReportStatus.Hidden
  return ReportStatus.Pending
}

function normalizeReportDetail(raw: unknown, id = ''): ReportDetail {
  const source = toRecord(raw)
  const fileUrl = String(source.fileUrl || source.reportFileUrl || source.reportFile || '')
  const reportId = String(source.id || source.reportId || id)
  const orderNo = String(source.orderNo || source.orderId || '')
  const title = String(source.title || source.projectName || source.sampleName || '')

  return {
    id: reportId,
    reportNo: String(source.reportNo || source.code || ''),
    enterpriseName: String(
      source.enterpriseName ||
        source.targetName ||
        source.contactName ||
        (source.demandId ? `需求 #${source.demandId}` : ''),
    ),
    orderNo: orderNo || (reportId ? `报告 #${reportId}` : ''),
    projectName: title || '检测报告',
    status: normalizeReportStatus(source.status),
    sealStatus:
      Number(source.sealStatus) === 1
        ? 'sealed'
        : Number(source.sealStatus) === 2
          ? 'rejected'
          : 'pending',
    publishAt: String(source.publishAt || source.createTime || source.createdAt || ''),
    reportFile: {
      id: `${id || source.id || 'report'}-file`,
      name: fileUrl ? '检测报告' : '未上传报告',
      url: fileUrl,
      fileType: fileUrl.split('.').pop() || 'pdf',
    },
    hidden: false,
    extractRecords: [
      {
        id: `${id || source.id || 'report'}-record`,
        title: '报告详情已加载',
        time: String(source.createTime || source.createdAt || ''),
        description: '当前报告详情由 QIP 真实接口返回。',
        status: OperationStatus.Done,
      },
    ],
  }
}

export async function getReportList(params?: ReportQuery): Promise<PageResult<ReportItem>> {
  if (isOperatorSession()) {
    return http<unknown>({
      url: '/api/admin/admin/report/list',
      method: 'get',
      params: {
        page: params?.pageNum || 1,
        size: params?.pageSize || 10,
      },
    }).then((res) => {
      const page = normalizePageResult(
        res,
        (item) => {
          const detail = normalizeReportDetail(item)
          return {
            id: detail.id,
            reportNo: detail.reportNo,
            orderNo: detail.orderNo,
            enterpriseName: detail.enterpriseName,
            projectName: detail.projectName,
            status: detail.status,
            sealStatus: detail.sealStatus,
            publishAt: detail.publishAt,
          } satisfies ReportItem
        },
        params,
      )

      const keyword = String(params?.keyword || '').trim().toLowerCase()
      const filtered = page.list.filter((item) => {
        const matchKeyword =
          !keyword ||
          [item.reportNo, item.orderNo, item.enterpriseName, item.projectName]
            .filter(Boolean)
            .some((field) => String(field).toLowerCase().includes(keyword))
        const matchStatus = !params?.status || item.status === params.status
        const matchSeal = !params?.sealStatus || item.sealStatus === params.sealStatus

        return matchKeyword && matchStatus && matchSeal
      })

      return keyword || params?.status || params?.sealStatus
        ? createClientPageResult(filtered, params)
        : page
    })
  }

  const orders = await http<unknown>({
    url: '/api/trade/order/my',
    method: 'get',
    params: {
      page: params?.pageNum || 1,
      size: params?.pageSize || 10,
    },
  })

  const source = toRecord(orders)
  const records = Array.isArray(source.records)
    ? (source.records as unknown[])
    : Array.isArray(source.list)
      ? (source.list as unknown[])
      : []

  const rows = await Promise.all(
    records.map(async (item) => {
      const order = toRecord(item)
      const orderId = String(order.id || '')
      if (!orderId) return null

      try {
        const report = await http<unknown>({
          url: `/api/trade/report/order/${orderId}`,
          method: 'get',
        })
        const detail = normalizeReportDetail(report)
        return {
          id: detail.id,
          reportNo: detail.reportNo,
          orderNo: String(order.orderNo || orderId),
          enterpriseName: String(order.enterpriseName || order.contactName || ''),
          projectName: String(order.demandTitle || detail.projectName || ''),
          status: detail.status,
          sealStatus: detail.sealStatus,
          publishAt: detail.publishAt,
        } satisfies ReportItem
      } catch {
        return null
      }
    }),
  )

  const list = rows.filter((item) => item !== null)
  const keyword = String(params?.keyword || '').trim().toLowerCase()
  const filtered = list.filter((item) => {
    const matchKeyword =
      !keyword ||
      [item.reportNo, item.orderNo, item.enterpriseName, item.projectName]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(keyword))
    const matchStatus = !params?.status || item.status === params.status
    const matchSeal = !params?.sealStatus || item.sealStatus === params.sealStatus

    return matchKeyword && matchStatus && matchSeal
  })

  return createClientPageResult(filtered, params)
}

export function getReportDetail(id: string): Promise<ReportDetail> {
  return http<unknown>({
    url: isOperatorSession() ? `/api/admin/admin/report/${id}` : `/api/trade/report/${id}`,
    method: 'get',
  }).then((res) => normalizeReportDetail(res, id))
}

export function invalidateReport(id: string, _reason: string): Promise<boolean> {
  return http<boolean>({
    url: isOperatorSession() ? `/api/admin/admin/report/${id}/invalidate` : `/api/trade/report/${id}/invalidate`,
    method: 'put',
  }).then(() => true)
}

export function toggleReportHidden(_id: string): Promise<boolean> {
  return resolveEmptyValue(true)
}

export function deleteReport(_id: string): Promise<boolean> {
  return resolveEmptyValue(true)
}

export interface TradeReportUploadPayload extends Record<string, unknown> {}

function normalizeDownloadUrl(raw: unknown) {
  const source = toRecord(raw)
  return String(source.url || source.downloadUrl || source.fileUrl || '')
}

export function uploadTradeReport(payload: TradeReportUploadPayload): Promise<string> {
  return http<number>({
    url: '/api/trade/report/upload',
    method: 'post',
    data: payload,
  }).then((res) => String(res || ''))
}

export function verifyTradeReport(reportNo: string): Promise<ReportDetail> {
  return http<unknown>({
    url: `/api/trade/report/verify/${reportNo}`,
    method: 'get',
  }).then((res) => normalizeReportDetail(res, reportNo))
}

export function downloadTradeReport(reportId: string): Promise<string> {
  return http<unknown>({
    url: `/api/trade/report/${reportId}/download`,
    method: 'get',
  }).then((res) => normalizeDownloadUrl(res))
}

export function generateTradeReportPdf(reportId: string): Promise<boolean> {
  return http<void>({
    url: `/api/trade/report/${reportId}/generate`,
    method: 'post',
  }).then(() => true)
}
