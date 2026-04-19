<script setup lang="ts">
import {
  Camera,
  Check,
  Lock,
  Message,
  Phone,
  SwitchButton,
  User,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import {
  changeAccountEmail,
  changeAccountPhone,
  getRealNameStatus,
  setUsername,
  submitRealName,
  updateAccountAvatar,
  updateAccountNickname,
} from '@/api/modules/account'
import { logoutAuth, sendSmsCode } from '@/api/modules/auth'
import { uploadGeneralFile, uploadIdCardFile } from '@/api/modules/file'
import PageContainer from '@/components/PageContainer.vue'
import ChangePasswordDialog from '@/components-business/ChangePasswordDialog/index.vue'
import SectionCard from '@/components-business/SectionCard/index.vue'
import { MOBILE_PATTERN } from '@/enum/auth'
import { ACCOUNT_TYPE_LABEL_MAP, ENTERPRISE_CAPABILITY_LABEL_MAP } from '@/enum/role'
import { useMessageStore } from '@/store/modules/message'
import { usePermissionStore } from '@/store/modules/permission'
import { useUserStore } from '@/store/modules/user'
import type { RealNameAuthStatus } from '@/types/account'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const permissionStore = usePermissionStore()
const messageStore = useMessageStore()

const avatarInputRef = ref<HTMLInputElement>()
const profileLoading = ref(false)
const avatarLoading = ref(false)
const passwordVisible = ref(false)
const phoneVisible = ref(false)
const emailVisible = ref(false)
const realNameVisible = ref(false)
const realNameLoading = ref(false)
const oldPhoneCountdown = ref(0)
const newPhoneCountdown = ref(0)
const realNameStatus = ref<RealNameAuthStatus>({ realNameStatus: 0 })

let oldPhoneTimer: number | null = null
let newPhoneTimer: number | null = null

const profileForm = reactive({
  displayName: '',
  nickname: '',
  avatar: '',
})

const profileSnapshot = reactive({
  displayName: '',
  nickname: '',
  avatar: '',
})

const phoneForm = reactive({
  step: 1 as 1 | 2,
  oldCode: '',
  newPhone: '',
  newCode: '',
})

const emailForm = reactive({
  newEmail: '',
  password: '',
})

const realNameForm = reactive({
  realName: '',
  idCardNo: '',
  idCardFront: '',
  idCardBack: '',
})

const pageTitle = computed(() => String(route.meta.pageTitle || route.meta.title || '个人资料'))
const isPersonal = computed(() => userStore.userInfo?.accountType === 'personal')
const profileCardTitle = computed(() => (isPersonal.value ? '个人资料' : '账号资料'))

const identityText = computed(() => {
  const user = userStore.userInfo
  if (!user) return '-'
  if (user.accountType !== 'enterprise') {
    return ACCOUNT_TYPE_LABEL_MAP[user.accountType] || user.accountType
  }

  const tags = user.enterpriseTags || []
  if (!tags.length) return ACCOUNT_TYPE_LABEL_MAP[user.accountType]
  return tags.map((item) => ENTERPRISE_CAPABILITY_LABEL_MAP[item] || item).join(' / ')
})

const maskedPhone = computed(() => maskPhone(userStore.userInfo?.mobile))
const maskedEmail = computed(() => maskEmail(userStore.userInfo?.email))

const realNameStatusText = computed(() => {
  switch (realNameStatus.value.realNameStatus) {
    case 1:
      return '审核中'
    case 2:
      return '已认证'
    case 3:
      return '未通过'
    default:
      return '未认证'
  }
})

const realNameActionText = computed(() => {
  switch (realNameStatus.value.realNameStatus) {
    case 1:
      return '查看状态'
    case 2:
      return '已完成'
    default:
      return '去认证'
  }
})

const securityLevel = computed(() => {
  const user = userStore.userInfo
  let score = 0
  if (user?.mobile) score += 1
  if (user?.email) score += 1
  if (user?.avatar) score += 1
  if (realNameStatus.value.realNameStatus === 2) score += 1

  if (score >= 4) return '高'
  if (score >= 2) return '中'
  return '低'
})

const securityItems = computed(() => [
  {
    key: 'phone',
    icon: Phone,
    title: '修改手机号',
    status: maskedPhone.value || '未绑定',
    description: '采用旧手机号验证码 + 新手机号验证码的双步骤换绑流程。',
    actionText: '修改手机号',
    danger: false,
    action: () => openPhoneDialog(),
  },
  {
    key: 'password',
    icon: Lock,
    title: '修改密码',
    status: '建议定期更新',
    description: '修改后将重新登录，避免旧会话继续使用。',
    actionText: '修改密码',
    danger: false,
    action: () => {
      passwordVisible.value = true
    },
  },
  {
    key: 'email',
    icon: Message,
    title: '绑定 / 修改邮箱',
    status: maskedEmail.value || '未绑定',
    description: '邮箱用于接收业务通知、找回账号和安全提醒。',
    actionText: userStore.userInfo?.email ? '修改邮箱' : '绑定邮箱',
    danger: false,
    action: () => {
      emailVisible.value = true
    },
  },
  {
    key: 'real-name',
    icon: Check,
    title: '实名认证',
    status: realNameStatusText.value,
    description: '认证通过后可提升账号可信度，并支持后续身份升级。',
    actionText: realNameActionText.value,
    danger: false,
    action: () => {
      if (realNameStatus.value.realNameStatus !== 2) {
        realNameVisible.value = true
      }
    },
  },
  {
    key: 'logout',
    icon: SwitchButton,
    title: '退出登录',
    status: '当前会话有效',
    description: '公共设备建议及时退出，避免会话残留。',
    actionText: '退出登录',
    danger: true,
    action: () => void confirmLogout(),
  },
])

watch(
  () => userStore.userInfo,
  (user) => {
    profileForm.displayName = user?.username || user?.name || ''
    profileForm.nickname = user?.name || user?.username || ''
    profileForm.avatar = user?.avatar || ''

    profileSnapshot.displayName = profileForm.displayName
    profileSnapshot.nickname = profileForm.nickname
    profileSnapshot.avatar = profileForm.avatar
  },
  { immediate: true },
)

function maskPhone(phone?: string) {
  if (!phone) return ''
  return phone.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2')
}

function maskEmail(email?: string) {
  if (!email) return ''
  const [name = '', domain = ''] = email.split('@')
  if (!domain) return email
  if (name.length <= 2) return `${name[0] || '*'}***@${domain}`
  return `${name.slice(0, 2)}***@${domain}`
}

function clearTimers() {
  if (oldPhoneTimer) window.clearInterval(oldPhoneTimer)
  if (newPhoneTimer) window.clearInterval(newPhoneTimer)
  oldPhoneTimer = null
  newPhoneTimer = null
}

function startCountdown(type: 'old' | 'new') {
  const refValue = type === 'old' ? oldPhoneCountdown : newPhoneCountdown
  const existingTimer = type === 'old' ? oldPhoneTimer : newPhoneTimer

  if (existingTimer) {
    window.clearInterval(existingTimer)
  }

  refValue.value = 60
  const timer = window.setInterval(() => {
    refValue.value -= 1
    if (refValue.value <= 0) {
      refValue.value = 0
      window.clearInterval(timer)
    }
  }, 1000)

  if (type === 'old') {
    oldPhoneTimer = timer
  } else {
    newPhoneTimer = timer
  }
}

async function loadRealNameStatus() {
  try {
    realNameStatus.value = await getRealNameStatus()
  } catch {
    realNameStatus.value = { realNameStatus: 0 }
  }
}

async function refreshAccountState() {
  await Promise.all([userStore.fetchCurrentUser(true), loadRealNameStatus()])
}

function openAvatarSelector() {
  avatarInputRef.value?.click()
}

async function handleAvatarChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  target.value = ''
  if (!file) return

  avatarLoading.value = true
  try {
    const uploaded = await uploadGeneralFile(file, 'avatar')
    await updateAccountAvatar(uploaded.url)
    ElMessage.success('头像已更新')
    await refreshAccountState()
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '头像更新失败')
  } finally {
    avatarLoading.value = false
  }
}

