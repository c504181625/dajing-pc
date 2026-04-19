import { toRecord } from '@/api/helper'
import type { UploadedFileInfo } from '@/types/account'
import { http } from '@/utils/request'

function createUploadForm(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return formData
}

function normalizeUploadedFile(raw: unknown): UploadedFileInfo {
  const source = toRecord(raw)

  return {
    fileKey: source.fileKey ? String(source.fileKey) : undefined,
    objectName: source.objectName ? String(source.objectName) : undefined,
    url: String(source.url || source.fileUrl || ''),
    fileName: source.fileName ? String(source.fileName) : undefined,
    fileType: source.fileType ? String(source.fileType) : undefined,
    size: source.size !== undefined ? Number(source.size) : undefined,
  }
}

export function uploadGeneralFile(file: File, dir?: string): Promise<UploadedFileInfo> {
  return http<unknown>({
    url: '/api/user/file/upload',
    method: 'post',
    params: dir ? { dir } : undefined,
    data: createUploadForm(file),
  }).then((res) => normalizeUploadedFile(res))
}

export function uploadLicenseFile(file: File): Promise<UploadedFileInfo> {
  return http<unknown>({
    url: '/api/user/file/upload/license',
    method: 'post',
    data: createUploadForm(file),
  }).then((res) => normalizeUploadedFile(res))
}

export function uploadCertFile(file: File): Promise<UploadedFileInfo> {
  return http<unknown>({
    url: '/api/user/file/upload/cert',
    method: 'post',
    data: createUploadForm(file),
  }).then((res) => normalizeUploadedFile(res))
}

export function uploadIdCardFile(file: File): Promise<UploadedFileInfo> {
  return http<unknown>({
    url: '/api/user/file/upload/id-card',
    method: 'post',
    data: createUploadForm(file),
  }).then((res) => normalizeUploadedFile(res))
}
