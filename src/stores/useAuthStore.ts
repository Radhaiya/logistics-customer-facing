import { create } from 'zustand'

function decodeTokenPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split('.')[1]
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

export type AppModule = 'bus' | 'truck' | null

interface AuthState {
  token: string | null
  refreshToken: string | null
  loading: boolean
  tenantId: string | null
  userEmail: string | null
  userName: string | null
  userRole: string | null
  module: AppModule
  setTokens: (token: string, refreshToken: string) => void
  setModule: (module: AppModule) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

function decodeUserInfo(token: string) {
  const payload = decodeTokenPayload(token)
  if (!payload) {
    return { tenantId: null, userEmail: null, userName: null, userRole: null }
  }
  const email = (payload.sub as string)?.split('|')[0] || null
  const firstName = (payload.firstName as string) || ''
  const lastName = (payload.lastName as string) || ''
  const name = [firstName, lastName].filter(Boolean).join(' ') || email?.split('@')[0] || null
  const roles = payload.roles as string[] | undefined
  const systemRoles = payload.systemRoles as string[] | undefined
  const allRoles = [...(roles || []), ...(systemRoles || [])]
  const role = allRoles.length > 0
    ? allRoles.join(', ')
    : (payload.scope as string) || null
  return {
    tenantId: (payload.tenantId as string) || null,
    userEmail: email,
    userName: name,
    userRole: role,
  }
}

export const useAuthStore = create<AuthState>((set) => {
  const initialToken = localStorage.getItem('auth_token')
  const initial = initialToken
    ? decodeUserInfo(initialToken)
    : { tenantId: null, userEmail: null, userName: null, userRole: null }

  const storedModule = localStorage.getItem('auth_module') as AppModule

  return {
    token: initialToken,
    refreshToken: localStorage.getItem('auth_refresh'),
    loading: false,
    tenantId: initial.tenantId ?? null,
    userEmail: initial.userEmail ?? null,
    userName: initial.userName ?? null,
    userRole: initial.userRole ?? null,
    module: storedModule === 'bus' || storedModule === 'truck' ? storedModule : null,
    setTokens: (token, refreshToken) => {
      const info = decodeUserInfo(token)
      localStorage.setItem('auth_token', token)
      localStorage.setItem('auth_refresh', refreshToken)
      set({ token, refreshToken, ...info })
    },
    setModule: (module) => {
      if (module) {
        localStorage.setItem('auth_module', module)
      } else {
        localStorage.removeItem('auth_module')
      }
      set({ module })
    },
    setLoading: (loading) => set({ loading }),
    logout: () => {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_refresh')
      localStorage.removeItem('auth_module')
      set({
        token: null,
        refreshToken: null,
        tenantId: null,
        userEmail: null,
        userName: null,
        userRole: null,
        module: null,
      })
    },
  }
})
