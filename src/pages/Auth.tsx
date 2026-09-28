import { useEffect, useRef, useState, type FormEvent } from 'react'
import logo from '../assets/icons/Icon-5.svg'
import { AuthApiError, login, register, verifyLoginTwoFactor, type AuthUser } from '../lib/authApi'
import { confirmEmailChange, requestPasswordReset, resendRegistrationVerificationCode, resetPassword, verifyEmail, verifyRegistrationEmailCode } from '../lib/accountApi'
import '../styles/auth.css'
import { useAppTranslation } from '../lib/i18n'

type AuthMode = 'create' | 'signin' | 'forgot' | 'reset-password' | 'verify-email' | 'verify-registration' | 'confirm-email-change' | 'two-factor'
const verificationEmailStorageKey = 'nodeconnect_verification_email'
const verificationCooldownStorageKey = 'nodeconnect_verification_resend_at'

function modeFromHash(): AuthMode {
  const params = new URLSearchParams((window.location.hash.split('?')[1] || '').replace(/^\?/, ''))
  const mode = params.get('mode')
  return ['create', 'signin', 'forgot', 'reset-password', 'verify-email', 'verify-registration', 'confirm-email-change', 'two-factor'].includes(mode || '') ? mode as AuthMode : 'create'
}

function hashForMode(mode: AuthMode): string {
  return mode === 'create' ? '#auth' : `#auth?mode=${mode}`
}

function maskEmailAddress(value: string): string {
  const [localPart, domain] = value.split('@')
  if (!localPart || !domain) return ''
  return `${localPart.slice(0, 1)}***@${domain}`
}

