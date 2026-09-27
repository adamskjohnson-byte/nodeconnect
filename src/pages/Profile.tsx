import { useEffect, useState, type FormEvent } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { getProfile, resendVerificationEmail, updateProfile } from '../lib/accountApi'
import type { AuthUser } from '../lib/authApi'
import shieldIcon from '../assets/icons/Icon-9.svg'
import nodesIcon from '../assets/icons/Icon-17.svg'
import walletMark from '../assets/wallet-mark.svg'
import '../styles/profile.css'

export default function Profile() {
  const [editing, setEditing] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getProfile().then((profile) => {
      if (!active) return
      setUser(profile)
      setFullName(profile.full_name)
    }).catch((reason: unknown) => {
      if (active) setError(reason instanceof Error ? reason.message : 'Unable to load profile.')
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const cancelEdit = () => {
    setFullName(user?.full_name || '')
    setEditing(false)
    setError('')
    setMessage('')
  }

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalized = fullName.trim()
    if (!normalized || normalized.length > 150) {
      setError('Enter a name between 1 and 150 characters.')
      return
    }
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const updated = await updateProfile(normalized)
      setUser(updated)
      setFullName(updated.full_name)
      setEditing(false)
      setMessage('Profile saved.')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to save profile.')
    } finally {
      setSaving(false)
    }
  }

  const resendVerification = async () => {
    setError('')
    setMessage('')
    try {
      const response = await resendVerificationEmail()
      setMessage(response.message)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to send verification email.')
    }
  }

  return <DashboardLayout activePage="profile" title="Profile" eyebrow="Workspace / Profile">
    <div className="profile-content">
      <header className="profile-intro"><div><span className="profile-eyebrow">Account overview</span><h2>Profile</h2><p>Manage your NodeConnect account and personal information.</p></div><span className="profile-prototype-tag">{user?.role === 'admin' ? 'ADMIN ACCOUNT' : 'MEMBER ACCOUNT'}</span></header>
      {(message || error || loading) && <p className={error ? 'account-feedback is-error' : 'account-feedback'} role={error ? 'alert' : 'status'}>{loading ? 'Loading profile...' : error || message}</p>}
      <section className="profile-identity surface-card">
        <div className="profile-avatar">NC</div>
        <div className="profile-identity-copy"><span className="profile-eyebrow">NodeConnect member</span><h3>{user?.full_name || 'Loading...'}</h3><p>{user?.email || 'Not available'}</p></div>
        <div className="profile-account-status"><span>Account status</span><strong><i /> {user?.status ? user.status[0].toUpperCase() + user.status.slice(1) : 'Not available'}</strong></div>
      </section>
      <div className="profile-grid">
        <section className="profile-panel surface-card"><div className="profile-panel-heading"><div><span className="profile-eyebrow">Personal details</span><h3>Personal Information</h3></div>{!editing && <button className="profile-outline-button" type="button" disabled={loading || !user} onClick={() => { setMessage(''); setEditing(true) }}>Edit Profile</button>}</div><form onSubmit={saveProfile}><div className="profile-fields"><label>Full Name<input type="text" value={editing ? fullName : user?.full_name || ''} onChange={(event) => setFullName(event.target.value)} maxLength={150} placeholder="Full name" readOnly={!editing} disabled={loading} /></label><label>Email Address<input type="email" value={user?.email || ''} placeholder="Not available" readOnly disabled /></label></div>{editing && <div className="profile-edit-actions"><button className="profile-outline-button" type="button" onClick={cancelEdit} disabled={saving}>Cancel</button><button className="profile-primary-button" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</button></div>}</form>{user && !user.email_verified_at && <button className="profile-verify-button" type="button" onClick={resendVerification}>Resend email verification</button>}</section>
        <section className="profile-panel surface-card"><div className="profile-panel-heading"><div><span className="profile-eyebrow">Web3 access</span><h3>Wallet Connection</h3></div><span className="profile-status-muted">Not connected</span></div><div className="profile-wallet-row"><div className="profile-wallet-icon"><img src={walletMark} alt="" /></div><div><span>Connection status</span><strong>Not Connected</strong></div></div><a className="profile-primary-button" href="#connect-wallet">Connect Wallet <span>+</span></a></section>
      </div>
      <section className="profile-panel profile-account-panel surface-card"><div className="profile-panel-heading"><div><span className="profile-eyebrow">Membership</span><h3>Account Information</h3></div><img className="profile-account-icon" src={shieldIcon} alt="" /></div><dl className="profile-info-list"><div><dt>Account Type</dt><dd>{user?.role === 'admin' ? 'Administrator' : 'NodeConnect Member'}</dd></div><div><dt>Member Since</dt><dd>{user?.created_at || 'Not available'}</dd></div><div><dt>Referral ID</dt><dd>Not available</dd></div></dl></section>
      <section className="profile-note"><img src={nodesIcon} alt="" /><p>Account information is securely loaded from your NodeConnect account.</p></section>
    </div>
  </DashboardLayout>
}
