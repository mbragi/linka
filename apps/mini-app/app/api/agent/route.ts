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

async function callBackendTool(tool: string, params: any) {
  // Call backend APIs based on tool type
  switch (tool) {
    case 'search_vendors':
      const vendorResponse = await fetch(`${process.env.NEXT_PUBLIC_ROOT_URL}/api/vendors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: params.query })
      });
      return await vendorResponse.json();
    
    case 'get_wallet_balance':
      // Mock wallet balance for now
      return { balance: '0.5 ETH', address: '0x123...' };
    
    default:
      return { error: 'Unknown tool' };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, senderAddress, conversationId, channel } = await request.json();

    // Check if we should share a Mini App
    const miniAppKey = detectMiniAppContext(message);
    
    // Create system prompt for the AI agent
    const systemPrompt = `You are Linka, a conversational marketplace assistant. You help users:
- Discover vendors and products
- Manage their wallet and payments
- Browse the marketplace
- Make onchain transactions

Available tools:
- search_vendors: Search for vendors by query
- get_wallet_balance: Get user's wallet balance

If a user asks about vendors, shopping, or marketplace, you can use the search_vendors tool.
If a user asks about their wallet or balance, you can use the get_wallet_balance tool.

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
            description: "Search for vendors in the marketplace",
            parameters: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "Search query for vendors"
                }
              },
              required: ["query"]
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
      
      toolResults = await callBackendTool(toolName, toolParams);
      
      // Get follow-up response with tool results
      const followUp = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
          { role: "assistant", content: completion.choices[0].message.content || "" },
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