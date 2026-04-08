import { mockPromise } from '../mock'

export function getRoleList() {
  return mockPromise([
    { id: 'role-001', name: '平台运营管理员', code: 'PLATFORM_ADMIN', dataScope: '全部企业' },
    { id: 'role-002', name: '审核员', code: 'AUDITOR', dataScope: '指派企业' },
    { id: 'role-003', name: '企业检测机构', code: 'ENTERPRISE_LAB', dataScope: '本企业' },
  ])
}
