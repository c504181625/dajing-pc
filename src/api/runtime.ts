import type { AxiosRequestConfig } from 'axios'

import { http } from '@/utils/request'

export type RequestMethod = NonNullable<AxiosRequestConfig['method']>

export type RequestDictionary = Record<string, unknown>

export type ResultData<T> = T extends { data?: infer D } ? D : T

export interface ApiRequestOptions {
  url: string
  method: RequestMethod
  pathParams?: RequestDictionary
  query?: RequestDictionary
  headers?: RequestDictionary
  body?: unknown
  formData?: RequestDictionary
  responseType?: AxiosRequestConfig['responseType']
}

function containsBinaryValue(value: unknown): boolean {
  if (value instanceof Blob || value instanceof File) return true
  if (Array.isArray(value)) return value.some((item) => containsBinaryValue(item))
  if (value && typeof value === 'object') {
    return Object.values(value as RequestDictionary).some((item) => containsBinaryValue(item))
  }
  return false
}

function buildUrl(url: string, pathParams?: RequestDictionary) {
  if (!pathParams) return url

  return url.replace(/\{([^}]+)\}/g, (_, key: string) => {
    const value = pathParams[key]
    if (value === undefined || value === null) {
      throw new Error(`缺少路径参数：${key}`)
    }
    return encodeURIComponent(String(value))
  })
}

function appendFormValue(form: FormData, key: string, value: unknown) {
  if (value === undefined || value === null) return

  if (Array.isArray(value)) {
    value.forEach((item) => appendFormValue(form, key, item))
    return
  }

  if (value instanceof Blob || value instanceof File) {
    form.append(key, value)
    return
  }

  if (typeof value === 'object') {
    form.append(key, JSON.stringify(value))
    return
  }

  form.append(key, String(value))
}

export function createFormData(payload: RequestDictionary) {
  const form = new FormData()

  Object.entries(payload).forEach(([key, value]) => {
    appendFormValue(form, key, value)
  })

  return form
}

export function apiRequest<T>(options: ApiRequestOptions) {
  const data = options.formData
    ? createFormData(options.formData)
    : containsBinaryValue(options.body)
      ? createFormData(options.body as RequestDictionary)
      : options.body
  const headers = { ...(options.headers || {}) }

  return http<T>({
    url: buildUrl(options.url, options.pathParams),
    method: options.method,
    params: options.query,
    data,
    headers: headers as AxiosRequestConfig['headers'],
    responseType: options.responseType,
  })
}
