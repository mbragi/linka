import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// WaSender WhatsApp webhook verification and message processing
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  // Verify webhook
  if (mode === 'subscribe' && token === process.env.WASENDER_VERIFY_TOKEN) {
    console.log('WaSender webhook verified');
    return new NextResponse(challenge);
  } else {
    return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verify WaSender webhook signature
    const signature = request.headers.get('x-hub-signature-256');
    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.WASENDER_WEBHOOK_SECRET || '')
      .update(JSON.stringify(body))
      .digest('hex');

    if (`sha256=${expectedSignature}` !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    // Process WaSender webhook events
    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.field === 'messages') {
            for (const message of change.value.messages || []) {
              await processWaSenderMessage(message, change.value.contacts?.[0]);
            }
          }
        }
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('WaSender webhook error:', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}

async function processWaSenderMessage(message: any, contact: any) {
  try {
    const phoneNumber = contact?.wa_id;
    const messageText = message.text?.body || '';
    const messageId = message.id;

    if (!messageText || !phoneNumber) {
      return;
    }

    console.log(`Processing WaSender message from ${phoneNumber}: ${messageText}`);

    // Call our AgentKit API
    const agentResponse = await fetch(`${process.env.NEXT_PUBLIC_ROOT_URL}/api/agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: messageText,
        threadId: phoneNumber,
        channel: 'whatsapp',
      }),
    });

    const { response } = await agentResponse.json();

    // Send response back via WaSender
    await sendWaSenderMessage(phoneNumber, response);

  } catch (error) {
    console.error('Error processing WaSender message:', error);
  }
}

async function sendWaSenderMessage(phoneNumber: string, message: string) {
  try {
    const response = await fetch(
      `${process.env.WASENDER_API_URL}/send-message`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.WASENDER_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneNumber,
          message: message,
          type: 'text',
        }),
      }
    );

    if (!response.ok) {
      console.error('Failed to send WaSender message:', await response.text());
    } else {
      console.log(`Message sent via WaSender to ${phoneNumber}`);
    }
  } catch (error) {
    console.error('Error sending WaSender message:', error);
  }
}
