import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './lib/i18n'
import './styles/globals.css'
import './styles/home.css'
import './styles/wallet.css'
import './styles/auth.css'
import './styles/account-theme.css'
import './styles/rtl.css'

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)