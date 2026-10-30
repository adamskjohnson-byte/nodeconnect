import { useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import WalletSelector from '../components/WalletSelector'
import chatIcon from '../assets/icons/Icon-1.svg'
import sendIcon from '../assets/icons/Icon-2.svg'
import catIcon from '../assets/icons/Icon-3.svg'
import leafIcon from '../assets/icons/Icon-18.svg'
import serverIcon from '../assets/icons/Icon-6.svg'
import shieldIcon from '../assets/icons/Icon-8.svg'
import shieldCheckIcon from '../assets/icons/Icon-9.svg'
import boltIcon from '../assets/icons/Icon-14.svg'
import giftIcon from '../assets/icons/Icon-16.svg'
import networkIcon from '../assets/icons/Icon-17.svg'
import lockIcon from '../assets/icons/Icon-19.svg'
import listIcon from '../assets/icons/Icon-20.svg'
import buildingIcon from '../assets/icons/Icon-22.svg'
import hexIcon from '../assets/icons/Icon-23.svg'
import globeIcon from '../assets/icons/Icon.svg'
import '../styles/resolve-issue.css'

const selectedIssueKey = 'nodeconnect_selected_issue'

const issueCategories = [
  { name: 'Migration Issue', icon: networkIcon },
  { name: 'Assist Recovery', icon: shieldCheckIcon },
  { name: 'Rectification', icon: boltIcon },
  { name: 'Validate', icon: shieldIcon },
  { name: 'Gas Fee', icon: boltIcon },
  { name: 'Claim Reflection', icon: giftIcon },
  { name: 'Swap / Exchange', icon: sendIcon },
  { name: 'Staking Issue', icon: leafIcon },
  { name: 'Cross-Chain Transfer', icon: networkIcon },
  { name: 'Transaction Error', icon: listIcon },
  { name: 'Slippage Error', icon: listIcon },
  { name: 'dApp Reconnection', icon: globeIcon },
  { name: 'Login Issue', icon: lockIcon },
  { name: 'Claim Airdrop', icon: giftIcon },
  { name: 'NFT', icon: hexIcon },
  { name: 'Missing / Irregular Balance', icon: serverIcon },
  { name: 'Threat Scan', icon: shieldIcon },
  { name: 'Wallet Insurance', icon: shieldCheckIcon },
  { name: 'Wallet Whitelist', icon: listIcon },
  { name: 'Stolen Purchase', icon: buildingIcon },
  { name: 'Locked Account', icon: lockIcon },
  { name: 'Transaction Delay', icon: chatIcon },
  { name: 'Wallet Retriever', icon: catIcon },
  { name: 'Other Issues', icon: hexIcon },
] as const

function savedIssue(): string {
  try {
    const issue = sessionStorage.getItem(selectedIssueKey)
    return issueCategories.some((category) => category.name === issue) ? issue || '' : ''
  } catch {
    return ''
  }
}

export default function ResolveIssue() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState(savedIssue)
  const [walletSelectorOpen, setWalletSelectorOpen] = useState(false)

  const selectIssue = (issue: string) => {
    setSelectedIssue(issue)
    try { sessionStorage.setItem(selectedIssueKey, issue) } catch { /* storage is optional */ }
    setWalletSelectorOpen(true)
  }

  const clearIssue = () => {
    setSelectedIssue('')
    try { sessionStorage.removeItem(selectedIssueKey) } catch { /* storage is optional */ }
  }

  return <div className="site-shell resolve-issue-page">
    <Header activePage="home" menuOpen={menuOpen} onMenuToggle={() => setMenuOpen((open) => !open)} />
    <main className="resolve-issue-main">
      <header className="resolve-issue-heading">
        <span className="resolve-issue-eyebrow">NODECONNECT SUPPORT</span>
        <h1>Resolve Issue</h1>
        <p>Select a protocol to initialize.</p>
      </header>
      {selectedIssue && <div className="resolve-issue-selection" role="status">
        <span>Selected protocol: <strong>{selectedIssue}</strong></span>
        <button type="button" onClick={clearIssue}>Choose another</button>
      </div>}
      <section className="resolve-issue-grid" aria-label="Issue categories">
        {issueCategories.map((category) => <button
          className={`resolve-issue-card${selectedIssue === category.name ? ' is-selected' : ''}`}
          type="button"
          key={category.name}
          aria-pressed={selectedIssue === category.name}
          onClick={() => selectIssue(category.name)}
        >
          <span className="resolve-issue-icon"><img src={category.icon} alt="" /></span>
          <span className="resolve-issue-name">{category.name}</span>
          <span className="resolve-issue-arrow" aria-hidden="true">›</span>
        </button>)}
      </section>
    </main>
    <Footer />
    {walletSelectorOpen && <WalletSelector onClose={() => setWalletSelectorOpen(false)} />}
  </div>
}
