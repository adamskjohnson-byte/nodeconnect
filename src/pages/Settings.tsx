import { useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import settingsIcon from '../assets/icons/Icon-22.svg'
import shieldIcon from '../assets/icons/Icon-9.svg'
import '../styles/settings.css'

type ToggleProps = { label: string; description?: string; enabled: boolean; onToggle: () => void }

function ToggleRow({ label, description, enabled, onToggle }: ToggleProps) {
  return <div className="settings-row"><div><strong>{label}</strong>{description && <span>{description}</span>}</div><button className={enabled ? 'settings-toggle is-on' : 'settings-toggle'} type="button" aria-pressed={enabled} aria-label={`${label}: ${enabled ? 'On' : 'Off'}`} onClick={onToggle}><i /></button></div>
}

function SettingsCard({ eyebrow, title, description, children, className = '' }: { eyebrow: string; title: string; description?: string; children: React.ReactNode; className?: string }) {
  return <section className={`settings-card surface-card ${className}`}><header className="settings-card-heading"><div><span className="settings-eyebrow">{eyebrow}</span><h3>{title}</h3>{description && <p>{description}</p>}</div></header>{children}</section>
}

export default function Settings() {
  const [theme, setTheme] = useState('Dark')
  const [sound, setSound] = useState(true)
  const [volume, setVolume] = useState(70)
  const [notifications, setNotifications] = useState({ activity: true, staking: true, rewards: true, referrals: false })

  const toggleNotification = (key: keyof typeof notifications) => setNotifications((current) => ({ ...current, [key]: !current[key] }))

  return <DashboardLayout activePage="settings" title="Settings" eyebrow="Workspace / Settings">
    <div className="settings-content">
      <header className="settings-intro"><div><span className="settings-eyebrow">Preferences</span><h2>Settings</h2><p>Customize your NodeConnect experience.</p></div><div className="settings-intro-icon"><img src={settingsIcon} alt="" /></div></header>
      <div className="settings-grid">
        <SettingsCard eyebrow="Interface" title="Appearance" description="Customize how NodeConnect looks."><div className="settings-setting-label">Theme</div><div className="settings-segmented" role="radiogroup" aria-label="Theme"><button className={theme === 'Dark' ? 'is-selected' : ''} type="button" onClick={() => setTheme('Dark')}>Dark</button><button className={theme === 'Light' ? 'is-selected' : ''} type="button" onClick={() => setTheme('Light')}>Light</button><button className={theme === 'System' ? 'is-selected' : ''} type="button" onClick={() => setTheme('System')}>System</button></div></SettingsCard>
        <SettingsCard eyebrow="Interface" title="Sound" description="Control interface sounds and feedback."><ToggleRow label="Sound Effects" description="Interface feedback" enabled={sound} onToggle={() => setSound((value) => !value)} /><div className="settings-volume"><div><strong>Volume</strong><span>{volume}%</span></div><input aria-label="Volume" type="range" min="0" max="100" value={volume} onChange={(event) => setVolume(Number(event.target.value))} /></div></SettingsCard>
        <SettingsCard eyebrow="Updates" title="Notifications"><div className="settings-rows"><ToggleRow label="Activity Notifications" enabled={notifications.activity} onToggle={() => toggleNotification('activity')} /><ToggleRow label="Staking Updates" enabled={notifications.staking} onToggle={() => toggleNotification('staking')} /><ToggleRow label="Reward Notifications" enabled={notifications.rewards} onToggle={() => toggleNotification('rewards')} /><ToggleRow label="Referral Notifications" enabled={notifications.referrals} onToggle={() => toggleNotification('referrals')} /></div></SettingsCard>
        <SettingsCard eyebrow="Protection" title="Security"><div className="settings-rows"><div className="settings-action-row"><div><strong>Password</strong><span>Manage your account password</span></div><button type="button" disabled>Change Password</button></div><div className="settings-action-row"><div><strong>Two-Factor Authentication</strong><span>Additional account protection</span></div><em>Not Enabled</em></div><div className="settings-action-row"><div><strong>Active Sessions</strong><span>Review signed-in devices</span></div><button type="button" disabled>Manage Sessions</button></div></div></SettingsCard>
        <SettingsCard eyebrow="Account" title="Account" className="settings-account-card"><div className="settings-account-fields"><label>Language<select defaultValue="English"><option>English</option></select></label><label>Currency<select defaultValue="USD"><option>USD</option></select></label></div><div className="settings-delete-row"><div><strong>Delete Account</strong><span>This action will be available when accounts are active.</span></div><button type="button" disabled><img src={shieldIcon} alt="" />Delete Account</button></div></SettingsCard>
      </div>
      <p className="settings-note">Settings are UI-only and are not saved to an account yet.</p>
    </div>
  </DashboardLayout>
}
