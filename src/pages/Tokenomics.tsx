import { useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import globe from '../assets/icons/Icon.svg'
import network from '../assets/icons/Icon-17.svg'
import fire from '../assets/icons/Icon-3.svg'
import '../styles/tokenomics.css'
import DashboardLayout from '../components/DashboardLayout'

const allocations = [
  ['Community & Rewards', '40%', 'community'],
  ['Ecosystem Growth', '25%', 'ecosystem'],
  ['Core Team (Vested)', '20%', 'team'],
  ['Early Investors', '10%', 'investors'],
  ['Initial Liquidity', '5%', 'liquidity'],
]

function SupplyCard({ label, value, unit, icon, tone = 'green', progress }: { label: string; value: string; unit: string; icon: string; tone?: string; progress?: boolean }) {
  return <article className={`supply-card ${tone}`}><div className="supply-icon"><img src={icon} alt="" /></div><span className="token-label">{label}</span><strong>{value}</strong>{progress ? <div className="supply-progress"><i /></div> : <span className="supply-badge">{unit}</span>}{progress ? <small>24.55% Unlocked</small> : null}</article>
}

export default function Tokenomics({ embedded = false }: { embedded?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const content = <div className="site-shell tokenomics-page">{!embedded && <Header activePage="tokenomics" menuOpen={menuOpen} onMenuToggle={() => setMenuOpen((open) => !open)} />}<main>
    <section className="tokenomics-intro section"><h1>$CNPY <span>Tokenomics</span></h1><p>The lifeblood of the NodeConnect ecosystem. Designed for sustainable<br className="tokenomics-break" /> growth, network security, and community governance.</p></section>
    <section className="supply-grid section"><SupplyCard label="TOTAL SUPPLY" value="1,000,000,000" unit="$CNPY" icon={globe} /><SupplyCard label="CIRCULATING SUPPLY" value="245,500,000" unit="" icon={network} progress /><SupplyCard label="TOTAL BURNED" value="12,400,000" unit="Deflationary" icon={fire} tone="burned" /></section>
    <section className="distribution-panel section"><div className="distribution-heading"><h2>Token Distribution</h2><p>Strategic allocation for long-term ecosystem health.</p></div><div className="distribution-body"><div className="distribution-donut" aria-label="Token allocation donut chart"><div><strong>1B</strong><span>CNPY</span></div></div><div className="allocation-rows">{allocations.map(([label, percent, tone]) => <div className={`allocation-row ${tone}`} key={label}><span><i />{label}</span><strong>{percent}</strong></div>)}</div></div></section>
  </main>{!embedded && <Footer />}</div>
  return embedded ? <DashboardLayout activePage="tokenomics" title="Tokenomics" eyebrow="Workspace / Tokenomics">{content}</DashboardLayout> : content
}