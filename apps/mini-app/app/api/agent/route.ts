import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Mini App catalog
const miniApps = {
  vendors: {
    url: `${process.env.NEXT_PUBLIC_ROOT_URL}/vendors`,
    description: "🛍️ Discover vendors and make purchases",
    triggers: ['shop', 'buy', 'vendor', 'store', 'marketplace']
  },
  marketplace: {
    url: `${process.env.NEXT_PUBLIC_ROOT_URL}/marketplace`,
    description: "🏪 Browse the marketplace",
    triggers: ['browse', 'marketplace', 'products', 'catalog']
  },
  wallet: {
    url: `${process.env.NEXT_PUBLIC_ROOT_URL}/wallet`,
    description: "💰 Manage your wallet and payments",
    triggers: ['wallet', 'fund', 'pay', 'balance', 'money']
  }
};

function detectMiniAppContext(message: string): string | null {
  const content = message.toLowerCase();
  
  for (const [key, app] of Object.entries(miniApps)) {
    if (app.triggers.some(trigger => content.includes(trigger))) {
      return key;
    }
  }
  
  return null;
}

async function callBackendTool(tool: string, params: any, userEmail?: string) {
  const backendUrl = process.env.BACKEND_SERVICE_URL || 'http://localhost:4000';
  
  switch (tool) {
    case 'search_vendors':
      const vendorResponse = await fetch(`${backendUrl}/api/vendors?category=${params.category || ''}&minReputation=${params.minReputation || 0}`);
      return await vendorResponse.json();
    
    case 'create_vendor':
      const createVendorResponse = await fetch(`${backendUrl}/api/vendors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail || 'temp@example.com',
          profile: {
            name: params.name,
            bio: params.bio,
            categories: params.categories || [],
            location: params.location,
            website: params.website
          },
          consentGiven: true
        })
      });
      return await createVendorResponse.json();
    
    case 'create_escrow':
      const escrowResponse = await fetch(`${backendUrl}/api/escrow/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          buyerEmail: userEmail || params.buyerEmail
        })
      });
      return await escrowResponse.json();
    
    case 'check_reputation':
      const reputationResponse = await fetch(`${backendUrl}/api/reputation/${params.userAddress}`);
      return await reputationResponse.json();
    
    case 'release_payment':
      const releaseResponse = await fetch(`${backendUrl}/api/escrow/${params.escrowId}/release`, {
        method: 'POST'
      });
      return await releaseResponse.json();
    
    case 'file_dispute':
      const disputeResponse = await fetch(`${backendUrl}/api/escrow/${params.escrowId}/dispute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: params.reason,
          evidence: params.evidence || []
        })
      });
      return await disputeResponse.json();
    
    case 'get_transaction_status':
      const transactionResponse = await fetch(`${backendUrl}/api/transactions/${userEmail || params.email}/${params.transactionId}`);
      return await transactionResponse.json();
    
    case 'get_wallet_balance':
      if (userEmail) {
        const balanceResponse = await fetch(`${backendUrl}/api/identity/${userEmail}/wallet/balance`);
        return await balanceResponse.json();
      }
      // Mock wallet balance for now
      return { balance: '0.5 ETH', address: '0x123...' };
    
    default:
      return { error: 'Unknown tool' };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, senderAddress, conversationId, channel, userEmail } = await request.json();

    // Check if we should share a Mini App
    const miniAppKey = detectMiniAppContext(message);
    
    // Create system prompt for the AI agent
    const systemPrompt = `You are Linka, a conversational marketplace assistant. You help users:
- Discover vendors and products
- Manage their wallet and payments
- Browse the marketplace
- Make onchain transactions

User Context: ${userEmail ? `Current user: ${userEmail}` : 'No user context available'}

Available tools:
- search_vendors: Search for vendors by category and reputation
- create_escrow: Create escrow for marketplace/service transactions
- check_reputation: Verify seller/buyer reputation before transactions
- release_payment: Release escrowed payments to sellers
- file_dispute: File disputes for unresolved transactions
- get_transaction_status: Check transaction status and timeline
- get_wallet_balance: Get user's wallet balance
- create_vendor: Create a new vendor profile

If a user asks about vendors, shopping, or marketplace, you can use the search_vendors tool.
If a user wants to make a purchase or book a service, you can use create_escrow.
If a user asks about their wallet or balance, you can use the get_wallet_balance tool.
If a user wants to check transaction status, use get_transaction_status.
If a user wants to become a vendor, use create_vendor.

Be helpful, friendly, and focused on marketplace activities.`;

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      tools: [
        {
          type: "function",
          function: {
            name: "search_vendors",
            description: "Search for vendors in the marketplace by category and minimum reputation",
            parameters: {
              type: "object",
              properties: {
                category: {
                  type: "string",
                  description: "The category to search for (electronics, clothing, food, services, etc.)"
                },
                minReputation: {
                  type: "number",
                  description: "Minimum reputation score (0-1000)"
                }
              }
            }
          }
        },
        {
          type: "function",
          function: {
            name: "create_escrow",
            description: "Create escrow for marketplace purchase or service booking",
            parameters: {
              type: "object",
              properties: {
                seller: {
                  type: "string",
                  description: "The seller's wallet address"
                },
                amount: {
                  type: "string",
                  description: "The amount in ETH (e.g., '0.1')"
                },
                tokenAddress: {
                  type: "string",
                  description: "Token address (use '0x0000000000000000000000000000000000000000' for ETH)"
                },
                deadline: {
                  type: "number",
                  description: "Deadline timestamp in seconds"
                },
                buyerEmail: {
                  type: "string",
                  description: "The buyer's email address"
                },
                sellerEmail: {
                  type: "string",
                  description: "The seller's email address"
                },
                metadata: {
                  type: "object",
                  description: "Transaction metadata including title, description, and milestones"
                },
                conversationContext: {
                  type: "object",
                  description: "Conversation context including channel and message history"
                }
              },
              required: ["seller", "amount", "tokenAddress", "deadline", "buyerEmail", "sellerEmail", "metadata", "conversationContext"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "check_reputation",
            description: "Check seller/buyer reputation before transaction",
            parameters: {
              type: "object",
              properties: {
                userAddress: {
                  type: "string",
                  description: "The user's wallet address"
                }
              },
              required: ["userAddress"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "release_payment",
            description: "Release escrowed payment to seller",
            parameters: {
              type: "object",
              properties: {
                escrowId: {
                  type: "string",
                  description: "The escrow ID"
                }
              },
              required: ["escrowId"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "file_dispute",
            description: "File dispute for unresolved transaction",
            parameters: {
              type: "object",
              properties: {
                escrowId: {
                  type: "string",
                  description: "The escrow ID"
                },
                reason: {
                  type: "string",
                  description: "The reason for the dispute"
                },
                evidence: {
                  type: "array",
                  items: { type: "string" },
                  description: "Evidence files or descriptions"
                }
              },
              required: ["escrowId", "reason"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "get_transaction_status",
            description: "Get transaction status and timeline",
            parameters: {
              type: "object",
              properties: {
                email: {
                  type: "string",
                  description: "The user's email address"
                },
                transactionId: {
                  type: "string",
                  description: "The transaction ID"
                }
              },
              required: ["email", "transactionId"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "create_vendor",
            description: "Create a new vendor profile",
            parameters: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description: "The vendor's business name"
                },
                bio: {
                  type: "string",
                  description: "Description of the vendor's business"
                },
                categories: {
                  type: "array",
                  items: { type: "string" },
                  description: "Business categories (electronics, clothing, food, services, etc.)"
                },
                location: {
                  type: "string",
                  description: "Business location"
                },
                website: {
                  type: "string",
                  description: "Business website URL"
                }
              },
              required: ["name", "bio"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "get_wallet_balance",
            description: "Get user's wallet balance",
            parameters: {
              type: "object",
              properties: {},
              required: []
            }
          }
        }
      ],
      tool_choice: "auto"
    });

    let responseText = completion.choices[0].message.content || "I'm here to help!";
    let toolResults = null;

    // Handle tool calls
    if (completion.choices[0].message.tool_calls) {
      const toolCall = completion.choices[0].message.tool_calls[0];
      const toolName = toolCall.function.name;
      const toolParams = JSON.parse(toolCall.function.arguments);
      
      toolResults = await callBackendTool(toolName, toolParams, userEmail);
      
      // Get follow-up response with tool results
      const followUp = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
          { 
            role: "assistant", 
            content: completion.choices[0].message.content,
            tool_calls: completion.choices[0].message.tool_calls
          },
          { role: "tool", content: JSON.stringify(toolResults), tool_call_id: toolCall.id }
        ],
        temperature: 0.7
      });
      
      responseText = followUp.choices[0].message.content || responseText;
    }

    // Prepare response
    const response = {
      response: responseText,
      miniAppShared: !!miniAppKey,
      miniAppUrl: miniAppKey ? miniApps[miniAppKey as keyof typeof miniApps].url : '',
      miniAppType: miniAppKey,
      senderAddress,
      conversationId,
      channel,
      toolResults
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Agent error:', error);
    return NextResponse.json({
      response: "Sorry, I'm having trouble right now. Please try again.",
      miniAppShared: false,
      miniAppUrl: '',
      miniAppType: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Linka OpenAI Agent API is running',
    channels: ['whatsapp', 'web', 'farcaster'],
    capabilities: [
      'OpenAI-powered conversational AI',
      'Mini App sharing',
      'Vendor search',
      'Wallet management',
      'Backend tool integration'
    ]
  });
}