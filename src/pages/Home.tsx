import { useState } from 'react'
import Header from '../components/Header'
import WalletSelector from '../components/WalletSelector'
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
  const [walletSelectorOpen, setWalletSelectorOpen] = useState(false)
  return <div className="site-shell">
    <Header activePage="home" walletHref={telegramSupportUrl} signInHref="#auth" menuOpen={menuOpen} onMenuToggle={() => setMenuOpen((open) => !open)} />
    <main>
      <section className="intro-hero" aria-labelledby="intro-hero-title">
        <h1 id="intro-hero-title"><span>The easiest way</span><span>to <strong>power</strong> <b>Web3</b></span></h1>
        <p>Your comprehensive protocol for resolving node issues, clearing network cache, and facilitating decentralized application connections without compromise.</p>
        <div className="intro-hero-actions">
          <a className="intro-hero-primary" href="#resolve-issue">Explore Node</a>
          <button className="intro-hero-secondary" type="button" onClick={() => setWalletSelectorOpen(true)}>Connect Wallet</button>
        </div>
      </section>
      <Hero />
      <LandingVideo />
      <WhyNodeConnect />
      <StakingPromotion />
      <TokenOverview />
      <ClaimSection />
      <OfficialReception />
    </main>
    <Footer />
    {walletSelectorOpen && <WalletSelector onClose={() => setWalletSelectorOpen(false)} />}
  </div>
}