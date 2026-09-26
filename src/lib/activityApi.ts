export type ActivityEventType = 'site_visit' | 'telegram_click'

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1/nodeconnect/api').replace(/\/$/, '')

function activityPagePath(): string {
  return `${window.location.pathname}${window.location.search}` || '/'
}

export function trackActivity(eventType: ActivityEventType): void {
  const payload = JSON.stringify({ event_type: eventType, page_path: activityPagePath(), referrer: document.referrer || null })
  const endpoint = `${apiBaseUrl}/activity/track.php`

  try {
    if (typeof navigator.sendBeacon === 'function') {
      const sent = navigator.sendBeacon(endpoint, new Blob([payload], { type: 'text/plain;charset=UTF-8' }))
      if (sent) return
    }
  } catch {
    // Fall through to keepalive fetch.
  }

  void fetch(endpoint, {
    method: 'POST',
    body: payload,
    keepalive: true,
    credentials: 'omit',
    headers: { 'Content-Type': 'application/json' },
  }).catch(() => undefined)
}

export function trackTelegramClick(): void {
  trackActivity('telegram_click')
}

export type AdminActivityRecord = {
  id: number
  event_type: ActivityEventType
  country: string | null
  country_code: string | null
  region: string | null
  city: string | null
  timezone: string | null
  device_type: string | null
  browser: string | null
  operating_system: string | null
  page_path: string | null
  created_at: string
}

export type AdminActivityResponse = {
  success: boolean
  message?: string
  summary: {
    visitors_today: number
    visitors_this_week: number
    telegram_clicks_today: number
    latest_visitor_at: string | null
  }
  activity: AdminActivityRecord[]
  pagination: { page: number; per_page: number; total: number; pages: number }
}

export async function getAdminActivity(): Promise<AdminActivityResponse> {
  const response = await fetch(`${apiBaseUrl}/admin/activity.php`, { credentials: 'include' })
  const payload = await response.json() as AdminActivityResponse
  if (!response.ok || !payload.success) {
    throw new Error(payload.message || 'Unable to load visitor activity.')
  }
  return payload
}
