import { useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import shield from '../assets/icons/Icon-9.svg'
import claim from '../assets/icons/Icon-19.svg'
import vote from '../assets/icons/Icon-3.svg'
import chart from '../assets/icons/Icon-20.svg'
import '../styles/history.css'
import DashboardLayout from '../components/DashboardLayout'

type Activity = { type: 'Stake' | 'Claim' | 'Vote'; amount: string; status: 'Completed' | 'Pending'; timestamp: string }

const activities: Activity[] = [
  { type: 'Stake', amount: '5,000 NODE', status: 'Completed', timestamp: '2023-10-27 14:32:01 UTC' },
  { type: 'Claim', amount: '125.4 NODE', status: 'Pending', timestamp: '2023-10-27 12:15:44 UTC' },
  { type: 'Vote', amount: 'Prop #42', status: 'Completed', timestamp: '2023-10-26 09:01:22 UTC' },
  { type: 'Stake', amount: '10,000 NODE', status: 'Completed', timestamp: '2023-10-25 18:44:10 UTC' },
]

const activityIcons = { Stake: shield, Claim: claim, Vote: vote }

function SummaryCard({ label, value, unit, change, icon }: { label: string; value: string; unit: string; change: string; icon: string }) {
  return <article className="history-summary-card"><div className="summary-copy"><span className="history-label">{label}</span><strong>{value}<small>{unit}</small></strong><em>↗ {change}</em></div><span className="summary-icon"><img src={icon} alt="" /></span></article>
}

function ActivityIcon({ type }: { type: Activity['type'] }) {
  return <span className={`activity-icon activity-${type.toLowerCase()}`}><img src={activityIcons[type]} alt="" /></span>
}

export default function TransactionHistory({ embedded = false }: { embedded?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const content = <div className="site-shell history-page">{!embedded && <Header activePage="history" menuOpen={menuOpen} onMenuToggle={() => setMenuOpen((open) => !open)} />}<main>
    <section className="history-content section"><div className="history-title-row"><div><h1>Transaction History</h1><p>Monitor your ecosystem interactions, staking rewards, and governance votes across the<br className="history-desktop-break" /> network.</p></div><div className="history-actions"><button type="button">↥ Export CSV</button><button type="button">≡ Filter</button></div></div>
      <div className="history-summary"><SummaryCard label="Total Rewards Claimed" value="42,891" unit="NODE" change="+12.5% vs last epoch" icon={claim} /><SummaryCard label="Recent Activity Volume" value="1.2M" unit="USD" change="+5.2% 30d trailing" icon={chart} /><article className="history-summary-card network-status"><div className="summary-copy"><span className="history-label">Network<br />Status</span><em>↗ Current Epoch <b>#4,892</b></em><em>Avg Gas Price <b>12 Gwei</b></em></div><span className="status-chip"><i /> Mainnet<br />Live</span></article></div>
      <div className="history-table-wrap"><table><thead><tr><th>Type</th><th>Amount</th><th>Status</th><th>Timestamp</th><th>Hash</th></tr></thead><tbody>{activities.map((activity) => <tr key={`${activity.type}-${activity.timestamp}`}><td><ActivityIcon type={activity.type} /><span>{activity.type}</span></td><td>{activity.amount}</td><td><span className={`status-pill ${activity.status.toLowerCase()}`}>◉ {activity.status}</span></td><td>{activity.timestamp}</td><td><a href="#transaction" aria-label={`View ${activity.type} transaction`}>↗</a></td></tr>)}</tbody></table><div className="history-table-footer"><span>Showing 1-4 of 128</span><div><button type="button" aria-label="Previous page">‹</button><button type="button" aria-label="Next page">›</button></div></div></div>
    </section>
  </main>{!embedded && <Footer />}</div>
  return embedded ? <DashboardLayout activePage="history" title="Transactions" eyebrow="Workspace / Transactions">{content}</DashboardLayout> : content
}