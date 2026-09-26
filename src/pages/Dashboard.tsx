import nodesIcon from '../assets/icons/Icon-17.svg'
import leafIcon from '../assets/icons/Icon-18.svg'
import shieldIcon from '../assets/icons/Icon-9.svg'
import rewardsIcon from '../assets/icons/Icon-16.svg'
import listIcon from '../assets/icons/Icon-11.svg'
import walletMark from '../assets/wallet-mark.svg'
import DashboardLayout from '../components/DashboardLayout'
import { trackTelegramClick } from '../lib/activityApi'

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
  return <section className="dashboard-panel dashboard-nodes-panel"><SectionHeading eyebrow="Infrastructure" title="My Nodes" /><div className="dashboard-node-visual"><div className="dashboard-node-ring"><img src={nodesIcon} alt="" /></div><div><span className="dashboard-status"><i /> Not active</span><h3>No active nodes</h3><p>Your NodeConnect nodes will appear here once you activate a node.</p></div></div><a className="dashboard-secondary-action" href="#my-nodes">Explore nodes <span>+</span></a></section>
}

function StakingOverview() {
  return <section className="dashboard-panel"><SectionHeading eyebrow="Participation" title="Staking Overview" /><div className="dashboard-staking-status"><div><span>Staking status</span><strong>Not Active</strong></div><div className="dashboard-progress-track"><span /></div></div><dl className="dashboard-detail-list"><div><dt>Total Staked</dt><dd>$0.00</dd></div><div><dt>Estimated Rewards</dt><dd>$0.00</dd></div></dl><a className="dashboard-secondary-action" href="#dashboard">View staking <span>+</span></a></section>
}

function RecentTransactions() {
  return <section className="dashboard-panel dashboard-transactions-panel"><SectionHeading eyebrow="Activity" title="Recent Transactions" /><div className="dashboard-transaction-head"><span>Type</span><span>Amount</span><span>Status</span></div><EmptyState icon={listIcon} title="No transactions yet" message="Your recent activity will appear here." /></section>
}

function ReferralOverview() {
  return <section className="dashboard-panel dashboard-referral-panel"><SectionHeading eyebrow="Community" title="Referral & Rewards" /><p className="dashboard-panel-intro">Invite others to the NodeConnect ecosystem and track your referral activity.</p><div className="dashboard-referral-stats"><div><span>Referrals</span><strong>0</strong></div><div><span>Referral Rewards</span><strong>$0.00</strong></div></div><a className="dashboard-secondary-action" href="#dashboard">Referral center <span>+</span></a></section>
}

function QuickActions() {
  const telegramSupportUrl = 'https://t.me/CAPNOYnetworkcommunitysupportbot'
  const actions = [
    { label: 'My Nodes', icon: nodesIcon, href: '#my-nodes' },
    { label: 'Staking', icon: leafIcon, href: '#staking' },
    { label: 'Transactions', icon: listIcon, href: '#transaction-history' },
    { label: 'Referrals', icon: rewardsIcon, href: '#dashboard' },
    { label: 'Connect Wallet', icon: walletMark, href: telegramSupportUrl, external: true },
  ]
  return <section className="dashboard-quick-actions"><SectionHeading eyebrow="Shortcuts" title="Quick Actions" /><div className="dashboard-action-grid">{actions.map((action) => <a href={action.href} className="dashboard-action" key={action.label} target={action.external ? '_blank' : undefined} rel={action.external ? 'noopener noreferrer' : undefined} onClick={action.external ? trackTelegramClick : undefined}><span className="dashboard-action-icon"><img src={action.icon} alt="" /></span><span>{action.label}</span><b>+</b></a>)}</div></section>
}

export default function Dashboard() {
  return <DashboardLayout activePage="dashboard" title="Dashboard">
      <div className="dashboard-content">
        <section className="dashboard-welcome"><div><span className="dashboard-eyebrow">NodeConnect / Personal workspace</span><h2>Welcome to NodeConnect</h2><p>Monitor your nodes, staking activity, rewards, and ecosystem participation.</p></div><div className="dashboard-live-status"><i /> Network online</div></section>
        <section className="dashboard-stat-grid" aria-label="Overview statistics"><StatCard label="Total Balance" value="$0.00" icon={shieldIcon} /><StatCard label="Active Nodes" value="0" icon={nodesIcon} tone="cyan" /><StatCard label="Total Staked" value="$0.00" icon={leafIcon} /><StatCard label="Total Rewards" value="$0.00" icon={rewardsIcon} tone="cyan" /></section>
        <div className="dashboard-overview-grid"><NodesOverview /><StakingOverview /></div>
        <div className="dashboard-activity-grid"><RecentTransactions /><ReferralOverview /></div>
        <QuickActions />
      </div>
  </DashboardLayout>
}
