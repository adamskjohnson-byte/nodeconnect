import { useEffect, useState } from 'react'
import Home from './pages/Home'
import Roadmap from './pages/Roadmap'
import TransactionHistory from './pages/TransactionHistory'
import Staking from './pages/Staking'
import Tokenomics from './pages/Tokenomics'
import ConnectWallet from './pages/ConnectWallet'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import MyNodes from './pages/MyNodes'
import AdminActivity from './pages/AdminActivity'
import AdminDashboard from './pages/AdminDashboard'
import { getCurrentUser, type AuthUser } from './lib/authApi'
import { trackActivity } from './lib/activityApi'
import { getPreferences } from './lib/accountApi'
import { setSoundPreferences } from './lib/soundService'
import { changeAppLanguage } from './lib/i18n'

const normalProtectedHashes = new Set(['#dashboard', '#connect-wallet', '#staking', '#tokenomics', '#roadmap', '#transaction-history', '#referrals', '#my-nodes', '#profile', '#settings'])
const adminProtectedHashes = new Set(['#admin', '#admin/activity'])
const intendedRouteKey = 'nodeconnect_intended_route'

export default function App() {
	const [hash, setHash] = useState(() => window.location.hash)
	const [authUser, setAuthUser] = useState<AuthUser | null>(null)
	const [authChecked, setAuthChecked] = useState(false)
	const [savedTheme, setSavedTheme] = useState(() => {
		try {
			const preferences = localStorage.getItem('nodeconnect_preferences')
			return preferences ? (JSON.parse(preferences) as { theme?: string }).theme || 'dark' : 'dark'
		} catch {
			return 'dark'
		}
	})

	useEffect(() => {
		let active = true
		getCurrentUser().then((user) => {
			if (active) setAuthUser(user)
		}).catch(() => {
			if (active) setAuthUser(null)
		})
		return () => { active = false }
	}, [])

	useEffect(() => {
		let active = true
		if (!authUser) return () => { active = false }
		getPreferences().then((preferences) => {
			if (!active) return
			setSavedTheme(preferences.theme)
			setSoundPreferences(preferences.sound_enabled, preferences.sound_volume)
			void changeAppLanguage(preferences.language)
			try { localStorage.setItem('nodeconnect_preferences', JSON.stringify(preferences)) } catch { /* storage is optional */ }
		}).catch(() => undefined)
		return () => { active = false }
	}, [authUser])

	useEffect(() => {
		const applyTheme = () => {
			const theme = savedTheme === 'system'
				? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
				: savedTheme
			document.documentElement.dataset.theme = theme
		}
		applyTheme()
		const media = window.matchMedia('(prefers-color-scheme: light)')
		media.addEventListener('change', applyTheme)
		return () => media.removeEventListener('change', applyTheme)
	}, [savedTheme])

	useEffect(() => {
		try {
			if (sessionStorage.getItem('nodeconnect_site_visit_tracked') !== '1') {
				sessionStorage.setItem('nodeconnect_site_visit_tracked', '1')
				trackActivity('site_visit')
			}
		} catch {
			trackActivity('site_visit')
		}
	}, [])

	useEffect(() => {
		const handleHashChange = () => setHash(window.location.hash)
		window.addEventListener('hashchange', handleHashChange)
		return () => window.removeEventListener('hashchange', handleHashChange)
	}, [])

	useEffect(() => {
		const isAdminRoute = adminProtectedHashes.has(hash)
		if (!normalProtectedHashes.has(hash) && !isAdminRoute) {
			setAuthChecked(true)
			return
		}

		let active = true
		setAuthChecked(false)
		getCurrentUser().then((user) => {
			if (!active) return
			setAuthUser(user)
			if (!user) {
				if (isAdminRoute) {
					sessionStorage.setItem(intendedRouteKey, hash)
					window.location.hash = '#auth?mode=signin'
				}
				return
			}
			if (isAdminRoute && user.role !== 'admin') window.location.hash = '#dashboard'
			setAuthChecked(true)
		}).catch(() => {
			if (active) {
				setAuthUser(null)
				setAuthChecked(true)
			}
		})

		return () => { active = false }
	}, [hash])

	if ((normalProtectedHashes.has(hash) || adminProtectedHashes.has(hash)) && !authChecked) return null

	if (hash.startsWith('#auth')) return <Auth />
	if (hash === '#roadmap') return <Roadmap embedded />
	if (hash === '#transaction-history') return <TransactionHistory embedded />
	if (hash === '#referrals') return <Dashboard />
	if (hash === '#staking') return <Staking embedded />
	if (hash === '#tokenomics') return <Tokenomics embedded />
	if (hash === '#connect-wallet') return <ConnectWallet />
	if (hash === '#dashboard') return <Dashboard />
	if (hash === '#profile') return <Profile />
	if (hash === '#settings') return <Settings />
	if (hash === '#my-nodes') return <MyNodes />
	if (hash === '#admin') return authUser?.role === 'admin' ? <AdminDashboard /> : <Home />
	if (hash === '#admin/activity') return authUser?.role === 'admin' ? <AdminActivity /> : <Home />
	return <Home />
}