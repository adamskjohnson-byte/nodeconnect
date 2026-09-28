import { useEffect, useState, type MouseEvent, type ReactNode } from 'react'
import logo from '../assets/icons/Icon-5.svg'
import nodesIcon from '../assets/icons/Icon-17.svg'
import leafIcon from '../assets/icons/Icon-18.svg'
import shieldIcon from '../assets/icons/Icon-9.svg'
import rewardsIcon from '../assets/icons/Icon-16.svg'
import listIcon from '../assets/icons/Icon-11.svg'
import settingsIcon from '../assets/icons/Icon-22.svg'
import { logout } from '../lib/authApi'
import { trackTelegramClick } from '../lib/activityApi'
import { getProfile } from '../lib/accountApi'
import { publishAvatarVersion } from '../lib/avatarStore'
import UserAvatar from './UserAvatar'
import { useAppTranslation } from '../lib/i18n'
import '../styles/dashboard.css'

type DashboardPage = 'dashboard' | 'my-nodes' | 'staking' | 'tokenomics' | 'roadmap' | 'history' | 'profile' | 'settings'
type NavItem = { label: string; icon: string; href: string; active?: DashboardPage; target?: string }

type DashboardLayoutProps = { children: ReactNode; activePage: DashboardPage; title: string; eyebrow?: string }

const telegramSupportUrl = 'https://t.me/CAPNOYnetworkcommunitysupportbot'

const navigation: NavItem[] = [
  { label: 'nav.dashboard', icon: nodesIcon, href: '#dashboard', active: 'dashboard' },
  { label: 'nav.connectWallet', icon: nodesIcon, href: telegramSupportUrl, target: '_blank' },
  { label: 'nav.staking', icon: leafIcon, href: '#staking', active: 'staking' },
  { label: 'nav.tokenomics', icon: rewardsIcon, href: '#tokenomics', active: 'tokenomics' },
  { label: 'nav.roadmap', icon: settingsIcon, href: '#roadmap', active: 'roadmap' },
  { label: 'nav.transactions', icon: listIcon, href: '#transaction-history', active: 'history' },
  { label: 'nav.myNodes', icon: rewardsIcon, href: '#my-nodes', active: 'my-nodes' },
  { label: 'nav.profile', icon: shieldIcon, href: '#profile', active: 'profile' },
  { label: 'nav.settings', icon: settingsIcon, href: '#settings', active: 'settings' },
]

export default function DashboardLayout({ children, activePage, title, eyebrow = 'Workspace / Overview' }: DashboardLayoutProps) {
  return <DashboardShell activePage={activePage} title={title} eyebrow={eyebrow}>{children}</DashboardShell>
}

export function DashboardShell({ children, activePage, title, eyebrow }: DashboardLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  return <div className="dashboard-page">
    {menuOpen && <button className="dashboard-sidebar-backdrop" type="button" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
    <DashboardSidebar activePage={activePage} menuOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    <main className="dashboard-main">
      <DashboardHeader title={title} eyebrow={eyebrow ?? 'Workspace / Overview'} onMenuOpen={() => setMenuOpen(true)} />
      <div className="dashboard-internal-content">{children}</div>
    </main>
  </div>
}

function DashboardSidebar({ activePage, menuOpen, onClose }: { activePage: DashboardPage; menuOpen: boolean; onClose: () => void }) {
  const t = useAppTranslation()
  const handleLogout = async (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    await logout()
    window.location.hash = '#home'
  }

  return <aside className={menuOpen ? 'dashboard-sidebar is-open' : 'dashboard-sidebar'}>
    <div className="dashboard-sidebar-top">
      <a className="dashboard-brand" href="#dashboard"><img src={logo} alt="" /><span>NodeConnect</span></a>
      <span className="dashboard-brand-status">NODE NETWORK</span>
    </div>
    <nav className="dashboard-nav" aria-label="Dashboard navigation">
      <span className="dashboard-nav-label">{t('nav.workspace')}</span>
      {navigation.map((item) => <a className={item.active === activePage ? 'is-active' : ''} href={item.href} key={item.label} onClick={() => { onClose(); if (item.href === telegramSupportUrl) trackTelegramClick() }} target={item.target} rel={item.target ? 'noopener noreferrer' : undefined}><span className="dashboard-nav-icon"><img src={item.icon} alt="" /></span><span>{t(item.label)}</span>{item.active === activePage && <i />}</a>)}
    </nav>
    <div className="dashboard-sidebar-bottom">
      <a className="dashboard-logout" href="#home" onClick={handleLogout}><span className="dashboard-nav-icon"><img src={shieldIcon} alt="" /></span><span>{t('nav.logout')}</span></a>
    </div>
  </aside>
}

function DashboardHeader({ title, eyebrow, onMenuOpen }: { title: string; eyebrow: string; onMenuOpen: () => void }) {
  const [name, setName] = useState('NodeConnect')
  useEffect(() => {
    let active = true
    getProfile().then((profile) => {
      if (!active) return
      setName(profile.full_name)
      publishAvatarVersion(profile.profile_image_version)
    }).catch(() => undefined)
    return () => { active = false }
  }, [])

  return <header className="dashboard-topbar">
    <button className="dashboard-menu-button" type="button" aria-label="Open dashboard navigation" onClick={onMenuOpen}><span /><span /><span /></button>
    <div className="dashboard-topbar-title"><span>{eyebrow}</span><h1>{title}</h1></div>
    <div className="dashboard-topbar-actions"><button className="dashboard-icon-button" type="button" aria-label="Notifications"><span className="dashboard-notification-dot" /></button><div className="dashboard-user"><UserAvatar className="dashboard-user-mark" name={name} /><div><strong>{name}</strong><span>NodeConnect member</span></div></div></div>
  </header>
}
