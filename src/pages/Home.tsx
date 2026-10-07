import { useState } from 'react'
import Header from '../components/Header'
import Hero from '../components/Hero'
import LandingVideo from '../components/LandingVideo'
import WhyNodeConnect from '../components/WhyNodeConnect'
import StakingPromotion from '../components/StakingPromotion'
import TokenOverview from '../components/TokenOverview'
import ClaimSection from '../components/ClaimSection'
import OfficialReception from '../components/OfficialReception'
import Footer from '../components/Footer'
import '../styles/landing-video.css'

const telegramSupportUrl = 'https://t.me/CAPNOYnetworkcommunitysupportbot'

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false)
  return <div className="site-shell"><Header activePage="home" walletHref={telegramSupportUrl} signInHref="#auth" menuOpen={menuOpen} onMenuToggle={() => setMenuOpen((open) => !open)} /><main><Hero /><LandingVideo /><WhyNodeConnect /><StakingPromotion /><TokenOverview /><ClaimSection /><OfficialReception /></main><Footer /></div>
}