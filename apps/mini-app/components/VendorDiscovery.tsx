'use client'

import { useState } from 'react'
import { Search, MapPin, Star, MessageCircle, ArrowRight } from 'lucide-react'

interface Vendor {
  id: string
  name: string
  category: string
  rating: number
  location: string
  description: string
  image: string
}

interface VendorDiscoveryProps {
  onClose: () => void
}

const mockVendors: Vendor[] = [
  {
    id: '1',
    name: 'TechGear Store',
    category: 'Electronics',
    rating: 4.8,
    location: 'Lagos, Nigeria',
    description: 'Premium electronics and gadgets for tech enthusiasts',
    image: '/vendor-tech.jpg'
  },
  {
    id: '2',
    name: 'Fashion Forward',
    category: 'Fashion',
    rating: 4.6,
    location: 'Abuja, Nigeria',
    description: 'Trendy fashion items and accessories',
    image: '/vendor-fashion.jpg'
  },
  {
    id: '3',
    name: 'Home Essentials',
    category: 'Home & Garden',
    rating: 4.9,
    location: 'Port Harcourt, Nigeria',
    description: 'Quality home and garden products',
    image: '/vendor-home.jpg'
  }
]

export default function VendorDiscovery({ onClose }: VendorDiscoveryProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [vendors] = useState<Vendor[]>(mockVendors)

  const categories = ['all', 'Electronics', 'Fashion', 'Home & Garden', 'Food', 'Services']

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vendor.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || vendor.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleStartChat = (vendor: Vendor) => {
    // This would typically open a chat with the vendor
    console.log('Starting chat with:', vendor.name)
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
          {filteredVendors.map((vendor) => (
            <div
              key={vendor.id}
              className="border border-gray-200 rounded-xl p-4 hover:border-linka-emerald transition-colors"
            >
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-linka-blue rounded-xl flex items-center justify-center">
                  <span className="text-2xl font-bold text-linka-emerald">
                    {vendor.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-linka-black">{vendor.name}</h3>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-linka-accent fill-current" />
                      <span className="text-sm text-gray-600">{vendor.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 mb-2">
                    <span className="text-sm bg-linka-blue text-linka-emerald px-2 py-1 rounded-full">
                      {vendor.category}
                    </span>
                    <div className="flex items-center space-x-1 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{vendor.location}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{vendor.description}</p>
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
          ))}
          
          {filteredVendors.length === 0 && (
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


