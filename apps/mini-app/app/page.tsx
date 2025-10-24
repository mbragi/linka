'use client'

import { useState, useEffect } from 'react'
import { Wallet, Search, ShoppingBag, ArrowRight, ChevronRight } from 'lucide-react'
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
  walletAddress: string
  onboardingCompleted: boolean
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isCheckingUser, setIsCheckingUser] = useState(true)

  useEffect(() => {
    checkUserSession()
  }, [])

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
    }
  }, [user, isInitialized])

  const checkUserSession = async () => {
    try {
      const storedUser = localStorage.getItem('linka_user')
      if (storedUser) {
        const userData = JSON.parse(storedUser)
        setUser(userData)
        setIsCheckingUser(false)
        return
      }
    } catch (error) {
      console.error('Error checking user session:', error)
    }
    
    setIsCheckingUser(false)
    setShowOnboarding(true)
  }
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showWalletFund, setShowWalletFund] = useState(false)
  const [showVendorDiscovery, setShowVendorDiscovery] = useState(false)

  const quickActions = [
    { icon: Search, label: 'Find Vendors', action: 'search' },
    { icon: Wallet, label: 'Fund Wallet', action: 'fund' },
    { icon: ShoppingBag, label: 'Browse Marketplace', action: 'browse' }
  ]

  const handleOnboardingComplete = (userData: any) => {
    setUser({
      email: userData.email,
      name: userData.name,
      walletAddress: userData.walletAddress,
      onboardingCompleted: true
    })
    setShowOnboarding(false)
  }

  const handleSignIn = (email: string) => {
    setUser({
      email,
      name: 'User', // Will be updated from API response
      walletAddress: '',
      onboardingCompleted: true
    })
    setShowOnboarding(false)
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
      fund: 'I want to fund my wallet',
      browse: 'Show me the marketplace'
    }
    handleSendMessage(actionTexts[action as keyof typeof actionTexts])
  }

  if (isCheckingUser) {
    return (
      <div className="min-h-screen bg-linka-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-linka-emerald border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (showOnboarding) {
    return (
      <OnboardingModal 
        onComplete={handleOnboardingComplete}
        onSignIn={handleSignIn}
      />
    )
  }

  return (
    <div className="min-h-screen bg-linka-white flex flex-col">
      {/* Header */}
      <div className="bg-linka-black text-linka-white p-4 flex items-center justify-between">
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
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-linka-emerald rounded-full"></div>
          <span className="text-sm">Online</span>
        </div>
      </div>

      {/* Chat Messages */}
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

      {/* Quick Actions */}
      <div className="p-4 border-t border-linka-blue">
        <div className="grid grid-cols-3 gap-3 mb-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleQuickAction(action.action)}
              className="flex items-center space-x-3 p-3 bg-white border border-linka-blue rounded-xl hover:bg-linka-blue transition-colors"
            >
              <action.icon className="w-5 h-5 text-linka-emerald" />
              <span className="text-sm font-medium text-linka-black">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-linka-blue bg-white">
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
        <WalletFund onClose={() => setShowWalletFund(false)} />
      )}

      {/* Vendor Discovery Modal */}
      {showVendorDiscovery && (
        <VendorDiscovery onClose={() => setShowVendorDiscovery(false)} />
      )}
    </div>
  )
}
