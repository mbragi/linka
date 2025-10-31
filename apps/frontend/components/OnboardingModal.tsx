'use client'

import { useState } from 'react'
import { CheckCircle, ArrowRight, User, Mail, Lock, Shield, Wallet } from 'lucide-react'
import { createIdentity, signIn } from '../libs/backend'
import type { OnboardingModalProps, OnboardingStep } from '../libs/types'

export default function OnboardingModal({ onComplete, onSignIn, isNewUser = true }: OnboardingModalProps) {
  const [step, setStep] = useState<OnboardingStep>(isNewUser ? 'welcome' : 'identity')
  const [currentIsNewUser, setCurrentIsNewUser] = useState(isNewUser)
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    consentGiven: false,
    googleId: '',
    walletAddress: '',
    encryptedPrivateKey: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const steps = currentIsNewUser ? [
    { id: 'welcome', title: 'Welcome', icon: User },
    { id: 'identity', title: 'Identity', icon: Mail },
    { id: 'consent', title: 'Consent', icon: Shield },
    { id: 'google', title: 'Google', icon: Lock },
    { id: 'wallet', title: 'Wallet', icon: Wallet },
    { id: 'complete', title: 'Complete', icon: CheckCircle }
  ] : [
    { id: 'identity', title: 'Sign In', icon: Mail },
    { id: 'complete', title: 'Complete', icon: CheckCircle }
  ]

  const currentStepIndex = steps.findIndex(s => s.id === step)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  const handleNext = () => {
    if (step === 'welcome') {
      setStep('identity')
    } else if (step === 'identity') {
      if (!formData.email || !formData.name) {
        setError('Please fill in all required fields')
        return
      }
      if (currentIsNewUser) {
        if (!formData.username || !formData.password || !formData.confirmPassword) {
          setError('Please fill in all required fields')
          return
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match')
          return
        }
        if (formData.password.length < 8) {
          setError('Password must be at least 8 characters')
          return
        }
        setStep('consent')
      } else {
        // For returning users, check password
        if (!formData.password) {
          setError('Please enter your password')
          return
        }
        handleSignIn()
        return
      }
    } else if (step === 'consent') {
      if (!formData.consentGiven) {
        setError('Please accept the terms to continue')
        return
      }
      setStep('google')
    } else if (step === 'google') {
      setStep('wallet')
    } else if (step === 'wallet') {
      setStep('complete')
    }
    setError('')
  }

  const handleSkipGoogle = () => {
    setStep('wallet')
  }

  const handleCreateAccount = async () => {
    setIsLoading(true)
    setError('')

    try {
      const data = await createIdentity({
        email: formData.email,
        profile: {
          name: formData.name,
        },
        consentGiven: formData.consentGiven,
      })

      if (!data.success) {
        throw new Error(data.error || 'Failed to create account')
      }

      localStorage.setItem('linka_user', JSON.stringify({
        email: formData.email,
        name: formData.name,
        username: formData.username,
        walletAddress: data.data.walletAddress,
        onboardingCompleted: true
      }))

      setFormData(prev => ({
        ...prev,
        walletAddress: data.data.walletAddress
      }))

      setStep('complete')
    } catch (error) {
      console.error('Error creating account:', error)
      setError(error instanceof Error ? error.message : 'Failed to create account')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignIn = async () => {
    if (!formData.email || !formData.password) {
      setError('Please enter your email and password')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const data = await signIn({
        email: formData.email,
      })

      if (!data.success) {
        throw new Error(data.error || 'Invalid credentials')
      }

      localStorage.setItem('linka_user', JSON.stringify({
        email: data.data.email,
        username: data.data.username,
        name: data.data.profile.name,
        walletAddress: data.data.walletAddress,
        onboardingCompleted: data.data.onboardingCompleted
      }))

      onSignIn(formData.email)
    } catch (error) {
      console.error('Error signing in:', error)
      setError(error instanceof Error ? error.message : 'Failed to sign in. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 'welcome':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-linka-emerald rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-linka-black mb-4">Welcome to Linka!</h2>
            <p className="text-gray-600 mb-6">
              I'm your conversational marketplace assistant. I help you discover vendors, 
              manage payments, and make onchain transactions through natural chat.
            </p>
            <p className="text-sm text-gray-500">
              Let's get you set up in just a few steps.
            </p>
          </div>
        )

      case 'consent':
        return (
          <div>
            <div className="w-16 h-16 bg-linka-blue rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-linka-emerald" />
            </div>
            <h2 className="text-xl font-bold text-linka-black mb-4">Data Consent</h2>
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm">
              <p className="mb-3">
                To provide you with the best experience, Linka collects and processes:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Email address and name for account creation</li>
                <li>Wallet address for onchain transactions</li>
                <li>Optional Google account data (if you choose to connect)</li>
                <li>Chat history for improving our service</li>
              </ul>
              <p className="mt-3 text-gray-600">
                Your data is encrypted and stored securely. We never share your personal information.
              </p>
            </div>
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.consentGiven}
                onChange={(e) => setFormData(prev => ({ ...prev, consentGiven: e.target.checked }))}
                className="mt-1 w-4 h-4 text-linka-emerald border-gray-300 rounded focus:ring-linka-emerald"
              />
              <span className="text-sm text-gray-700">
                I consent to Linka collecting and processing my data as described above.
              </span>
            </label>
          </div>
        )

      case 'identity':
        return (
          <div>
            <div className="w-16 h-16 bg-linka-blue rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-linka-emerald" />
            </div>
            <h2 className="text-xl font-bold text-linka-black mb-4">Your Identity</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-linka-emerald focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-linka-emerald focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                />
              </div>
      {currentIsNewUser && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username *
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              placeholder="johndoe"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-linka-emerald focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">This will be your @username.linka identifier</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-linka-emerald focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password *
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-linka-emerald focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
            />
          </div>
        </>
      )}
      {!currentIsNewUser && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password *
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            placeholder="••••••••"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-linka-emerald focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
          />
        </div>
      )}
            </div>
          </div>
        )

      case 'google':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-linka-blue rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-linka-emerald" />
            </div>
            <h2 className="text-xl font-bold text-linka-black mb-4">Connect Google (Optional)</h2>
            <p className="text-gray-600 mb-6">
              Connect your Google account for easier sign-in and enhanced features.
            </p>
            <button
              onClick={handleSkipGoogle}
              className="w-full bg-linka-emerald text-white py-3 rounded-xl font-medium hover:bg-green-600 transition-colors mb-3"
            >
              Connect with Google
            </button>
            <button
              onClick={handleSkipGoogle}
              className="w-full py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Skip for now
            </button>
          </div>
        )

      case 'wallet':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-linka-blue rounded-full flex items-center justify-center mx-auto mb-6">
              <Wallet className="w-8 h-8 text-linka-emerald" />
            </div>
            <h2 className="text-xl font-bold text-linka-black mb-4">Creating Your Wallet</h2>
            <p className="text-gray-600 mb-6">
              I'm creating a secure custodial wallet for you. This will enable onchain transactions.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="w-8 h-8 border-4 border-linka-emerald border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-gray-600">Generating wallet...</p>
            </div>
            <button
              onClick={handleCreateAccount}
              disabled={isLoading}
              className="w-full bg-linka-emerald text-white py-3 rounded-xl font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        )

      case 'complete':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-linka-emerald rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-linka-black mb-4">Welcome to Linka!</h2>
            <p className="text-gray-600 mb-6">
              Your account has been created successfully. Your wallet address is:
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <code className="text-sm text-gray-700 break-all">
                {formData.walletAddress}
              </code>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              You can now start discovering vendors and making payments onchain!
            </p>
            <button
              onClick={() => onComplete(formData)}
              className="w-full bg-linka-emerald text-white py-3 rounded-xl font-medium hover:bg-green-600 transition-colors"
            >
              Start Using Linka
            </button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Step {currentStepIndex + 1} of {steps.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-linka-emerald h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-6">
          {renderStep()}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Navigation */}
        {step !== 'wallet' && step !== 'complete' && (
          <div className="flex space-x-3">
            {step !== 'welcome' && (
              <button
                onClick={() => {
                  const prevStepIndex = currentStepIndex - 1
                  if (prevStepIndex >= 0) {
                    setStep(steps[prevStepIndex].id as OnboardingStep)
                  }
                }}
                className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 bg-linka-emerald text-white py-3 rounded-xl font-medium hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
            >
              <span>{step === 'google' ? 'Skip' : 'Next'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Sign In Option */}
        {step === 'identity' && currentIsNewUser && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center mb-3">
              Already have an account?
            </p>
            <button
              onClick={handleSignIn}
              disabled={!formData.email || isLoading}
              className="w-full py-2 border border-linka-emerald text-linka-emerald rounded-xl font-medium hover:bg-linka-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        )}

        {/* Create Account Option */}
        {step === 'identity' && !currentIsNewUser && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center mb-3">
              Don't have an account?
            </p>
            <button
              onClick={() => setCurrentIsNewUser(true)}
              className="w-full py-2 border border-linka-emerald text-linka-emerald rounded-xl font-medium hover:bg-linka-blue transition-colors"
            >
              Create New Account
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
