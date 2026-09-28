import { useEffect, useState } from 'react'
import type { WalletConfig, WalletId } from './walletConfig'
import logo from '../assets/icons/Icon-5.svg'
import { useAppTranslation } from '../lib/i18n'

type FlowStatus = 'connecting' | 'connected' | 'rejected' | 'unavailable' | 'error'
type FlowResult = { status: FlowStatus; address?: string; message?: string }
type WalletFlowProps = { wallet: WalletConfig; onCancel: () => void; onRetry: () => void }

type EthereumProvider = { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> }
type SolanaProvider = { connect: () => Promise<{ publicKey?: { toString: () => string } }> }

declare global {
  interface Window {
    ethereum?: EthereumProvider & { isMetaMask?: boolean; isRabby?: boolean; isCoinbaseWallet?: boolean; isTrust?: boolean }
    phantom?: { solana?: SolanaProvider }
    solflare?: SolanaProvider
  }
}

const shorten = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`

async function connectWallet(wallet: WalletConfig): Promise<FlowResult> {
  if (wallet.network === 'solana') {
    const provider = wallet.id === 'phantom' ? window.phantom?.solana : window.solflare
    if (!provider) return { status: 'unavailable' }
    try {
      const response = await provider.connect()
      const address = response.publicKey?.toString()
      return address ? { status: 'connected', address: shorten(address) } : { status: 'error' }
    } catch (error) {
      if (error instanceof Error && /reject|denied|cancel/i.test(error.message)) return { status: 'rejected' }
      return { status: 'error' }
    }
  }

  if (wallet.id === 'walletconnect') return { status: 'unavailable' }
  const provider = window.ethereum
  if (!provider) return { status: 'unavailable' }
  try {
    const accounts = await provider.request({ method: 'eth_requestAccounts' }) as string[]
    return accounts?.[0] ? { status: 'connected', address: shorten(accounts[0]) } : { status: 'error' }
  } catch (error) {
    if (error instanceof Error && /reject|denied|cancel/i.test(error.message)) return { status: 'rejected' }
    return { status: 'error' }
  }
}

export default function WalletFlow({ wallet, onCancel, onRetry }: WalletFlowProps) {
  const t = useAppTranslation()
  const [result, setResult] = useState<FlowResult>({ status: 'connecting' })

  useEffect(() => {
    let active = true
    const timer = window.setTimeout(async () => {
      const next = await connectWallet(wallet)
      if (active) setResult(next)
    }, 2000)
    return () => { active = false; window.clearTimeout(timer) }
  }, [wallet])

  const isConnecting = result.status === 'connecting'
  const heading = isConnecting ? t('wallet.confirmIn', { wallet: wallet.name }) : result.status === 'connected' ? t('wallet.connectedNamed', { wallet: wallet.name }) : t('wallet.connectNamed', { wallet: wallet.name })
  const description = isConnecting
    ? t('wallet.openProvider', { wallet: wallet.name })
    : result.status === 'connected'
      ? t('wallet.connectedDescription', { wallet: wallet.name })
      : result.message || (result.status === 'unavailable' && wallet.id === 'walletconnect' ? t('wallet.projectConfigNeeded') : result.status === 'unavailable' ? t('wallet.unavailable', { wallet: wallet.name }) : result.status === 'rejected' ? t('wallet.rejected') : t('wallet.connectionFailed'))
  const statusText = isConnecting ? t('wallet.connecting') : t(`wallet.status${result.status[0].toUpperCase()}${result.status.slice(1)}`)
  const retry = () => { setResult({ status: 'connecting' }); onRetry() }

  return <div className="wallet-flow-page"><header className="wallet-flow-header"><a className="wallet-brand" href="#home"><img className="wallet-flow-logo" src={logo} alt="" /><span>NodeConnect</span></a><button className="wallet-menu" type="button" aria-label={t('wallet.openNavigation')}><i /><i /><i /></button></header><main className="wallet-flow-main"><div className={`flow-orb ${isConnecting ? 'is-connecting' : result.status}`}><span className="flow-cross" /></div><div className="flow-status"><i /> {statusText}</div><h1>{heading}</h1><p>{description}</p>{isConnecting && <div className="flow-progress"><span /></div>}{result.status === 'connected' && <div className="flow-address">{t('wallet.publicAddress')} <strong>{result.address}</strong></div>}{!isConnecting && result.status !== 'connected' && <p className="flow-method">{t('wallet.method', { method: wallet.method })}</p>}<div className="flow-actions">{!isConnecting && result.status !== 'connected' && <button className="flow-primary" type="button" onClick={retry}>{t('wallet.tryAgain')}</button>}{result.status === 'connected' ? <button className="flow-primary" type="button" onClick={onCancel}>{t('wallet.continue')}</button> : null}<button className="flow-secondary" type="button" onClick={onCancel}>{result.status === 'connected' ? t('wallet.disconnectView') : t('wallet.cancelConnection')}</button></div><button className="flow-help" type="button" onClick={onCancel}>ⓘ &nbsp; {t('wallet.needHelp')}</button></main></div>
}
