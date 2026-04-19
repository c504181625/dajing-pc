/* eslint-disable */
// Auto-generated from qip-openapi-merged(2).json. Do not edit manually.

export const INTERNAL_OPERATIONS = [
  {
    name: "updateStatus",
    method: "PUT",
    path: "/api/user/user/{userId}/status",
    summary: "更新用户状态（管理员内部接口）",
  },
  {
    name: "updateMemberLevel",
    method: "PUT",
    path: "/api/user/user/{userId}/member-level",
    summary: "更新会员等级（服务间内部接口，传 X-Internal-Secret）",
  },
  {
    name: "getUserById",
    method: "GET",
    path: "/api/user/user/{userId}",
    summary: "根据ID查询用户信息（内部接口）",
  },
  {
    name: "getInstitutionUserId",
    method: "GET",
    path: "/api/user/enterprise/{enterpriseId}/institution-user-id",
    summary: "内部接口：查询机构负责人用户ID（trade-service调用）",
  },
] as const
