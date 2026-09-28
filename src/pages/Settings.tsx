import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import settingsIcon from '../assets/icons/Icon-22.svg'
import shieldIcon from '../assets/icons/Icon-9.svg'
import QRCode from 'qrcode'
import { beginTwoFactorSetup, changePassword, deactivateAccount, disableTwoFactor, getPreferences, getSessions, getTwoFactorStatus, regenerateRecoveryCodes, resendVerificationEmail, revokeOtherSessions, revokeSession, updatePreferences, enableTwoFactor, type ActiveSession, type UserPreferences } from '../lib/accountApi'
import { playUiSound, setSoundPreferences } from '../lib/soundService'
import { changeAppLanguage, languages, useAppTranslation } from '../lib/i18n'
import '../styles/settings.css'
import '../styles/settings-dialog.css'

type ToggleProps = { label: string; description?: string; enabled: boolean; onToggle: () => void }

function SecurityDialog({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const t = useAppTranslation()
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const element = dialog.current
    if (!element) return
    element.showModal()
    return () => { if (element.open) element.close() }
  }, [])
  return <dialog ref={dialog} className="settings-security-dialog" aria-labelledby="settings-dialog-title" onCancel={(event) => { event.preventDefault(); onClose() }}>
    <header><h3 id="settings-dialog-title">{title}</h3><button type="button" aria-label={t('common.close')} onClick={onClose}>×</button></header>
    {children}
  </dialog>
}

function ToggleRow({ label, description, enabled, onToggle }: ToggleProps) {
  const t = useAppTranslation()
  return <div className="settings-row"><div><strong>{label}</strong>{description && <span>{description}</span>}</div><button className={enabled ? 'settings-toggle is-on' : 'settings-toggle'} type="button" aria-pressed={enabled} aria-label={t('settings.toggleLabel', { label, state: t(enabled ? 'common.on' : 'common.off') })} onClick={onToggle}><i /></button></div>
}

function SettingsCard({ eyebrow, title, description, children, className = '' }: { eyebrow: string; title: string; description?: string; children: React.ReactNode; className?: string }) {
  return <section className={`settings-card surface-card ${className}`}><header className="settings-card-heading"><div><span className="settings-eyebrow">{eyebrow}</span><h3>{title}</h3>{description && <p>{description}</p>}</div></header>{children}</section>
}

