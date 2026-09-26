import { useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import telegram from '../assets/icons/Icon-2.svg'
import '../styles/roadmap.css'
import DashboardLayout from '../components/DashboardLayout'

type Phase = { number: string; title: string; milestones: string[]; status: string; state: 'complete' | 'active' | 'upcoming' | 'future' }

const phases: Phase[] = [
  { number: '1', title: 'Seedling', milestones: ['Core protocol deployment', 'Initial node operator onboarding', 'Whitepaper release'], status: 'Completed - Q1 2024', state: 'complete' },
  { number: '2', title: 'Growth', milestones: ['Cross-chain integration', 'Staking rewards v2', 'Governance forum launch', 'Strategic partnerships'], status: 'In Progress - Q3 2024', state: 'active' },
  { number: '3', title: 'Canopy', milestones: ['Decentralized identity protocol', 'Mobile application beta', 'Advanced validator tooling'], status: 'Upcoming - Q1 2025', state: 'upcoming' },
  { number: '4', title: 'Global Forest', milestones: ['Fully autonomous network', 'Institutional integration suite', 'Ecosystem grant program scaling'], status: 'Future Vision', state: 'future' },
]

function PhaseCard({ phase }: { phase: Phase }) {
  return <article className={`roadmap-phase phase-${phase.state}`}><div className="phase-heading"><span className="phase-badge">Phase {phase.number}</span><h2>{phase.title}</h2></div><ul>{phase.milestones.map((milestone) => <li key={milestone}>{milestone}</li>)}</ul></article>
}

export default function Roadmap({ embedded = false }: { embedded?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const content = <div className="site-shell roadmap-page">{!embedded && <Header activePage="roadmap" menuOpen={menuOpen} onMenuToggle={() => setMenuOpen((open) => !open)} />}<main>
    <section className="roadmap-intro section"><div className="roadmap-badge">▣ &nbsp; DEVELOPMENT PATH</div><h1>The Evolution of<br />NodeConnect</h1><p>Charting our course through the decentralized wilderness. Our roadmap outlines the<br className="desktop-break" /> strategic phases of growth, from establishing roots to forming a global canopy.</p></section>
    <section className="roadmap-timeline section" aria-label="NodeConnect development roadmap"><div className="timeline-line" />{phases.map((phase, index) => <div className={`timeline-row row-${index % 2 === 0 ? 'left' : 'right'}`} key={phase.number}><div className="timeline-card"><PhaseCard phase={phase} /></div><div className={`timeline-node ${phase.state}`} aria-hidden="true"><span /></div><div className="timeline-status">{phase.status}</div></div>)}</section>
    <section className="community-cta section"><div className="telegram-icon"><img src={telegram} alt="" /></div><h2>Join our community</h2><p>Connect with thousands of node operators, developers, and<br className="desktop-break" /> protocol enthusiasts. Get real-time support and updates.</p><button className="community-button" type="button">Connect with Telegram</button></section>
  </main>{!embedded && <Footer />}</div>
  return embedded ? <DashboardLayout activePage="roadmap" title="Roadmap" eyebrow="Workspace / Roadmap">{content}</DashboardLayout> : content
}