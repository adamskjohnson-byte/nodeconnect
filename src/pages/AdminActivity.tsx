import { useEffect, useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import { getAdminActivity, type AdminActivityResponse, type AdminActivityRecord } from '../lib/activityApi'
import '../styles/admin-activity.css'
import { useAppTranslation } from '../lib/i18n'

function display(value: string | null, unknown: string): string {
  return value && value.trim() !== '' ? value : unknown
}

function location(record: AdminActivityRecord, unknown: string): string {
  const parts = [record.city, record.region].filter((value): value is string => Boolean(value && value.trim()))
  return parts.length > 0 ? parts.join(', ') : unknown
}

function eventLabel(eventType: AdminActivityRecord['event_type'], t: (key: string) => string): string {
  return eventType === 'telegram_click' ? t('admin.telegramClick') : t('admin.newVisitor')
}

function formatDate(value: string | null, missing: string): string {
  if (!value) return missing
  const date = new Date(`${value.replace(' ', 'T')}Z`)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
}

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return <article className="admin-activity-summary-card"><span>{label}</span><strong>{value}</strong></article>
}

export default function AdminActivity() {
  const t = useAppTranslation()
  const [data, setData] = useState<AdminActivityResponse | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getAdminActivity().then((response) => {
      if (active) setData(response)
    }).catch(() => {
      if (active) setError(t('errors.loadActivity'))
    })
    return () => { active = false }
  }, [])

  return <AdminLayout activePage="activity" title={t('admin.activityTitle')} eyebrow={`${t('nav.admin')} / ${t('admin.visitorMonitoring')} `}>
    <div className="admin-activity-content">
      <section className="admin-activity-intro">
        <div><span className="dashboard-eyebrow">{t('admin.approxIpLocation')}</span><h2>{t('admin.visitorMonitoring')}</h2><p>{t('admin.activityDescription')}</p></div>
      </section>
      {error && <div className="admin-activity-state is-error" role="alert">{error}</div>}
      {!data && !error && <div className="admin-activity-state">{t('admin.loading')}</div>}
      {data && <>
        <section className="admin-activity-summary" aria-label={t('admin.summaryLabel')}>
          <SummaryCard label={t('admin.visitorsToday')} value={data.summary.visitors_today} />
          <SummaryCard label={t('admin.visitorsWeek')} value={data.summary.visitors_this_week} />
          <SummaryCard label={t('admin.telegramClicksToday')} value={data.summary.telegram_clicks_today} />
          <SummaryCard label={t('admin.latestVisitor')} value={formatDate(data.summary.latest_visitor_at, t('common.notAvailable'))} />
        </section>
        <section className="admin-activity-panel">
          <div className="admin-activity-heading"><div><span className="dashboard-eyebrow">{t('admin.liveRecords')}</span><h2>{t('admin.recentActivity')}</h2></div><span>{t('admin.records', { count: data.pagination.total })}</span></div>
          <div className="admin-activity-table-wrap"><table className="admin-activity-table"><thead><tr><th>{t('admin.event')}</th><th>{t('admin.country')}</th><th>{t('admin.approxLocation')}</th><th>{t('admin.device')}</th><th>{t('admin.browser')}</th><th>{t('admin.os')}</th><th>{t('common.page')}</th><th>{t('admin.dateTime')}</th></tr></thead><tbody>{data.activity.map((record) => <tr key={record.id}><td><span className={`admin-activity-event ${record.event_type}`}>{eventLabel(record.event_type, t)}</span></td><td>{display(record.country, t('common.unknown'))}</td><td>{location(record, t('common.unknown'))}</td><td>{display(record.device_type, t('common.unknown'))}</td><td>{display(record.browser, t('common.unknown'))}</td><td>{display(record.operating_system, t('common.unknown'))}</td><td>{display(record.page_path, t('common.unknown'))}</td><td>{formatDate(record.created_at, t('common.notAvailable'))}</td></tr>)}</tbody></table>{data.activity.length === 0 && <div className="admin-activity-state">{t('admin.noRecords')}</div>}</div>
        </section>
      </>}
    </div>
  </AdminLayout>
}
