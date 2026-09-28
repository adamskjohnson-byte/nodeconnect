import shield from '../assets/icons/Icon-8.svg'
import leaf from '../assets/icons/Icon-18.svg'
import network from '../assets/icons/Icon-17.svg'
import community from '../assets/icons/Icon-16.svg'
import { useAppTranslation } from '../lib/i18n'

const features = [['home.secureTitle', 'home.secureDescription', shield], ['home.sustainableTitle', 'home.sustainableDescription', leaf], ['home.utilityTitle', 'home.utilityDescription', network], ['home.rewardsTitle', 'home.rewardsDescription', community]]

export default function WhyNodeConnect() { const t = useAppTranslation(); return <section className="why section" id="why-nodeconnect"><div className="eyebrow">{t('home.whyTitle')}</div><div className="feature-grid">{features.map(([title, copy, icon]) => <article className="feature" key={title}><div className="feature-icon"><img src={icon} alt="" /></div><h2>{t(title).split(' & ').map((line) => <span key={line}>{line}</span>)}</h2><p>{t(copy)}</p></article>)}</div></section> }