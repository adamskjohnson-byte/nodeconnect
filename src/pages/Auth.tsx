import { FormEvent, useEffect, useState } from 'react'
import logo from '../assets/icons/Icon-5.svg'
import { login, register } from '../lib/authApi'
import '../styles/auth.css'

type AuthMode = 'create' | 'signin'

function getInitialAuthMode(): AuthMode {
  const hash = window.location.hash || '#auth'
  const [, query = ''] = hash.split('?')
  const params = new URLSearchParams(query)
  return params.get('mode') === 'signin' ? 'signin' : 'create'
}

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>(getInitialAuthMode)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const syncModeFromHash = () => {
      const nextMode = getInitialAuthMode()
      setMode(nextMode)
    }

    window.addEventListener('hashchange', syncModeFromHash)
    return () => window.removeEventListener('hashchange', syncModeFromHash)
  }, [])

  const setAuthMode = (nextMode: AuthMode) => {
    setMode(nextMode)
    setMessage('')
    if (nextMode === 'signin') {
      window.location.hash = '#auth?mode=signin'
      return
    }
    window.location.hash = '#auth'
  }

  const submitAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')
    setSubmitting(true)
    try {
      const response = mode === 'create'
        ? await register({ full_name: fullName, email, password, confirm_password: confirmPassword })
        : await login({ email, password })
      const user = response.user
      const intendedRoute = sessionStorage.getItem('nodeconnect_intended_route')
      sessionStorage.removeItem('nodeconnect_intended_route')
      const destination = user?.role === 'admin'
        ? (intendedRoute === '#admin' || intendedRoute === '#admin/activity' ? intendedRoute : '#admin')
        : (intendedRoute && !intendedRoute.startsWith('#admin') ? intendedRoute : '#dashboard')
      window.location.hash = destination
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return <div className="auth-page"><header className="auth-header"><a className="auth-brand" href="#home"><img src={logo} alt="" /><span>NodeConnect</span></a><a className="auth-back" href="#home">Back to home</a></header><main className="auth-main"><section className="auth-card" aria-labelledby="auth-title"><div className="auth-orbit" aria-hidden="true"><span /></div><p className="auth-kicker">NODECONNECT ACCESS</p><h1 id="auth-title">Welcome to NodeConnect</h1><p className="auth-intro">Create an account or sign in to continue to the NodeConnect ecosystem.</p><div className="auth-tabs" role="tablist" aria-label="Authentication mode"><button className={mode === 'create' ? 'is-active' : ''} type="button" role="tab" aria-selected={mode === 'create'} onClick={() => setAuthMode('create')}>Create Account</button><button className={mode === 'signin' ? 'is-active' : ''} type="button" role="tab" aria-selected={mode === 'signin'} onClick={() => setAuthMode('signin')}>Sign In</button></div>{message && <p className="auth-message" role="alert">{message}</p>}<form onSubmit={submitAuth}>{mode === 'create' && <label>Full Name<input type="text" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Your full name" autoComplete="name" disabled={submitting} /></label>}<label>Email Address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" disabled={submitting} /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" autoComplete={mode === 'create' ? 'new-password' : 'current-password'} disabled={submitting} /></label>{mode === 'create' ? <label>Confirm Password<input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Confirm your password" autoComplete="new-password" disabled={submitting} /></label> : <a className="forgot-link" href="#auth">Forgot Password?</a>}<button className="auth-primary" type="submit" disabled={submitting}>{submitting ? 'Please wait...' : mode === 'create' ? 'Create Account' : 'Sign In'}</button></form>{mode === 'create' && <p className="terms-copy">By creating an account, you agree to the NodeConnect terms and privacy policy.</p>}</section></main></div>
}