async function handleSaveProfile() {
  if (!profileForm.displayName.trim()) {
    ElMessage.warning('请输入姓名 / 联系人')
    return
  }

  const tasks: Promise<boolean>[] = []
  if (profileForm.displayName !== profileSnapshot.displayName) {
    tasks.push(setUsername(profileForm.displayName.trim()))
  }
  if (profileForm.nickname !== profileSnapshot.nickname) {
    tasks.push(updateAccountNickname(profileForm.nickname.trim()))
  }
  if (profileForm.avatar !== profileSnapshot.avatar) {
    tasks.push(updateAccountAvatar(profileForm.avatar))
  }

  if (!tasks.length) {
    ElMessage.info('资料没有变化')
    return
  }

  profileLoading.value = true
  try {
    await Promise.all(tasks)
    ElMessage.success(isPersonal.value ? '个人资料已保存' : '账号资料已保存')
    await refreshAccountState()
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '资料保存失败')
  } finally {
    profileLoading.value = false
  }
}

function resetPhoneDialog() {
  phoneForm.step = 1
  phoneForm.oldCode = ''
  phoneForm.newPhone = ''
  phoneForm.newCode = ''
  oldPhoneCountdown.value = 0
  newPhoneCountdown.value = 0
  clearTimers()
}

function openPhoneDialog() {
  resetPhoneDialog()
  phoneVisible.value = true
}

