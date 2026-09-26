import listIcon from '../assets/icons/Icon-6.svg'
import networkIcon from '../assets/icons/Icon-17.svg'
import globeIcon from '../assets/icons/Icon.svg'
import buildingIcon from '../assets/icons/Icon-22.svg'

const uses = [['Data Storage & Retrieval', listIcon], ['AI & Machine Learning', networkIcon], ['dApps & Web3 Services', globeIcon], ['Enterprise Solutions', buildingIcon]]
const allocations = [['40%', 'Community', 'green'], ['25%', 'Ecosystem', 'lilac'], ['20%', 'Team', 'green'], ['10%', 'Investors', 'pink'], ['5%', 'Liquidity', 'muted']]

export default function TokenOverview() { return <section className="token-section section" id="tokenomics"><article className="token-card surface-card"><div className="eyebrow">TOKEN</div><div className="token-title-row"><h2>CNPY</h2><span>ERC-20</span></div><p className="supply">TOTAL SUPPLY <strong>1,000,000,000</strong></p><div className="eyebrow use-label">USE CASES</div><ul>{uses.map(([label, icon]) => <li key={label}><img src={icon} alt="" />{label}</li>)}</ul></article><article className="allocation-card surface-card"><div className="eyebrow">TOKENOMICS ALLOCATION</div><div className="allocation-body"><div className="donut"><div><strong>1B</strong><span>Total</span></div></div><div className="allocation-list">{allocations.map(([percent, label, tone]) => <div className={`allocation ${tone}`} key={label}><b>{percent}</b><span>{label}</span></div>)}</div></div></article></section> }