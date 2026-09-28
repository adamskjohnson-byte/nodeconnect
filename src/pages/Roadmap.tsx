import { useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import telegram from '../assets/icons/Icon-2.svg'
import '../styles/roadmap.css'
import DashboardLayout from '../components/DashboardLayout'
import { useAppTranslation } from '../lib/i18n'

type Phase = { number: string; title: string; milestones: string[]; status: string; state: 'complete' | 'active' | 'upcoming' | 'future' }

const phases: Phase[] = [
  { number: '1', title: 'roadmap.seedling', milestones: ['roadmap.coreDeployment', 'roadmap.nodeOnboarding', 'roadmap.whitepaper'], status: 'roadmap.completed', state: 'complete' },
  { number: '2', title: 'roadmap.growth', milestones: ['roadmap.crossChain', 'roadmap.stakingV2', 'roadmap.governance', 'roadmap.partnerships'], status: 'roadmap.inProgress', state: 'active' },
  { number: '3', title: 'roadmap.canopy', milestones: ['roadmap.identity', 'roadmap.mobileBeta', 'roadmap.validatorTools'], status: 'roadmap.upcoming', state: 'upcoming' },
  { number: '4', title: 'roadmap.globalForest', milestones: ['roadmap.autonomousNetwork', 'roadmap.institutional', 'roadmap.grants'], status: 'roadmap.futureVision', state: 'future' },
]

function PhaseCard({ phase, t }: { phase: Phase; t: (key: string, options?: Record<string, unknown>) => string }) {
  return <article className={`roadmap-phase phase-${phase.state}`}><div className="phase-heading"><span className="phase-badge">{t('roadmap.phase', { number: phase.number })}</span><h2>{t(phase.title)}</h2></div><ul>{phase.milestones.map((milestone) => <li key={milestone}>{t(milestone)}</li>)}</ul></article>
}

export default function Roadmap({ embedded = false }: { embedded?: boolean }) {
  const t = useAppTranslation()
  const [menuOpen, setMenuOpen] = useState(false)
  const content = <div className="site-shell roadmap-page">{!embedded && <Header activePage="roadmap" menuOpen={menuOpen} onMenuToggle={() => setMenuOpen((open) => !open)} />}<main>
    <section className="roadmap-intro section"><div className="roadmap-badge">▣ &nbsp; {t('roadmap.developmentPath')}</div><h1>{t('roadmap.title')}</h1><p>{t('roadmap.description')}</p></section>
    <section className="roadmap-timeline section" aria-label={t('roadmap.timelineLabel')}><div className="timeline-line" />{phases.map((phase, index) => <div className={`timeline-row row-${index % 2 === 0 ? 'left' : 'right'}`} key={phase.number}><div className="timeline-card"><PhaseCard phase={phase} t={t} /></div><div className={`timeline-node ${phase.state}`} aria-hidden="true"><span /></div><div className="timeline-status">{t(phase.status)}</div></div>)}</section>
    <section className="community-cta section"><div className="telegram-icon"><img src={telegram} alt="" /></div><h2>{t('roadmap.joinCommunity')}</h2><p>{t('roadmap.communityDescription')}</p><button className="community-button" type="button">{t('roadmap.connectTelegram')}</button></section>
  </main>{!embedded && <Footer />}</div>
  return embedded ? <DashboardLayout activePage="roadmap" title={t('nav.roadmap')} eyebrow={`${t('nav.workspace')} / ${t('nav.roadmap')}`}>{content}</DashboardLayout> : content
}