async function sendOldPhoneCode() {
  const mobile = userStore.userInfo?.mobile
  if (!mobile) {
    ElMessage.warning('当前账号未绑定手机号')
    return
  }

  await sendSmsCode({
    mobile,
    scene: 'login_mobile',
  })
  startCountdown('old')
  ElMessage.success('旧手机号验证码已发送')
}

function goPhoneStepTwo() {
  if (!phoneForm.oldCode.trim()) {
    ElMessage.warning('请输入旧手机号验证码')
    return
  }
  phoneForm.step = 2
}

async function sendNewPhoneCode() {
  if (!MOBILE_PATTERN.test(phoneForm.newPhone)) {
    ElMessage.warning('请输入正确的新手机号')
    return
  }
  if (phoneForm.newPhone === userStore.userInfo?.mobile) {
    ElMessage.warning('新手机号不能与旧手机号相同')
    return
  }

  await sendSmsCode({
    mobile: phoneForm.newPhone,
    scene: 'login_mobile',
  })
  startCountdown('new')
  ElMessage.success('新手机号验证码已发送')
}

async function submitPhoneChange() {
  if (!phoneForm.oldCode.trim()) {
    ElMessage.warning('请先完成旧手机号验证')
    return
  }
  if (!MOBILE_PATTERN.test(phoneForm.newPhone)) {
    ElMessage.warning('请输入正确的新手机号')
    return
  }
  if (phoneForm.newPhone === userStore.userInfo?.mobile) {
    ElMessage.warning('新手机号不能与旧手机号相同')
    return
  }
  if (!phoneForm.newCode.trim()) {
    ElMessage.warning('请输入新手机号验证码')
    return
  }

  try {
    await changeAccountPhone({
      newPhone: phoneForm.newPhone,
      smsCode: phoneForm.newCode,
    })
    ElMessage.success('手机号修改成功')
    phoneVisible.value = false
    await refreshAccountState()
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '手机号修改失败')
  }
}

function resetEmailDialog() {
  emailForm.newEmail = ''
  emailForm.password = ''
}

