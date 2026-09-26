import { useState, type MouseEvent, type ReactNode } from 'react'
import logo from '../assets/icons/Icon-5.svg'
import listIcon from '../assets/icons/Icon-11.svg'
import nodesIcon from '../assets/icons/Icon-17.svg'
import shieldIcon from '../assets/icons/Icon-9.svg'
import { logout } from '../lib/authApi'
import '../styles/admin.css'

type AdminPage = 'dashboard' | 'activity'
type AdminLayoutProps = { children: ReactNode; activePage: AdminPage; title: string; eyebrow?: string }

const navigation = [
  { label: 'Admin Dashboard', href: '#admin', page: 'dashboard' as AdminPage, icon: nodesIcon },
  { label: 'Visitor Activity', href: '#admin/activity', page: 'activity' as AdminPage, icon: listIcon },
]

export default function AdminLayout({ children, activePage, title, eyebrow = 'NodeConnect / Admin' }: AdminLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const handleLogout = async (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    await logout()
    window.location.hash = '#home'
  }

  return <div className="admin-page">
    {menuOpen && <button className="admin-sidebar-backdrop" type="button" aria-label="Close admin navigation" onClick={() => setMenuOpen(false)} />}
    <aside className={menuOpen ? 'admin-sidebar is-open' : 'admin-sidebar'}>
      <div className="admin-sidebar-top"><a className="admin-brand" href="#admin"><img src={logo} alt="" /><span>NodeConnect</span></a><span className="admin-brand-status">ADMIN CONTROL</span></div>
      <nav className="admin-nav" aria-label="Admin navigation"><span className="admin-nav-label">Administration</span>{navigation.map((item) => <a className={item.page === activePage ? 'is-active' : ''} href={item.href} key={item.page} onClick={() => setMenuOpen(false)}><span className="admin-nav-icon"><img src={item.icon} alt="" /></span><span>{item.label}</span>{item.page === activePage && <i />}</a>)}</nav>
      <div className="admin-sidebar-bottom"><a className="admin-logout" href="#home" onClick={handleLogout}><span className="admin-nav-icon"><img src={shieldIcon} alt="" /></span><span>Logout</span></a></div>
    </aside>
    <main className="admin-main">
      <header className="admin-topbar"><button className="admin-menu-button" type="button" aria-label="Open admin navigation" onClick={() => setMenuOpen(true)}><span /><span /><span /></button><div className="admin-topbar-title"><span>{eyebrow}</span><h1>{title}</h1></div><div className="admin-topbar-badge"><i /> Admin area</div></header>
      <div className="admin-content">{children}</div>
    </main>
  </div>
}
