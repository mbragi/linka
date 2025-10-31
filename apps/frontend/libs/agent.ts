import type { AgentMessageRequest, AgentMessageResponse } from './types'

export type { AgentMessageRequest, AgentMessageResponse }

export async function sendAgentMessage(request: AgentMessageRequest): Promise<AgentMessageResponse> {
  try {
    const response = await fetch('/api/agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: request.message,
        threadId: request.threadId || 'web-user',
        channel: request.channel || 'web',
        userEmail: request.userEmail,
        senderAddress: request.senderAddress,
        conversationId: request.conversationId,
      }),
    })

    if (!response.ok) {
      throw new Error(`Agent API responded with status ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error calling agent API:', error)
    throw error
  }
}