async function submitEmailChange() {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailPattern.test(emailForm.newEmail)) {
    ElMessage.warning('请输入正确的邮箱地址')
    return
  }
  if (!emailForm.password.trim()) {
    ElMessage.warning('请输入当前登录密码')
    return
  }

  try {
    await changeAccountEmail({
      newEmail: emailForm.newEmail.trim(),
      password: emailForm.password.trim(),
    })
    ElMessage.success('邮箱已更新')
    emailVisible.value = false
    resetEmailDialog()
    await refreshAccountState()
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '邮箱更新失败')
  }
}

async function handleRealNameFileChange(type: 'front' | 'back', event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  target.value = ''
  if (!file) return

  try {
    const uploaded = await uploadIdCardFile(file)
    if (type === 'front') {
      realNameForm.idCardFront = uploaded.url
      ElMessage.success('身份证人像面已上传')
    } else {
      realNameForm.idCardBack = uploaded.url
      ElMessage.success('身份证国徽面已上传')
    }
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '证件上传失败')
  }
}

async function submitRealNameAuth() {
  const idCardPattern = /(^\d{17}[\dXx]$)|(^\d{15}$)/
  if (!realNameForm.realName.trim()) {
    ElMessage.warning('请输入真实姓名')
    return
  }
  if (!idCardPattern.test(realNameForm.idCardNo)) {
    ElMessage.warning('请输入正确的身份证号')
    return
  }
  if (!realNameForm.idCardFront || !realNameForm.idCardBack) {
    ElMessage.warning('请上传身份证正反面')
    return
  }

  realNameLoading.value = true
  try {
    await submitRealName({
      realName: realNameForm.realName.trim(),
      idCardNo: realNameForm.idCardNo.trim(),
      idCardFront: realNameForm.idCardFront,
      idCardBack: realNameForm.idCardBack,
    })
    ElMessage.success('实名认证资料已提交')
    realNameVisible.value = false
    await refreshAccountState()
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '实名认证提交失败')
  } finally {
    realNameLoading.value = false
  }
}

async function performLogout() {
  try {
    await logoutAuth()
  } catch {
    // 后端登出失败时继续清理本地状态，避免用户卡在旧会话。
  }

  const logoutPath = userStore.isPlatformUser ? '/operator-login' : '/login'
  userStore.logout()
  permissionStore.resetRoutes(router)
  messageStore.resetStats()
  await router.replace(logoutPath)
}

async function confirmLogout() {
  try {
    await ElMessageBox.confirm('确认退出当前登录账号吗？', '退出登录', {
      type: 'warning',
    })
  } catch {
    return
  }

  await performLogout()
  ElMessage.success('已退出登录')
}

async function handlePasswordSuccess() {
  ElMessage.success('密码修改成功，请重新登录')
  passwordVisible.value = false
  await performLogout()
}

watch(
  () => phoneVisible.value,
  (visible) => {
    if (!visible) resetPhoneDialog()
  },
)

watch(
  () => emailVisible.value,
  (visible) => {
    if (!visible) resetEmailDialog()
  },
)

watch(
  () => realNameVisible.value,
  (visible) => {
    if (!visible) {
      realNameForm.realName = ''
      realNameForm.idCardNo = ''
      realNameForm.idCardFront = ''
      realNameForm.idCardBack = ''
    }
  },
)

onBeforeUnmount(() => {
  clearTimers()
})

void loadRealNameStatus()
</script>

