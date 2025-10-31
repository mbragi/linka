import { getBackendUrl } from './api'
import type { WalletBalance, CreateIdentityRequest, SignInRequest } from './types'

export type { WalletBalance, CreateIdentityRequest, SignInRequest }

export async function fetchWalletBalance(email: string): Promise<WalletBalance | null> {
  try {
    const backendUrl = getBackendUrl()
    const response = await fetch(`${backendUrl}/api/identity/${email}/wallet/balance`)
    const data = await response.json()
    
    if (data.success) {
      return data.data || null
    }
    return null
  } catch (error) {
    console.error('Error fetching wallet balance:', error)
    return null
  }
}

export async function createIdentity(request: CreateIdentityRequest) {
  try {
    const backendUrl = getBackendUrl()
    const response = await fetch(`${backendUrl}/api/identity/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })
    return await response.json()
  } catch (error) {
    console.error('Error creating identity:', error)
    throw error
  }
}

export async function signIn(request: SignInRequest) {
  try {
    const backendUrl = getBackendUrl()
    const response = await fetch(`${backendUrl}/api/identity/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })
    return await response.json()
  } catch (error) {
    console.error('Error signing in:', error)
    throw error
  }
}

export async function fetchVendors(category?: string, minReputation?: number) {
  try {
    const backendUrl = getBackendUrl()
    const params = new URLSearchParams()
    if (category) params.append('category', category)
    if (minReputation !== undefined) params.append('minReputation', minReputation.toString())
    
    const url = `${backendUrl}/api/vendors${params.toString() ? `?${params.toString()}` : ''}`
    const response = await fetch(url)
    return await response.json()
  } catch (error) {
    console.error('Error fetching vendors:', error)
    throw error
  }
}

