import { useEffect, useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import { getAdminActivity, type AdminActivityResponse, type AdminActivityRecord } from '../lib/activityApi'
import '../styles/admin-activity.css'

function display(value: string | null): string {
  return value && value.trim() !== '' ? value : 'Unknown'
}

function location(record: AdminActivityRecord): string {
  const parts = [record.city, record.region].filter((value): value is string => Boolean(value && value.trim()))
  return parts.length > 0 ? parts.join(', ') : 'Unknown'
}

function eventLabel(eventType: AdminActivityRecord['event_type']): string {
  return eventType === 'telegram_click' ? 'Telegram Click' : 'New Visitor'
}

function formatDate(value: string | null): string {
  if (!value) return 'No visitor recorded'
  const date = new Date(`${value.replace(' ', 'T')}Z`)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
}

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return <article className="admin-activity-summary-card"><span>{label}</span><strong>{value}</strong></article>
}

export default function AdminActivity() {
  const [data, setData] = useState<AdminActivityResponse | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getAdminActivity().then((response) => {
      if (active) setData(response)
    }).catch((reason: unknown) => {
      if (active) setError(reason instanceof Error ? reason.message : 'Unable to load visitor activity.')
    })
    return () => { active = false }
  }, [])

  return <AdminLayout activePage="activity" title="Visitor Activity" eyebrow="Admin / Monitoring">
    <div className="admin-activity-content">
      <section className="admin-activity-intro">
        <div><span className="dashboard-eyebrow">Approximate IP-based location</span><h2>Visitor monitoring</h2><p>Review recent public-site visits and Telegram link interactions recorded by the PHP activity API.</p></div>
      </section>
      {error && <div className="admin-activity-state is-error" role="alert">{error}</div>}
      {!data && !error && <div className="admin-activity-state">Loading activity...</div>}
      {data && <>
        <section className="admin-activity-summary" aria-label="Visitor activity summary">
          <SummaryCard label="Visitors Today" value={data.summary.visitors_today} />
          <SummaryCard label="Visitors This Week" value={data.summary.visitors_this_week} />
          <SummaryCard label="Telegram Clicks Today" value={data.summary.telegram_clicks_today} />
          <SummaryCard label="Latest Visitor" value={formatDate(data.summary.latest_visitor_at)} />
        </section>
        <section className="admin-activity-panel">
          <div className="admin-activity-heading"><div><span className="dashboard-eyebrow">Live records</span><h2>Recent Activity</h2></div><span>{data.pagination.total} records</span></div>
          <div className="admin-activity-table-wrap"><table className="admin-activity-table"><thead><tr><th>Event</th><th>Country</th><th>Approx. Location</th><th>Device</th><th>Browser</th><th>OS</th><th>Page</th><th>Date / Time</th></tr></thead><tbody>{data.activity.map((record) => <tr key={record.id}><td><span className={`admin-activity-event ${record.event_type}`}>{eventLabel(record.event_type)}</span></td><td>{display(record.country)}</td><td>{location(record)}</td><td>{display(record.device_type)}</td><td>{display(record.browser)}</td><td>{display(record.operating_system)}</td><td>{display(record.page_path)}</td><td>{formatDate(record.created_at)}</td></tr>)}</tbody></table>{data.activity.length === 0 && <div className="admin-activity-state">No activity records yet.</div>}</div>
        </section>
      </>}
    </div>
  </AdminLayout>
}