export default function Auth() {
  const t = useAppTranslation()
  const [mode, setMode] = useState<AuthMode>(modeFromHash)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [code, setCode] = useState('')
  const [verificationEmail, setVerificationEmail] = useState(() => {
    try { return sessionStorage.getItem(verificationEmailStorageKey) || '' } catch { return '' }
  })
  const [verificationEmailSent, setVerificationEmailSent] = useState(false)
  const [resendUntil, setResendUntil] = useState(() => {
    try { const value = Number(sessionStorage.getItem(verificationCooldownStorageKey)); return Number.isFinite(value) ? value : 0 } catch { return 0 }
  })
  const [clock, setClock] = useState(Date.now())
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const verificationStarted = useRef('')
  const emailChangeStarted = useRef('')
  const query = new URLSearchParams((window.location.hash.split('?')[1] || '').replace(/^\?/, ''))
  const resetToken = query.get('token') || ''

  useEffect(() => {
    const syncMode = () => setMode(modeFromHash())
    window.addEventListener('hashchange', syncMode)
    return () => window.removeEventListener('hashchange', syncMode)
  }, [])

  useEffect(() => {
    if (resendUntil <= Date.now()) return
    const timer = window.setInterval(() => setClock(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [resendUntil])

  useEffect(() => {
    if (mode !== 'verify-email' || !resetToken || verificationStarted.current === resetToken) return
    verificationStarted.current = resetToken
    setSubmitting(true)
    verifyEmail(resetToken).then(() => setMessage(t('profile.emailAddressVerified'))).catch(() => setError(t('errors.verifyEmail'))).finally(() => setSubmitting(false))
  }, [mode, resetToken])

  useEffect(() => {
    if (mode !== 'confirm-email-change' || !resetToken || emailChangeStarted.current === resetToken) return
    emailChangeStarted.current = resetToken
    setSubmitting(true)
    confirmEmailChange(resetToken).then(() => setMessage(t('profile.emailAddressVerified'))).catch(() => setError(t('errors.confirmEmailChange'))).finally(() => setSubmitting(false))
  }, [mode, resetToken])

  const changeMode = (nextMode: AuthMode) => {
    setMode(nextMode)
    setMessage('')
    setError('')
    window.location.hash = hashForMode(nextMode)
  }

  useEffect(() => {
    if (mode === 'verify-registration' && !verificationEmail) changeMode('signin')
  }, [mode, verificationEmail])

  const startResendCooldown = () => {
    const until = Date.now() + 60_000
    setResendUntil(until)
    setClock(Date.now())
    try { sessionStorage.setItem(verificationCooldownStorageKey, String(until)) } catch { /* browser storage is optional */ }
  }

  const enterRegistrationVerification = (targetEmail: string, emailSent: boolean) => {
    setVerificationEmail(targetEmail)
    setVerificationEmailSent(emailSent)
    setPassword('')
    setConfirmPassword('')
    try { sessionStorage.setItem(verificationEmailStorageKey, targetEmail) } catch { /* browser storage is optional */ }
    setCode('')
    setMode('verify-registration')
    setMessage('')
    setError(emailSent ? '' : t('errors.sendVerification'))
    startResendCooldown()
    window.location.hash = hashForMode('verify-registration')
  }

  const finishAuthentication = (user?: AuthUser) => {
    const intendedRoute = sessionStorage.getItem('nodeconnect_intended_route')
    sessionStorage.removeItem('nodeconnect_intended_route')
    const destination = user?.role === 'admin'
      ? (intendedRoute === '#admin' || intendedRoute === '#admin/activity' ? intendedRoute : '#admin')
      : (intendedRoute && !intendedRoute.startsWith('#admin') ? intendedRoute : '#dashboard')
    window.location.hash = destination
  }

  const submitAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage(''); setError(''); setSubmitting(true)
    try {
      if (mode === 'create') {
        const response = await register({ full_name: fullName, email, password, confirm_password: confirmPassword })
        setPassword('')
        setConfirmPassword('')
        enterRegistrationVerification(email, response.verification_email_sent === true)
      } else {
        const response = await login({ email, password })
        if (response.requires_2fa) {
          setCode('')
          changeMode('two-factor')
          setMessage(t('auth.enterSecondFactor'))
        } else {
          finishAuthentication(response.user)
        }
      }
    } catch (reason) {
      if (reason instanceof AuthApiError && reason.code === 'EMAIL_NOT_VERIFIED') {
        enterRegistrationVerification(email, reason.verificationEmailSent === true)
      } else {
        setError(t('errors.generic'))
      }
    } finally { setSubmitting(false) }
  }

  const submitRegistrationVerification = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true); setError(''); setMessage('')
    try {
      await verifyRegistrationEmailCode(verificationEmail, code)
      setCode(''); setPassword(''); setVerificationEmail('')
      setVerificationEmailSent(false)
      try {
        sessionStorage.removeItem(verificationEmailStorageKey)
        sessionStorage.removeItem(verificationCooldownStorageKey)
      } catch { /* browser storage is optional */ }
      setResendUntil(0)
      setMode('signin')
      setMessage(t('auth.registrationVerified'))
      window.location.hash = hashForMode('signin')
    } catch {
      setError(t('errors.verifyCode'))
    } finally { setSubmitting(false) }
  }

  const resendRegistrationCode = async () => {
    if (!verificationEmail || Math.ceil((resendUntil - clock) / 1000) > 0 || submitting) return
    setSubmitting(true); setError(''); setMessage('')
    startResendCooldown()
    try {
      await resendRegistrationVerificationCode(verificationEmail)
      setMessage(t('auth.verificationCodeRequested'))
    } catch {
      setError(t('errors.sendVerification'))
    } finally { setSubmitting(false) }
  }

  const submitForgot = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSubmitting(true); setError(''); setMessage('')
    try { await requestPasswordReset(email); setMessage(t('auth.sendResetLink')) }
    catch { setError(t('errors.processRequest')) }
    finally { setSubmitting(false) }
  }

  const submitReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSubmitting(true); setError(''); setMessage('')
    try {
      await resetPassword(resetToken, password, confirmPassword)
      setMessage(t('auth.resetPassword'))
      setPassword(''); setConfirmPassword('')
    } catch { setError(t('errors.resetPassword')) }
    finally { setSubmitting(false) }
  }

  const submitTwoFactor = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSubmitting(true); setError(''); setMessage('')
    try {
      const response = await verifyLoginTwoFactor(code)
      finishAuthentication(response.user)
    } catch { setError(t('errors.verifyCode')) }
    finally { setSubmitting(false) }
  }

  const specialMode = mode === 'forgot' || mode === 'reset-password' || mode === 'verify-email' || mode === 'verify-registration' || mode === 'confirm-email-change' || mode === 'two-factor'
  const titleKey = mode === 'forgot' ? 'auth.resetPasswordTitle' : mode === 'reset-password' ? 'auth.choosePasswordTitle' : mode === 'verify-email' || mode === 'verify-registration' ? 'auth.verifyEmailTitle' : mode === 'confirm-email-change' ? 'auth.confirmEmailChangeTitle' : mode === 'two-factor' ? 'auth.twoFactorTitle' : 'auth.welcome'
  const introKey = mode === 'forgot' ? 'auth.resetPasswordDescription' : mode === 'reset-password' ? 'auth.choosePasswordDescription' : mode === 'verify-email' ? 'auth.verifyingEmail' : mode === 'verify-registration' ? 'auth.registrationOtpDescription' : mode === 'confirm-email-change' ? 'auth.confirmingEmailChange' : mode === 'two-factor' ? 'auth.twoFactorDescription' : 'auth.intro'
  const resendSeconds = Math.max(0, Math.ceil((resendUntil - clock) / 1000))
  return <div className="auth-page"><header className="auth-header"><a className="auth-brand" href="#home"><img src={logo} alt="" /><span>NodeConnect</span></a><a className="auth-back" href="#home">{t('common.backHome')}</a></header><main className="auth-main"><section className="auth-card" aria-labelledby="auth-title"><div className="auth-orbit" aria-hidden="true"><span /></div><p className="auth-kicker">{t('auth.access')}</p><h1 id="auth-title">{t(titleKey)}</h1><p className="auth-intro">{t(introKey)}</p>
    {!specialMode && <div className="auth-tabs" role="tablist" aria-label={t('auth.access')}><button className={mode === 'create' ? 'is-active' : ''} type="button" role="tab" aria-selected={mode === 'create'} onClick={() => changeMode('create')}>{t('auth.createAccount')}</button><button className={mode === 'signin' ? 'is-active' : ''} type="button" role="tab" aria-selected={mode === 'signin'} onClick={() => changeMode('signin')}>{t('auth.signIn')}</button></div>}
    {(message || error) && <p className={error ? 'auth-message is-error' : 'auth-message'} role={error ? 'alert' : 'status'}>{error || message}</p>}
    {(mode === 'create' || mode === 'signin') && <form onSubmit={submitAuth}>{mode === 'create' && <label>{t('common.fullName')}<input type="text" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder={t('auth.yourFullName')} autoComplete="name" maxLength={150} required disabled={submitting} /></label>}<label>{t('common.emailAddress')}<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={t('auth.emailPlaceholder')} autoComplete="email" required disabled={submitting} /></label><label>{t('common.password')}<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={t('auth.enterPassword')} autoComplete={mode === 'create' ? 'new-password' : 'current-password'} minLength={mode === 'create' ? 12 : undefined} maxLength={128} required disabled={submitting} /></label>{mode === 'create' ? <label>{t('common.confirmPassword')}<input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder={t('auth.confirmYourPassword')} autoComplete="new-password" required disabled={submitting} /></label> : <button className="forgot-link" type="button" onClick={() => changeMode('forgot')}>{t('auth.forgotPassword')}</button>}<button className="auth-primary" type="submit" disabled={submitting}>{submitting ? t('common.pleaseWait') : mode === 'create' ? t('auth.createAccount') : t('auth.signIn')}</button></form>}
    {mode === 'forgot' && <form onSubmit={submitForgot}><label>{t('common.emailAddress')}<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={t('auth.emailPlaceholder')} autoComplete="email" required disabled={submitting} /></label><button className="auth-primary" type="submit" disabled={submitting}>{submitting ? t('common.pleaseWait') : t('auth.sendResetLink')}</button></form>}
    {mode === 'reset-password' && <form onSubmit={submitReset}><label>{t('auth.newPassword')}<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" minLength={12} maxLength={128} required disabled={submitting} /></label><label>{t('auth.confirmNewPassword')}<input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" minLength={12} maxLength={128} required disabled={submitting} /></label><button className="auth-primary" type="submit" disabled={submitting || !resetToken}>{submitting ? t('common.pleaseWait') : t('auth.resetPassword')}</button></form>}
    {mode === 'verify-registration' && <><p className="auth-message">{verificationEmailSent ? t('auth.verificationCodeSentTo', { email: maskEmailAddress(verificationEmail) }) : <>{t('common.emailAddress')}: {maskEmailAddress(verificationEmail)}</>}</p><form onSubmit={submitRegistrationVerification}><label>{t('auth.verificationCode')}<input type="text" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} pattern="[0-9]{6}" maxLength={6} required disabled={submitting} /></label><button className="auth-primary" type="submit" disabled={submitting || code.length !== 6}>{submitting ? t('common.pleaseWait') : t('auth.verifyEmailCode')}</button></form><button className="forgot-link" type="button" onClick={() => void resendRegistrationCode()} disabled={submitting || resendSeconds > 0 || !verificationEmail}>{resendSeconds > 0 ? t('auth.resendCooldown', { seconds: resendSeconds }) : t('auth.resendCode')}</button></>}
    {(mode === 'verify-email' || mode === 'confirm-email-change') && !submitting && !message && !error && <p className="auth-message is-error">{t('auth.invalidSecureLink')}</p>}
    {mode === 'two-factor' && <form onSubmit={submitTwoFactor}><label>{t('auth.authenticatorOrRecovery')}<input type="text" inputMode="text" autoComplete="one-time-code" value={code} onChange={(event) => setCode(event.target.value)} maxLength={40} required disabled={submitting} /></label><button className="auth-primary" type="submit" disabled={submitting}>{submitting ? t('auth.verifying') : t('auth.verifyAndSignIn')}</button></form>}
    {specialMode && mode !== 'verify-email' && <button className="forgot-link" type="button" onClick={() => changeMode('signin')}>{t('nav.signIn')}</button>}
    {mode === 'create' && <p className="terms-copy">{t('auth.terms')}</p>}
    </section></main></div>
}
