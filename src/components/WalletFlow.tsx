import { useEffect, useState } from 'react'
import type { WalletConfig, WalletId } from './walletConfig'
import logo from '../assets/icons/Icon-5.svg'

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
    if (!provider) return { status: 'unavailable', message: `${wallet.name} isn't available in this browser.` }
    try {
      const response = await provider.connect()
      const address = response.publicKey?.toString()
      return address ? { status: 'connected', address: shorten(address) } : { status: 'error', message: 'The wallet did not return a public address.' }
    } catch (error) {
      if (error instanceof Error && /reject|denied|cancel/i.test(error.message)) return { status: 'rejected', message: 'Connection request was rejected.' }
      return { status: 'error', message: 'The wallet connection could not be completed.' }
    }
  }

  if (wallet.id === 'walletconnect') return { status: 'unavailable', message: 'WalletConnect needs a project configuration before it can connect.' }
  const provider = window.ethereum
  if (!provider) return { status: 'unavailable', message: `${wallet.name} isn't available in this browser.` }
  try {
    const accounts = await provider.request({ method: 'eth_requestAccounts' }) as string[]
    return accounts?.[0] ? { status: 'connected', address: shorten(accounts[0]) } : { status: 'error', message: 'The wallet did not return a public address.' }
  } catch (error) {
    if (error instanceof Error && /reject|denied|cancel/i.test(error.message)) return { status: 'rejected', message: 'Connection request was rejected.' }
    return { status: 'error', message: 'The wallet connection could not be completed.' }
  }
}

export default function WalletFlow({ wallet, onCancel, onRetry }: WalletFlowProps) {
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
  const heading = isConnecting ? `Confirm in ${wallet.name}` : result.status === 'connected' ? `${wallet.name} Connected` : `Connect ${wallet.name}`
  const description = isConnecting
    ? `Open the ${wallet.name} browser extension or mobile app to authorize and connect your wallet to NodeConnect.`
    : result.status === 'connected'
      ? `Your ${wallet.name} wallet is connected to NodeConnect.`
      : result.message
  const retry = () => { setResult({ status: 'connecting' }); onRetry() }

  return <div className="wallet-flow-page"><header className="wallet-flow-header"><a className="wallet-brand" href="#home"><img className="wallet-flow-logo" src={logo} alt="" /><span>NodeConnect</span></a><button className="wallet-menu" type="button" aria-label="Open navigation"><i /><i /><i /></button></header><main className="wallet-flow-main"><div className={`flow-orb ${isConnecting ? 'is-connecting' : result.status}`}><span className="flow-cross" /></div><div className="flow-status"><i /> {isConnecting ? 'CONNECTING...' : result.status.toUpperCase()}</div><h1>{heading}</h1><p>{description}</p>{isConnecting && <div className="flow-progress"><span /></div>}{result.status === 'connected' && <div className="flow-address">Public address <strong>{result.address}</strong></div>}{!isConnecting && result.status !== 'connected' && <p className="flow-method">Method: {wallet.method}</p>}<div className="flow-actions">{!isConnecting && result.status !== 'connected' && <button className="flow-primary" type="button" onClick={retry}>Try Again</button>}{result.status === 'connected' ? <button className="flow-primary" type="button" onClick={onCancel}>Continue</button> : null}<button className="flow-secondary" type="button" onClick={onCancel}>{result.status === 'connected' ? 'Disconnect View' : 'Cancel Connection'}</button></div><button className="flow-help" type="button" onClick={onCancel}>ⓘ &nbsp; Need help connecting?</button></main></div>
}