<template>
  <PageContainer :title="pageTitle">
    <div class="account-page">
      <div class="account-grid">
        <SectionCard :title="profileCardTitle" class="profile-card">
          <div class="avatar-block">
            <div class="avatar-preview">
              <img v-if="profileForm.avatar" :src="profileForm.avatar" alt="头像" />
              <el-icon v-else><User /></el-icon>
            </div>
            <div class="avatar-meta">
              <div class="avatar-title">头像</div>
              <div class="avatar-tip">支持 JPG、PNG，建议上传清晰的方形头像。</div>
              <el-button type="primary" plain :icon="Camera" :loading="avatarLoading" @click="openAvatarSelector">
                修改头像
              </el-button>
              <input
                ref="avatarInputRef"
                class="hidden-input"
                type="file"
                accept="image/*"
                @change="handleAvatarChange"
              />
            </div>
          </div>

          <el-form label-position="top" class="profile-form">
            <div class="form-grid">
              <el-form-item label="姓名 / 联系人">
                <el-input v-model="profileForm.displayName" placeholder="请输入姓名 / 联系人" />
              </el-form-item>
              <el-form-item label="用户昵称">
                <el-input v-model="profileForm.nickname" placeholder="请输入昵称" />
              </el-form-item>
            </div>

            <div class="bound-item">
              <div>
                <div class="bound-item__label">手机号</div>
                <div class="bound-item__value">{{ maskedPhone || '未绑定手机号' }}</div>
              </div>
              <el-button type="primary" plain :icon="Phone" @click="openPhoneDialog">修改手机号</el-button>
            </div>

            <div class="bound-item">
              <div>
                <div class="bound-item__label">邮箱</div>
                <div class="bound-item__value">{{ maskedEmail || '未绑定邮箱' }}</div>
              </div>
              <el-button type="primary" plain :icon="Message" @click="emailVisible = true">
                {{ userStore.userInfo?.email ? '修改邮箱' : '绑定邮箱' }}
              </el-button>
            </div>

            <div class="form-actions">
              <el-button type="primary" :loading="profileLoading" @click="handleSaveProfile">保存资料</el-button>
            </div>
          </el-form>
        </SectionCard>

        <div class="side-stack">
          <SectionCard title="账号摘要">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="账号主体">
                {{ isPersonal ? '个人用户' : ACCOUNT_TYPE_LABEL_MAP[userStore.userInfo?.accountType || 'personal'] }}
              </el-descriptions-item>
              <el-descriptions-item label="当前身份">{{ identityText }}</el-descriptions-item>
              <el-descriptions-item label="用户ID">{{ userStore.userInfo?.id || '-' }}</el-descriptions-item>
              <el-descriptions-item label="最近登录时间">{{ userStore.userInfo?.lastLoginTime || '-' }}</el-descriptions-item>
              <el-descriptions-item label="最近登录方式">Web 登录</el-descriptions-item>
              <el-descriptions-item label="注册时间">-</el-descriptions-item>
              <el-descriptions-item label="实名认证状态">{{ realNameStatusText }}</el-descriptions-item>
              <el-descriptions-item label="账号安全等级">{{ securityLevel }}</el-descriptions-item>
            </el-descriptions>
          </SectionCard>

          <SectionCard title="安全设置">
            <div class="security-list">
              <div v-for="item in securityItems" :key="item.key" class="security-item">
                <div class="security-item__icon">
                  <el-icon><component :is="item.icon" /></el-icon>
                </div>
                <div class="security-item__content">
                  <div class="security-item__title">{{ item.title }}</div>
                  <div class="security-item__status">{{ item.status }}</div>
                  <div class="security-item__desc">{{ item.description }}</div>
                </div>
                <el-button :type="item.danger ? 'danger' : 'primary'" plain @click="item.action">
                  {{ item.actionText }}
                </el-button>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="安全提示">
            <ul class="tips-list">
              <li>修改手机号采用双步骤结构：先校验旧手机号，再绑定新手机号。</li>
              <li>当前后端暂未提供旧手机号验证码独立校验接口，旧号验证由前端流程承接。</li>
              <li>修改密码成功后会重新登录，建议提前保存未提交内容。</li>
              <li>邮箱建议绑定常用工作邮箱，用于业务通知、找回账号与安全提醒。</li>
              <li>{{ isPersonal ? '实名认证通过后，可继续申请升级企业或机构身份。' : '实名认证通过后，可进一步完善企业账号可信资料。' }}</li>
            </ul>
          </SectionCard>
        </div>
      </div>
    </div>

    <el-drawer v-model="phoneVisible" title="修改手机号" size="520px">
      <div class="security-drawer">
        <el-alert type="info" show-icon :closable="false">
          <template #title>
            当前页面按“旧手机号验证 → 新手机号绑定”双步骤组织；最终提交时调用后端现有的新手机号修改接口。
          </template>
        </el-alert>

        <el-steps :active="phoneForm.step - 1" simple finish-status="success" class="steps-bar">
          <el-step title="验证旧手机号" />
          <el-step title="绑定新手机号" />
        </el-steps>

        <div v-if="phoneForm.step === 1" class="step-panel">
          <div class="step-panel__title">第一步：验证旧手机号</div>
          <div class="step-panel__value">当前绑定手机号：{{ maskedPhone || '未绑定' }}</div>
          <el-form label-position="top">
            <el-form-item label="旧手机号验证码">
              <div class="verify-row">
                <el-input v-model="phoneForm.oldCode" placeholder="请输入旧手机号验证码" />
                <el-button :disabled="oldPhoneCountdown > 0" @click="sendOldPhoneCode">
                  {{ oldPhoneCountdown > 0 ? `${oldPhoneCountdown}s 后重发` : '获取验证码' }}
                </el-button>
              </div>
            </el-form-item>
          </el-form>
          <div class="dialog-actions">
            <el-button type="primary" @click="goPhoneStepTwo">下一步</el-button>
          </div>
        </div>

        <div v-else class="step-panel">
          <div class="step-panel__title">第二步：绑定新手机号</div>
          <el-form label-position="top">
            <el-form-item label="新手机号">
              <el-input v-model="phoneForm.newPhone" placeholder="请输入新手机号" />
            </el-form-item>
            <el-form-item label="新手机号验证码">
              <div class="verify-row">
                <el-input v-model="phoneForm.newCode" placeholder="请输入新手机号验证码" />
                <el-button :disabled="newPhoneCountdown > 0" @click="sendNewPhoneCode">
                  {{ newPhoneCountdown > 0 ? `${newPhoneCountdown}s 后重发` : '获取验证码' }}
                </el-button>
              </div>
            </el-form-item>
          </el-form>
          <div class="dialog-actions">
            <el-button @click="phoneForm.step = 1">上一步</el-button>
            <el-button type="primary" @click="submitPhoneChange">确认修改</el-button>
          </div>
        </div>
      </div>
    </el-drawer>

    <el-dialog v-model="emailVisible" title="绑定 / 修改邮箱" width="480px">
      <el-form label-position="top">
        <el-form-item label="当前邮箱">
          <el-input :model-value="maskedEmail || '未绑定'" disabled />
        </el-form-item>
        <el-form-item label="新邮箱">
          <el-input v-model="emailForm.newEmail" placeholder="请输入新邮箱地址" />
        </el-form-item>
        <el-form-item label="当前密码">
          <el-input
            v-model="emailForm.password"
            type="password"
            show-password
            placeholder="请输入当前登录密码"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="emailVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEmailChange">保存邮箱</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="realNameVisible" title="实名认证" width="560px">
      <el-form label-position="top">
        <el-form-item label="真实姓名">
          <el-input v-model="realNameForm.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="身份证号">
          <el-input v-model="realNameForm.idCardNo" placeholder="请输入身份证号" />
        </el-form-item>
        <div class="upload-grid">
          <label class="upload-box">
            <div class="upload-box__label">身份证人像面</div>
            <div class="upload-box__value">{{ realNameForm.idCardFront ? '已上传' : '点击上传' }}</div>
            <input class="hidden-input" type="file" accept="image/*" @change="handleRealNameFileChange('front', $event)" />
          </label>
          <label class="upload-box">
            <div class="upload-box__label">身份证国徽面</div>
            <div class="upload-box__value">{{ realNameForm.idCardBack ? '已上传' : '点击上传' }}</div>
            <input class="hidden-input" type="file" accept="image/*" @change="handleRealNameFileChange('back', $event)" />
          </label>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="realNameVisible = false">取消</el-button>
        <el-button type="primary" :loading="realNameLoading" @click="submitRealNameAuth">提交认证</el-button>
      </template>
    </el-dialog>

    <ChangePasswordDialog
      v-model:visible="passwordVisible"
      :title="`${pageTitle}密码设置`"
      @success="handlePasswordSuccess"
    />
  </PageContainer>
