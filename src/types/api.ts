export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface Pagination {
  pageNum: number
  pageSize: number
  total: number
}

export interface PageResult<T> extends Pagination {
  list: T[]
}

export interface PageQuery {
  pageNum: number
  pageSize: number
}

export interface ListQuery extends PageQuery {
  keyword?: string
  status?: string
  startDate?: string
  endDate?: string
}

export interface DetailResponse<T> {
  detail: T
}
