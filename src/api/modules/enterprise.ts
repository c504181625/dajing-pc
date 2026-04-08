import { mockPromise } from '../mock'

export function getEnterpriseProfile() {
  return mockPromise({
    enterpriseName: '苏州智造检测有限公司',
    socialCreditCode: '91320594MA1Q2A0X1Y',
    legalPerson: '陈海波',
    contactName: '陈璐',
    contactPhone: '13800001111',
    address: '江苏省苏州市工业园区星湖街 328 号',
  })
}
