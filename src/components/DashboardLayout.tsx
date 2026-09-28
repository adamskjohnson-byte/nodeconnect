import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import logo from '../assets/icons/Icon-5.svg'
import nodesIcon from '../assets/icons/Icon-17.svg'
import leafIcon from '../assets/icons/Icon-18.svg'
import shieldIcon from '../assets/icons/Icon-9.svg'
import rewardsIcon from '../assets/icons/Icon-16.svg'
import listIcon from '../assets/icons/Icon-11.svg'
import settingsIcon from '../assets/icons/Icon-22.svg'
import { logoutAndNavigate } from '../lib/authApi'
import { trackTelegramClick } from '../lib/activityApi'
import { getNotifications, getProfile, markAllNotificationsRead, markNotificationRead, type AccountNotification } from '../lib/accountApi'
import { publishAvatarVersion } from '../lib/avatarStore'
import UserAvatar from './UserAvatar'
import { useAppTranslation } from '../lib/i18n'
import { playUiSound } from '../lib/soundService'
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

export default function DashboardLayout({ children, activePage, title, eyebrow }: DashboardLayoutProps) {
  return <DashboardShell activePage={activePage} title={title} eyebrow={eyebrow}>{children}</DashboardShell>
}

export function DashboardShell({ children, activePage, title, eyebrow }: DashboardLayoutProps) {
  const t = useAppTranslation()
  const [menuOpen, setMenuOpen] = useState(false)
  return <div className="dashboard-page">
    {menuOpen && <button className="dashboard-sidebar-backdrop" type="button" aria-label={t('common.close')} onClick={() => setMenuOpen(false)} />}
    <DashboardSidebar activePage={activePage} menuOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    <main className="dashboard-main">
      <DashboardHeader title={title} eyebrow={eyebrow ?? `${t('nav.workspace')} / ${t('dashboard.title')}`} onMenuOpen={() => setMenuOpen(true)} />
      <div className="dashboard-internal-content">{children}</div>
    </main>
  </div>
}

function DashboardSidebar({ activePage, menuOpen, onClose }: { activePage: DashboardPage; menuOpen: boolean; onClose: () => void }) {
  const t = useAppTranslation()
  const handleLogout = async (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    await logoutAndNavigate()
  }

  return <aside className={menuOpen ? 'dashboard-sidebar is-open' : 'dashboard-sidebar'}>
    <div className="dashboard-sidebar-top">
      <a className="dashboard-brand" href="#dashboard"><img src={logo} alt="" /><span>NodeConnect</span></a>
      <span className="dashboard-brand-status">{t('dashboard.networkOnline')}</span>
    </div>
    <nav className="dashboard-nav" aria-label={t('nav.dashboard')}>
      <span className="dashboard-nav-label">{t('nav.workspace')}</span>
      {navigation.map((item) => <a className={item.active === activePage ? 'is-active' : ''} href={item.href} key={item.label} onClick={() => { onClose(); if (item.href === telegramSupportUrl) trackTelegramClick() }} target={item.target} rel={item.target ? 'noopener noreferrer' : undefined}><span className="dashboard-nav-icon"><img src={item.icon} alt="" /></span><span>{t(item.label)}</span>{item.active === activePage && <i />}</a>)}
    </nav>
    <div className="dashboard-sidebar-bottom">
      <a className="dashboard-logout" href="#home" onClick={handleLogout}><span className="dashboard-nav-icon"><img src={shieldIcon} alt="" /></span><span>{t('nav.logout')}</span></a>
    </div>
  </aside>
}

