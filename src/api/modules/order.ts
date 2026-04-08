import { mockPromise, orderDetails, orderList } from '../mock'

export function getOrderList() {
  return mockPromise({
    list: orderList,
    pageNum: 1,
    pageSize: 10,
    total: orderList.length,
  })
}

export function getOrderDetail(id: string) {
  return mockPromise(orderDetails[id] || orderDetails['order-001'])
}
