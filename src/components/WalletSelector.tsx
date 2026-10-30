import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import logo from '../assets/icons/Icon-5.svg'
import WalletFlow from './WalletFlow'
import { wallets, type WalletConfig } from './walletConfig'

type WalletSelectorProps = { onClose: () => void }

export default function WalletSelector({ onClose }: WalletSelectorProps) {
  const [selectedWallet, setSelectedWallet] = useState<WalletConfig | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionSuccessful, setConnectionSuccessful] = useState(false)
  const [isFinalStep, setIsFinalStep] = useState(false)
  const [manualConnect, setManualConnect] = useState(false)
  const [nodeIdScreen, setNodeIdScreen] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const onCloseRef = useRef(onClose)
  const connectingRef = useRef(isConnecting)
  onCloseRef.current = onClose
  connectingRef.current = isConnecting

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !connectingRef.current) {
        event.preventDefault()
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab' || !dialogRef.current) return
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])'))
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      previousFocus?.focus()
    }
  }, [])

  const close = () => {
    if (!isConnecting) onClose()
  }

  const selectWallet = (wallet: WalletConfig) => {
    setSelectedWallet(wallet)
    setIsConnecting(true)
    setConnectionSuccessful(false)
    setIsFinalStep(false)
  }

  const renderWallets = (group: WalletConfig['group']) => wallets.filter((wallet) => wallet.group === group).map((wallet) => <button className="wallet-picker-row" type="button" key={wallet.id} onClick={() => selectWallet(wallet)}>
      <span className="wallet-picker-icon">{wallet.icon && <img src={wallet.icon} alt="" />}</span>
      <span className="wallet-picker-name">{wallet.name}</span>
      <span className="wallet-picker-chevron" aria-hidden="true">›</span>
    </button>)

  return createPortal(<div className="wallet-picker-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget && !isConnecting) close() }}>
    <div className="wallet-picker-dialog" role="dialog" aria-modal="true" aria-labelledby="wallet-picker-title" aria-describedby={connectionSuccessful ? undefined : 'wallet-picker-subtitle'} ref={dialogRef}>
      <header className="wallet-picker-header">
        <a className="wallet-picker-brand" href="#home" onClick={close}><img src={logo} alt="" /><span>NodeConnect</span></a>
        <button className="wallet-picker-close" type="button" aria-label="Close wallet selector" disabled={isConnecting} ref={closeButtonRef} onClick={close}>×</button>
      </header>
      {!connectionSuccessful && !isFinalStep && <div className={`wallet-picker-intro${manualConnect ? ' is-manual' : ''}`}>
        <span className="wallet-picker-mark" aria-hidden="true">{manualConnect && selectedWallet?.icon ? <img src={selectedWallet.icon} alt="" /> : '↗'}</span>
        <h2 id="wallet-picker-title">{nodeIdScreen ? 'Submit NodeConnect ID' : manualConnect ? 'Manual Connection' : 'Connect Wallet'}</h2>
        <p id="wallet-picker-subtitle">{nodeIdScreen ? 'Provide your correct NodeConnect ID' : manualConnect ? 'How can we assist you?' : 'Choose your preferred wallet'}</p>
      </div>}
      {selectedWallet ? <WalletFlow
        wallet={selectedWallet}
        presentation="modal"
        onDone={onClose}
        onConnectionStatusChange={setConnectionSuccessful}
        onFinalStepChange={setIsFinalStep}
        manualConnect={manualConnect}
        onManualConnectChange={setManualConnect}
        nodeIdScreen={nodeIdScreen}
        onNodeIdScreenChange={setNodeIdScreen}
        onCancel={() => { setSelectedWallet(null); setIsConnecting(false); setConnectionSuccessful(false); setIsFinalStep(false); setManualConnect(false); setNodeIdScreen(false) }}
        onTryAnother={() => { setSelectedWallet(null); setIsConnecting(false); setConnectionSuccessful(false); setIsFinalStep(false); setManualConnect(false); setNodeIdScreen(false) }}
        onRetry={() => { setConnectionSuccessful(false); setSelectedWallet((wallet) => wallet ? { ...wallet } : null) }}
        onConnectingChange={setIsConnecting}
      /> : <div className="wallet-picker-list">
        <section className="wallet-picker-group" aria-labelledby="wallet-picker-popular">
          <h3 id="wallet-picker-popular">POPULAR</h3>
          {renderWallets('Popular Wallets')}
        </section>
        <section className="wallet-picker-group" aria-labelledby="wallet-picker-other">
          <h3 id="wallet-picker-other">OTHER WALLETS</h3>
          {renderWallets('Other Wallets')}
        </section>
      </div>}
    </div>
  </div>, document.body)
}