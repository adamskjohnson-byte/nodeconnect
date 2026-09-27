import { useEffect, useState, type FormEvent } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import settingsIcon from '../assets/icons/Icon-22.svg'
import shieldIcon from '../assets/icons/Icon-9.svg'
import QRCode from 'qrcode'
import { beginTwoFactorSetup, changePassword, deactivateAccount, disableTwoFactor, getPreferences, getSessions, getTwoFactorStatus, regenerateRecoveryCodes, resendVerificationEmail, revokeOtherSessions, revokeSession, updatePreferences, enableTwoFactor, type ActiveSession, type UserPreferences } from '../lib/accountApi'
import '../styles/settings.css'

type ToggleProps = { label: string; description?: string; enabled: boolean; onToggle: () => void }

function ToggleRow({ label, description, enabled, onToggle }: ToggleProps) {
  return <div className="settings-row"><div><strong>{label}</strong>{description && <span>{description}</span>}</div><button className={enabled ? 'settings-toggle is-on' : 'settings-toggle'} type="button" aria-pressed={enabled} aria-label={`${label}: ${enabled ? 'On' : 'Off'}`} onClick={onToggle}><i /></button></div>
}

function SettingsCard({ eyebrow, title, description, children, className = '' }: { eyebrow: string; title: string; description?: string; children: React.ReactNode; className?: string }) {
  return <section className={`settings-card surface-card ${className}`}><header className="settings-card-heading"><div><span className="settings-eyebrow">{eyebrow}</span><h3>{title}</h3>{description && <p>{description}</p>}</div></header>{children}</section>
}

