import { API_URL } from '../config'
import { useAuthStore } from '../stores/useAuthStore'

export class ApiError extends Error {
  status: number
  body: string

  constructor(status: number, body: string) {
    super(`API Error ${status}: ${body}`)
    this.status = status
    this.body = body
  }
}

function normalizeErrorBody(body: string) {
  if (!body) return 'Something went wrong.'

  try {
    const parsed = JSON.parse(body) as Record<string, unknown>
    const message = parsed.message || parsed.error || parsed.body || parsed.detail
    if (typeof message === 'string' && message.trim()) return message
  } catch {
    // Non-JSON error payloads are valid API responses.
  }

  return body
}

export function getApiErrorMessage(error: unknown) {
  if (error instanceof ApiError) return normalizeErrorBody(error.body)
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'Something went wrong.'
}

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = useAuthStore.getState().refreshToken
  if (!refreshToken) return false

  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    if (!res.ok) return false
    const data = await res.json()
    useAuthStore.getState().setTokens(data.accessToken, data.refreshToken)
    return true
  } catch {
    return false
  }
}

export async function fetchJson<T>(
  url: string,
  options?: RequestInit,
  retried?: boolean,
): Promise<T> {
  const token = useAuthStore.getState().token

  const isFormData = options?.body instanceof FormData

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options?.headers as Record<string, string>),
  }
  if (!isFormData) {
    headers['Content-Type'] = 'application/json'
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  })

  if (res.status === 401 && !retried) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      return fetchJson<T>(url, options, true)
    }
    useAuthStore.getState().logout()
    throw new ApiError(401, 'Session expired. Please login again.')
  }

  if (res.status === 204) {
    return null as T
  }

  if (!res.ok) {
    const body = await res.text()
    throw new ApiError(res.status, body)
  }

  return res.json()
}
