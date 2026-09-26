import { useEffect, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { getCurrentUser, type AuthUser } from '../lib/authApi'
import shieldIcon from '../assets/icons/Icon-9.svg'
import nodesIcon from '../assets/icons/Icon-17.svg'
import walletMark from '../assets/wallet-mark.svg'
import '../styles/profile.css'

export default function Profile() {
  const [editing, setEditing] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    getCurrentUser().then(setUser).catch(() => setUser(null))
  }, [])

  return <DashboardLayout activePage="profile" title="Profile" eyebrow="Workspace / Profile">
    <div className="profile-content">
      <header className="profile-intro"><div><span className="profile-eyebrow">Account overview</span><h2>Profile</h2><p>Manage your NodeConnect account and personal information.</p></div><span className="profile-prototype-tag">UI ACCOUNT</span></header>
      <section className="profile-identity surface-card">
        <div className="profile-avatar">NC</div>
        <div className="profile-identity-copy"><span className="profile-eyebrow">NodeConnect member</span><h3>{user?.full_name || 'NodeConnect'}</h3><p>{user?.email || 'Not available'}</p></div>
        <div className="profile-account-status"><span>Account status</span><strong><i /> {user?.status === 'active' ? 'Active' : user?.status || 'Not available'}</strong></div>
      </section>
      <div className="profile-grid">
        <section className="profile-panel surface-card"><div className="profile-panel-heading"><div><span className="profile-eyebrow">Personal details</span><h3>Personal Information</h3></div><button className="profile-outline-button" type="button" onClick={() => setEditing((value) => !value)}>{editing ? 'Done' : 'Edit Profile'}</button></div><div className="profile-fields"><label>Full Name<input type="text" value={user?.full_name || ''} placeholder="Not available" readOnly={!editing} /></label><label>Email Address<input type="email" value={user?.email || ''} placeholder="Not available" readOnly={!editing} /></label></div></section>
        <section className="profile-panel surface-card"><div className="profile-panel-heading"><div><span className="profile-eyebrow">Web3 access</span><h3>Wallet Connection</h3></div><span className="profile-status-muted">Not connected</span></div><div className="profile-wallet-row"><div className="profile-wallet-icon"><img src={walletMark} alt="" /></div><div><span>Connection status</span><strong>Not Connected</strong></div></div><a className="profile-primary-button" href="#connect-wallet">Connect Wallet <span>+</span></a></section>
      </div>
      <section className="profile-panel profile-account-panel surface-card"><div className="profile-panel-heading"><div><span className="profile-eyebrow">Membership</span><h3>Account Information</h3></div><img className="profile-account-icon" src={shieldIcon} alt="" /></div><dl className="profile-info-list"><div><dt>Account Type</dt><dd>NodeConnect Member</dd></div><div><dt>Member Since</dt><dd>{user?.created_at || 'Not available'}</dd></div><div><dt>Referral ID</dt><dd>Not available</dd></div></dl></section>
      <section className="profile-note"><img src={nodesIcon} alt="" /><p>Profile details are UI-only during the current NodeConnect prototype phase.</p></section>
    </div>
  </DashboardLayout>
}
