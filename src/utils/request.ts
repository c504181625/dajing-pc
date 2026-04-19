import axios from 'axios'
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'

import type { ApiResponse } from '@/types/api'
import { getAccessToken, removeAccessToken } from './auth'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://43.138.0.218:8080'

export interface ResultEnvelope<T = unknown> extends ApiResponse<T> {
  success?: boolean
}

function normalizeAuthorization(token: string) {
  if (!token) return ''
  return /^Bearer\s+/i.test(token) ? token : `Bearer ${token}`
}

const request = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
})

request.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = normalizeAuthorization(token)
  }
  return config
})

export function isResultEnvelope(value: unknown): value is ResultEnvelope<unknown> {
  return (
    !!value &&
    typeof value === 'object' &&
    typeof (value as ResultEnvelope<unknown>).code === 'number'
  )
}

export function unwrapResult<T>(body: unknown): T {
  if (isResultEnvelope(body)) {
    const message = body.message || '请求失败'

    if (body.success === false || (body.code !== 0 && body.code !== 200)) {
      ElMessage.error(message)
      throw body
    }

    if (body.data !== undefined) {
      return body.data as T
    }

    return body as T
  }

  if (body && typeof body === 'object') {
    const record = body as Record<string, unknown>
    if (record.success === false) {
      const message = (record.message as string) || '请求失败'
      ElMessage.error(message)
      throw body
    }

    if ('data' in record && record.data !== undefined) {
      return record.data as T
    }
  }

  return body as T
}

function unwrapResponse<T>(response: AxiosResponse): T {
  return unwrapResult<T>(response.data as unknown)
}

request.interceptors.response.use(
  (response) => {
    try {
      return unwrapResponse(response)
    } catch (error) {
      return Promise.reject(error)
    }
  },
  (error: AxiosError<ApiResponse<unknown>>) => {
    if (error.response?.status === 401) {
      removeAccessToken()
    }

    ElMessage.error(error.response?.data?.message || error.message || '网络异常')
    return Promise.reject(error)
  },
)

export function http<T = unknown>(config: AxiosRequestConfig) {
  return request<T, T>(config)
}

export default request
