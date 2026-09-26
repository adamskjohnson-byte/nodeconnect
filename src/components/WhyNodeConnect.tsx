import shield from '../assets/icons/Icon-8.svg'
import leaf from '../assets/icons/Icon-18.svg'
import network from '../assets/icons/Icon-17.svg'
import community from '../assets/icons/Icon-16.svg'

const features = [['Decentralized\n& Secure', 'Built on decentralized infrastructure with end-to-end encryption and privacy.', shield], ['Sustainable\nBy Design', 'Eco-friendly network incentivizing green nodes and sustainable growth.', leaf], ['Real World\nUtility', 'Powering dApps, AI, and enterprise solutions with decentralized data.', network], ['Community\nRewards', 'Community driven rewards through staking, referrals, and ecosystem growth.', community]]

export default function WhyNodeConnect() { return <section className="why section" id="why-nodeconnect"><div className="eyebrow">WHY NODECONNECT?</div><div className="feature-grid">{features.map(([title, copy, icon]) => <article className="feature" key={title}><div className="feature-icon"><img src={icon} alt="" /></div><h2>{title.split('\n').map((line) => <span key={line}>{line}</span>)}</h2><p>{copy}</p></article>)}</div></section> }