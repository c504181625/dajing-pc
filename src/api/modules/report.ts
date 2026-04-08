import { mockPromise, reportList } from '../mock'

export function getReportList() {
  return mockPromise({
    list: reportList,
    pageNum: 1,
    pageSize: 10,
    total: reportList.length,
  })
}