function DashboardHeader({ title, eyebrow, onMenuOpen }: { title: string; eyebrow: string; onMenuOpen: () => void }) {
  const t = useAppTranslation()
  const [name, setName] = useState('NodeConnect')
  const [email, setEmail] = useState('')
  const [accountOpen, setAccountOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState<AccountNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [notificationError, setNotificationError] = useState(false)
  const accountRoot = useRef<HTMLDivElement>(null)
  const notificationRoot = useRef<HTMLDivElement>(null)
  const accountMenuRef = useRef<HTMLDivElement>(null)
  const accountTriggerRef = useRef<HTMLButtonElement>(null)
  const notificationPanelRef = useRef<HTMLElement>(null)
  const notificationTriggerRef = useRef<HTMLButtonElement>(null)
  const hasNotificationBaseline = useRef(false)
  const knownUnreadCount = useRef(0)

  const refreshNotifications = async (playForNew = false) => {
    try {
      const result = await getNotifications()
      if (playForNew && hasNotificationBaseline.current && result.unread_count > knownUnreadCount.current) {
        try {
          const preferences = JSON.parse(localStorage.getItem('nodeconnect_preferences') || '{}') as { sound_enabled?: boolean }
          if (preferences.sound_enabled !== false) playUiSound('toggle')
        } catch { playUiSound('toggle') }
      }
      knownUnreadCount.current = result.unread_count
      hasNotificationBaseline.current = true
      setNotifications(result.notifications)
      setUnreadCount(result.unread_count)
      setNotificationError(false)
    } catch {
      setNotificationError(true)
    }
  }

  useEffect(() => {
    let active = true
    getProfile().then((profile) => {
      if (!active) return
      setName(profile.full_name)
      setEmail(profile.email)
      publishAvatarVersion(profile.profile_image_version)
    }).catch(() => undefined)
    return () => { active = false }
  }, [])

  useEffect(() => {
    void refreshNotifications()
    const interval = window.setInterval(() => void refreshNotifications(true), 60_000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!accountOpen && !notificationsOpen) return
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (!accountRoot.current?.contains(target)) setAccountOpen(false)
      if (!notificationRoot.current?.contains(target)) setNotificationsOpen(false)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setAccountOpen(false)
        setNotificationsOpen(false)
        if (accountOpen) accountTriggerRef.current?.focus()
        if (notificationsOpen) notificationTriggerRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [accountOpen, notificationsOpen])

  useEffect(() => {
    if (accountOpen) accountMenuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus()
  }, [accountOpen])

  useEffect(() => {
    if (notificationsOpen) notificationPanelRef.current?.focus()
  }, [notificationsOpen])

  const toggleAccountMenu = () => {
    setNotificationsOpen(false)
    setAccountOpen(!accountOpen)
  }

  const toggleNotifications = () => {
    setAccountOpen(false)
    const open = !notificationsOpen
    setNotificationsOpen(open)
    if (open) void refreshNotifications()
  }

  const markRead = async (notification: AccountNotification) => {
    if (notification.read_at) return
    try {
      await markNotificationRead(notification.id)
      await refreshNotifications()
    } catch {
      setNotificationError(true)
    }
  }

  const markAllRead = async () => {
    if (unreadCount === 0) return
    try {
      await markAllNotificationsRead()
      await refreshNotifications()
    } catch {
      setNotificationError(true)
    }
  }

  const handleAccountMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(accountMenuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') || [])
    const currentIndex = items.indexOf(document.activeElement as HTMLElement)
    let nextIndex: number | null = null
    if (event.key === 'ArrowDown') nextIndex = (currentIndex + 1 + items.length) % items.length
    if (event.key === 'ArrowUp') nextIndex = (currentIndex - 1 + items.length) % items.length
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = items.length - 1
    if (nextIndex !== null && items.length > 0) {
      event.preventDefault()
      items[nextIndex].focus()
    }
  }

  const handleLogout = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setAccountOpen(false)
    await logoutAndNavigate()
  }

  return <header className="dashboard-topbar">
    <button className="dashboard-menu-button" type="button" aria-label={t('wallet.openNavigation')} onClick={onMenuOpen}><span /><span /><span /></button>
    <div className="dashboard-topbar-title"><span>{eyebrow}</span><h1>{title}</h1></div>
    <div className="dashboard-topbar-actions">
      <div className="dashboard-popover-anchor" ref={notificationRoot}>
        <button ref={notificationTriggerRef} className="dashboard-icon-button" type="button" aria-label={t('notifications.title')} aria-haspopup="dialog" aria-expanded={notificationsOpen} onClick={toggleNotifications}><span className="dashboard-notification-glyph" aria-hidden="true" />{unreadCount > 0 && <span className="dashboard-notification-dot" aria-label={`${unreadCount}`} />}</button>
        {notificationsOpen && <section ref={notificationPanelRef} tabIndex={-1} className="dashboard-popover dashboard-notifications-panel" role="dialog" aria-label={t('notifications.title')}><header><h2>{t('notifications.title')}</h2><button type="button" disabled={unreadCount === 0} onClick={() => void markAllRead()}>{t('notifications.markAllRead')}</button></header>{notificationError ? <p className="dashboard-notifications-empty">{t('errors.generic')}</p> : notifications.length === 0 ? <p className="dashboard-notifications-empty">{t('notifications.empty')}</p> : <ul>{notifications.map((notification) => <li key={notification.id} className={notification.read_at ? '' : 'is-unread'}><button type="button" onClick={() => void markRead(notification)} aria-label={notification.read_at ? t(notification.title) : `${t(notification.title)}. ${t('notifications.markAllRead')}`}><span className="dashboard-notification-copy"><strong>{t(notification.title)}</strong><span>{t(notification.message)}</span><time dateTime={notification.created_at}>{new Date(`${notification.created_at.replace(' ', 'T')}Z`).toLocaleString()}</time></span>{!notification.read_at && <i aria-hidden="true" />}</button></li>)}</ul>}</section>}
      </div>
      <div className="dashboard-popover-anchor" ref={accountRoot}>
        <button ref={accountTriggerRef} className="dashboard-user-button" type="button" aria-label={t('profile.accountMenu', { name })} aria-haspopup="menu" aria-expanded={accountOpen} onClick={toggleAccountMenu}><UserAvatar className="dashboard-user-mark" name={name} /><span className="dashboard-user-copy"><strong>{name}</strong><span>{t('profile.nodeMember')}</span></span></button>
        {accountOpen && <div ref={accountMenuRef} className="dashboard-popover dashboard-account-menu" role="menu" onKeyDown={handleAccountMenuKeyDown}><div className="dashboard-account-summary"><strong>{name}</strong><span>{email}</span></div><a role="menuitem" tabIndex={0} href="#profile" onClick={() => setAccountOpen(false)}>{t('nav.profile')}</a><a role="menuitem" tabIndex={0} href="#settings" onClick={() => setAccountOpen(false)}>{t('nav.settings')}</a><button role="menuitem" tabIndex={0} type="button" onClick={(event) => void handleLogout(event)}>{t('nav.logout')}</button></div>}
      </div>
    </div>
  </header>
}
