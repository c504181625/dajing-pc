import { demandList, mockPromise } from '../mock'

export function getDemandList() {
  return mockPromise({
    list: demandList,
    pageNum: 1,
    pageSize: 10,
    total: demandList.length,
  })
}
