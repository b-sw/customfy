import axios from 'axios'

const TOKEN_KEY = 'customfy.token'

export function isLocal(): boolean {
  return window.location.hostname === 'localhost'
}

// When running locally the backend is always on localhost:3003; otherwise use
// the remote URL baked in at build time (VITE_API_URL).
const LOCAL_API_URL = 'http://localhost:3003'
export const apiBaseUrl = isLocal() ? LOCAL_API_URL : import.meta.env.VITE_API_URL

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

export const api = axios.create({
  baseURL: apiBaseUrl,
})

api.interceptors.request.use((config) => {
  const token = tokenStorage.get()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export interface User {
  id: string
  email?: string
  authMethod: string
  avatarUrl: string
  displayName: string
  isAdmin: boolean
}

export const AuthApi = {
  async loginGoogle(googleCode: string): Promise<{ token: string; isNewUser?: boolean }> {
    const { data } = await api.post('/auth/google/login', {
      googleCode,
      forceLocalLogin: isLocal(),
    })
    return data
  },

  async loginLocal(email: string): Promise<{ token: string; isNewUser?: boolean }> {
    const { data } = await api.post('/auth/local/login', { email })
    return data
  },

  async getMe(): Promise<User> {
    const { data } = await api.get<User>('/users/me')
    return data
  },
}
