import listIcon from '../assets/icons/Icon-6.svg'
import networkIcon from '../assets/icons/Icon-17.svg'
import globeIcon from '../assets/icons/Icon.svg'
import buildingIcon from '../assets/icons/Icon-22.svg'
import { useAppTranslation } from '../lib/i18n'

const uses = [['home.dataStorage', listIcon], ['home.aiMachineLearning', networkIcon], ['home.dappsServices', globeIcon], ['home.enterpriseSolutions', buildingIcon]]
const allocations = [['40%', 'home.community', 'green'], ['25%', 'home.ecosystem', 'lilac'], ['20%', 'home.team', 'green'], ['10%', 'home.investors', 'pink'], ['5%', 'home.liquidity', 'muted']]

export default function TokenOverview() { const t = useAppTranslation(); return <section className="token-section section" id="tokenomics"><article className="token-card surface-card"><div className="eyebrow">{t('home.token')}</div><div className="token-title-row"><h2>CNPY</h2><span>ERC-20</span></div><p className="supply">{t('home.totalSupply')} <strong>1,000,000,000</strong></p><div className="eyebrow use-label">{t('home.useCases')}</div><ul>{uses.map(([label, icon]) => <li key={label}><img src={icon} alt="" />{t(label)}</li>)}</ul></article><article className="allocation-card surface-card"><div className="eyebrow">{t('home.tokenAllocation')}</div><div className="allocation-body"><div className="donut"><div><strong>1B</strong><span>{t('home.total')}</span></div></div><div className="allocation-list">{allocations.map(([percent, label, tone]) => <div className={`allocation ${tone}`} key={label}><b>{percent}</b><span>{t(label)}</span></div>)}</div></div></article></section> }