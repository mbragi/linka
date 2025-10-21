'use client'

import { useState } from 'react'
import { MessageCircle, Wallet, Search, ShoppingBag, ArrowRight } from 'lucide-react'
import WalletFund from '../components/WalletFund'
import VendorDiscovery from '../components/VendorDiscovery'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Welcome to Linka! I\'m here to help you discover vendors, chat naturally, and pay onchain. What would you like to do today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showWalletFund, setShowWalletFund] = useState(false)
  const [showVendorDiscovery, setShowVendorDiscovery] = useState(false)

  const quickActions = [
    { icon: Search, label: 'Find Vendors', action: 'search' },
    { icon: Wallet, label: 'Fund Wallet', action: 'fund' },
    { icon: ShoppingBag, label: 'Browse Marketplace', action: 'browse' },
    { icon: MessageCircle, label: 'Start Chat', action: 'chat' }
  ]

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsTyping(true)

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I understand you want to ' + text.toLowerCase() + '. Let me help you with that!',
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botResponse])
      setIsTyping(false)
    }, 1000)
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
      browse: 'Show me the marketplace',
      chat: 'I want to start chatting'
    }
    handleSendMessage(actionTexts[action as keyof typeof actionTexts])
  }

  return (
    <div className="min-h-screen bg-linka-white flex flex-col">
      {/* Header */}
      <div className="bg-linka-black text-linka-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-linka-emerald rounded-lg flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Linka</h1>
            <p className="text-sm text-linka-blue">Conversations that close onchain</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-linka-emerald rounded-full"></div>
          <span className="text-sm">Online</span>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
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
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
        <div className="grid grid-cols-2 gap-3 mb-4">
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
