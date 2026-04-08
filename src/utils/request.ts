import axios from 'axios'
import type { AxiosError, AxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'

import type { ApiResponse } from '@/types/api'
import { getAccessToken, removeAccessToken } from './auth'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
})

request.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

request.interceptors.response.use(
  (response) => {
    const data = response.data as ApiResponse<unknown>
    if (typeof data?.code === 'number' && data.code !== 0) {
      ElMessage.error(data.message || '请求失败')
      return Promise.reject(data)
    }
    return data?.data ?? response.data
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
