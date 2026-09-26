import { useEffect, useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import { getAdminActivity, type AdminActivityResponse, type AdminActivityRecord } from '../lib/activityApi'

function value(text: string | null): string {
  return text && text.trim() !== '' ? text : 'Unknown'
}

function formatDate(text: string | null): string {
  if (!text) return 'No visitor recorded'
  const date = new Date(`${text.replace(' ', 'T')}Z`)
  return Number.isNaN(date.getTime()) ? text : date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
}

function location(record: AdminActivityRecord): string {
  return [record.city, record.region].filter(Boolean).join(', ') || 'Unknown'
}

export default function AdminDashboard() {
  const [data, setData] = useState<AdminActivityResponse | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getAdminActivity().then((response) => {
      if (active) setData(response)
    }).catch((reason: unknown) => {
      if (active) setError(reason instanceof Error ? reason.message : 'Unable to load admin activity.')
    })
    return () => { active = false }
  }, [])

  return <AdminLayout activePage="dashboard" title="Admin Dashboard">
    <div className="admin-dashboard-content">
      <section className="admin-dashboard-intro"><span className="dashboard-eyebrow">NodeConnect / Administration</span><h2>Control center</h2><p>Monitor visitor activity and Telegram interactions across the NodeConnect public site.</p></section>
      {error && <div className="admin-dashboard-state" role="alert">{error}</div>}
      {!data && !error && <div className="admin-dashboard-state">Loading admin activity...</div>}
      {data && <>
        <section className="admin-dashboard-summary" aria-label="Admin activity summary">
          <article className="admin-dashboard-card"><span>Visitors Today</span><strong>{data.summary.visitors_today}</strong></article>
          <article className="admin-dashboard-card"><span>Visitors This Week</span><strong>{data.summary.visitors_this_week}</strong></article>
          <article className="admin-dashboard-card"><span>Telegram Clicks Today</span><strong>{data.summary.telegram_clicks_today}</strong></article>
          <article className="admin-dashboard-card"><span>Latest Visitor</span><strong>{formatDate(data.summary.latest_visitor_at)}</strong></article>
        </section>
        <section className="admin-dashboard-panel"><div className="admin-dashboard-panel-heading"><div><span className="dashboard-eyebrow">Live records</span><h2>Recent Activity</h2></div><span>{data.pagination.total} records</span></div>{data.activity.length > 0 ? <div className="admin-dashboard-activity-list">{data.activity.slice(0, 5).map((record) => <div className="admin-dashboard-activity-row" key={record.id}><span className={`admin-dashboard-event ${record.event_type}`}>{record.event_type === 'telegram_click' ? 'Telegram Click' : 'New Visitor'}</span><span>{value(record.country)}</span><span>{location(record)}</span><span>{formatDate(record.created_at)}</span></div>)}</div> : <div className="admin-dashboard-state">No activity records yet.</div>}<div className="admin-dashboard-actions"><a className="admin-dashboard-link" href="#admin/activity">View Visitor Activity</a></div></section>
      </>}
    </div>
  </AdminLayout>
}
