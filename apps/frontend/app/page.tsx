'use client'

import { useState, useEffect } from 'react'
import { Wallet, Search, ShoppingBag, ArrowRight, ChevronRight, User, LogOut } from 'lucide-react'
import WalletFund from '../components/WalletFund'
import VendorDiscovery from '../components/VendorDiscovery'
import OnboardingModal from '../components/OnboardingModal'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

interface User {
  email: string
  name: string
  username?: string
  walletAddress: string
  onboardingCompleted: boolean
}

interface WalletBalance {
  balance: string
  currency: string
  walletAddress: string
  network?: {
    name: string
    chainId: number
  }
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isCheckingUser, setIsCheckingUser] = useState(false)
  const [isNewUser, setIsNewUser] = useState(true)
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null)
  const [showAnonymousHome, setShowAnonymousHome] = useState(true)

  useEffect(() => {
    checkUserSession()
  }, [])

  useEffect(() => {
    const storedUser = localStorage.getItem('linka_user')
    setShowAnonymousHome(!storedUser)
  }, [user])

  useEffect(() => {
    if (user && !isInitialized) {
      setMessages([
        {
          id: '1',
          text: `Welcome back, ${user.name}! I'm here to help you discover vendors, chat naturally, and pay onchain. What would you like to do today?`,
          sender: 'bot',
          timestamp: new Date()
        }
      ])
      setIsInitialized(true)
      fetchWalletBalance()
    }
  }, [user, isInitialized])

  const fetchWalletBalance = async () => {
    if (!user) return
    
    try {
      console.debug('Fetching wallet balance for user:', user.email)
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'
      console.debug('Backend URL:', backendUrl)
      const response = await fetch(`${backendUrl}/api/identity/${user.email}/wallet/balance`)
      const data = await response.json()
      
      if (data.success) {
        setWalletBalance(data.data)
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error)
    }
  }

  const checkUserSession = async () => {
    try {
      const storedUser = localStorage.getItem('linka_user')
      if (storedUser) {
        const userData = JSON.parse(storedUser)
        setUser({
          email: userData.email,
          name: userData.name,
          username: userData.username,
          walletAddress: userData.walletAddress,
          onboardingCompleted: userData.onboardingCompleted
        })
        setShowAnonymousHome(false)
        return
      }
    } catch (error) {
      console.error('Error checking user session:', error)
    }
    
    setShowAnonymousHome(true)
  }
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showWalletFund, setShowWalletFund] = useState(false)
  const [showVendorDiscovery, setShowVendorDiscovery] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const quickActions = [
    { icon: Search, label: 'Find Vendors', action: 'search' },
    { icon: Wallet, label: 'Manage Wallet', action: 'fund' }
  ]

  const anonymousQuickActions = [
    { icon: Search, label: 'Find Vendors', action: 'find-vendors' },
    { icon: ShoppingBag, label: 'Become a Vendor', action: 'become-vendor' },
    { icon: User, label: 'Sign In', action: 'sign-in' }
  ]

  const handleOnboardingComplete = (userData: any) => {
    setUser({
      email: userData.email,
      name: userData.name,
      username: userData.username,
      walletAddress: userData.walletAddress,
      onboardingCompleted: true
    })
    setShowOnboarding(false)
    fetchWalletBalance()
  }

  const handleSignIn = (email: string) => {
    setUser({
      email,
      name: 'User', // Will be updated from API response
      walletAddress: '',
      onboardingCompleted: true
    })
    setShowOnboarding(false)
    fetchWalletBalance()
  }

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !user) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsTyping(true)

    try {
      // Call AgentKit API with user context
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text.trim(),
          threadId: 'web-user',
          channel: 'web',
          userEmail: user.email
        }),
      })

      const data = await response.json()

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, botResponse])
    } catch (error) {
      console.error('Error calling AgentKit API:', error)
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I\'m having trouble connecting right now. Please try again later.',
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorResponse])
    } finally {
      setIsTyping(false)
    }
  }

  const handleQuickAction = (action: string) => {
    // Anonymous user actions
    if (showAnonymousHome) {
      if (action === 'sign-in') {
        setIsNewUser(false)
        setShowOnboarding(true)
        return
      }
      if (action === 'become-vendor') {
        setIsNewUser(true)
        setShowOnboarding(true)
        return
      }
      if (action === 'find-vendors') {
        setShowVendorDiscovery(true)
        return
      }
      return
    }

    // Authenticated user actions
    if (action === 'fund') {
      setShowWalletFund(true)
      return
    }
    
    if (action === 'search') {
      setShowVendorDiscovery(true)
      return
    }
    
    const actionTexts = {
      search: 'I want to find vendors',
      fund: 'I want to fund my wallet'
    }
    handleSendMessage(actionTexts[action as keyof typeof actionTexts])
  }

  const handleLogout = () => {
    localStorage.removeItem('linka_user')
    setUser(null)
    setShowAnonymousHome(true)
    setMessages([])
    setIsInitialized(false)
    setShowUserMenu(false)
  }

  if (showOnboarding) {
    return (
      <OnboardingModal 
        onComplete={handleOnboardingComplete}
        onSignIn={handleSignIn}
        isNewUser={isNewUser}
      />
    )
  }

  // Anonymous home screen
  if (showAnonymousHome) {
    return (
      <div className="min-h-screen bg-linka-white flex flex-col">
        {/* Header */}
        <div className="bg-linka-black text-linka-white p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-linka-emerald rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Linka</h1>
              <p className="text-sm text-linka-blue">Discover, Chat, and Pay on Base</p>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-linka-black mb-4">
              Conversations that close onchain
            </h2>
            <p className="text-gray-600 mb-8">
              Discover vendors, chat naturally, and make secure payments through conversation. 
              All powered by AI on the Base blockchain.
            </p>

            {/* Quick Actions for Anonymous Users */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {anonymousQuickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action.action)}
                  className="flex flex-col items-center space-y-2 p-4 bg-white border border-linka-blue rounded-xl hover:bg-linka-blue transition-colors"
                >
                  <action.icon className="w-8 h-8 text-linka-emerald" />
                  <span className="text-sm font-medium text-linka-black">{action.label}</span>
                </button>
              ))}
            </div>

            <p className="text-sm text-gray-500">
              Sign in to access wallet management and make purchases
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Authenticated home screen
  return (
    <div className="h-screen bg-linka-white flex flex-col">
      {/* Header */}
      <div className="bg-linka-black text-linka-white p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-linka-emerald rounded-lg flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Linka</h1>
            <div className="flex items-center space-x-1 text-sm text-linka-blue">
              <span>Home</span>
              <ChevronRight className="w-3 h-3" />
              <span>Chat</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {walletBalance && (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 bg-linka-blue px-3 py-1 rounded-lg hover:bg-linka-emerald transition-colors cursor-pointer"
              >
              <Wallet className="w-4 h-4 text-linka-emerald" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-linka-black">
                  {walletBalance.balance} {walletBalance.currency}
                </span>
                {walletBalance.network && (
                  <span className="text-xs text-gray-600">
                    {walletBalance.network.name} ({walletBalance.network.chainId})
                  </span>
                )}
              </div>
              </button>
              
              {/* User Dropdown Menu */}
              {showUserMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-linka-blue z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-linka-blue">
                      <p className="text-sm font-medium text-linka-black">{user?.name}</p>
                      {user?.username && (
                        <p className="text-xs text-linka-emerald font-semibold">@{user.username}.linka</p>
                      )}
                      <p className="text-xs text-gray-600 truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-red-50 transition-colors text-left group"
                    >
                      <LogOut className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-medium text-linka-black group-hover:text-red-500">Log out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-linka-emerald rounded-full"></div>
            <span className="text-sm">Online</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-linka-blue bg-white flex-shrink-0">
        <div className="flex gap-3">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleQuickAction(action.action)}
              className="flex items-center justify-center gap-2 flex-1 p-3 bg-white border border-linka-blue rounded-xl hover:bg-linka-blue transition-colors"
            >
              <action.icon className="w-5 h-5 text-linka-emerald" />
              <span className="text-sm font-medium text-linka-black">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages - Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length > 0 && messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                message.sender === 'user'
                  ? 'bg-linka-emerald text-white'
                  : 'bg-white text-linka-black border border-linka-blue'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <p className={`text-xs mt-1 ${
                message.sender === 'user' ? 'text-green-100' : 'text-gray-500'
              }`}>
                {message.timestamp.getHours().toString().padStart(2, '0')}:{message.timestamp.getMinutes().toString().padStart(2, '0')}
              </p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white text-linka-black border border-linka-blue px-4 py-2 rounded-2xl">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-linka-emerald rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-linka-emerald rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-linka-emerald rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input - Fixed at Bottom */}
      <div className="p-4 border-t border-linka-blue bg-white flex-shrink-0">
        <div className="flex space-x-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 border border-linka-blue rounded-xl focus:outline-none focus:ring-2 focus:ring-linka-emerald focus:border-transparent"
          />
          <button
            onClick={() => handleSendMessage(inputText)}
            disabled={!inputText.trim()}
            className="px-4 py-3 bg-linka-emerald text-white rounded-xl hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Wallet Fund Modal */}
        {showWalletFund && (
          <WalletFund 
            onClose={() => setShowWalletFund(false)} 
            walletAddress={user?.walletAddress}
            networkInfo={walletBalance?.network}
            onBalanceRefresh={fetchWalletBalance}
          />
        )}

      {/* Vendor Discovery Modal */}
      {showVendorDiscovery && (
        <VendorDiscovery onClose={() => setShowVendorDiscovery(false)} />
      )}
    </div>
  )
}