export default function Settings() {
  const t = useAppTranslation()
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [volumeDraft, setVolumeDraft] = useState(70)
  const [sessions, setSessions] = useState<ActiveSession[]>([])
  const [sessionsOpen, setSessionsOpen] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [setupSecret, setSetupSecret] = useState('')
  const [setupQr, setSetupQr] = useState('')
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])
  const [securityMode, setSecurityMode] = useState<'idle' | 'change-password' | 'confirm-2fa' | 'setup-2fa' | 'show-recovery-codes' | 'disable-2fa' | 'regenerate-codes' | 'deactivate'>('idle')
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', confirm_password: '' })
  const [securityPassword, setSecurityPassword] = useState('')
  const [deactivationConfirmation, setDeactivationConfirmation] = useState('')
  const [securityCode, setSecurityCode] = useState('')
  const [setupCode, setSetupCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    try {
      const cached = localStorage.getItem('nodeconnect_preferences')
      if (cached) {
        const parsed = JSON.parse(cached) as UserPreferences
        setPreferences(parsed)
        setVolumeDraft(parsed.sound_volume)
        setSoundPreferences(parsed.sound_enabled, parsed.sound_volume)
      }
    } catch {
      try { localStorage.removeItem('nodeconnect_preferences') } catch { /* storage is optional */ }
    }
    Promise.all([getPreferences(), getTwoFactorStatus()]).then(([saved, twoFactor]) => {
      if (!active) return
      setPreferences(saved)
      setVolumeDraft(saved.sound_volume)
      setTwoFactorEnabled(twoFactor.enabled)
      setSoundPreferences(saved.sound_enabled, saved.sound_volume)
      try { localStorage.setItem('nodeconnect_preferences', JSON.stringify(saved)) } catch { /* server persistence is authoritative */ }
    }).catch(() => {
      if (active) setError(t('errors.settingsLoad'))
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!preferences) return
    const applyTheme = () => {
      const resolved = preferences.theme === 'system'
        ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
        : preferences.theme
      document.documentElement.dataset.theme = resolved
    }
    applyTheme()
    const media = window.matchMedia('(prefers-color-scheme: light)')
    media.addEventListener('change', applyTheme)
    return () => media.removeEventListener('change', applyTheme)
  }, [preferences?.theme])

  const savePreference = async (key: keyof UserPreferences, value: UserPreferences[keyof UserPreferences]) => {
    if (!preferences) return
    const previous = preferences
    const next = { ...preferences, [key]: value } as UserPreferences
    setPreferences(next)
    setSoundPreferences(next.sound_enabled, next.sound_volume)
    if (key === 'language') {
      void changeAppLanguage(value as UserPreferences['language'])
      try { localStorage.setItem('nodeconnect_preferences', JSON.stringify(next)) } catch { /* server remains authoritative */ }
    }
    if (key === 'sound_enabled' && value === true) playUiSound('toggle')
    setMessage('')
    setError('')
    setSaving(true)
    try {
      const saved = await updatePreferences({ [key]: value } as Partial<UserPreferences>)
      setPreferences(saved)
      setVolumeDraft(saved.sound_volume)
      if (key === 'language') void changeAppLanguage(saved.language)
      try { localStorage.setItem('nodeconnect_preferences', JSON.stringify(saved)) } catch { /* server persistence is authoritative */ }
      setMessage(t('settings.saved'))
    } catch {
      setPreferences(previous)
      setSoundPreferences(previous.sound_enabled, previous.sound_volume)
      if (key === 'language') {
        void changeAppLanguage(previous.language)
        try { localStorage.setItem('nodeconnect_preferences', JSON.stringify(previous)) } catch { /* storage is optional */ }
      }
      setError(t('errors.saveSettings'))
    } finally {
      setSaving(false)
    }
  }

  const showSessions = async () => {
    setSessionsOpen((open) => !open)
    if (!sessionsOpen) {
      try { setSessions(await getSessions()) } catch { setError(t('errors.loadSessions')) }
    }
  }

  const submitPasswordChange = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true); setError(''); setMessage('')
    try {
      await changePassword(passwordForm)
      setMessage(t('settings.changePasswordSuccess'))
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' })
      setSecurityMode('idle')
    } catch { setError(t('errors.changePassword')) }
    finally { setSaving(false) }
  }

  const startTwoFactor = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSaving(true); setError(''); setMessage('')
    try {
      const result = await beginTwoFactorSetup(securityPassword)
      const qr = await QRCode.toDataURL(result.provisioning_uri, { width: 190, margin: 1, color: { dark: '#00ff88', light: '#07100c' } })
      setSetupSecret(result.secret); setSetupQr(qr); setSetupCode(''); setSecurityMode('setup-2fa')
    } catch { setError(t('errors.beginTwoFactor')) }
    finally { setSaving(false) }
  }

  const confirmTwoFactor = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSaving(true); setError('')
    try {
      const result = await enableTwoFactor(securityPassword, setupCode)
      setRecoveryCodes(result.recovery_codes); setTwoFactorEnabled(true); setSetupSecret(''); setSetupQr(''); setSecurityMode('show-recovery-codes'); setSecurityPassword(''); setSetupCode(''); setMessage(t('settings.twoFactorEnabled'))
    } catch { setError(t('errors.enableTwoFactor')) }
    finally { setSaving(false) }
  }

  const performTwoFactorAction = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSaving(true); setError('')
    try {
      if (securityMode === 'disable-2fa') {
        await disableTwoFactor(securityPassword, securityCode)
        setTwoFactorEnabled(false); setMessage(t('common.disabled')); setSecurityMode('idle')
      } else {
        const result = await regenerateRecoveryCodes(securityPassword, securityCode)
        setRecoveryCodes(result.recovery_codes); setSecurityMode('show-recovery-codes'); setMessage(t('settings.regeneratedRecoveryCodes'))
      }
      setSecurityPassword(''); setSecurityCode('')
    } catch { setError(t('errors.updateTwoFactor')) }
    finally { setSaving(false) }
  }

  const deactivate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSaving(true); setError('')
    try {
      await deactivateAccount(securityPassword, deactivationConfirmation)
      setMessage(t('common.disabled'))
      window.location.hash = '#home'
    } catch { setError(t('errors.deactivateAccount')) }
    finally { setSaving(false) }
  }

  const notifyResend = async () => {
    setSaving(true); setError(''); setMessage('')
    try { await resendVerificationEmail(); setMessage(t('settings.resendVerification')) }
    catch { setError(t('errors.sendVerification')) }
    finally { setSaving(false) }
  }

  const togglePreference = (key: 'sound_enabled' | 'activity_notifications' | 'staking_notifications' | 'reward_notifications' | 'referral_notifications') => {
    if (preferences) void savePreference(key, !preferences[key])
  }

  const revokeOne = async (session: ActiveSession) => {
    if (session.is_current || !window.confirm(t('settings.revokeSessionConfirm'))) return
    try { await revokeSession(session.id); setSessions(await getSessions()); setMessage(t('settings.sessionRevoked')) }
    catch { setError(t('errors.revokeSession')) }
  }

  const revokeOthers = async () => {
    if (!window.confirm(t('settings.revokeOthersConfirm'))) return
    try { const result = await revokeOtherSessions(); setSessions(await getSessions()); setMessage(t('settings.sessionsRevoked', { count: result.revoked })) }
    catch { setError(t('errors.revokeSessions')) }
  }

  return <DashboardLayout activePage="settings" title={t('settings.title')} eyebrow={`${t('nav.workspace')} / ${t('settings.title')}`}>
    <div className="settings-content">
      <header className="settings-intro"><div><span className="settings-eyebrow">{t('settings.eyebrow')}</span><h2>{t('settings.title')}</h2><p>{t('settings.description')}</p></div><div className="settings-intro-icon"><img src={settingsIcon} alt="" /></div></header>
      {(loading || message || error || saving) && <p className={error ? 'settings-feedback is-error' : 'settings-feedback'} role={error ? 'alert' : 'status'}>{loading ? t('settings.loading') : saving ? t('settings.saving') : error || message}</p>}
      <div className="settings-grid">
        <SettingsCard eyebrow={t('settings.interface')} title={t('settings.appearance')} description={t('settings.appearanceDescription')}><div className="settings-setting-label">{t('settings.theme')}</div><div className="settings-segmented" role="radiogroup" aria-label={t('settings.theme')}>{(['dark', 'light', 'system'] as const).map((theme) => <button className={preferences?.theme === theme ? 'is-selected' : ''} type="button" key={theme} aria-checked={preferences?.theme === theme} role="radio" disabled={!preferences || saving} onClick={() => void savePreference('theme', theme)}>{t(`settings.${theme}`)}</button>)}</div></SettingsCard>
        <SettingsCard eyebrow={t('settings.interface')} title={t('settings.sound')} description={t('settings.soundDescription')}><ToggleRow label={t('settings.soundEffects')} description={t('settings.soundFeedback')} enabled={preferences?.sound_enabled ?? true} onToggle={() => togglePreference('sound_enabled')} /><div className="settings-volume"><div><strong>{t('settings.volume')}</strong><span>{volumeDraft}%</span></div><input aria-label={t('settings.volume')} type="range" min="0" max="100" value={volumeDraft} disabled={!preferences} onChange={(event) => { const nextVolume = Number(event.target.value); setVolumeDraft(nextVolume); setSoundPreferences(preferences?.sound_enabled ?? false, nextVolume) }} onPointerUp={() => { playUiSound('toggle'); void savePreference('sound_volume', volumeDraft) }} onKeyUp={() => { playUiSound('toggle'); void savePreference('sound_volume', volumeDraft) }} /></div></SettingsCard>
        <SettingsCard eyebrow={t('settings.updates')} title={t('settings.notifications')} description={t('settings.notificationsDescription')}><div className="settings-rows"><ToggleRow label={t('settings.activityNotifications')} enabled={preferences?.activity_notifications ?? true} onToggle={() => togglePreference('activity_notifications')} /><ToggleRow label={t('settings.stakingUpdates')} enabled={preferences?.staking_notifications ?? true} onToggle={() => togglePreference('staking_notifications')} /><ToggleRow label={t('settings.rewardNotifications')} enabled={preferences?.reward_notifications ?? true} onToggle={() => togglePreference('reward_notifications')} /><ToggleRow label={t('settings.referralNotifications')} enabled={preferences?.referral_notifications ?? true} onToggle={() => togglePreference('referral_notifications')} /></div></SettingsCard>
        <SettingsCard eyebrow={t('settings.protection')} title={t('settings.security')}><div className="settings-rows"><div className="settings-action-row"><div><strong>{t('settings.password')}</strong><span>{t('settings.changePasswordDescription')}</span></div><button type="button" onClick={() => setSecurityMode(securityMode === 'change-password' ? 'idle' : 'change-password')}>{t('settings.changePassword')}</button></div><div className="settings-action-row"><div><strong>{t('settings.twoFactor')}</strong><span>{t('settings.authenticatorApp')}</span></div><em>{twoFactorEnabled ? t('settings.enabled') : t('settings.notEnabled')}</em></div><div className="settings-action-row"><div><strong>{t('settings.activeSessions')}</strong><span>{t('settings.reviewDevices')}</span></div><button type="button" onClick={showSessions}>{sessionsOpen ? t('settings.hideSessions') : t('settings.manageSessions')}</button></div></div>
          {securityMode === 'change-password' && <form className="settings-security-form" onSubmit={submitPasswordChange}><label>{t('settings.currentPassword')}<input type="password" autoComplete="current-password" value={passwordForm.current_password} onChange={(event) => setPasswordForm({ ...passwordForm, current_password: event.target.value })} required /></label><label>{t('settings.newPassword')}<input type="password" autoComplete="new-password" value={passwordForm.new_password} onChange={(event) => setPasswordForm({ ...passwordForm, new_password: event.target.value })} minLength={12} maxLength={128} required /></label><label>{t('settings.confirmNewPassword')}<input type="password" autoComplete="new-password" value={passwordForm.confirm_password} onChange={(event) => setPasswordForm({ ...passwordForm, confirm_password: event.target.value })} required /></label><button type="submit" disabled={saving}>{t('settings.savePassword')}</button></form>}
          {!twoFactorEnabled && securityMode === 'idle' && <button className="settings-security-launch" type="button" onClick={() => { setSecurityPassword(''); setSecurityMode('confirm-2fa') }}>{t('settings.twoFactor')}</button>}
          {securityMode === 'confirm-2fa' && <SecurityDialog title={t('settings.confirmPasswordBegin')} onClose={() => { setSecurityMode('idle'); setSecurityPassword(''); setError('') }}><form className="settings-security-form" onSubmit={startTwoFactor}><p>{t('settings.beginSetupDescription')}</p>{error && <p className="settings-feedback is-error" role="alert">{error}</p>}<label>{t('settings.currentPassword')}<input type="password" autoComplete="current-password" autoFocus value={securityPassword} onChange={(event) => setSecurityPassword(event.target.value)} required /></label><button type="submit" disabled={saving}>{saving ? t('settings.startingSetup') : t('common.continue')}</button></form></SecurityDialog>}
          {securityMode === 'setup-2fa' && <SecurityDialog title={t('settings.setUpAuthenticator')} onClose={() => { setSecurityMode('idle'); setSecurityPassword(''); setSetupSecret(''); setSetupQr(''); setError('') }}><div className="settings-two-factor-setup"><p>{t('settings.setupInstructions')}</p>{setupQr && <img className="settings-two-factor-qr" src={setupQr} alt={t('settings.qrAlt')} />}{error && <p className="settings-feedback is-error" role="alert">{error}</p>}<p className="settings-secret">{t('settings.manualSetupKey')} <strong>{setupSecret}</strong></p><form className="settings-security-form" onSubmit={confirmTwoFactor}><label>{t('settings.authenticatorCode')}<input inputMode="numeric" autoComplete="one-time-code" autoFocus value={setupCode} onChange={(event) => setSetupCode(event.target.value)} pattern="[0-9]{6}" maxLength={6} required /></label><button type="submit" disabled={saving}>{saving ? t('settings.verifying') : t('settings.verifyEnable')}</button><button type="button" onClick={() => { setSecurityMode('idle'); setSecurityPassword(''); setSetupSecret(''); setSetupQr(''); setError('') }}>{t('settings.cancelSetup')}</button></form></div></SecurityDialog>}
          {twoFactorEnabled && securityMode === 'idle' && <div className="settings-security-actions"><button type="button" onClick={() => setSecurityMode('disable-2fa')}>{t('settings.disableTwoFactor')}</button><button type="button" onClick={() => setSecurityMode('regenerate-codes')}>{t('settings.regenerateCodes')}</button></div>}
          {(securityMode === 'disable-2fa' || securityMode === 'regenerate-codes') && <SecurityDialog title={securityMode === 'disable-2fa' ? t('settings.disableTwoFactor') : t('settings.regenerateCodes')} onClose={() => { setSecurityMode('idle'); setSecurityPassword(''); setSecurityCode(''); setError('') }}><form className="settings-security-form" onSubmit={performTwoFactorAction}><p>{t('settings.confirmDisableDescription')}</p>{error && <p className="settings-feedback is-error" role="alert">{error}</p>}<label>{t('settings.currentPassword')}<input type="password" autoComplete="current-password" autoFocus value={securityPassword} onChange={(event) => setSecurityPassword(event.target.value)} required /></label><label>{t('settings.authenticatorCode')}<input inputMode="numeric" autoComplete="one-time-code" value={securityCode} onChange={(event) => setSecurityCode(event.target.value)} pattern="[0-9]{6}" maxLength={6} required /></label><button type="submit" disabled={saving}>{securityMode === 'disable-2fa' ? t('settings.confirmDisable') : t('settings.generateRecoveryCodes')}</button><button type="button" onClick={() => { setSecurityMode('idle'); setSecurityPassword(''); setSecurityCode(''); setError('') }}>{t('common.cancel')}</button></form></SecurityDialog>}
          {securityMode === 'show-recovery-codes' && recoveryCodes.length > 0 && <SecurityDialog title={t('settings.saveRecoveryCodes')} onClose={() => { setRecoveryCodes([]); setSecurityMode('idle') }}><div className="settings-recovery-codes"><strong>{t('settings.recoveryCodesOnce')}</strong><p>{t('settings.recoveryCodesNotice')}</p><ul>{recoveryCodes.map((code) => <li key={code}>{code}</li>)}</ul><button type="button" onClick={() => { setRecoveryCodes([]); setSecurityMode('idle') }}>{t('settings.savedCodes')}</button></div></SecurityDialog>}
          {sessionsOpen && <div className="settings-session-list"><div className="settings-session-list-heading"><strong>{t('settings.signedInSessions')}</strong><button type="button" onClick={revokeOthers}>{t('settings.signOutOthers')}</button></div>{sessions.length === 0 ? <p>{t('settings.noActiveSessions')}</p> : sessions.map((session) => <div className="settings-session" key={session.id}><div><strong>{session.browser} · {session.device_type}</strong><span>{session.operating_system} · {session.is_current ? t('settings.thisDevice') : t('settings.otherSession')}</span><span>{t('settings.lastActive', { time: new Date(`${session.last_activity_at.replace(' ', 'T')}Z`).toLocaleString() })}</span></div>{!session.is_current && <button type="button" onClick={() => void revokeOne(session)}>{t('settings.revoke')}</button>}</div>)}</div>}
        </SettingsCard>
        <SettingsCard eyebrow={t('settings.account')} title={t('settings.account')} className="settings-account-card"><div className="settings-account-fields"><label>{t('settings.language')}<select value={preferences?.language || 'en'} disabled={!preferences || saving} onChange={(event) => void savePreference('language', event.target.value as UserPreferences['language'])}>{languages.map((language) => <option key={language.code} value={language.code}>{language.label}</option>)}</select></label><label>{t('settings.currency')}<select value={preferences?.currency || 'USD'} disabled={!preferences} onChange={(event) => void savePreference('currency', event.target.value as 'USD')}><option value="USD">USD</option></select></label></div><button className="settings-verify-button" type="button" onClick={notifyResend} disabled={saving}><img src={shieldIcon} alt="" />{t('settings.resendVerification')}</button><div className="settings-delete-row"><div><strong>{t('settings.deactivateAccount')}</strong><span>{t('settings.deactivationDescription')}</span></div><button type="button" onClick={() => setSecurityMode(securityMode === 'deactivate' ? 'idle' : 'deactivate')}><img src={shieldIcon} alt="" />{t('settings.deactivate')}</button></div>{securityMode === 'deactivate' && <form className="settings-security-form" onSubmit={deactivate}><p>{t('settings.deactivateConfirmText')}</p><label>{t('common.password')}<input type="password" autoComplete="current-password" value={securityPassword} onChange={(event) => setSecurityPassword(event.target.value)} required /></label><label>{t('settings.typeDeactivate')}<input value={deactivationConfirmation} onChange={(event) => setDeactivationConfirmation(event.target.value)} required pattern="DEACTIVATE" /></label><button type="submit" disabled={saving}>{t('settings.confirmDeactivation')}</button></form>}</SettingsCard>
      </div>
      <p className="settings-note">{preferences ? t('settings.preferencesSavedToAccount') : t('settings.preferencesLoading')}</p>
    </div>
  </DashboardLayout>
}