</template>

<style scoped lang="scss">
.account-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.account-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(340px, 0.9fr);
  gap: 18px;
}

.profile-card {
  min-height: 100%;
}

.avatar-block {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 8px;
}

.avatar-preview {
  width: 96px;
  height: 96px;
  display: grid;
  place-items: center;
  overflow: hidden;
  border-radius: 24px;
  color: var(--dj-color-primary);
  background: linear-gradient(
    180deg,
    color-mix(in srgb, white 74%, var(--dj-color-primary) 26%) 0%,
    color-mix(in srgb, white 92%, var(--dj-color-primary) 8%) 100%
  );
  font-size: 30px;
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--dj-color-text-primary);
}

.avatar-tip {
  margin: 6px 0 14px;
  font-size: 13px;
  color: var(--dj-color-text-regular);
}

.hidden-input {
  display: none;
}

.profile-form {
  margin-top: 10px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.bound-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px;
  border: 1px solid color-mix(in srgb, var(--dj-color-border) 88%, var(--dj-color-primary) 12%);
  border-radius: 18px;
}

.bound-item + .bound-item {
  margin-top: 12px;
}

.bound-item__label {
  font-size: 13px;
  color: var(--dj-color-text-regular);
}

.bound-item__value {
  margin-top: 6px;
  font-size: 18px;
  font-weight: 700;
  color: var(--dj-color-text-primary);
}

