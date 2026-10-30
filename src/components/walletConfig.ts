import atomic from '../assets/icons/Atomic.jpg'
import cardano from '../assets/icons/Cardano.png'
import coinbase from '../assets/icons/coinbase.png'
import coreLightning from '../assets/icons/Core-lightning.png'
import cosmostation from '../assets/icons/Cosmostation.png'
import dappnode from '../assets/icons/DAppNode.png'
import fetch from '../assets/icons/Fetch.png'
import keepkey from '../assets/icons/KeepKey.png'
import keplr from '../assets/icons/keplr.png'
import ledger from '../assets/icons/ledger.png'
import metamask from '../assets/icons/metamask.png'
import monero from '../assets/icons/Monero.jpg'
import myether from '../assets/icons/myether.jpg'
import phantom from '../assets/icons/phantom.png'
import polygon from '../assets/icons/Polygon.png'
import rainbow from '../assets/icons/rainbow.jpg'
import safepal from '../assets/icons/safepal.webp'
import solflare from '../assets/icons/wallet-solflare.svg'
import rabby from '../assets/icons/wallet-rabby.svg'
import trezor from '../assets/icons/Trezorx.png'
import trust from '../assets/icons/Trustwallet.png'
import verus from '../assets/icons/Verus.png'
import wander from '../assets/icons/Wander.png'
import xumm from '../assets/icons/Xaman.png'
import okx from '../assets/icons/oxk.png'

export type WalletId = 'metamask' | 'okx' | 'walletconnect' | 'coinbase' | 'trust' | 'phantom' | 'solflare' | 'rabby' | 'ledger' | 'trezor' | 'dappnode' | 'wander' | 'bitcoin-core' | 'core-lightning' | 'monero' | 'verus' | 'cardano' | 'rainbow' | 'fetch' | 'cosmostation' | 'keplr' | 'bsc' | 'myetherwallet' | 'safepal' | 'atomic' | 'keepkey' | 'exodus' | 'polygon' | 'xumm'
export type WalletConfig = { id: WalletId; name: string; icon: string; group: 'Popular Wallets' | 'Other Wallets'; popular?: boolean; network: 'evm' | 'solana' | 'unsupported'; method: string }

export const wallets: WalletConfig[] = [
  { id: 'metamask', name: 'MetaMask', icon: metamask, group: 'Popular Wallets', popular: true, network: 'evm', method: 'Injected EIP-1193 provider' },
  { id: 'okx', name: 'OKX Wallet', icon: okx, group: 'Popular Wallets', popular: true, network: 'evm', method: 'OKX Wallet EIP-1193 provider' },
  { id: 'walletconnect', name: 'WalletConnect', icon: '', group: 'Popular Wallets', network: 'evm', method: 'Reown/WalletConnect configuration' },
  { id: 'coinbase', name: 'Coinbase Wallet', icon: coinbase, group: 'Popular Wallets', network: 'evm', method: 'Coinbase Wallet provider' },
  { id: 'phantom', name: 'Phantom', icon: phantom, group: 'Popular Wallets', popular: true, network: 'solana', method: 'Phantom Solana provider' },
  { id: 'trust', name: 'Trust Wallet', icon: trust, group: 'Popular Wallets', popular: true, network: 'evm', method: 'Injected EIP-1193 provider' },
  { id: 'ledger', name: 'Ledger', icon: ledger, group: 'Popular Wallets', popular: true, network: 'unsupported', method: 'Ledger hardware wallet integration' },
  { id: 'trezor', name: 'Trezor', icon: trezor, group: 'Popular Wallets', popular: true, network: 'unsupported', method: 'Trezor hardware wallet integration' },
  { id: 'dappnode', name: 'DAppNode Wallet', icon: dappnode, group: 'Other Wallets', network: 'unsupported', method: 'DAppNode wallet provider integration' },
  { id: 'wander', name: 'Wander Wallet', icon: wander, group: 'Other Wallets', network: 'unsupported', method: 'Wander wallet provider integration' },
  { id: 'bitcoin-core', name: 'Bitcoin Core', icon: '', group: 'Other Wallets', network: 'unsupported', method: 'Bitcoin Core wallet integration' },
  { id: 'core-lightning', name: 'Core-lightning', icon: coreLightning, group: 'Other Wallets', network: 'unsupported', method: 'Core Lightning wallet integration' },
  { id: 'monero', name: 'Monero Wallet', icon: monero, group: 'Other Wallets', network: 'unsupported', method: 'Monero wallet provider integration' },
  { id: 'verus', name: 'Verus Wallet', icon: verus, group: 'Other Wallets', network: 'unsupported', method: 'Verus wallet provider integration' },
  { id: 'cardano', name: 'Cardano Wallet', icon: cardano, group: 'Other Wallets', network: 'unsupported', method: 'Cardano CIP-30 wallet integration' },
  { id: 'rainbow', name: 'Rainbow Wallet', icon: rainbow, group: 'Other Wallets', network: 'unsupported', method: 'Rainbow Wallet provider integration' },
  { id: 'fetch', name: 'Fetch Wallet', icon: fetch, group: 'Other Wallets', network: 'unsupported', method: 'Fetch wallet provider integration' },
  { id: 'cosmostation', name: 'Cosmostation', icon: cosmostation, group: 'Other Wallets', network: 'unsupported', method: 'Cosmostation wallet provider integration' },
  { id: 'keplr', name: 'Keplr Wallet', icon: keplr, group: 'Other Wallets', network: 'unsupported', method: 'Keplr wallet provider integration' },
  { id: 'bsc', name: 'BSC Wallet', icon: '', group: 'Other Wallets', network: 'unsupported', method: 'BSC wallet provider integration' },
  { id: 'myetherwallet', name: 'MyEtherWallet', icon: myether, group: 'Other Wallets', network: 'unsupported', method: 'MyEtherWallet provider integration' },
  { id: 'safepal', name: 'SafePal', icon: safepal, group: 'Other Wallets', network: 'unsupported', method: 'SafePal wallet provider integration' },
  { id: 'atomic', name: 'Atomic Wallet', icon: atomic, group: 'Other Wallets', network: 'unsupported', method: 'Atomic wallet provider integration' },
  { id: 'keepkey', name: 'KeepKey', icon: keepkey, group: 'Other Wallets', network: 'unsupported', method: 'KeepKey hardware wallet integration' },
  { id: 'exodus', name: 'Exodus', icon: '', group: 'Other Wallets', network: 'unsupported', method: 'Exodus wallet provider integration' },
  { id: 'polygon', name: 'Polygon Wallet', icon: polygon, group: 'Other Wallets', network: 'unsupported', method: 'Polygon wallet provider integration' },
  { id: 'xumm', name: 'Xumm App Wallet', icon: xumm, group: 'Other Wallets', network: 'unsupported', method: 'Xumm wallet provider integration' },
  { id: 'solflare', name: 'Solflare', icon: solflare, group: 'Other Wallets', network: 'solana', method: 'Solflare Solana provider' },
  { id: 'rabby', name: 'Rabby Wallet', icon: rabby, group: 'Other Wallets', network: 'evm', method: 'Injected EIP-1193 provider' },
]

export const walletById = (id: WalletId) => wallets.find((wallet) => wallet.id === id)!
