import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Handle different types of webhook events from Farcaster/MiniKit
    console.log('Webhook received:', body)
    
    // Process the webhook data here
    // This could include user interactions, payments, etc.
    
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed successfully' 
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process webhook' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    message: 'Linka webhook endpoint is running' 
  })
}

