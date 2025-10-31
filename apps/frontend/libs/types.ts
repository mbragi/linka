export interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

export interface User {
  email: string
  name: string
  username?: string
  walletAddress: string
  onboardingCompleted: boolean
}

export interface WalletBalance {
  balance: string
  currency: string
  walletAddress: string
  network?: {
    name: string
    chainId: number
  }
}

export interface CreateIdentityRequest {
  email: string
  profile?: {
    name?: string
    bio?: string
    categories?: string[]
    location?: string
    website?: string
  }
  consentGiven: boolean
}

export interface SignInRequest {
  email: string
}

export interface AgentMessageRequest {
  message: string
  threadId?: string
  channel?: string
  userEmail?: string
  senderAddress?: string
  conversationId?: string
}

export interface AgentMessageResponse {
  response: string
  miniAppShared?: boolean
  miniAppUrl?: string
  miniAppType?: string
  toolResults?: any
}

export interface Vendor {
  id: string
  email: string
  walletAddress: string
  profile: {
    name: string
    bio: string
    categories: string[]
    location: string
    website?: string
  }
  reputation: {
    score: number
    totalTransactions: number
    completedTransactions: number
  }
}

export interface VendorDiscoveryProps {
  onClose: () => void
}

export interface WalletFundProps {
  onClose: () => void
  walletAddress?: string
  networkInfo?: {
    name: string
    chainId: number
  }
  onBalanceRefresh?: () => void
}

export interface OnboardingModalProps {
  onComplete: (userData: any) => void
  onSignIn: (email: string) => void
  isNewUser?: boolean
}

export type OnboardingStep = 'welcome' | 'consent' | 'identity' | 'google' | 'wallet' | 'complete'

