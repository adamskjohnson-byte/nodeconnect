import { useEffect, useRef, useState, type FormEvent } from 'react'
import logo from '../assets/icons/Icon-5.svg'
import { login, register, verifyLoginTwoFactor, type AuthUser } from '../lib/authApi'
import { requestPasswordReset, resetPassword, verifyEmail } from '../lib/accountApi'
import '../styles/auth.css'

type AuthMode = 'create' | 'signin' | 'forgot' | 'reset-password' | 'verify-email' | 'two-factor'

function modeFromHash(): AuthMode {
  const params = new URLSearchParams((window.location.hash.split('?')[1] || '').replace(/^\?/, ''))
  const mode = params.get('mode')
  return ['create', 'signin', 'forgot', 'reset-password', 'verify-email', 'two-factor'].includes(mode || '') ? mode as AuthMode : 'create'
}

function hashForMode(mode: AuthMode): string {
  return mode === 'create' ? '#auth' : `#auth?mode=${mode}`
}

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>(modeFromHash)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const verificationStarted = useRef('')
  const query = new URLSearchParams((window.location.hash.split('?')[1] || '').replace(/^\?/, ''))
  const resetToken = query.get('token') || ''

  useEffect(() => {
    const syncMode = () => setMode(modeFromHash())
    window.addEventListener('hashchange', syncMode)
    return () => window.removeEventListener('hashchange', syncMode)
  }, [])

  useEffect(() => {
    if (mode !== 'verify-email' || !resetToken || verificationStarted.current === resetToken) return
    verificationStarted.current = resetToken
    setSubmitting(true)
    verifyEmail(resetToken).then((response) => setMessage(response.message)).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Unable to verify this email address.')).finally(() => setSubmitting(false))
  }, [mode, resetToken])

  const changeMode = (nextMode: AuthMode) => {
    setMode(nextMode)
    setMessage('')
    setError('')
    window.location.hash = hashForMode(nextMode)
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
        finishAuthentication(response.user)
      } else {
        const response = await login({ email, password })
        if (response.requires_2fa) {
          setCode('')
          changeMode('two-factor')
          setMessage(response.message || 'Enter your authenticator or recovery code.')
        } else {
          finishAuthentication(response.user)
        }
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Something went wrong. Please try again.')
    } finally { setSubmitting(false) }
  }

  const submitForgot = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSubmitting(true); setError(''); setMessage('')
    try { setMessage((await requestPasswordReset(email)).message) }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to process this request.') }
    finally { setSubmitting(false) }
  }

  const submitReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSubmitting(true); setError(''); setMessage('')
    try {
      setMessage((await resetPassword(resetToken, password, confirmPassword)).message)
      setPassword(''); setConfirmPassword('')
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to reset your password.') }
    finally { setSubmitting(false) }
  }

  const submitTwoFactor = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSubmitting(true); setError(''); setMessage('')
    try {
      const response = await verifyLoginTwoFactor(code)
      finishAuthentication(response.user)
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to verify this code.') }
    finally { setSubmitting(false) }
  }

  const specialMode = mode === 'forgot' || mode === 'reset-password' || mode === 'verify-email' || mode === 'two-factor'
  return <div className="auth-page"><header className="auth-header"><a className="auth-brand" href="#home"><img src={logo} alt="" /><span>NodeConnect</span></a><a className="auth-back" href="#home">Back to home</a></header><main className="auth-main"><section className="auth-card" aria-labelledby="auth-title"><div className="auth-orbit" aria-hidden="true"><span /></div><p className="auth-kicker">NODECONNECT ACCESS</p><h1 id="auth-title">{mode === 'forgot' ? 'Reset your password' : mode === 'reset-password' ? 'Choose a new password' : mode === 'verify-email' ? 'Verify your email' : mode === 'two-factor' ? 'Two-factor verification' : 'Welcome to NodeConnect'}</h1><p className="auth-intro">{mode === 'forgot' ? 'Enter your account email and we will send a reset link if the account can be found.' : mode === 'reset-password' ? 'Choose a new password for your NodeConnect account.' : mode === 'verify-email' ? 'Verifying the secure link for your account.' : mode === 'two-factor' ? 'Enter your six-digit authenticator code or a single-use recovery code.' : 'Create an account or sign in to continue to the NodeConnect ecosystem.'}</p>
    {!specialMode && <div className="auth-tabs" role="tablist" aria-label="Authentication mode"><button className={mode === 'create' ? 'is-active' : ''} type="button" role="tab" aria-selected={mode === 'create'} onClick={() => changeMode('create')}>Create Account</button><button className={mode === 'signin' ? 'is-active' : ''} type="button" role="tab" aria-selected={mode === 'signin'} onClick={() => changeMode('signin')}>Sign In</button></div>}
    {(message || error) && <p className={error ? 'auth-message is-error' : 'auth-message'} role={error ? 'alert' : 'status'}>{error || message}</p>}
    {(mode === 'create' || mode === 'signin') && <form onSubmit={submitAuth}>{mode === 'create' && <label>Full Name<input type="text" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Your full name" autoComplete="name" maxLength={150} required disabled={submitting} /></label>}<label>Email Address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required disabled={submitting} /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" autoComplete={mode === 'create' ? 'new-password' : 'current-password'} minLength={mode === 'create' ? 12 : undefined} maxLength={128} required disabled={submitting} /></label>{mode === 'create' ? <label>Confirm Password<input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Confirm your password" autoComplete="new-password" required disabled={submitting} /></label> : <button className="forgot-link" type="button" onClick={() => changeMode('forgot')}>Forgot Password?</button>}<button className="auth-primary" type="submit" disabled={submitting}>{submitting ? 'Please wait...' : mode === 'create' ? 'Create Account' : 'Sign In'}</button></form>}
    {mode === 'forgot' && <form onSubmit={submitForgot}><label>Email Address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required disabled={submitting} /></label><button className="auth-primary" type="submit" disabled={submitting}>{submitting ? 'Please wait...' : 'Send Reset Link'}</button></form>}
    {mode === 'reset-password' && <form onSubmit={submitReset}><label>New Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" minLength={12} maxLength={128} required disabled={submitting} /></label><label>Confirm New Password<input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" minLength={12} maxLength={128} required disabled={submitting} /></label><button className="auth-primary" type="submit" disabled={submitting || !resetToken}>{submitting ? 'Please wait...' : 'Reset Password'}</button></form>}
    {mode === 'verify-email' && !submitting && !message && <p className="auth-message is-error">This verification link is invalid or expired.</p>}
    {mode === 'two-factor' && <form onSubmit={submitTwoFactor}><label>Authenticator or recovery code<input type="text" inputMode="text" autoComplete="one-time-code" value={code} onChange={(event) => setCode(event.target.value)} maxLength={40} required disabled={submitting} /></label><button className="auth-primary" type="submit" disabled={submitting}>{submitting ? 'Verifying...' : 'Verify and Sign In'}</button></form>}
    {specialMode && mode !== 'verify-email' && <button className="forgot-link" type="button" onClick={() => changeMode('signin')}>Back to Sign In</button>}
    {mode === 'create' && <p className="terms-copy">By creating an account, you agree to the NodeConnect terms and privacy policy.</p>}
    </section></main></div>
}
