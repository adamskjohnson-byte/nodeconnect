import type { AuthUser } from './authApi'

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1/nodeconnect/api').replace(/\/$/, '')

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      ...options,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    })
    const payload = await response.json() as T & { success?: boolean; message?: string }
    if (!response.ok || payload.success === false) {
      throw new Error(payload.message || 'The request could not be completed.')
    }
    return payload
  } catch (error) {
    if (error instanceof TypeError) throw new Error('Unable to reach the NodeConnect API.')
    throw error
  }
}

export type UserPreferences = {
  theme: 'dark' | 'light' | 'system'
  sound_enabled: boolean
  sound_volume: number
  activity_notifications: boolean
  staking_notifications: boolean
  reward_notifications: boolean
  referral_notifications: boolean
  language: 'en'
  currency: 'USD'
}

export type ActiveSession = {
  id: number
  is_current: boolean
  ip_address: string | null
  device_type: string
  browser: string
  operating_system: string
  created_at: string
  last_activity_at: string
  expires_at: string
}

export type RecoveryCodeResponse = { success: true; recovery_codes: string[]; message?: string }
export type TwoFactorSetup = { success: true; secret: string; provisioning_uri: string }

export const getProfile = async () => (await request<{ success: true; user: AuthUser }>('/account/profile.php')).user
export const updateProfile = async (fullName: string) => (await request<{ success: true; user: AuthUser }>('/account/profile.php', { method: 'POST', body: JSON.stringify({ full_name: fullName }) })).user
export const getPreferences = async () => (await request<{ success: true; preferences: UserPreferences }>('/settings/preferences.php')).preferences
export const updatePreferences = async (preferences: Partial<UserPreferences>) => (await request<{ success: true; preferences: UserPreferences }>('/settings/preferences.php', { method: 'POST', body: JSON.stringify(preferences) })).preferences
export const changePassword = (data: { current_password: string; new_password: string; confirm_password: string }) => request<{ success: true; message: string }>('/account/password.php', { method: 'POST', body: JSON.stringify(data) })
export const getSessions = async () => (await request<{ success: true; sessions: ActiveSession[] }>('/account/sessions.php')).sessions
export const revokeSession = (sessionId: number) => request<{ success: true; message: string }>('/account/sessions.php', { method: 'POST', body: JSON.stringify({ action: 'revoke', session_id: sessionId }) })
export const revokeOtherSessions = () => request<{ success: true; revoked: number }>('/account/sessions.php', { method: 'POST', body: JSON.stringify({ action: 'revoke_others' }) })
export const getTwoFactorStatus = () => request<{ success: true; enabled: boolean }>('/account/two-factor.php')
export const beginTwoFactorSetup = (password: string) => request<TwoFactorSetup>('/account/two-factor.php', { method: 'POST', body: JSON.stringify({ action: 'begin', password }) })
export const enableTwoFactor = (password: string, code: string) => request<RecoveryCodeResponse>('/account/two-factor.php', { method: 'POST', body: JSON.stringify({ action: 'enable', password, code }) })
export const disableTwoFactor = (password: string, code: string) => request<{ success: true; message: string }>('/account/two-factor.php', { method: 'POST', body: JSON.stringify({ action: 'disable', password, code }) })
export const regenerateRecoveryCodes = (password: string, code: string) => request<RecoveryCodeResponse>('/account/two-factor.php', { method: 'POST', body: JSON.stringify({ action: 'regenerate_codes', password, code }) })
export const deactivateAccount = (password: string, confirmation: string) => request<{ success: true; message: string }>('/account/deactivate.php', { method: 'POST', body: JSON.stringify({ password, confirmation }) })
export const resendVerificationEmail = () => request<{ success: true; message: string }>('/auth/resend-verification.php', { method: 'POST', body: '{}' })
export const requestPasswordReset = (email: string) => request<{ success: true; message: string }>('/auth/request-password-reset.php', { method: 'POST', body: JSON.stringify({ email }) })
export const resetPassword = (token: string, newPassword: string, confirmPassword: string) => request<{ success: true; message: string }>('/auth/reset-password.php', { method: 'POST', body: JSON.stringify({ token, new_password: newPassword, confirm_password: confirmPassword }) })
export const verifyEmail = (token: string) => request<{ success: true; message: string }>('/auth/verify-email.php', { method: 'POST', body: JSON.stringify({ token }) })
