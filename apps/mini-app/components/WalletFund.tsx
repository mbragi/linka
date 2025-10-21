'use client'

import { useState } from 'react'
import { Wallet, CreditCard, ArrowRight, CheckCircle } from 'lucide-react'

interface WalletFundProps {
  onClose: () => void
}

export default function WalletFund({ onClose }: WalletFundProps) {
  const [step, setStep] = useState<'method' | 'amount' | 'processing' | 'success'>('method')
  const [selectedMethod, setSelectedMethod] = useState<'bread' | 'card'>('bread')
  const [amount, setAmount] = useState('')

  const fundingMethods = [
    {
      id: 'bread',
      name: 'Bread.africa',
      description: 'Bank transfer & virtual account',
      icon: Wallet,
      recommended: true
    },
    {
      id: 'card',
      name: 'Card Payment',
      description: 'Credit/debit card via Paystack',
      icon: CreditCard,
      recommended: false
    }
  ]

  const handleFundWallet = () => {
    setStep('processing')
    // Simulate processing
    setTimeout(() => {
      setStep('success')
    }, 2000)
  }

  if (step === 'success') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-linka-emerald mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-linka-black mb-2">Wallet Funded!</h3>
            <p className="text-gray-600 mb-6">
              Your wallet has been successfully funded with ${amount}. You can now start making payments onchain.
            </p>
            <button
              onClick={onClose}
              className="w-full bg-linka-emerald text-white py-3 rounded-xl font-medium hover:bg-green-600 transition-colors"
            >
              Continue to Linka
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-linka-black">Fund Your Wallet</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        {step === 'method' && (
          <div>
            <p className="text-gray-600 mb-4">Choose your preferred funding method:</p>
            <div className="space-y-3">
              {fundingMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id as 'bread' | 'card')}
                  className={`w-full p-4 border rounded-xl text-left transition-colors ${
                    selectedMethod === method.id
                      ? 'border-linka-emerald bg-linka-blue'
                      : 'border-gray-200 hover:border-linka-blue'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <method.icon className="w-6 h-6 text-linka-emerald" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-linka-black">{method.name}</span>
                        {method.recommended && (
                          <span className="text-xs bg-linka-emerald text-white px-2 py-1 rounded-full">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{method.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep('amount')}
              className="w-full mt-6 bg-linka-emerald text-white py-3 rounded-xl font-medium hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 'amount' && (
          <div>
            <p className="text-gray-600 mb-4">Enter the amount you want to fund:</p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (USD)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-linka-emerald focus:border-transparent"
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setStep('method')}
                className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleFundWallet}
                disabled={!amount || parseFloat(amount) <= 0}
                className="flex-1 bg-linka-emerald text-white py-3 rounded-xl font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Fund Wallet
              </button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 border-4 border-linka-emerald border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-linka-black mb-2">Processing Payment</h3>
            <p className="text-gray-600">
              Please wait while we process your ${amount} payment...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}


