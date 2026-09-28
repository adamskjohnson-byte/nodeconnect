import { useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import shield from '../assets/icons/Icon-9.svg'
import claim from '../assets/icons/Icon-19.svg'
import vote from '../assets/icons/Icon-3.svg'
import chart from '../assets/icons/Icon-20.svg'
import '../styles/history.css'
import DashboardLayout from '../components/DashboardLayout'
import { useAppTranslation } from '../lib/i18n'

type Activity = { type: 'Stake' | 'Claim' | 'Vote'; amount: string; status: 'Completed' | 'Pending'; timestamp: string }

const activities: Activity[] = [
  { type: 'Stake', amount: '5,000 NODE', status: 'Completed', timestamp: '2023-10-27 14:32:01 UTC' },
  { type: 'Claim', amount: '125.4 NODE', status: 'Pending', timestamp: '2023-10-27 12:15:44 UTC' },
  { type: 'Vote', amount: 'Prop #42', status: 'Completed', timestamp: '2023-10-26 09:01:22 UTC' },
  { type: 'Stake', amount: '10,000 NODE', status: 'Completed', timestamp: '2023-10-25 18:44:10 UTC' },
]

const activityIcons = { Stake: shield, Claim: claim, Vote: vote }
const activityTranslationKeys = { Stake: 'transactions.activityStake', Claim: 'transactions.activityClaim', Vote: 'transactions.activityVote' } as const

function SummaryCard({ label, value, unit, change, icon }: { label: string; value: string; unit: string; change: string; icon: string }) {
  return <article className="history-summary-card"><div className="summary-copy"><span className="history-label">{label}</span><strong>{value}<small>{unit}</small></strong><em>↗ {change}</em></div><span className="summary-icon"><img src={icon} alt="" /></span></article>
}

function ActivityIcon({ type }: { type: Activity['type'] }) {
  return <span className={`activity-icon activity-${type.toLowerCase()}`}><img src={activityIcons[type]} alt="" /></span>
}

export default function TransactionHistory({ embedded = false }: { embedded?: boolean }) {
  const t = useAppTranslation()
  const [menuOpen, setMenuOpen] = useState(false)
  const content = <div className="site-shell history-page">{!embedded && <Header activePage="history" menuOpen={menuOpen} onMenuToggle={() => setMenuOpen((open) => !open)} />}<main>
    <section className="history-content section"><div className="history-title-row"><div><h1>{t('transactions.title')}</h1><p>{t('transactions.description')}</p></div><div className="history-actions"><button type="button">↥ {t('transactions.exportCsv')}</button><button type="button">≡ {t('transactions.filter')}</button></div></div>
      <div className="history-summary"><SummaryCard label={t('transactions.totalRewardsClaimed')} value="42,891" unit="NODE" change={t('transactions.epochComparison', { change: '+12.5%' })} icon={claim} /><SummaryCard label={t('transactions.recentActivityVolume')} value="1.2M" unit="USD" change={t('transactions.trailingComparison', { change: '+5.2%' })} icon={chart} /><article className="history-summary-card network-status"><div className="summary-copy"><span className="history-label">{t('transactions.networkStatus')}</span><em>↗ {t('transactions.currentEpoch')} <b>#4,892</b></em><em>{t('transactions.avgGasPrice')} <b>12 Gwei</b></em></div><span className="status-chip"><i /> {t('transactions.mainnetLive')}</span></article></div>
      <div className="history-table-wrap"><table><thead><tr><th>{t('common.type')}</th><th>{t('common.amount')}</th><th>{t('common.status')}</th><th>{t('common.dateTime')}</th><th>{t('transactions.hash')}</th></tr></thead><tbody>{activities.map((activity) => <tr key={`${activity.type}-${activity.timestamp}`}><td><ActivityIcon type={activity.type} /><span>{t(activityTranslationKeys[activity.type])}</span></td><td>{activity.amount}</td><td><span className={`status-pill ${activity.status.toLowerCase()}`}>◉ {t(activity.status === 'Completed' ? 'transactions.completed' : 'transactions.pending')}</span></td><td>{activity.timestamp}</td><td><a href="#transaction" aria-label={t('transactions.viewTransaction', { type: t(activityTranslationKeys[activity.type]) })}>↗</a></td></tr>)}</tbody></table><div className="history-table-footer"><span>{t('transactions.showing', { from: 1, to: 4, total: 128 })}</span><div><button type="button" aria-label={t('transactions.previousPage')}>‹</button><button type="button" aria-label={t('transactions.nextPage')}>›</button></div></div></div>
    </section>
  </main>{!embedded && <Footer />}</div>
  return embedded ? <DashboardLayout activePage="history" title={t('nav.transactions')} eyebrow={`${t('nav.workspace')} / ${t('nav.transactions')}`}>{content}</DashboardLayout> : content
}