'use client'

import { useState, useEffect } from 'react'
import { Search, MapPin, Star, MessageCircle, ArrowRight, Loader2 } from 'lucide-react'
import { fetchVendors } from '../libs/backend'
import type { Vendor, VendorDiscoveryProps } from '../libs/types'

export default function VendorDiscovery({ onClose }: VendorDiscoveryProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const categories = ['all', 'electronics', 'clothing', 'food', 'services', 'digital', 'art', 'home', 'beauty', 'sports', 'automotive']

  useEffect(() => {
    loadVendors()
  }, [])

  const loadVendors = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      const data = await fetchVendors()
      
      if (data.success) {
        setVendors(data.data.vendors || [])
      } else {
        throw new Error(data.error || 'Failed to load vendors')
      }
    } catch (error) {
      console.error('Error fetching vendors:', error)
      setError('Failed to load vendors. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vendor.profile.bio.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || 
                           vendor.profile.categories.some(cat => cat.toLowerCase() === selectedCategory.toLowerCase())
    return matchesSearch && matchesCategory
  })

  const handleStartChat = (vendor: Vendor) => {
    // This would typically open a chat with the vendor
    console.log('Starting chat with:', vendor.profile.name)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-linka-black">Discover Vendors</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vendors..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-linka-emerald focus:border-transparent"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-linka-emerald text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category === 'all' ? 'All Categories' : category}
              </button>
            ))}
          </div>
        </div>

        {/* Vendor List */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 text-linka-emerald animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading vendors...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={loadVendors}
                className="bg-linka-emerald text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : filteredVendors.length > 0 ? (
            filteredVendors.map((vendor) => (
            <div
              key={vendor.id}
              className="border border-gray-200 rounded-xl p-4 hover:border-linka-emerald transition-colors"
            >
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-linka-blue rounded-xl flex items-center justify-center">
                  <span className="text-2xl font-bold text-linka-emerald">
                      {vendor.profile.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-linka-black">{vendor.profile.name}</h3>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-linka-accent fill-current" />
                        <span className="text-sm text-gray-600">{vendor.reputation.score}</span>
                      </div>
                  </div>
                  <div className="flex items-center space-x-4 mb-2">
                    <span className="text-sm bg-linka-blue text-linka-emerald px-2 py-1 rounded-full">
                        {vendor.profile.categories.join(', ')}
                    </span>
                    <div className="flex items-center space-x-1 text-gray-600">
                      <MapPin className="w-4 h-4" />
                        <span className="text-sm">{vendor.profile.location}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{vendor.profile.bio}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        {vendor.reputation.completedTransactions} completed transactions
                  </div>
                  <button
                    onClick={() => handleStartChat(vendor)}
                    className="flex items-center space-x-2 bg-linka-emerald text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Start Chat</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No vendors found</h3>
              <p className="text-gray-500">Try adjusting your search or category filter</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


