import { useCallback, useState } from 'react'
import logo from '../assets/icons/Icon-5.svg'
import walletMark from '../assets/wallet-mark.svg'
import WalletFlow from '../components/WalletFlow'
import { wallets, type WalletConfig } from '../components/walletConfig'
import '../styles/wallet.css'

export default function ConnectWallet() {
  const [selectedWallet, setSelectedWallet] = useState<WalletConfig | null>(null)
  const goBack = useCallback(() => {
    if (window.history.length > 1) window.history.back()
    else window.location.hash = '#home'
  }, [])
  if (selectedWallet) return <WalletFlow wallet={selectedWallet} onCancel={() => setSelectedWallet(null)} onRetry={() => setSelectedWallet({ ...selectedWallet })} />
  const providerGroup = (title: string) => <div className="wallet-group"><h3>{title}</h3><div className="wallet-providers">{wallets.filter((wallet) => wallet.group === title).map((wallet) => <button className="wallet-provider" type="button" key={wallet.id} onClick={() => setSelectedWallet(wallet)}><span className="provider-icon"><img src={wallet.icon} alt="" /></span><strong>{wallet.name}</strong>{wallet.popular && <em>Popular</em>}</button>)}</div></div>
  return <div className="connect-wallet-page"><header className="connect-wallet-header"><a className="wallet-brand" href="#home"><img src={logo} alt="" /><span>NodeConnect</span></a><button className="wallet-close" type="button" aria-label="Close wallet page" onClick={goBack}>×</button></header><main className="wallet-screen"><div className="wallet-intro"><div className="wallet-mark" aria-hidden="true"><img src={walletMark} alt="" /></div><h1>Connect Wallet</h1><p>Select a provider to access the NodeConnect<br className="wallet-desktop-break" /> ecosystem and manage your nodes.</p></div><div className="wallet-groups">{providerGroup('Popular Wallets')}{providerGroup('Other Wallets')}</div><div className="wallet-footer"><button type="button" onClick={goBack}>ⓘ Web3 Wallet?</button><button type="button" onClick={goBack}>Go Back</button></div></main></div>
}