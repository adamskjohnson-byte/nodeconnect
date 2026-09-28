import { useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import networkIcon from '../assets/icons/Icon-17.svg'
import shieldIcon from '../assets/icons/Icon-8.svg'
import leafIcon from '../assets/icons/Icon-18.svg'
import '../styles/staking.css'
import DashboardLayout from '../components/DashboardLayout'
import { useAppTranslation } from '../lib/i18n'

const pools = [
  { name: 'Core Liquidity', durationKey: 'staking.flexible', tvl: '$4.2M', apr: '12%', icon: networkIcon, tone: 'green' },
  { name: 'Eco Validator', durationKey: 'staking.days', days: '90', tvl: '$1.8M', apr: '18%', icon: shieldIcon, tone: 'lilac' },
]

export default function Staking({ embedded = false }: { embedded?: boolean }) {
  const t = useAppTranslation()
  const [menuOpen, setMenuOpen] = useState(false)
  const content = <div className="site-shell staking-page">{!embedded && <Header activePage="staking" menuOpen={menuOpen} onMenuToggle={() => setMenuOpen((open) => !open)} />}<main>
    <section className="staking-dashboard section"><div className="portfolio-column"><h1>{t('staking.title')}</h1><div className="portfolio-stats"><div><span>{t('staking.totalStaked')}</span><strong>4,500 <small>NDC</small></strong><em>{t('staking.thisMonth', { change: '+2.5%' })}</em></div><div><span>{t('staking.totalRewards')}</span><strong>1,250 <small>NDC</small></strong></div><div><span>{t('staking.currentAverageApr')}</span><strong>18.5%</strong></div></div><div className="rewards-heading"><h2>{t('staking.rewardsHistory')}</h2><div><span>{t('staking.period7d')}</span><b>{t('staking.period30d')}</b><span>{t('staking.periodAll')}</span></div></div><div className="rewards-chart" aria-label={t('staking.chartAlt')}><svg viewBox="0 0 500 170" preserveAspectRatio="none" aria-hidden="true"><path className="chart-fill" d="M0 92 C72 75 125 78 194 90 S310 142 385 116 S445 96 500 70 V170 H0Z" /><path className="chart-line" d="M0 92 C72 75 125 78 194 90 S310 142 385 116 S445 96 500 70" /></svg></div><h2 className="pools-title">{t('staking.activePools')}</h2><div className="pool-list">{pools.map((pool) => <article className="pool-row" key={pool.name}><span className={`pool-icon ${pool.tone}`}><img src={pool.icon} alt="" /></span><div className="pool-name"><strong>{pool.name}</strong><small>{`${pool.durationKey === 'staking.days' ? t(pool.durationKey, { days: pool.days }) : t(pool.durationKey)}  ${t('staking.tvl', { amount: pool.tvl })}`}</small></div><div className="pool-apr"><small>{t('staking.apr')}</small><strong>{pool.apr}</strong></div><button type="button">{t('staking.stakeNow')}</button></article>)}</div></div><aside className="quick-stake"><h2>ϟ {t('staking.quickStake')}</h2><label htmlFor="pool-select">{t('staking.selectPool')}</label><select id="pool-select" defaultValue="Core Liquidity"><option>Core Liquidity (12% APR)</option><option>Eco Validator (18% APR)</option></select><div className="amount-label"><label htmlFor="stake-amount">{t('staking.amountNdc')}</label><span>{t('staking.maxAmount', { amount: '4,200' })}</span></div><div className="stake-input"><input id="stake-amount" defaultValue="0.00" aria-label={t('staking.amountNdc')} /><span>{t('staking.half')}&nbsp;&nbsp; {t('staking.max')}</span></div><div className="stake-estimate"><div>{t('staking.estimatedDailyRewards')} <b>1.24 NDC</b></div><div>{t('staking.networkFee')} <b>0.005 ETH</b></div></div><button className="confirm-stake" type="button">{t('staking.confirmStake')}</button></aside></section>
  </main>{!embedded && <Footer />}</div>
  return embedded ? <DashboardLayout activePage="staking" title={t('nav.staking')} eyebrow={`${t('nav.workspace')} / ${t('nav.staking')}`}>{content}</DashboardLayout> : content
}