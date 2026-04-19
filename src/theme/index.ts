export interface ThemeTokens {
  primary: string
  primaryHover: string
  pageBg: string
  cardBg: string
  borderColor: string
  textPrimary: string
  textSecondary: string
  textRegular: string
  menuActiveBg: string
  menuHoverBg: string
  headerBg: string
  pageDecoration: string
  pageDecorationSize: string
}

export interface ThemePreset {
  id: string
  name: string
  description: string
  tags: string[]
  backgroundLabel: string
  tokens: ThemeTokens
}

export const THEME_STORAGE_KEY = 'operator-system-theme'
export const DEFAULT_THEME_ID = 'tech-blue'

export const themePresets: ThemePreset[] = [
  {
    id: 'tech-blue',
    name: '科技蓝',
    description: '适合平台运营后台，清爽克制，重点信息更突出。',
    tags: ['浅雾背景', '科技感', '高识别'],
    backgroundLabel: '柔雾渐变',
    tokens: {
      primary: '#1f5eff',
      primaryHover: '#184fe1',
      pageBg: '#f4f7fc',
      cardBg: '#ffffff',
      borderColor: '#e4eaf5',
      textPrimary: '#172033',
      textSecondary: '#31415f',
      textRegular: '#6d7b93',
      menuActiveBg: 'linear-gradient(90deg, rgba(31, 94, 255, 0.16) 0%, rgba(31, 94, 255, 0.05) 100%)',
      menuHoverBg: 'rgba(31, 94, 255, 0.08)',
      headerBg: 'rgba(255, 255, 255, 0.92)',
      pageDecoration:
        'radial-gradient(circle at top right, rgba(31, 94, 255, 0.12), transparent 30%), radial-gradient(circle at left top, rgba(103, 152, 255, 0.08), transparent 34%)',
      pageDecorationSize: 'cover, cover',
    },
  },
  {
    id: 'teal-business',
    name: '青绿商务',
    description: '更稳重的企业后台风格，适合长时间办公与业务查看。',
    tags: ['商务风格', '青绿主色', '柔和对比'],
    backgroundLabel: '浅纹理背景',
    tokens: {
      primary: '#0f9f92',
      primaryHover: '#0b8b80',
      pageBg: '#f3f7f7',
      cardBg: '#ffffff',
      borderColor: '#dde9e7',
      textPrimary: '#17312f',
      textSecondary: '#2d514d',
      textRegular: '#66807c',
      menuActiveBg: 'linear-gradient(90deg, rgba(15, 159, 146, 0.15) 0%, rgba(15, 159, 146, 0.04) 100%)',
      menuHoverBg: 'rgba(15, 159, 146, 0.08)',
      headerBg: 'rgba(255, 255, 255, 0.94)',
      pageDecoration:
        'radial-gradient(circle at top left, rgba(15, 159, 146, 0.12), transparent 28%), linear-gradient(180deg, rgba(255, 255, 255, 0.62), rgba(255, 255, 255, 0.62))',
      pageDecorationSize: 'cover, cover',
    },
  },
  {
    id: 'orange-vitality',
    name: '活力橙',
    description: '更强调任务推进和运营动作，适合活动与增长场景。',
    tags: ['暖色强调', '活力风格', '状态突出'],
    backgroundLabel: '晨光背景',
    tokens: {
      primary: '#ea7b22',
      primaryHover: '#d96c14',
      pageBg: '#faf6f1',
      cardBg: '#ffffff',
      borderColor: '#f0dfd0',
      textPrimary: '#3b2415',
      textSecondary: '#614433',
      textRegular: '#8a6a56',
      menuActiveBg: 'linear-gradient(90deg, rgba(234, 123, 34, 0.16) 0%, rgba(234, 123, 34, 0.05) 100%)',
      menuHoverBg: 'rgba(234, 123, 34, 0.08)',
      headerBg: 'rgba(255, 255, 255, 0.94)',
      pageDecoration:
        'radial-gradient(circle at top right, rgba(234, 123, 34, 0.14), transparent 34%), radial-gradient(circle at bottom left, rgba(246, 180, 121, 0.12), transparent 30%)',
      pageDecorationSize: 'cover, cover',
    },
  },
]

function getPresetById(id?: string | null) {
  return themePresets.find((item) => item.id === id) || themePresets[0]!
}

function setThemeCssVar(name: string, value: string) {
  document.documentElement.style.setProperty(name, value)
}

function applyElementTheme(tokens: ThemeTokens) {
  setThemeCssVar('--el-color-primary', tokens.primary)
  setThemeCssVar('--el-color-primary-dark-2', tokens.primaryHover)
  setThemeCssVar('--el-bg-color', tokens.cardBg)
  setThemeCssVar('--el-bg-color-page', tokens.pageBg)
  setThemeCssVar('--el-text-color-primary', tokens.textPrimary)
  setThemeCssVar('--el-text-color-regular', tokens.textSecondary)
  setThemeCssVar('--el-border-color', tokens.borderColor)
  setThemeCssVar('--el-border-color-light', tokens.borderColor)
}

export function applyThemePreset(themeId: string, persist = true) {
  if (typeof document === 'undefined') return

  const preset = getPresetById(themeId)
  const tokens = preset.tokens

  setThemeCssVar('--dj-color-primary', tokens.primary)
  setThemeCssVar('--dj-color-primary-hover', tokens.primaryHover)
  setThemeCssVar('--dj-color-bg-page', tokens.pageBg)
  setThemeCssVar('--dj-color-bg-card', tokens.cardBg)
  setThemeCssVar('--dj-color-border', tokens.borderColor)
  setThemeCssVar('--dj-color-text-primary', tokens.textPrimary)
  setThemeCssVar('--dj-color-text-secondary', tokens.textSecondary)
  setThemeCssVar('--dj-color-text-regular', tokens.textRegular)
  setThemeCssVar('--dj-color-menu-active', tokens.menuActiveBg)
  setThemeCssVar('--dj-color-menu-hover', tokens.menuHoverBg)
  setThemeCssVar('--dj-color-header-bg', tokens.headerBg)
  setThemeCssVar('--dj-theme-page-decoration', tokens.pageDecoration)
  setThemeCssVar('--dj-theme-page-decoration-size', tokens.pageDecorationSize)

  applyElementTheme(tokens)

  if (persist) {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({ id: preset.id }))
  }
}

export function readSavedThemeId() {
  if (typeof window === 'undefined') return DEFAULT_THEME_ID

  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY)
    if (!raw) return DEFAULT_THEME_ID
    const parsed = JSON.parse(raw) as { id?: string }
    return getPresetById(parsed.id).id
  } catch {
    return DEFAULT_THEME_ID
  }
}

export function initTheme() {
  if (typeof window === 'undefined') return
  applyThemePreset(readSavedThemeId(), false)
}

export function resetTheme() {
  applyThemePreset(DEFAULT_THEME_ID, true)
}

export function getThemePreset(themeId?: string | null) {
  return getPresetById(themeId)
}
