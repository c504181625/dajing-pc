# 质量社区前后台分态改造方案

## 1. 资讯中心前台与后台的页面划分方案

### 前台资讯中心
- `资讯首页`：推荐资讯、最新资讯、分类筛选、资讯卡片流。
- `资讯详情页`：标题、摘要、正文预览、相关推荐、收藏/分享预留位。

### 后台资讯管理
- `资讯管理列表`：筛选栏 + 表格 + 状态列 + 操作列。
- `资讯详情/编辑页`：内容信息、发布信息、前台预览、统一操作区。

## 2. 社区问答前台与后台的页面划分方案

### 前台社区问答
- `问答首页`：热门问题、最新问题、待回答问题、分类筛选。
- `提问页`：普通用户发布问题。
- `问题详情页`：问题主帖、回答列表、写回答、举报入口。
- `我的提问 / 我的回答`：二期补充，优先复用现有列表页骨架。

### 后台问答管理
- `问答管理列表`：问题管理主列表。
- `问答详情/编辑页`：问题信息、前台预览、统一操作区。
- `回答管理 / 举报处理`：二期优先通过页签或二级页扩展，不单独重做主骨架。

## 3. 专家在线前台与后台的页面划分方案

### 前台专家在线
- `专家首页`：推荐专家、在线状态、筛选、专家卡片流。
- `专家详情页`：头像/姓名/职称/机构、简介、擅长领域、咨询入口、历史互动。

### 后台专家管理
- `专家管理列表`：筛选栏 + 表格 + 状态列 + 操作列。
- `专家详情/编辑页`：基础资料、服务状态、前台预览、统一操作区。
- `认证审核 / 推荐运营`：二期在同一管理模块下扩展页签或二级页。

## 4. 前后台菜单调整建议

### operator 后台
- `质量社区 / 资讯管理`
- `质量社区 / 问答管理`
- `质量社区 / 专家管理`

### personal / enterprise / enterprise+provider 前台
- `质量社区 / 资讯中心`
- `质量社区 / 社区问答`
- `质量社区 / 专家在线`

## 5. 哪些现有页面可直接复用

- 平台侧原有三张列表管理页骨架可继续复用：
  - `src/views/platform/community/article/index.vue`
  - `src/views/platform/community/question/index.vue`
  - `src/views/platform/community/expert/index.vue`
- 原有详情页可继续作为后台详情/编辑页容器复用：
  - `src/views/platform/community/article/detail.vue`
  - `src/views/platform/community/question/detail.vue`
  - `src/views/platform/community/expert/detail.vue`
- 共用数据接口可直接复用：
  - `src/api/modules/content.ts`
  - `src/mock/modules/content.ts`

## 6. 哪些页面只需要改命名、改权限、改字段

- `资讯中心` 后台页改名为 `资讯管理`。
- `社区问答` 后台页改名为 `问答管理`。
- `专家在线` 后台页改名为 `专家管理`。
- 仅需权限和路由重分配，不改数据结构：
  - operator 走 `/operator/community/*`
  - 普通用户走 `/community/*`

## 7. 哪些页面需要最小化新增

- 前台新增页面：
  - `src/views/community/article/index.vue`
  - `src/views/community/article/detail.vue`
  - `src/views/community/question/index.vue`
  - `src/views/community/question/detail.vue`
  - `src/views/community/question/ask.vue`
  - `src/views/community/expert/index.vue`
  - `src/views/community/expert/detail.vue`
- 不新增第二套数据表，只新增前台展示壳层。

## 8. 前后台路由规划

### 前台社区路由
- `/community/news`
- `/community/news/:id`
- `/community/qa`
- `/community/qa/:id`
- `/community/qa/ask`
- `/community/experts`
- `/community/experts/:id`

### 后台管理路由
- `/operator/community/news`
- `/operator/community/news/detail/:id`
- `/operator/community/qa`
- `/operator/community/qa/detail/:id`
- `/operator/community/experts`
- `/operator/community/experts/detail/:id`

### operator 预览路由
- `/operator/community/preview/news`
- `/operator/community/preview/news/:id`
- `/operator/community/preview/qa`
- `/operator/community/preview/qa/:id`
- `/operator/community/preview/experts`
- `/operator/community/preview/experts/:id`

## 9. 权限控制规则

- `operator`
  - 可访问后台管理路由。
  - 可访问隐藏的前台预览路由。
  - 可执行新增、编辑、删除、推荐、上下线等管理动作。
- `personal / enterprise / enterprise+provider`
  - 仅可访问 `/community/*` 前台路由。
  - 不可访问 `/operator/community/*` 管理路由。
- 普通用户的前台互动能力：
  - 可查看资讯。
  - 可提问、回答、追问、举报。
  - 仅能编辑/删除自己的内容。

## 10. 前后台共用数据模型建议

### 资讯内容
- `id`
- `bizType`
- `title`
- `summary`
- `categoryCode`
- `status`
- `featured`
- `author`
- `publishTime`
- `viewCount`

### 问题
- `id`
- `title`
- `summary`
- `categoryCode`
- `status`
- `solveStatus`
- `asker`
- `publishTime`
- `answerCount`
- `viewCount`
- `featured`

### 回答
- `id`
- `questionId`
- `author`
- `publishTime`
- `content`
- `likeCount`
- `accepted`

### 专家
- `id`
- `name`
- `title`
- `organization`
- `specialties`
- `serviceStatus`
- `introduction`
- `consultationPriceText`
- `onlineTimeText`
- `publishTime`

## 11. 前端菜单与路由守卫伪代码

```ts
function buildCommunityMenus(user) {
  if (user.accountType === 'operator') {
    return [
      '/operator/community/news',
      '/operator/community/qa',
      '/operator/community/experts',
    ]
  }

  return [
    '/community/news',
    '/community/qa',
    '/community/experts',
  ]
}

router.beforeEach((to) => {
  const accountType = userStore.userInfo?.accountType

  if (!token && to.path !== '/login') return '/login'

  if (to.path.startsWith('/operator/community')) {
    if (accountType !== 'operator') return '/login'
  }

  if (to.path.startsWith('/community')) {
    if (!['personal', 'enterprise'].includes(accountType ?? '')) return '/login'
  }
})
```

## 12. 普通用户“只能编辑自己的内容”的前后端实现建议

### 前端
- 列表页根据 `row.author.id === currentUser.accountId` 决定是否显示 `编辑 / 删除`。
- 详情页进入编辑态前先校验作者归属。
- 若不是本人，只展示 `查看`、`回答`、`举报` 等前台动作。

### 后端
- 更新/删除接口必须使用登录态用户 `accountId` 校验资源所属人。
- 示例：
  - `updateQuestion(id, currentUserId)` 时先查 `question.author_id`
  - 若 `author_id !== currentUserId`，直接返回 `403`
- 对管理员单独放行。

## 最小改动实施建议

- 一期先完成“后台保留管理态、前台新增社区态”。
- 列表、详情、编辑继续复用现有后台骨架。
- 前台优先做浏览、提问、回答、专家查看，不一次性引入复杂社交关系。
- 二期再扩展：
  - 我的提问 / 我的回答
  - 举报审核
  - 分类标签管理
  - 推荐位管理
