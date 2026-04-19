export interface ApiResponse<T> {
  code: number
  message: string
  data: T
  success?: boolean
  requestId?: string
}

export interface Pagination {
  pageNum: number
  pageSize: number
  total: number
}

export interface PageResult<T> extends Pagination {
  list: T[]
  records?: T[]
  current?: number
  size?: number
  pages?: number
}

export interface PageQuery {
  pageNum: number
  pageSize: number
}

export interface SortField {
  field: string
  order: 'asc' | 'desc'
}

export interface ListQuery extends PageQuery {
  keyword?: string
  status?: string
  startDate?: string
  endDate?: string
  dateRange?: [string, string] | []
  sort?: SortField[]
}

export interface DetailResponse<T> {
  detail: T
}

export interface OptionItem {
  label: string
  value: string | number | boolean
  disabled?: boolean
}
