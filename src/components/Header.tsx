import logo from '../assets/icons/Icon-5.svg'
import hex from '../assets/icons/Icon-23.svg'
import { trackTelegramClick } from '../lib/activityApi'

type HeaderProps = { menuOpen: boolean; onMenuToggle: () => void; activePage?: 'home' | 'roadmap' | 'history' | 'staking' | 'tokenomics'; walletHref?: string; signInHref?: string }
const binanceUrl = 'https://x.com/BinanceWallet/status/2096486606060548208'
const telegramSupportUrl = 'https://t.me/CAPNOYnetworkcommunitysupportbot'
const links = [{ label: 'Home', href: '#home', hiddenOnHeader: true }, { label: 'Binance', href: binanceUrl, external: true }]

export default function Header({ menuOpen, onMenuToggle, activePage = 'home', walletHref = telegramSupportUrl, signInHref = '#auth' }: HeaderProps) {
  return <header className="site-header"><div className="header-inner">
    <a className="brand" href="#home"><img src={logo} alt="" /><span>NodeConnect</span></a>
    <nav className="primary-nav" aria-label="Primary navigation">{links.map((link) => {
      const isActive = link.label === 'Home' && activePage === 'home'
      const hiddenClass = link.hiddenOnHeader ? 'nav-hidden-home' : ''
      return <a className={`${isActive ? 'active' : ''} ${hiddenClass}`.trim()} href={link.href} key={link.label} target={link.external ? '_blank' : undefined} rel={link.external ? 'noopener noreferrer' : undefined}>{link.label}</a>
    })}</nav>
    <div className="header-actions">
      <a className="button button-small button-secondary" href={signInHref}>Sign In</a>
      <a className="button button-small" href={walletHref} target="_blank" rel="noopener noreferrer" onClick={() => { if (walletHref === telegramSupportUrl) trackTelegramClick() }}>Connect Wallet</a>
    </div>
  </div></header>
}