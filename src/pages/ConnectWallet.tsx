import { useCallback, useState } from 'react'
import logo from '../assets/icons/Icon-5.svg'
import walletMark from '../assets/wallet-mark.svg'
import WalletFlow from '../components/WalletFlow'
import { wallets, type WalletConfig } from '../components/walletConfig'
import '../styles/wallet.css'
import { useAppTranslation } from '../lib/i18n'

export default function ConnectWallet() {
  const t = useAppTranslation()
  const [selectedWallet, setSelectedWallet] = useState<WalletConfig | null>(null)
  const goBack = useCallback(() => {
    if (window.history.length > 1) window.history.back()
    else window.location.hash = '#home'
  }, [])
  if (selectedWallet) return <WalletFlow wallet={selectedWallet} onCancel={() => setSelectedWallet(null)} onRetry={() => setSelectedWallet({ ...selectedWallet })} />
  const providerGroup = (titleKey: 'wallet.popularWallets' | 'wallet.otherWallets', group: WalletConfig['group']) => <div className="wallet-group"><h3>{t(titleKey)}</h3><div className="wallet-providers">{wallets.filter((wallet) => wallet.group === group).map((wallet) => <button className="wallet-provider" type="button" key={wallet.id} onClick={() => setSelectedWallet(wallet)}><span className="provider-icon"><img src={wallet.icon} alt="" /></span><strong>{wallet.name}</strong>{wallet.popular && <em>{t('wallet.popular')}</em>}</button>)}</div></div>
  return <div className="connect-wallet-page"><header className="connect-wallet-header"><a className="wallet-brand" href="#home"><img src={logo} alt="" /><span>NodeConnect</span></a><button className="wallet-close" type="button" aria-label={t('wallet.closePage')} onClick={goBack}>×</button></header><main className="wallet-screen"><div className="wallet-intro"><div className="wallet-mark" aria-hidden="true"><img src={walletMark} alt="" /></div><h1>{t('wallet.title')}</h1><p>{t('wallet.selectProvider')}</p></div><div className="wallet-groups">{providerGroup('wallet.popularWallets', 'Popular Wallets')}{providerGroup('wallet.otherWallets', 'Other Wallets')}</div><div className="wallet-footer"><button type="button" onClick={goBack}>ⓘ {t('wallet.web3Wallet')}</button><button type="button" onClick={goBack}>{t('wallet.goBack')}</button></div></main></div>
}