export default function Settings() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [volumeDraft, setVolumeDraft] = useState(70)
  const [sessions, setSessions] = useState<ActiveSession[]>([])
  const [sessionsOpen, setSessionsOpen] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [setupSecret, setSetupSecret] = useState('')
  const [setupQr, setSetupQr] = useState('')
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])
  const [securityMode, setSecurityMode] = useState<'idle' | 'change-password' | 'setup-2fa' | 'disable-2fa' | 'regenerate-codes' | 'deactivate'>('idle')
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
      }
    } catch {
      try { localStorage.removeItem('nodeconnect_preferences') } catch { /* storage is optional */ }
    }
    Promise.all([getPreferences(), getTwoFactorStatus()]).then(([saved, twoFactor]) => {
      if (!active) return
      setPreferences(saved)
      setVolumeDraft(saved.sound_volume)
      setTwoFactorEnabled(twoFactor.enabled)
      try { localStorage.setItem('nodeconnect_preferences', JSON.stringify(saved)) } catch { /* server persistence is authoritative */ }
    }).catch((reason: unknown) => {
      if (active) setError(reason instanceof Error ? reason.message : 'Unable to load settings.')
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
    setMessage('')
    setError('')
    setSaving(true)
    try {
      const saved = await updatePreferences({ [key]: value } as Partial<UserPreferences>)
      setPreferences(saved)
      setVolumeDraft(saved.sound_volume)
      try { localStorage.setItem('nodeconnect_preferences', JSON.stringify(saved)) } catch { /* server persistence is authoritative */ }
      setMessage('Settings saved.')
    } catch (reason) {
      setPreferences(previous)
      setError(reason instanceof Error ? reason.message : 'Unable to save settings.')
    } finally {
      setSaving(false)
    }
  }

  const showSessions = async () => {
    setSessionsOpen((open) => !open)
    if (!sessionsOpen) {
      try { setSessions(await getSessions()) } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to load sessions.') }
    }
  }

  const submitPasswordChange = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true); setError(''); setMessage('')
    try {
      const result = await changePassword(passwordForm)
      setMessage(result.message)
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' })
      setSecurityMode('idle')
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to change password.') }
    finally { setSaving(false) }
  }

  const startTwoFactor = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSaving(true); setError(''); setMessage('')
    try {
      const result = await beginTwoFactorSetup(securityPassword)
      const qr = await QRCode.toDataURL(result.provisioning_uri, { width: 190, margin: 1, color: { dark: '#00ff88', light: '#07100c' } })
      setSetupSecret(result.secret); setSetupQr(qr); setSetupCode(''); setSecurityMode('setup-2fa')
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to start two-factor setup.') }
    finally { setSaving(false) }
  }

  const confirmTwoFactor = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSaving(true); setError('')
    try {
      const result = await enableTwoFactor(securityPassword, setupCode)
      setRecoveryCodes(result.recovery_codes); setTwoFactorEnabled(true); setSetupSecret(''); setSetupQr(''); setSecurityMode('idle'); setSecurityPassword(''); setSetupCode(''); setMessage(result.message || 'Two-factor authentication enabled.')
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to enable two-factor authentication.') }
    finally { setSaving(false) }
  }

  const performTwoFactorAction = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSaving(true); setError('')
    try {
      if (securityMode === 'disable-2fa') {
        const result = await disableTwoFactor(securityPassword, securityCode)
        setTwoFactorEnabled(false); setMessage(result.message); setSecurityMode('idle')
      } else {
        const result = await regenerateRecoveryCodes(securityPassword, securityCode)
        setRecoveryCodes(result.recovery_codes); setMessage('New recovery codes generated. Previous codes are no longer valid.')
      }
      setSecurityPassword(''); setSecurityCode('')
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to update two-factor settings.') }
    finally { setSaving(false) }
  }

  const deactivate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSaving(true); setError('')
    try {
      const result = await deactivateAccount(securityPassword, deactivationConfirmation)
      setMessage(result.message)
      window.location.hash = '#home'
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to deactivate account.') }
    finally { setSaving(false) }
  }

  const notifyResend = async () => {
    setSaving(true); setError(''); setMessage('')
    try { setMessage((await resendVerificationEmail()).message) }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to send verification email.') }
    finally { setSaving(false) }
  }

  const togglePreference = (key: 'sound_enabled' | 'activity_notifications' | 'staking_notifications' | 'reward_notifications' | 'referral_notifications') => {
    if (preferences) void savePreference(key, !preferences[key])
  }

  const revokeOne = async (session: ActiveSession) => {
    if (session.is_current || !window.confirm('Revoke this session?')) return
    try { await revokeSession(session.id); setSessions(await getSessions()); setMessage('Session revoked.') }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to revoke session.') }
  }

  const revokeOthers = async () => {
    if (!window.confirm('Sign out all other active sessions?')) return
    try { const result = await revokeOtherSessions(); setSessions(await getSessions()); setMessage(`${result.revoked} other session(s) revoked.`) }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to revoke sessions.') }
  }

  return <DashboardLayout activePage="settings" title="Settings" eyebrow="Workspace / Settings">
    <div className="settings-content">
      <header className="settings-intro"><div><span className="settings-eyebrow">Preferences</span><h2>Settings</h2><p>Customize your NodeConnect experience.</p></div><div className="settings-intro-icon"><img src={settingsIcon} alt="" /></div></header>
      {(loading || message || error || saving) && <p className={error ? 'settings-feedback is-error' : 'settings-feedback'} role={error ? 'alert' : 'status'}>{loading ? 'Loading saved settings...' : saving ? 'Saving...' : error || message}</p>}
      <div className="settings-grid">
        <SettingsCard eyebrow="Interface" title="Appearance" description="Choose how NodeConnect is displayed."><div className="settings-setting-label">Theme</div><div className="settings-segmented" role="radiogroup" aria-label="Theme">{(['dark', 'light', 'system'] as const).map((theme) => <button className={preferences?.theme === theme ? 'is-selected' : ''} type="button" key={theme} aria-checked={preferences?.theme === theme} role="radio" disabled={!preferences || saving} onClick={() => void savePreference('theme', theme)}>{theme[0].toUpperCase() + theme.slice(1)}</button>)}</div></SettingsCard>
        <SettingsCard eyebrow="Interface" title="Sound" description="Preferences apply when the application plays supported sounds."><ToggleRow label="Sound Effects" description="Interface feedback" enabled={preferences?.sound_enabled ?? true} onToggle={() => togglePreference('sound_enabled')} /><div className="settings-volume"><div><strong>Volume</strong><span>{volumeDraft}%</span></div><input aria-label="Volume" type="range" min="0" max="100" value={volumeDraft} disabled={!preferences} onChange={(event) => setVolumeDraft(Number(event.target.value))} onPointerUp={() => void savePreference('sound_volume', volumeDraft)} onKeyUp={() => void savePreference('sound_volume', volumeDraft)} /></div></SettingsCard>
        <SettingsCard eyebrow="Updates" title="Notifications" description="Saved per account; delivery depends on supported product events."><div className="settings-rows"><ToggleRow label="Activity Notifications" enabled={preferences?.activity_notifications ?? true} onToggle={() => togglePreference('activity_notifications')} /><ToggleRow label="Staking Updates" enabled={preferences?.staking_notifications ?? true} onToggle={() => togglePreference('staking_notifications')} /><ToggleRow label="Reward Notifications" enabled={preferences?.reward_notifications ?? true} onToggle={() => togglePreference('reward_notifications')} /><ToggleRow label="Referral Notifications" enabled={preferences?.referral_notifications ?? true} onToggle={() => togglePreference('referral_notifications')} /></div></SettingsCard>
        <SettingsCard eyebrow="Protection" title="Security"><div className="settings-rows"><div className="settings-action-row"><div><strong>Password</strong><span>Change your account password</span></div><button type="button" onClick={() => setSecurityMode(securityMode === 'change-password' ? 'idle' : 'change-password')}>Change Password</button></div><div className="settings-action-row"><div><strong>Two-Factor Authentication</strong><span>Authenticator app verification</span></div><em>{twoFactorEnabled ? 'Enabled' : 'Not Enabled'}</em></div><div className="settings-action-row"><div><strong>Active Sessions</strong><span>Review signed-in devices</span></div><button type="button" onClick={showSessions}>{sessionsOpen ? 'Hide Sessions' : 'Manage Sessions'}</button></div></div>
          {securityMode === 'change-password' && <form className="settings-security-form" onSubmit={submitPasswordChange}><label>Current Password<input type="password" autoComplete="current-password" value={passwordForm.current_password} onChange={(event) => setPasswordForm({ ...passwordForm, current_password: event.target.value })} required /></label><label>New Password<input type="password" autoComplete="new-password" value={passwordForm.new_password} onChange={(event) => setPasswordForm({ ...passwordForm, new_password: event.target.value })} minLength={12} maxLength={128} required /></label><label>Confirm New Password<input type="password" autoComplete="new-password" value={passwordForm.confirm_password} onChange={(event) => setPasswordForm({ ...passwordForm, confirm_password: event.target.value })} required /></label><button type="submit" disabled={saving}>Save Password</button></form>}
          {!twoFactorEnabled && securityMode === 'idle' && <form className="settings-security-form settings-inline-form" onSubmit={startTwoFactor}><label>Confirm your password to begin authenticator setup<input type="password" autoComplete="current-password" value={securityPassword} onChange={(event) => setSecurityPassword(event.target.value)} required /></label><button type="submit" disabled={saving}>Enable Two-Factor Authentication</button></form>}
          {securityMode === 'setup-2fa' && <div className="settings-two-factor-setup"><p>Scan with your authenticator app, then enter its current six-digit code.</p>{setupQr && <img className="settings-two-factor-qr" src={setupQr} alt="Authenticator setup QR code" />}<p className="settings-secret">Manual setup key: <strong>{setupSecret}</strong></p><form className="settings-security-form" onSubmit={confirmTwoFactor}><label>Authenticator code<input inputMode="numeric" autoComplete="one-time-code" value={setupCode} onChange={(event) => setSetupCode(event.target.value)} pattern="[0-9]{6}" maxLength={6} required /></label><button type="submit" disabled={saving}>Verify and Enable</button><button type="button" onClick={() => { setSecurityMode('idle'); setSecurityPassword(''); setSetupSecret(''); setSetupQr('') }}>Cancel Setup</button></form></div>}
          {twoFactorEnabled && securityMode === 'idle' && <div className="settings-security-actions"><button type="button" onClick={() => setSecurityMode('disable-2fa')}>Disable Two-Factor</button><button type="button" onClick={() => setSecurityMode('regenerate-codes')}>Regenerate Recovery Codes</button></div>}
          {(securityMode === 'disable-2fa' || securityMode === 'regenerate-codes') && <form className="settings-security-form" onSubmit={performTwoFactorAction}><label>Current Password<input type="password" autoComplete="current-password" value={securityPassword} onChange={(event) => setSecurityPassword(event.target.value)} required /></label><label>Authenticator code<input inputMode="numeric" autoComplete="one-time-code" value={securityCode} onChange={(event) => setSecurityCode(event.target.value)} pattern="[0-9]{6}" maxLength={6} required /></label><button type="submit" disabled={saving}>{securityMode === 'disable-2fa' ? 'Confirm Disable' : 'Generate New Recovery Codes'}</button><button type="button" onClick={() => { setSecurityMode('idle'); setSecurityPassword(''); setSecurityCode('') }}>Cancel</button></form>}
          {recoveryCodes.length > 0 && <div className="settings-recovery-codes"><strong>Save these recovery codes now</strong><p>Each code works once. They will not be shown again.</p><ul>{recoveryCodes.map((code) => <li key={code}>{code}</li>)}</ul><button type="button" onClick={() => setRecoveryCodes([])}>I saved my codes</button></div>}
          {sessionsOpen && <div className="settings-session-list"><div className="settings-session-list-heading"><strong>Signed-in sessions</strong><button type="button" onClick={revokeOthers}>Sign out other sessions</button></div>{sessions.length === 0 ? <p>No active sessions.</p> : sessions.map((session) => <div className="settings-session" key={session.id}><div><strong>{session.browser} · {session.device_type}</strong><span>{session.operating_system} · {session.is_current ? 'This device' : 'Other session'}</span><span>Last active {new Date(`${session.last_activity_at.replace(' ', 'T')}Z`).toLocaleString()}</span></div>{!session.is_current && <button type="button" onClick={() => void revokeOne(session)}>Revoke</button>}</div>)}</div>}
        </SettingsCard>
        <SettingsCard eyebrow="Account" title="Account" className="settings-account-card"><div className="settings-account-fields"><label>Language<select value={preferences?.language || 'en'} disabled={!preferences} onChange={(event) => void savePreference('language', event.target.value as 'en')}><option value="en">English</option></select></label><label>Currency<select value={preferences?.currency || 'USD'} disabled={!preferences} onChange={(event) => void savePreference('currency', event.target.value as 'USD')}><option value="USD">USD</option></select></label></div><button className="settings-verify-button" type="button" onClick={notifyResend} disabled={saving}><img src={shieldIcon} alt="" />Resend email verification</button><div className="settings-delete-row"><div><strong>Deactivate Account</strong><span>Disables sign-in and revokes sessions. Existing records are retained.</span></div><button type="button" onClick={() => setSecurityMode(securityMode === 'deactivate' ? 'idle' : 'deactivate')}><img src={shieldIcon} alt="" />Deactivate</button></div>{securityMode === 'deactivate' && <form className="settings-security-form" onSubmit={deactivate}><p>To confirm, enter your password. Your account will be disabled and retained records will not be deleted.</p><label>Password<input type="password" autoComplete="current-password" value={securityPassword} onChange={(event) => setSecurityPassword(event.target.value)} required /></label><label>Type DEACTIVATE<input value={deactivationConfirmation} onChange={(event) => setDeactivationConfirmation(event.target.value)} required pattern="DEACTIVATE" /></label><button type="submit" disabled={saving}>Confirm Deactivation</button></form>}</SettingsCard>
      </div>
      <p className="settings-note">{preferences ? 'Preferences are saved to your NodeConnect account.' : 'Settings are loading from your account.'}</p>
    </div>
  </DashboardLayout>
}
