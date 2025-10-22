# ARCHITECTURE.md

## System Overview

Linka is a conversational marketplace powered by OpenAI and Mini Apps, providing multi-channel AI agents that interface users with vendors, payments, and blockchain services via WhatsApp (WaSender), Web chat, and Farcaster. The system emphasizes composability, fallback resiliency, and seamless blockchain integration.

---

## Core Architecture

### 1. OpenAI-Powered AI Layer

* **Next.js API Routes** with OpenAI integration
* **Multi-channel support**: WhatsApp (WaSender), Web, Farcaster
* **Tool calling** for backend service integration
* **Mini App sharing** for enhanced user experience

### 2. Conversational AI Agent

* **OpenAI GPT-4o-mini** for intelligent conversation handling
* **Multi-step workflows** for onboarding, vendor discovery, payments
* **Context-aware responses** across all channels
* **Backend tool integration** for blockchain operations

### 3. API Services (`/api/`)

* `/api/agent` - Main OpenAI conversational AI endpoint
* `/api/vendors` - Vendor discovery and search
* `/api/webhook/whatsapp` - WaSender webhook integration
* **Direct webhook endpoints** eliminate need for separate adapter service

---

## Multi-Channel Integration

### WhatsApp (WaSender)

* **Webhook endpoint**: `/api/webhook/whatsapp`
* **WaSender API** for message sending/receiving
* **Conversational flow** maintained across sessions
* **Phone number-based** thread management

### Web Interface

* **Next.js mini-app** with chat interface
* **Real-time messaging** via OpenAI API
* **Farcaster MiniKit** integration
* **Responsive design** for mobile/desktop

### Farcaster

* **Native Farcaster actions** via Mini Apps
* **Cast sending** and community interaction
* **MiniKit compatibility** for seamless UX
* **Base blockchain** native integration

---

## OpenAI Capabilities

### Conversational AI

* **Intent classification** and entity extraction
* **Multi-step workflows** (onboarding, payments)
* **Context awareness** across channels
* **Tool orchestration** for complex tasks

### Backend Tool Integration

* **Vendor search** via `/api/vendors`
* **Wallet management** and balance checking
* **Mini App sharing** based on context
* **Payment processing** workflows

---

## Deployment Architecture

* **Next.js application** with API routes and webhook endpoints
* **OpenAI integration** for AI and conversation
* **Direct webhook handling** for WhatsApp and other services
* **Environment-based** configuration
* **Simplified architecture** - no separate adapter service needed