.form-actions {
  margin-top: 18px;
}

.side-stack {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.security-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.security-item {
  display: grid;
  grid-template-columns: 46px minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid color-mix(in srgb, var(--dj-color-border) 90%, white);
}

.security-item:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.security-item__icon {
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  color: var(--dj-color-primary);
  background: color-mix(in srgb, white 86%, var(--dj-color-primary) 14%);
  font-size: 18px;
}

.security-item__title {
  font-size: 15px;
  font-weight: 700;
  color: var(--dj-color-text-primary);
}

.security-item__status {
  margin-top: 4px;
  font-size: 14px;
  color: var(--dj-color-text-secondary);
}

.security-item__desc {
  margin-top: 4px;
  font-size: 13px;
  color: var(--dj-color-text-regular);
}

.tips-list {
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  color: var(--dj-color-text-secondary);
  line-height: 1.7;
}

.security-drawer {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.steps-bar {
  margin-top: 6px;
}

.step-panel {
  padding: 20px;
  border-radius: 18px;
  background: color-mix(in srgb, white 90%, var(--dj-color-primary) 10%);
}

.step-panel__title {
  font-size: 18px;
  font-weight: 700;
  color: var(--dj-color-text-primary);
}

.step-panel__value {
  margin: 8px 0 16px;
  color: var(--dj-color-text-secondary);
}

.verify-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 144px;
  gap: 12px;
  width: 100%;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.upload-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.upload-box {
  padding: 18px;
  border: 1px dashed color-mix(in srgb, var(--dj-color-border) 80%, var(--dj-color-primary) 20%);
  border-radius: 16px;
  cursor: pointer;
}

.upload-box__label {
  font-size: 14px;
  font-weight: 600;
  color: var(--dj-color-text-primary);
}

.upload-box__value {
  margin-top: 8px;
  font-size: 13px;
  color: var(--dj-color-text-regular);
}

@media (max-width: 1200px) {
  .account-grid,
  .form-grid,
  .upload-grid {
    grid-template-columns: 1fr;
  }

  .security-item {
    grid-template-columns: 46px minmax(0, 1fr);
  }

  .security-item .el-button {
    grid-column: 2;
    justify-self: start;
  }
}
</style>
