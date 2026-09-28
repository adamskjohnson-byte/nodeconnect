import { useState, type MouseEvent, type ReactNode } from 'react'
import logo from '../assets/icons/Icon-5.svg'
import listIcon from '../assets/icons/Icon-11.svg'
import nodesIcon from '../assets/icons/Icon-17.svg'
import shieldIcon from '../assets/icons/Icon-9.svg'
import { logoutAndNavigate } from '../lib/authApi'
import '../styles/admin.css'
import { useAppTranslation } from '../lib/i18n'

type AdminPage = 'dashboard' | 'activity'
type AdminLayoutProps = { children: ReactNode; activePage: AdminPage; title: string; eyebrow?: string }

const navigation = [
  { label: 'nav.admin', href: '#admin', page: 'dashboard' as AdminPage, icon: nodesIcon },
  { label: 'nav.activity', href: '#admin/activity', page: 'activity' as AdminPage, icon: listIcon },
]

export default function AdminLayout({ children, activePage, title, eyebrow = 'NodeConnect / Admin' }: AdminLayoutProps) {
  const t = useAppTranslation()
  const [menuOpen, setMenuOpen] = useState(false)
  const handleLogout = async (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    await logoutAndNavigate()
  }

  return <div className="admin-page">
    {menuOpen && <button className="admin-sidebar-backdrop" type="button" aria-label={t('admin.closeNavigation')} onClick={() => setMenuOpen(false)} />}
    <aside className={menuOpen ? 'admin-sidebar is-open' : 'admin-sidebar'}>
      <div className="admin-sidebar-top"><a className="admin-brand" href="#admin"><img src={logo} alt="" /><span>NodeConnect</span></a><span className="admin-brand-status">{t('admin.adminControl')}</span></div>
      <nav className="admin-nav" aria-label={t('admin.adminNavigation')}><span className="admin-nav-label">{t('admin.administration')}</span>{navigation.map((item) => <a className={item.page === activePage ? 'is-active' : ''} href={item.href} key={item.page} onClick={() => setMenuOpen(false)}><span className="admin-nav-icon"><img src={item.icon} alt="" /></span><span>{t(item.label)}</span>{item.page === activePage && <i />}</a>)}</nav>
      <div className="admin-sidebar-bottom"><a className="admin-logout" href="#home" onClick={handleLogout}><span className="admin-nav-icon"><img src={shieldIcon} alt="" /></span><span>{t('nav.logout')}</span></a></div>
    </aside>
    <main className="admin-main">
      <header className="admin-topbar"><button className="admin-menu-button" type="button" aria-label={t('admin.openNavigation')} onClick={() => setMenuOpen(true)}><span /><span /><span /></button><div className="admin-topbar-title"><span>{eyebrow}</span><h1>{title}</h1></div><div className="admin-topbar-badge"><i /> {t('admin.adminArea')}</div></header>
      <div className="admin-content">{children}</div>
    </main>
  </div>
}
