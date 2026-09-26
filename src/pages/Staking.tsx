import { useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import networkIcon from '../assets/icons/Icon-17.svg'
import shieldIcon from '../assets/icons/Icon-8.svg'
import leafIcon from '../assets/icons/Icon-18.svg'
import '../styles/staking.css'
import DashboardLayout from '../components/DashboardLayout'

const pools = [
  { name: 'Core Liquidity', meta: 'FLEXIBLE  TVL: $4.2M', apr: '12%', icon: networkIcon, tone: 'green' },
  { name: 'Eco Validator', meta: '90 DAYS  TVL: $1.8M', apr: '18%', icon: shieldIcon, tone: 'lilac' },
]

export default function Staking({ embedded = false }: { embedded?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const content = <div className="site-shell staking-page">{!embedded && <Header activePage="staking" menuOpen={menuOpen} onMenuToggle={() => setMenuOpen((open) => !open)} />}<main>
    <section className="staking-dashboard section"><div className="portfolio-column"><h1>Staking Portfolio</h1><div className="portfolio-stats"><div><span>TOTAL STAKED</span><strong>4,500 <small>NDC</small></strong><em>+2.5% this month</em></div><div><span>TOTAL REWARDS</span><strong>1,250 <small>NDC</small></strong></div><div><span>CURRENT AVG APR</span><strong>18.5%</strong></div></div><div className="rewards-heading"><h2>Rewards History</h2><div><span>7D</span><b>30D</b><span>ALL</span></div></div><div className="rewards-chart" aria-label="Rewards history chart"><svg viewBox="0 0 500 170" preserveAspectRatio="none" aria-hidden="true"><path className="chart-fill" d="M0 92 C72 75 125 78 194 90 S310 142 385 116 S445 96 500 70 V170 H0Z" /><path className="chart-line" d="M0 92 C72 75 125 78 194 90 S310 142 385 116 S445 96 500 70" /></svg></div><h2 className="pools-title">Active Staking Pools</h2><div className="pool-list">{pools.map((pool) => <article className="pool-row" key={pool.name}><span className={`pool-icon ${pool.tone}`}><img src={pool.icon} alt="" /></span><div className="pool-name"><strong>{pool.name}</strong><small>{pool.meta}</small></div><div className="pool-apr"><small>APR</small><strong>{pool.apr}</strong></div><button type="button">Stake Now</button></article>)}</div></div><aside className="quick-stake"><h2>ϟ Quick Stake</h2><label htmlFor="pool-select">SELECT POOL</label><select id="pool-select" defaultValue="Core Liquidity"><option>Core Liquidity (12% APR)</option><option>Eco Validator (18% APR)</option></select><div className="amount-label"><label htmlFor="stake-amount">AMOUNT (NDC)</label><span>MAX: 4,200</span></div><div className="stake-input"><input id="stake-amount" defaultValue="0.00" aria-label="Stake amount" /><span>HALF&nbsp;&nbsp; MAX</span></div><div className="stake-estimate"><div>Estimated Daily Rewards <b>1.24 NDC</b></div><div>Network Fee <b>0.005 ETH</b></div></div><button className="confirm-stake" type="button">Confirm Stake</button></aside></section>
  </main>{!embedded && <Footer />}</div>
  return embedded ? <DashboardLayout activePage="staking" title="Staking" eyebrow="Workspace / Staking">{content}</DashboardLayout> : content
}