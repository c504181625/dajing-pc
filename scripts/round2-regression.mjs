import fs from 'node:fs/promises'
import path from 'node:path'

const BASE_URL = 'http://43.138.0.218:8080'
const rootDir = process.cwd()
const logoPath = path.join(rootDir, 'public', 'logo.png')
const resultPath = path.join(rootDir, 'docs', 'round2-regression-results.json')
let latestResults = null

const accounts = {
  provider: { account: '18134064570', password: 'Test@12345678', role: '服务提供方' },
  demander: { account: '13120583910', password: 'Test@12345678', role: '企业需求方' },
  personal: { account: '19174990558', password: 'Abc@123456', role: '个人账号' },
  admin: { account: 'admin', password: 'ABCcba@123', role: '平台运营方' },
}

function buildUrl(url, query) {
  const target = new URL(url.startsWith('http') ? url : `${BASE_URL}${url}`)
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === '') continue
      target.searchParams.set(key, String(value))
    }
  }
  return target.toString()
}

async function request(url, { method = 'GET', token, query, data, headers } = {}) {
  const target = buildUrl(url, query)
  const finalHeaders = new Headers(headers || {})

  if (token) {
    finalHeaders.set('Authorization', /^Bearer /i.test(token) ? token : `Bearer ${token}`)
  }

  let body
  if (data instanceof FormData) {
    body = data
  } else if (data !== undefined) {
    body = JSON.stringify(data)
    finalHeaders.set('Content-Type', 'application/json')
  }

  const response = await fetch(target, { method, headers: finalHeaders, body })
  const text = await response.text()
  let payload

  try {
    payload = text ? JSON.parse(text) : null
  } catch {
    payload = text
  }

  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}`)
    error.status = response.status
    error.payload = payload
    error.url = target
    throw error
  }

  if (payload && typeof payload === 'object' && 'code' in payload) {
    if (payload.success === false || ![0, 200].includes(Number(payload.code))) {
      const error = new Error(payload.message || '业务失败')
      error.status = response.status
      error.payload = payload
      error.url = target
      throw error
    }
    return payload.data
  }

  return payload
}

function createIssue(partial) {
  return {
    title: partial.title,
    role: partial.role,
    module: partial.module,
    path: partial.path,
    steps: partial.steps || [],
    actual: partial.actual || '',
    expected: partial.expected || '',
    api: partial.api || '',
    request: partial.request || {},
    response: partial.response || {},
    type: partial.type || '前端/接口',
    severity: partial.severity || '中',
    blocking: partial.blocking ?? false,
    regression: partial.regression ?? false,
  }
}

async function login(name) {
  const account = accounts[name]
  const data = await request('/api/user/auth/login/password', {
    method: 'POST',
    data: {
      account: account.account,
      password: account.password,
      device: 'WEB',
    },
  })

  return {
    ...account,
    token: data.accessToken || data.token,
    profile: data.profile || data.user || data,
  }
}

async function uploadFile(token, endpoint, filePath, filename, mime, extraQuery) {
  const content = await fs.readFile(filePath)
  const form = new FormData()
  form.append('file', new Blob([content], { type: mime }), filename)
  return request(endpoint, {
    method: 'POST',
    token,
    query: extraQuery,
    data: form,
  })
}

function uniqueCreditCode() {
  return `91${String(Date.now()).slice(-10)}${String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0')}`
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main() {
  const issues = []
  const results = {
    generatedAt: new Date().toISOString(),
    accounts: {},
    personal: {},
    demander: {},
    provider: {},
    admin: {},
    flow: {},
    issues,
  }
  latestResults = results

  const admin = await login('admin')
  const personal = await login('personal')
  const demander = await login('demander')
  const provider = await login('provider')

  results.accounts = {
    admin: { account: admin.account, role: admin.role, accountType: admin.profile?.accountType },
    personal: { account: personal.account, role: personal.role, accountType: personal.profile?.accountType },
    demander: { account: demander.account, role: demander.role, accountType: demander.profile?.accountType },
    provider: { account: provider.account, role: provider.role, accountType: provider.profile?.accountType },
  }

  results.personal.currentUser = await request('/api/user/user/current', { token: personal.token })
  results.personal.realNameStatus = await request('/api/user/account/real-name', { token: personal.token })

  const safeProfilePayload = {
    nickname:
      results.personal.currentUser.nickname ||
      results.personal.currentUser.name ||
      results.personal.currentUser.username ||
      '个人用户',
    avatar: results.personal.currentUser.avatar || '',
  }
  await request('/api/user/account/profile', {
    method: 'PUT',
    token: personal.token,
    data: safeProfilePayload,
  })
  results.personal.profileUpdate = { ok: true, payload: safeProfilePayload }

  let personalEnterpriseState
  try {
    personalEnterpriseState = await request('/api/user/enterprise/my', { token: personal.token })
  } catch (error) {
    personalEnterpriseState = {
      missing: true,
      message: error?.payload?.message || error.message,
      code: error?.payload?.code || error.status || '',
    }
  }
  results.personal.enterpriseBefore = personalEnterpriseState

  const licenseUpload = await uploadFile(
    personal.token,
    '/api/user/file/upload/license',
    logoPath,
    `enterprise-upgrade-round2-${Date.now()}.png`,
    'image/png',
  )
  results.personal.licenseUpload = licenseUpload

  const enterpriseName = `回归测试企业R2-${String(Date.now()).slice(-6)}`
  const creditCode = uniqueCreditCode()
  const upgradePayload = {
    enterpriseName,
    unifiedCreditCode: creditCode,
    businessLicense: String(licenseUpload.objectName || licenseUpload.fileKey || licenseUpload.url || ''),
    legalPerson: results.personal.currentUser.name || '测试联系人',
    contactName: results.personal.currentUser.name || '测试联系人',
    contactPhone: results.personal.currentUser.mobile || personal.account,
    enterpriseType: 1,
    serviceRange: '质量检测、认证咨询',
    region: '湖南省长沙市',
    address: '回归测试地址 88 号',
    introduction: '第二轮接口回归自动化创建企业升级申请',
  }

  let createdEnterpriseId = ''
  try {
    const upgradeRes = await request('/api/user/enterprise/register', {
      method: 'POST',
      token: personal.token,
      data: upgradePayload,
    })
    results.personal.enterpriseUpgrade = { ok: true, payload: upgradePayload, response: upgradeRes }
  } catch (error) {
    results.personal.enterpriseUpgrade = {
      ok: false,
      payload: upgradePayload,
      error: error?.payload || error.message,
    }
    issues.push(
      createIssue({
        title: '个人升级企业申请未成功提交',
        role: '个人',
        module: '企业升级',
        path: '/personal/profile',
        steps: ['个人账号登录', '上传营业执照', '提交企业升级申请'],
        actual: JSON.stringify(error?.payload || error.message),
        expected: '企业升级申请应提交成功并进入待审核状态',
        api: 'POST /api/user/enterprise/register',
        request: upgradePayload,
        response: error?.payload || error.message,
        type: '接口/业务',
        severity: '中',
        blocking: false,
      }),
    )
  }

  let createdEnterprise = null
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const pendingEnterprisePage = await request('/api/admin/admin/enterprise/pending', {
      token: admin.token,
      query: { page: 1, size: 50 },
    })
    const pendingEnterpriseList = Array.isArray(pendingEnterprisePage?.records)
      ? pendingEnterprisePage.records
      : Array.isArray(pendingEnterprisePage?.list)
        ? pendingEnterprisePage.list
        : []
    createdEnterprise = pendingEnterpriseList.find(
      (item) =>
        item.enterpriseName === enterpriseName ||
        item.unifiedCreditCode === creditCode ||
        String(item.contactPhone || '').includes(String(results.personal.currentUser.mobile || '').slice(-4)),
    )
    if (createdEnterprise) break
    await delay(1200)
  }
  if (createdEnterprise) {
    createdEnterpriseId = String(createdEnterprise.id)
  }
  results.admin.enterprisePendingMatch = createdEnterprise || null

  if (createdEnterpriseId) {
    await request(`/api/admin/admin/enterprise/${createdEnterpriseId}/audit`, {
      method: 'PUT',
      token: admin.token,
      query: { passed: true },
    })
    results.admin.enterpriseAudit = { ok: true, enterpriseId: createdEnterpriseId }
  } else {
    results.admin.enterpriseAudit = { ok: false, reason: '未在待审核企业列表中找到本轮申请' }
  }

  const personalAfterAudit = await login('personal')
  results.personal.afterAuditCurrentUser = await request('/api/user/user/current', {
    token: personalAfterAudit.token,
  })
  results.personal.enterpriseAfter = await (async () => {
    try {
      return await request('/api/user/enterprise/my', { token: personalAfterAudit.token })
    } catch (error) {
      return { error: error?.payload || error.message }
    }
  })()

  if (createdEnterpriseId && !results.personal.afterAuditCurrentUser.enterpriseId) {
    issues.push(
      createIssue({
        title: '企业审核通过后个人身份未即时切换',
        role: '个人 / 平台运营方',
        module: '企业升级',
        path: '/personal/profile',
        steps: ['个人提交企业升级', '管理员审核通过', '个人重新登录并刷新当前用户信息'],
        actual: JSON.stringify(results.personal.afterAuditCurrentUser),
        expected: '审核通过后当前用户信息应带出 enterpriseId 或切换为企业身份',
        api: 'GET /api/user/user/current',
        request: {},
        response: results.personal.afterAuditCurrentUser,
        type: '权限/状态流转',
        severity: '中',
        blocking: false,
      }),
    )
  }

  const demandPayload = {
    title: `第二轮回归需求-${String(Date.now()).slice(-6)}`,
    sampleName: '接口回归样品',
    sampleCount: 2,
    contactName: demander.profile?.name || '需求联系人',
    contactPhone: demander.profile?.mobile || accounts.demander.account,
    additionalReq: '自动化第二轮回归测试需求',
    category: '材料检测',
    testProject: '拉伸强度、硬度',
    testStandard: 'GB/T 16865-2013',
    remark: 'round2 regression',
  }
  const demandId = String(
    await request('/api/trade/demand/publish', {
      method: 'POST',
      token: demander.token,
      data: demandPayload,
    }),
  )
  await delay(15_000)
  results.demander.demand = {
    demandId,
    payload: demandPayload,
    detail: await request(`/api/trade/demand/${demandId}`, { token: demander.token }),
  }

  let providerHall = null
  let hallRecords = []
  for (let attempt = 0; attempt < 5; attempt += 1) {
    providerHall = await request('/api/trade/demand/hall', {
      token: provider.token,
      query: { page: 1, size: 50 },
    })
    hallRecords = Array.isArray(providerHall?.records)
      ? providerHall.records
      : Array.isArray(providerHall?.list)
        ? providerHall.list
        : []
    if (hallRecords.some((item) => String(item.id) === demandId)) break
    await delay(1000)
  }
  results.provider.demandVisible = hallRecords.some((item) => String(item.id) === demandId)
  if (!results.provider.demandVisible) {
    issues.push(
      createIssue({
        title: '服务提供方需求大厅未看到新发布需求',
        role: '服务提供方',
        module: '需求大厅',
        path: '/enterprise/order-receive',
        steps: ['企业需求方发布需求', '服务提供方进入需求大厅'],
        actual: JSON.stringify(hallRecords.slice(0, 10)),
        expected: `需求 ${demandId} 应在需求大厅中可见`,
        api: 'GET /api/trade/demand/hall',
        request: { page: 1, size: 50 },
        response: providerHall,
        type: '数据/状态流转',
        severity: '高',
        blocking: true,
      }),
    )
  }

  const bidPayload = {
    demandId: Number(demandId),
    quoteAmount: 4321,
    estimatedDays: 5,
    testPlan: '按标准完成检测并出具报告',
    remark: '第二轮自动回归报价',
  }
  let bidId = ''
  let bidError = null
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      bidId = String(
        await request('/api/trade/demand/bid', {
          method: 'POST',
          token: provider.token,
          data: bidPayload,
        }),
      )
      bidError = null
      break
    } catch (error) {
      bidError = error
      await delay(1200)
    }
  }
  if (!bidId) {
    throw bidError
  }
  results.provider.bid = {
    bidId,
    payload: bidPayload,
    bids: await request(`/api/trade/demand/${demandId}/bids`, { token: demander.token }),
  }

  const orderId = String(
    await request(`/api/trade/order/confirm/${bidId}`, {
      method: 'POST',
      token: demander.token,
    }),
  )
  results.flow.orderConfirm = {
    orderId,
    detailAfterCreate: await request(`/api/trade/order/${orderId}`, { token: demander.token }),
  }

  await request(`/api/trade/order/${orderId}/pay-callback`, {
    method: 'PUT',
    token: demander.token,
    query: {
      payChannel: 'MOCK',
      outTradeNo: `ROUND2_${Date.now()}`,
    },
  })
  results.flow.afterPay = await request(`/api/trade/order/${orderId}`, { token: demander.token })

  await request('/api/trade/order/shipping', {
    method: 'POST',
    token: demander.token,
    data: {
      orderId: Number(orderId),
      shippingMethod: 1,
      expressCompany: '顺丰',
      expressNo: `SF${Date.now()}`,
    },
  })
  results.flow.afterShipping = await request(`/api/trade/order/${orderId}`, { token: demander.token })

  await request('/api/trade/order/receive-confirm', {
    method: 'POST',
    token: provider.token,
    data: {
      orderId: Number(orderId),
      normal: true,
    },
  })
  results.flow.afterReceive = await request(`/api/trade/order/${orderId}`, { token: provider.token })

  const reportFileUpload = await uploadFile(
    provider.token,
    '/api/user/file/upload',
    logoPath,
    `round2-report-${Date.now()}.png`,
    'image/png',
    { dir: 'report' },
  )
  results.provider.reportFileUpload = reportFileUpload

  const reportPayload = {
    orderId: Number(orderId),
    demandId: Number(demandId),
    title: `${demandPayload.title}-检测报告`,
    sampleName: demandPayload.sampleName,
    testResult: '各检测项符合预期指标',
    conclusion: '检测通过',
    fileUrl: String(reportFileUpload.url || reportFileUpload.objectName || reportFileUpload.fileKey || ''),
    status: 1,
  }
  const reportId = String(
    await request('/api/trade/report/upload', {
      method: 'POST',
      token: provider.token,
      data: reportPayload,
    }),
  )
  results.provider.report = {
    reportId,
    payload: reportPayload,
    detail: await request(`/api/trade/report/${reportId}`, { token: provider.token }),
  }

  await request(`/api/trade/order/${orderId}/confirm-report`, {
    method: 'PUT',
    token: demander.token,
  })
  results.flow.afterConfirmReport = await request(`/api/trade/order/${orderId}`, {
    token: demander.token,
  })

  results.admin.orderList = await request('/api/admin/admin/order/list', {
    token: admin.token,
    query: { page: 1, size: 50 },
  })
  results.admin.reportList = await request('/api/admin/admin/report/list', {
    token: admin.token,
    query: { page: 1, size: 50 },
  })
  results.admin.reportDetail = await request(`/api/admin/admin/report/${reportId}`, {
    token: admin.token,
  })
  results.admin.userList = await request('/api/admin/admin/user/list', {
    token: admin.token,
    query: { page: 1, size: 20 },
  })

  const adminOrderRecords = Array.isArray(results.admin.orderList?.records)
    ? results.admin.orderList.records
    : Array.isArray(results.admin.orderList?.list)
      ? results.admin.orderList.list
      : []
  if (!adminOrderRecords.some((item) => String(item.id) === orderId)) {
    issues.push(
      createIssue({
        title: '管理端订单列表未命中新创建订单',
        role: '平台运营方',
        module: '订单管理',
        path: '/operator/business/order',
        steps: ['需求方发布需求', '服务方报价', '需求方确认成单', '管理员查看订单列表'],
        actual: JSON.stringify(adminOrderRecords.slice(0, 10)),
        expected: `订单 ${orderId} 应在管理端列表可查询到`,
        api: 'GET /api/admin/admin/order/list',
        request: { page: 1, size: 50 },
        response: results.admin.orderList,
        type: '接口/数据',
        severity: '中',
        blocking: false,
        regression: true,
      }),
    )
  }

  const adminReportRecords = Array.isArray(results.admin.reportList?.records)
    ? results.admin.reportList.records
    : Array.isArray(results.admin.reportList?.list)
      ? results.admin.reportList.list
      : []
  if (!adminReportRecords.some((item) => String(item.id) === reportId)) {
    issues.push(
      createIssue({
        title: '管理端报告列表未命中新上传报告',
        role: '平台运营方',
        module: '报告管理',
        path: '/operator/business/report',
        steps: ['服务方上传报告', '管理员进入报告管理'],
        actual: JSON.stringify(adminReportRecords.slice(0, 10)),
        expected: `报告 ${reportId} 应在管理端报告列表可查询到`,
        api: 'GET /api/admin/admin/report/list',
        request: { page: 1, size: 50 },
        response: results.admin.reportList,
        type: '接口/数据',
        severity: '中',
        blocking: false,
        regression: true,
      }),
    )
  }

  await fs.writeFile(resultPath, JSON.stringify(results, null, 2), 'utf8')
  console.log(`Round2 regression results saved to ${resultPath}`)
}

main().catch(async (error) => {
  const output = latestResults || {
    generatedAt: new Date().toISOString(),
    issues: [],
  }
  output.fatal = {
    message: error.message,
    status: error.status,
    url: error.url,
    payload: error.payload,
    stack: error.stack,
  }
  await fs.writeFile(resultPath, JSON.stringify(output, null, 2), 'utf8')
  console.error(output)
  process.exit(1)
})
