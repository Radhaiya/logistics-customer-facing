import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '../stores/useAuthStore'
import type { LoginRequest, TokenResponse } from '../types'
import { fetchJson } from './client'

export function useLogin() {
  const setTokens = useAuthStore((s) => s.setTokens)
  const setLoading = useAuthStore((s) => s.setLoading)

  return useMutation({
    mutationFn: (data: LoginRequest) =>
      fetchJson<TokenResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken)
    },
    onSettled: () => setLoading(false),
  })
}
