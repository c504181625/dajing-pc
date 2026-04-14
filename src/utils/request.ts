import axios from 'axios'
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'

import type { ApiResponse } from '@/types/api'
import { getAccessToken, removeAccessToken } from './auth'

const defaultBaseURL = import.meta.env.VITE_API_BASE_URL || 'http://43.138.0.218:8080'

const request = axios.create({
  baseURL: defaultBaseURL,
  timeout: 15000,
})

request.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

function isEnvelope(value: unknown): value is ApiResponse<unknown> {
  return !!value && typeof value === 'object' && typeof (value as ApiResponse<unknown>).code === 'number'
}

function unwrapResponse<T>(response: AxiosResponse): T {
  const body = response.data as unknown

  if (isEnvelope(body)) {
    if (body.code !== 0) {
      const message = body.message || '璇锋眰澶辫触'
      ElMessage.error(message)
      throw body
    }
    return (body.data ?? body) as T
  }

  if (body && typeof body === 'object') {
    const record = body as Record<string, unknown>
    if (record.success === false) {
      const message = (record.message as string) || '璇锋眰澶辫触'
      ElMessage.error(message)
      throw body
    }

    if ('data' in record && record.data !== undefined) {
      return record.data as T
    }
  }

  return body as T
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

    ElMessage.error(error.response?.data?.message || error.message || '缃戠粶寮傚父')
    return Promise.reject(error)
  },
)

export function http<T = unknown>(config: AxiosRequestConfig) {
  return request<T, T>(config)
}

export default request
