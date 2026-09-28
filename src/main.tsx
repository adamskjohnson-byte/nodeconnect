import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { i18nReady } from './lib/i18n'
import { installGlobalSoundInteractions } from './lib/soundService'
import './styles/globals.css'
import './styles/home.css'
import './styles/wallet.css'
import './styles/auth.css'
import './styles/account-theme.css'
import './styles/rtl.css'

installGlobalSoundInteractions()
void i18nReady.then(() => createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>))