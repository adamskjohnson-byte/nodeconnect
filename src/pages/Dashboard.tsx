import nodesIcon from '../assets/icons/Icon-17.svg'
import leafIcon from '../assets/icons/Icon-18.svg'
import shieldIcon from '../assets/icons/Icon-9.svg'
import rewardsIcon from '../assets/icons/Icon-16.svg'
import listIcon from '../assets/icons/Icon-11.svg'
import walletMark from '../assets/wallet-mark.svg'
import DashboardLayout from '../components/DashboardLayout'
import { trackTelegramClick } from '../lib/activityApi'
import { useAppTranslation } from '../lib/i18n'

type StatCardProps = { label: string; value: string; icon: string; tone?: 'green' | 'cyan' }

function StatCard({ label, value, icon, tone = 'green' }: StatCardProps) {
  return <article className="dashboard-stat-card">
    <div className={`dashboard-stat-icon ${tone}`}><img src={icon} alt="" /></div>
    <div><span>{label}</span><strong>{value}</strong></div>
  </article>
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return <div className="dashboard-section-heading"><span>{eyebrow}</span><h2>{title}</h2></div>
}

function EmptyState({ icon, title, message }: { icon: string; title: string; message: string }) {
  return <div className="dashboard-empty-state"><div className="dashboard-empty-icon"><img src={icon} alt="" /></div><strong>{title}</strong><p>{message}</p></div>
}

function NodesOverview() {
  const t = useAppTranslation()
  return <section className="dashboard-panel dashboard-nodes-panel"><SectionHeading eyebrow={t('dashboard.infrastructure')} title={t('dashboard.myNodes')} /><div className="dashboard-node-visual"><div className="dashboard-node-ring"><img src={nodesIcon} alt="" /></div><div><span className="dashboard-status"><i /> {t('dashboard.notActive')}</span><h3>{t('dashboard.noActiveNodes')}</h3><p>{t('dashboard.nodesAppear')}</p></div></div><a className="dashboard-secondary-action" href="#my-nodes">{t('dashboard.exploreNodes')} <span>+</span></a></section>
}

function StakingOverview() {
  const t = useAppTranslation()
  return <section className="dashboard-panel"><SectionHeading eyebrow={t('dashboard.participation')} title={t('dashboard.stakingOverview')} /><div className="dashboard-staking-status"><div><span>{t('dashboard.stakingStatus')}</span><strong>{t('dashboard.notActive')}</strong></div><div className="dashboard-progress-track"><span /></div></div><dl className="dashboard-detail-list"><div><dt>{t('dashboard.totalStakedLabel')}</dt><dd>$0.00</dd></div><div><dt>{t('dashboard.estimatedRewards')}</dt><dd>$0.00</dd></div></dl><a className="dashboard-secondary-action" href="#staking">{t('dashboard.viewStaking')} <span>+</span></a></section>
}

function RecentTransactions() {
  const t = useAppTranslation()
  return <section className="dashboard-panel dashboard-transactions-panel"><SectionHeading eyebrow={t('common.activity')} title={t('dashboard.recentTransactions')} /><div className="dashboard-transaction-head"><span>{t('common.type')}</span><span>{t('common.amount')}</span><span>{t('common.status')}</span></div><EmptyState icon={listIcon} title={t('dashboard.noTransactions')} message={t('dashboard.recentActivity')} /></section>
}

function ReferralOverview() {
  const t = useAppTranslation()
  return <section className="dashboard-panel dashboard-referral-panel"><SectionHeading eyebrow={t('home.community')} title={t('dashboard.referralRewards')} /><p className="dashboard-panel-intro">{t('dashboard.inviteDescription')}</p><div className="dashboard-referral-stats"><div><span>{t('dashboard.referrals')}</span><strong>0</strong></div><div><span>{t('dashboard.referralRewardsLabel')}</span><strong>$0.00</strong></div></div><a className="dashboard-secondary-action" href="#dashboard">{t('dashboard.referralCenter')} <span>+</span></a></section>
}

function QuickActions() {
  const t = useAppTranslation()
  const telegramSupportUrl = 'https://t.me/CAPNOYnetworkcommunitysupportbot'
  const actions = [
    { label: 'nav.myNodes', icon: nodesIcon, href: '#my-nodes' },
    { label: 'nav.staking', icon: leafIcon, href: '#staking' },
    { label: 'nav.transactions', icon: listIcon, href: '#transaction-history' },
    { label: 'dashboard.referrals', icon: rewardsIcon, href: '#dashboard' },
    { label: 'nav.connectWallet', icon: walletMark, href: telegramSupportUrl, external: true },
  ]
  return <section className="dashboard-quick-actions"><SectionHeading eyebrow={t('dashboard.shortcuts')} title={t('dashboard.quickActions')} /><div className="dashboard-action-grid">{actions.map((action) => <a href={action.href} className="dashboard-action" key={action.label} target={action.external ? '_blank' : undefined} rel={action.external ? 'noopener noreferrer' : undefined} onClick={action.external ? trackTelegramClick : undefined}><span className="dashboard-action-icon"><img src={action.icon} alt="" /></span><span>{t(action.label)}</span><b>+</b></a>)}</div></section>
}

export default function Dashboard() {
  const t = useAppTranslation()
  return <DashboardLayout activePage="dashboard" title={t('dashboard.title')}>
      <div className="dashboard-content">
        <section className="dashboard-welcome"><div><span className="dashboard-eyebrow">{t('dashboard.workspace')}</span><h2>{t('dashboard.welcome')}</h2><p>{t('dashboard.description')}</p></div><div className="dashboard-live-status"><i /> {t('dashboard.networkOnline')}</div></section>
        <section className="dashboard-stat-grid" aria-label={t('dashboard.title')}><StatCard label={t('dashboard.totalBalance')} value="$0.00" icon={shieldIcon} /><StatCard label={t('dashboard.activeNodes')} value="0" icon={nodesIcon} tone="cyan" /><StatCard label={t('dashboard.totalStaked')} value="$0.00" icon={leafIcon} /><StatCard label={t('dashboard.totalRewards')} value="$0.00" icon={rewardsIcon} tone="cyan" /></section>
        <div className="dashboard-overview-grid"><NodesOverview /><StakingOverview /></div>
        <div className="dashboard-activity-grid"><RecentTransactions /><ReferralOverview /></div>
        <QuickActions />
      </div>
  </DashboardLayout>
}
