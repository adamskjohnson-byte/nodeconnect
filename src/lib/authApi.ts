export type AuthUser = {
  id: number
  full_name: string
  email: string
  status: 'active' | 'suspended' | 'disabled'
  role: 'user' | 'admin'
  created_at: string
  last_login_at: string | null
}

type ApiResponse = { success: boolean; message?: string; user?: AuthUser }

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1/nodeconnect/api').replace(/\/$/, '')

async function request(path: string, options: RequestInit = {}): Promise<ApiResponse> {
  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      ...options,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    })
    const payload = await response.json() as ApiResponse
    if (!response.ok || !payload.success) {
      throw new Error(payload.message || 'Something went wrong. Please try again.')
    }
    return payload
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Unable to reach the authentication server. Please try again.')
    }
    throw error
  }
}

export const register = (data: { full_name: string; email: string; password: string; confirm_password: string }) => request('/auth/register.php', { method: 'POST', body: JSON.stringify(data) })
export const login = (data: { email: string; password: string }) => request('/auth/login.php', { method: 'POST', body: JSON.stringify(data) })
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    const response = await request('/auth/me.php')
    return response.user || null
  } catch (error) {
    if (error instanceof Error && /Not authenticated|Authentication required/i.test(error.message)) return null
    throw error
  }
}
export const logout = () => request('/auth/logout.php', { method: 'POST' })
