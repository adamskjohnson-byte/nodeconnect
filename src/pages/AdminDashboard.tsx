import { useEffect, useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import { getAdminActivity, type AdminActivityResponse, type AdminActivityRecord } from '../lib/activityApi'
import { useAppTranslation } from '../lib/i18n'

function value(text: string | null, unknown: string): string {
  return text && text.trim() !== '' ? text : unknown
}

function formatDate(text: string | null, missing: string): string {
  if (!text) return missing
  const date = new Date(`${text.replace(' ', 'T')}Z`)
  return Number.isNaN(date.getTime()) ? text : date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
}

function location(record: AdminActivityRecord, unknown: string): string {
  return [record.city, record.region].filter(Boolean).join(', ') || unknown
}

export default function AdminDashboard() {
  const t = useAppTranslation()
  const [data, setData] = useState<AdminActivityResponse | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getAdminActivity().then((response) => {
      if (active) setData(response)
    }).catch(() => {
      if (active) setError(t('errors.loadAdminActivity'))
    })
    return () => { active = false }
  }, [])

  return <AdminLayout activePage="dashboard" title={t('admin.dashboardTitle')}>
    <div className="admin-dashboard-content">
      <section className="admin-dashboard-intro"><span className="dashboard-eyebrow">NodeConnect / {t('admin.administration')}</span><h2>{t('admin.controlCenter')}</h2><p>{t('admin.monitoringDescription')}</p></section>
      {error && <div className="admin-dashboard-state" role="alert">{error}</div>}
      {!data && !error && <div className="admin-dashboard-state">{t('admin.loadingActivity')}</div>}
      {data && <>
        <section className="admin-dashboard-summary" aria-label={t('admin.activitySummary')}>
          <article className="admin-dashboard-card"><span>{t('admin.visitorsToday')}</span><strong>{data.summary.visitors_today}</strong></article>
          <article className="admin-dashboard-card"><span>{t('admin.visitorsWeek')}</span><strong>{data.summary.visitors_this_week}</strong></article>
          <article className="admin-dashboard-card"><span>{t('admin.telegramClicksToday')}</span><strong>{data.summary.telegram_clicks_today}</strong></article>
          <article className="admin-dashboard-card"><span>{t('admin.latestVisitor')}</span><strong>{formatDate(data.summary.latest_visitor_at, t('common.notAvailable'))}</strong></article>
        </section>
        <section className="admin-dashboard-panel"><div className="admin-dashboard-panel-heading"><div><span className="dashboard-eyebrow">{t('admin.liveRecords')}</span><h2>{t('admin.recentActivity')}</h2></div><span>{t('admin.records', { count: data.pagination.total })}</span></div>{data.activity.length > 0 ? <div className="admin-dashboard-activity-list">{data.activity.slice(0, 5).map((record) => <div className="admin-dashboard-activity-row" key={record.id}><span className={`admin-dashboard-event ${record.event_type}`}>{record.event_type === 'telegram_click' ? t('admin.telegramClick') : t('admin.newVisitor')}</span><span>{value(record.country, t('common.unknown'))}</span><span>{location(record, t('common.unknown'))}</span><span>{formatDate(record.created_at, t('common.notAvailable'))}</span></div>)}</div> : <div className="admin-dashboard-state">{t('admin.noRecords')}</div>}<div className="admin-dashboard-actions"><a className="admin-dashboard-link" href="#admin/activity">{t('admin.viewVisitorActivity')}</a></div></section>
      </>}
    </div>
  </AdminLayout>
}
