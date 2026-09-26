import nodesIcon from '../assets/icons/Icon-17.svg'
import shieldIcon from '../assets/icons/Icon-9.svg'
import leafIcon from '../assets/icons/Icon-18.svg'
import listIcon from '../assets/icons/Icon-11.svg'
import DashboardLayout from '../components/DashboardLayout'
import '../styles/my-nodes.css'

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
  return <DashboardLayout activePage="my-nodes" title="My Nodes" eyebrow="Workspace / My Nodes">
    <div className="my-nodes-content">
      <header className="my-nodes-intro"><div><span className="my-nodes-eyebrow">My Nodes</span><h2>My Nodes</h2><p>Manage your NodeConnect infrastructure and monitor your node activity.</p></div><div className="my-nodes-intro-icon"><img src={nodesIcon} alt="" /></div></header>
      <section className="my-nodes-stat-grid" aria-label="Node statistics"><NodeStat label="TOTAL NODES" value="0" icon={nodesIcon} /><NodeStat label="ACTIVE NODES" value="0" icon={shieldIcon} tone="cyan" /><NodeStat label="NODE STATUS" value="Not Active" icon={leafIcon} /><NodeStat label="NODE REWARDS" value="$0.00" icon={listIcon} tone="cyan" /></section>
      <section className="my-nodes-panel my-nodes-empty-panel surface-card"><SectionHeading eyebrow="Infrastructure" title="My Nodes" /><div className="my-nodes-empty-state"><div className="my-nodes-empty-ring"><img src={nodesIcon} alt="" /></div><div><span className="my-nodes-status"><i /> Not active</span><h3>No active nodes</h3><p>You don't have any active NodeConnect nodes yet. Activate a node to start participating in the network.</p><button className="my-nodes-primary-button" type="button" disabled>Activate a Node</button></div></div></section>
      <section className="my-nodes-panel surface-card"><SectionHeading eyebrow="Node Infrastructure" title="Network Participation" description="Your NodeConnect infrastructure and network participation will be displayed here." /><div className="my-nodes-infrastructure-grid"><InfrastructureItem label="NODE STATUS" value="Not Active" description="Node status will appear here once a node is activated." icon={shieldIcon} /><InfrastructureItem label="NETWORK" value="NodeConnect Network" description="Your connected network will be shown here." icon={nodesIcon} /><InfrastructureItem label="ACTIVITY" value="No activity" description="Node activity will appear after node activation." icon={listIcon} /></div></section>
      <section className="my-nodes-panel surface-card"><SectionHeading eyebrow="Node Activity" title="Recent Node Activity" /><div className="my-nodes-activity-empty"><div className="my-nodes-activity-icon"><img src={listIcon} alt="" /></div><strong>No node activity yet</strong><p>Your node events and activity will appear here once you activate a node.</p></div></section>
      <section className="my-nodes-panel surface-card"><SectionHeading eyebrow="Node Health" title="Infrastructure Status" /><dl className="my-nodes-health-list"><div><dt>Network</dt><dd>Not Connected</dd></div><div><dt>Node Availability</dt><dd>No Active Nodes</dd></div><div><dt>Uptime</dt><dd>Not Available</dd></div><div><dt>Last Activity</dt><dd>Not Available</dd></div></dl></section>
      <section className="my-nodes-help"><div className="my-nodes-help-icon"><img src={leafIcon} alt="" /></div><div><span className="my-nodes-eyebrow">NodeConnect</span><h3>Need help with your nodes?</h3><p>Node information, activation details, and infrastructure guidance will be available here as the NodeConnect network develops.</p></div><button className="my-nodes-secondary-button" type="button">Learn More</button></section>
    </div>
  </DashboardLayout>
}
