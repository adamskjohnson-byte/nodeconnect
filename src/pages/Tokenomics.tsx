import { useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import globe from '../assets/icons/Icon.svg'
import network from '../assets/icons/Icon-17.svg'
import fire from '../assets/icons/Icon-3.svg'
import '../styles/tokenomics.css'
import DashboardLayout from '../components/DashboardLayout'
import { useAppTranslation } from '../lib/i18n'

const allocations = [
  ['tokenomics.communityRewards', '40%', 'community'],
  ['tokenomics.ecosystemGrowth', '25%', 'ecosystem'],
  ['tokenomics.coreTeamVested', '20%', 'team'],
  ['tokenomics.earlyInvestors', '10%', 'investors'],
  ['tokenomics.initialLiquidity', '5%', 'liquidity'],
]

function SupplyCard({ label, value, unit, icon, tone = 'green', progress }: { label: string; value: string; unit: string; icon: string; tone?: string; progress?: boolean }) {
  const t = useAppTranslation()
  return <article className={`supply-card ${tone}`}><div className="supply-icon"><img src={icon} alt="" /></div><span className="token-label">{t(label)}</span><strong>{value}</strong>{progress ? <div className="supply-progress"><i /></div> : <span className="supply-badge">{unit}</span>}{progress ? <small>{t('tokenomics.unlocked', { percent: '24.55' })}</small> : null}</article>
}

export default function Tokenomics({ embedded = false }: { embedded?: boolean }) {
  const t = useAppTranslation()
  const [menuOpen, setMenuOpen] = useState(false)
  const content = <div className="site-shell tokenomics-page">{!embedded && <Header activePage="tokenomics" menuOpen={menuOpen} onMenuToggle={() => setMenuOpen((open) => !open)} />}<main>
    <section className="tokenomics-intro section"><h1>$CNPY <span>{t('tokenomics.title')}</span></h1><p>{t('tokenomics.description')}</p></section>
    <section className="supply-grid section"><SupplyCard label="tokenomics.totalSupply" value="1,000,000,000" unit="$CNPY" icon={globe} /><SupplyCard label="tokenomics.circulatingSupply" value="245,500,000" unit="" icon={network} progress /><SupplyCard label="tokenomics.totalBurned" value="12,400,000" unit={t('tokenomics.deflationary')} icon={fire} tone="burned" /></section>
    <section className="distribution-panel section"><div className="distribution-heading"><h2>{t('tokenomics.distribution')}</h2><p>{t('tokenomics.distributionDescription')}</p></div><div className="distribution-body"><div className="distribution-donut" aria-label={t('tokenomics.chartAlt')}><div><strong>1B</strong><span>CNPY</span></div></div><div className="allocation-rows">{allocations.map(([label, percent, tone]) => <div className={`allocation-row ${tone}`} key={label}><span><i />{t(label)}</span><strong>{percent}</strong></div>)}</div></div></section>
  </main>{!embedded && <Footer />}</div>
  return embedded ? <DashboardLayout activePage="tokenomics" title={t('nav.tokenomics')} eyebrow={`${t('nav.workspace')} / ${t('nav.tokenomics')}`}>{content}</DashboardLayout> : content
}