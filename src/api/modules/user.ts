import { mockPromise } from '../mock'

export function getUserList() {
  return mockPromise([
    {
      id: 'user-001',
      name: '平台管理员',
      mobile: '13800000001',
      roleNames: '平台运营管理员',
      status: 'ENABLE',
    },
    {
      id: 'user-002',
      name: '陈璐',
      mobile: '13800001111',
      roleNames: '企业主账号',
      status: 'ENABLE',
    },
  ])
}
