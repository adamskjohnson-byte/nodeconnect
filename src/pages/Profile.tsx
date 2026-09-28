import { useEffect, useRef, useState, type FormEvent } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { getEmailChangeStatus, getProfile, removeProfilePicture, requestEmailChange, resendVerificationEmail, updateProfile, uploadProfilePicture } from '../lib/accountApi'
import type { AccountProfile } from '../lib/accountApi'
import { publishAvatarVersion } from '../lib/avatarStore'
import UserAvatar from '../components/UserAvatar'
import { playUiSound } from '../lib/soundService'
import { useAppTranslation } from '../lib/i18n'
import shieldIcon from '../assets/icons/Icon-9.svg'
import nodesIcon from '../assets/icons/Icon-17.svg'
import walletMark from '../assets/wallet-mark.svg'
import '../styles/profile.css'
import '../styles/profile-controls.css'

export default function Profile() {
  const t = useAppTranslation()
  const [editing, setEditing] = useState(false)
  const [user, setUser] = useState<AccountProfile | null>(null)
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [emailStatus, setEmailStatus] = useState<{ pending_email: string | null; expires_at: string | null }>({ pending_email: null, expires_at: null })
  const [emailFormOpen, setEmailFormOpen] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [emailPassword, setEmailPassword] = useState('')
  const [pictureBusy, setPictureBusy] = useState(false)
  const pictureInput = useRef<HTMLInputElement>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let active = true
    getProfile().then((profile) => {
      if (!active) return
      setUser(profile)
      setFullName(profile.full_name)
      publishAvatarVersion(profile.profile_image_version)
    }).catch(() => {
      if (active) setError(t('errors.profileLoad'))
    }).finally(() => { if (active) setLoading(false) })
    getEmailChangeStatus().then(({ pending_email, expires_at }) => {
      if (active) setEmailStatus({ pending_email, expires_at })
    }).catch(() => undefined)
    return () => { active = false }
  }, [])

  const cancelEdit = () => {
    setFullName(user?.full_name || '')
    setEditing(false)
    setError('')
    setMessage('')
  }

  const changePicture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { setError(t('errors.imageTooLarge')); return }
    setPictureBusy(true); setError(''); setMessage('')
    try {
      const result = await uploadProfilePicture(file)
      publishAvatarVersion(result.profile_image_version)
      setUser((current) => current ? { ...current, profile_image_version: result.profile_image_version } : current)
      setMessage(t('profile.pictureSaved'))
      playUiSound('success')
    } catch { setError(t('errors.uploadImage')) }
    finally { setPictureBusy(false) }
  }

  const removePicture = async () => {
    setPictureBusy(true); setError(''); setMessage('')
    try {
      const result = await removeProfilePicture()
      publishAvatarVersion(null)
      setUser((current) => current ? { ...current, profile_image_version: null } : current)
      setMessage(t('profile.pictureRemoved'))
    } catch { setError(t('errors.removeImage')) }
    finally { setPictureBusy(false) }
  }

  const submitEmailChange = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(''); setMessage('')
    try {
      await requestEmailChange(newEmail, emailPassword)
      const status = await getEmailChangeStatus()
      setEmailStatus({ pending_email: status.pending_email, expires_at: status.expires_at })
      setEmailPassword(''); setEmailFormOpen(false); setMessage(status.pending_email ? t('profile.pendingConfirmation', { email: status.pending_email, expiresAt: status.expires_at || '' }) : t('profile.changeEmail'))
    } catch { setError(t('errors.emailChange')) }
  }

  const copyReferral = async () => {
    if (!user?.referral_id) return
    try {
      await navigator.clipboard.writeText(user.referral_id)
      setCopied(true); setMessage(t('profile.referralCopied'))
      playUiSound('copy')
      window.setTimeout(() => setCopied(false), 1800)
    } catch { setError(t('errors.copyReferral')) }
  }

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalized = fullName.trim()
    if (!normalized || normalized.length > 150) {
      setError(t('errors.nameLength'))
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
      setMessage(t('profile.saved'))
      playUiSound('success')
    } catch {
      setError(t('errors.saveProfile'))
    } finally {
      setSaving(false)
    }
  }

  const resendVerification = async () => {
    setError('')
    setMessage('')
    try {
      await resendVerificationEmail()
      setMessage(t('profile.resendVerification'))
    } catch {
      setError(t('errors.sendVerification'))
    }
  }

  return <DashboardLayout activePage="profile" title={t('nav.profile')} eyebrow={`${t('nav.workspace')} / ${t('nav.profile')}`}>
    <div className="profile-content">
      <header className="profile-intro"><div><span className="profile-eyebrow">{t('profile.accountOverview')}</span><h2>{t('nav.profile')}</h2><p>{t('profile.manageDescription')}</p></div><span className="profile-prototype-tag">{user?.role === 'admin' ? t('profile.adminAccount') : t('profile.memberAccount')}</span></header>
      {(message || error || loading) && <p className={error ? 'account-feedback is-error' : 'account-feedback'} role={error ? 'alert' : 'status'}>{loading ? t('profile.loading') : error || message}</p>}
      <section className="profile-identity surface-card">
        <div className="profile-avatar-tools"><UserAvatar className="profile-avatar" name={user?.full_name || 'NodeConnect'} /><button className="profile-photo-button" type="button" onClick={() => pictureInput.current?.click()} disabled={pictureBusy}>{pictureBusy ? t('common.saving') : user?.profile_image_version ? t('profile.changePhoto') : t('profile.addPhoto')}</button>{user?.profile_image_version && <button className="profile-photo-remove" type="button" onClick={() => void removePicture()} disabled={pictureBusy}>{t('profile.removePhoto')}</button>}<input ref={pictureInput} className="profile-picture-input" type="file" accept="image/jpeg,image/png,image/webp" aria-label={user?.profile_image_version ? t('profile.changePhoto') : t('profile.addPhoto')} onChange={(event) => void changePicture(event)} /></div>
        <div className="profile-identity-copy"><span className="profile-eyebrow">{t('profile.nodeMember')}</span><h3>{user?.full_name || t('common.loading')}</h3><p>{user?.email || t('common.notAvailable')}</p></div>
        <div className="profile-account-status"><span>{t('profile.accountStatus')}</span><strong><i /> {user?.status ? t(`profile.status${user.status[0].toUpperCase()}${user.status.slice(1)}`) : t('common.notAvailable')}</strong></div>
      </section>
      <div className="profile-grid">
        <section className="profile-panel surface-card"><div className="profile-panel-heading"><div><span className="profile-eyebrow">{t('profile.personalDetails')}</span><h3>{t('profile.personalInformation')}</h3></div>{!editing && <button className="profile-outline-button" type="button" disabled={loading || !user} onClick={() => { setMessage(''); setEditing(true) }}>{t('profile.editProfile')}</button>}</div><form onSubmit={saveProfile}><div className="profile-fields"><label>{t('common.fullName')}<input type="text" value={editing ? fullName : user?.full_name || ''} onChange={(event) => setFullName(event.target.value)} maxLength={150} placeholder={t('common.fullName')} readOnly={!editing} disabled={loading} /></label><label>{t('common.emailAddress')}<input type="email" value={user?.email || ''} placeholder={t('common.notAvailable')} readOnly disabled /></label></div>{editing && <div className="profile-edit-actions"><button className="profile-outline-button" type="button" onClick={cancelEdit} disabled={saving}>{t('common.cancel')}</button><button className="profile-primary-button" type="submit" disabled={saving}>{saving ? t('common.saving') : t('profile.saveProfile')}</button></div>}</form><div className="profile-email-status"><span>{t('profile.emailCurrentStatus')}</span><strong>{user?.email || t('common.notAvailable')}</strong><span>{user?.email_verified_at ? t('profile.emailAddressVerified') : t('profile.emailNotVerified')}</span>{emailStatus.pending_email && <p role="status">{t('profile.pendingConfirmation', { email: emailStatus.pending_email, expiresAt: emailStatus.expires_at || '' })}</p>}</div>{!emailFormOpen ? <button className="profile-verify-button" type="button" onClick={() => { setEmailFormOpen(true); setNewEmail(''); setError('') }}>{t('profile.changeEmail')}</button> : <form className="profile-email-form" onSubmit={submitEmailChange}><label>{t('profile.newEmail')}<input type="email" autoComplete="email" value={newEmail} onChange={(event) => setNewEmail(event.target.value)} maxLength={255} required /></label><label>{t('profile.currentPassword')}<input type="password" autoComplete="current-password" value={emailPassword} onChange={(event) => setEmailPassword(event.target.value)} required /></label><p>{t('profile.changeEmailNotice')}</p><div className="profile-edit-actions"><button className="profile-outline-button" type="button" onClick={() => setEmailFormOpen(false)}>{t('common.cancel')}</button><button className="profile-primary-button" type="submit">{t('profile.sendConfirmation')}</button></div></form>}{user && !user.email_verified_at && <button className="profile-verify-button" type="button" onClick={resendVerification}>{t('profile.resendVerification')}</button>}</section>
        <section className="profile-panel surface-card"><div className="profile-panel-heading"><div><span className="profile-eyebrow">{t('profile.walletAccess')}</span><h3>{t('profile.walletConnection')}</h3></div><span className="profile-status-muted">{t('profile.notConnected')}</span></div><div className="profile-wallet-row"><div className="profile-wallet-icon"><img src={walletMark} alt="" /></div><div><span>{t('profile.connectionStatus')}</span><strong>{t('profile.notConnectedTitle')}</strong></div></div><a className="profile-primary-button" href="#connect-wallet">{t('profile.connectWallet')} <span>+</span></a></section>
      </div>
      <section className="profile-panel profile-account-panel surface-card"><div className="profile-panel-heading"><div><span className="profile-eyebrow">{t('profile.membership')}</span><h3>{t('profile.accountInformation')}</h3></div><img className="profile-account-icon" src={shieldIcon} alt="" /></div><dl className="profile-info-list"><div><dt>{t('profile.accountType')}</dt><dd>{user?.role === 'admin' ? t('common.administrator') : t('profile.nodeMemberType')}</dd></div><div><dt>{t('profile.memberSince')}</dt><dd>{user?.created_at || t('common.notAvailable')}</dd></div><div><dt>{t('profile.referralId')}</dt><dd><span>{user?.referral_id || t('profile.referralLoading')}</span>{user?.referral_id && <button className="profile-copy-button" data-sound-interaction="copy" type="button" aria-label={t('common.copy')} onClick={() => void copyReferral()}>{copied ? t('common.copied') : t('common.copy')}</button>}</dd></div></dl></section>
      <section className="profile-note"><img src={nodesIcon} alt="" /><p>{t('profile.accountLoadedSecurely')}</p></section>
    </div>
  </DashboardLayout>
}
