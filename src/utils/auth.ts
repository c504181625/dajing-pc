const TOKEN_KEY = 'dajing-access-token'

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY) || ''
}

export function setAccessToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeAccessToken() {
  localStorage.removeItem(TOKEN_KEY)
}
