import { NextRequest, NextResponse } from 'next/server';

// Mock vendor data - in production this would come from a database
const mockVendors = [
  {
    id: '1',
    name: 'TechGear Store',
    category: 'Electronics',
    rating: 4.8,
    location: 'Lagos, Nigeria',
    description: 'Premium electronics and gadgets for tech enthusiasts',
    image: '/vendor-tech.jpg',
    walletAddress: '0x1234567890123456789012345678901234567890',
    farcasterUsername: '@techgear',
  },
  {
    id: '2',
    name: 'Fashion Forward',
    category: 'Fashion',
    rating: 4.6,
    location: 'Abuja, Nigeria',
    description: 'Trendy fashion items and accessories',
    image: '/vendor-fashion.jpg',
    walletAddress: '0x2345678901234567890123456789012345678901',
    farcasterUsername: '@fashionforward',
  },
  {
    id: '3',
    name: 'Home Essentials',
    category: 'Home & Garden',
    rating: 4.9,
    location: 'Port Harcourt, Nigeria',
    description: 'Quality home and garden products',
    image: '/vendor-home.jpg',
    walletAddress: '0x3456789012345678901234567890123456789012',
    farcasterUsername: '@homeessentials',
  },
  {
    id: '4',
    name: 'Crypto Collectibles',
    category: 'NFTs',
    rating: 4.7,
    location: 'Global',
    description: 'Unique NFT collections and digital art',
    image: '/vendor-nft.jpg',
    walletAddress: '0x4567890123456789012345678901234567890123',
    farcasterUsername: '@cryptocollectibles',
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || 'all';
  const limit = parseInt(searchParams.get('limit') || '10');

  let filteredVendors = mockVendors;

  // Filter by search query
  if (query) {
    filteredVendors = filteredVendors.filter(vendor =>
      vendor.name.toLowerCase().includes(query.toLowerCase()) ||
      vendor.description.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Filter by category
  if (category !== 'all') {
    filteredVendors = filteredVendors.filter(vendor =>
      vendor.category.toLowerCase() === category.toLowerCase()
    );
  }

  // Limit results
  filteredVendors = filteredVendors.slice(0, limit);

  return NextResponse.json({
    vendors: filteredVendors,
    total: filteredVendors.length,
    query,
    category,
  });
}

export async function POST(request: NextRequest) {
  try {
    const { message, threadId, channel } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Parse vendor search intent from message
    const searchIntent = parseVendorSearchIntent(message);
    
    if (searchIntent.intent === 'search') {
      const vendors = await searchVendors(searchIntent.query, searchIntent.category);
      
      return NextResponse.json({
        response: formatVendorResponse(vendors, channel),
        vendors,
        intent: 'vendor_search',
        threadId,
        channel,
      });
    }

    return NextResponse.json({
      response: "I can help you discover vendors! Try saying 'find electronics vendors' or 'search for fashion stores'",
      intent: 'clarify',
      threadId,
      channel,
    });

  } catch (error) {
    console.error('Vendor search error:', error);
    return NextResponse.json(
      { error: 'Failed to process vendor search' }, 
      { status: 500 }
    );
  }
}

function parseVendorSearchIntent(message: string) {
  const lowerMessage = message.toLowerCase();
  
  // Extract search query
  const searchPatterns = [
    /find (.+?) vendors?/i,
    /search for (.+?)/i,
    /show me (.+?) stores?/i,
    /(.+?) vendors?/i,
  ];

  let query = '';
  let category = 'all';

  for (const pattern of searchPatterns) {
    const match = message.match(pattern);
    if (match) {
      query = match[1].trim();
      break;
    }
  }

  // Determine category
  const categories = ['electronics', 'fashion', 'home', 'nft', 'food', 'services'];
  for (const cat of categories) {
    if (lowerMessage.includes(cat)) {
      category = cat;
      break;
    }
  }

  return {
    intent: query ? 'search' : 'clarify',
    query,
    category,
  };
}

async function searchVendors(query: string, category: string) {
  let filteredVendors = mockVendors;

  if (query) {
    filteredVendors = filteredVendors.filter(vendor =>
      vendor.name.toLowerCase().includes(query.toLowerCase()) ||
      vendor.description.toLowerCase().includes(query.toLowerCase())
    );
  }

  if (category !== 'all') {
    filteredVendors = filteredVendors.filter(vendor =>
      vendor.category.toLowerCase() === category.toLowerCase()
    );
  }

  return filteredVendors.slice(0, 5);
}

function formatVendorResponse(vendors: any[], channel: string) {
  if (vendors.length === 0) {
    return "I couldn't find any vendors matching your search. Try a different category or search term!";
  }

  if (channel === 'whatsapp') {
    // WhatsApp-friendly format
    let response = `Found ${vendors.length} vendors:\n\n`;
    vendors.forEach((vendor, index) => {
      response += `${index + 1}. *${vendor.name}*\n`;
      response += `   ${vendor.description}\n`;
      response += `   ⭐ ${vendor.rating} | 📍 ${vendor.location}\n`;
      response += `   💬 ${vendor.farcasterUsername}\n\n`;
    });
    response += "Reply with the number to start chatting with a vendor!";
    return response;
  } else {
    // Web/Farcaster format
    let response = `Found ${vendors.length} vendors:\n\n`;
    vendors.forEach((vendor, index) => {
      response += `${index + 1}. **${vendor.name}**\n`;
      response += `   ${vendor.description}\n`;
      response += `   ⭐ ${vendor.rating} | 📍 ${vendor.location}\n`;
      response += `   💬 ${vendor.farcasterUsername}\n\n`;
    });
    return response;
  }
}
