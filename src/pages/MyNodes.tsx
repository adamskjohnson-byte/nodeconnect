import nodesIcon from '../assets/icons/Icon-17.svg'
import shieldIcon from '../assets/icons/Icon-9.svg'
import leafIcon from '../assets/icons/Icon-18.svg'
import listIcon from '../assets/icons/Icon-11.svg'
import DashboardLayout from '../components/DashboardLayout'
import '../styles/my-nodes.css'
import { useAppTranslation } from '../lib/i18n'

type NodeStatProps = { label: string; value: string; icon: string; tone?: 'green' | 'cyan' }

function NodeStat({ label, value, icon, tone = 'green' }: NodeStatProps) {
  return <article className="my-nodes-stat dashboard-stat-card"><div className={`dashboard-stat-icon ${tone}`}><img src={icon} alt="" /></div><div><span>{label}</span><strong>{value}</strong></div></article>
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return <header className="my-nodes-section-heading"><div><span className="my-nodes-eyebrow">{eyebrow}</span><h2>{title}</h2>{description && <p>{description}</p>}</div></header>
}

function InfrastructureItem({ label, value, description, icon }: { label: string; value: string; description: string; icon: string }) {
  return <article className="my-nodes-infrastructure-item"><div className="my-nodes-item-icon"><img src={icon} alt="" /></div><div><span>{label}</span><strong>{value}</strong><p>{description}</p></div></article>
}

export default function MyNodes() {
  const t = useAppTranslation()
  return <DashboardLayout activePage="my-nodes" title={t('nodes.title')} eyebrow={`${t('nav.workspace')} / ${t('nodes.title')}`}>
    <div className="my-nodes-content">
      <header className="my-nodes-intro"><div><span className="my-nodes-eyebrow">{t('nodes.title')}</span><h2>{t('nodes.title')}</h2><p>{t('nodes.description')}</p></div><div className="my-nodes-intro-icon"><img src={nodesIcon} alt="" /></div></header>
      <section className="my-nodes-stat-grid" aria-label={t('nodes.statistics')}><NodeStat label={t('nodes.totalNodes')} value="0" icon={nodesIcon} /><NodeStat label={t('nodes.activeNodes')} value="0" icon={shieldIcon} tone="cyan" /><NodeStat label={t('nodes.nodeStatus')} value={t('nodes.noActiveNodesStatus')} icon={leafIcon} /><NodeStat label={t('nodes.nodeRewards')} value="$0.00" icon={listIcon} tone="cyan" /></section>
      <section className="my-nodes-panel my-nodes-empty-panel surface-card"><SectionHeading eyebrow={t('dashboard.infrastructure')} title={t('nodes.title')} /><div className="my-nodes-empty-state"><div className="my-nodes-empty-ring"><img src={nodesIcon} alt="" /></div><div><span className="my-nodes-status"><i /> {t('dashboard.notActive')}</span><h3>{t('nodes.noActiveNodes')}</h3><p>{t('nodes.activateDescription')}</p><button className="my-nodes-primary-button" type="button" disabled>{t('nodes.activate')}</button></div></div></section>
      <section className="my-nodes-panel surface-card"><SectionHeading eyebrow={t('nodes.title')} title={t('nodes.networkParticipation')} description={t('nodes.networkParticipationDescription')} /><div className="my-nodes-infrastructure-grid"><InfrastructureItem label={t('nodes.nodeStatus')} value={t('nodes.noActiveNodesStatus')} description={t('nodes.statusDescription')} icon={shieldIcon} /><InfrastructureItem label={t('common.network')} value={t('nodes.networkName')} description={t('nodes.networkDescription')} icon={nodesIcon} /><InfrastructureItem label={t('common.activity')} value={t('nodes.noActivity')} description={t('nodes.activityDescription')} icon={listIcon} /></div></section>
      <section className="my-nodes-panel surface-card"><SectionHeading eyebrow={t('nodes.title')} title={t('nodes.recentActivity')} /><div className="my-nodes-activity-empty"><div className="my-nodes-activity-icon"><img src={listIcon} alt="" /></div><strong>{t('nodes.noActivityYet')}</strong><p>{t('nodes.activityEmptyDescription')}</p></div></section>
      <section className="my-nodes-panel surface-card"><SectionHeading eyebrow={t('nodes.health')} title={t('nodes.infrastructureStatus')} /><dl className="my-nodes-health-list"><div><dt>{t('common.network')}</dt><dd>{t('nodes.networkNotConnected')}</dd></div><div><dt>{t('nodes.availability')}</dt><dd>{t('nodes.noActiveNodesStatus')}</dd></div><div><dt>{t('nodes.uptime')}</dt><dd>{t('common.notAvailable')}</dd></div><div><dt>{t('common.activity')}</dt><dd>{t('common.notAvailable')}</dd></div></dl></section>
      <section className="my-nodes-help"><div className="my-nodes-help-icon"><img src={leafIcon} alt="" /></div><div><span className="my-nodes-eyebrow">NodeConnect</span><h3>{t('nodes.needHelp')}</h3><p>{t('nodes.helpDescription')}</p></div><button className="my-nodes-secondary-button" type="button">{t('nodes.learnMore')}</button></section>
    </div>
  </DashboardLayout>
}
