import metamask from '../assets/icons/wallet-metamask.svg'
import walletConnect from '../assets/icons/wallet-walletconnect.svg'
import coinbase from '../assets/icons/wallet-coinbase.svg'
import trust from '../assets/icons/wallet-trust.svg'
import phantom from '../assets/icons/wallet-phantom.svg'
import solflare from '../assets/icons/wallet-solflare.svg'
import rabby from '../assets/icons/wallet-rabby.svg'

export type WalletId = 'metamask' | 'walletconnect' | 'coinbase' | 'trust' | 'phantom' | 'solflare' | 'rabby'
export type WalletConfig = { id: WalletId; name: string; icon: string; group: 'Popular Wallets' | 'Other Wallets'; popular?: boolean; network: 'evm' | 'solana'; method: string }

export const wallets: WalletConfig[] = [
  { id: 'metamask', name: 'MetaMask', icon: metamask, group: 'Popular Wallets', popular: true, network: 'evm', method: 'Injected EIP-1193 provider' },
  { id: 'walletconnect', name: 'WalletConnect', icon: walletConnect, group: 'Popular Wallets', network: 'evm', method: 'Reown/WalletConnect configuration' },
  { id: 'coinbase', name: 'Coinbase Wallet', icon: coinbase, group: 'Popular Wallets', network: 'evm', method: 'Coinbase Wallet provider' },
  { id: 'trust', name: 'Trust Wallet', icon: trust, group: 'Other Wallets', network: 'evm', method: 'Injected EIP-1193 provider' },
  { id: 'phantom', name: 'Phantom', icon: phantom, group: 'Other Wallets', network: 'solana', method: 'Phantom Solana provider' },
  { id: 'solflare', name: 'Solflare', icon: solflare, group: 'Other Wallets', network: 'solana', method: 'Solflare Solana provider' },
  { id: 'rabby', name: 'Rabby Wallet', icon: rabby, group: 'Other Wallets', network: 'evm', method: 'Injected EIP-1193 provider' },
]

export const walletById = (id: WalletId) => wallets.find((wallet) => wallet.id === id)!
