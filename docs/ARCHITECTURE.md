# ARCHITECTURE.md

## System Overview

Linka is a conversational marketplace powered by OpenAI and Mini Apps, providing multi-channel AI agents that interface users with vendors, payments, and blockchain services via WhatsApp (WaSender), Web chat, and Farcaster. The system emphasizes composability, fallback resiliency, and seamless blockchain integration with a unified backend service.

---

## Core Architecture

### 1. Unified Backend Service

* **Node.js/TypeScript** service handling all backend operations
* **MongoDB** for user profiles, transactions, and conversation history
* **Ethers.js v6** for Base blockchain contract interactions
* **Express.js** with comprehensive API endpoints
* **Redis** for queue management and caching

### 2. OpenAI-Powered AI Layer

* **Next.js API Routes** with OpenAI integration
* **Multi-channel support**: WhatsApp (WaSender), Web, Farcaster
* **Tool integration** with unified backend service
* **Base blockchain native** for onchain transactions

### 3. Conversational AI Agent

* **OpenAI GPT-4o-mini** for intelligent conversation handling
* **Multi-step workflows** for onboarding, vendor discovery, payments
* **Context-aware responses** across all channels
* **Backend tool integration** for blockchain operations

### 4. API Services

**Mini App APIs (`/api/`):**
* `/api/agent` - Main OpenAI conversational AI endpoint
* `/api/vendors` - Vendor discovery and search
* `/api/webhook/whatsapp` - WaSender webhook integration

**Backend Service APIs (`/api/`):**
* `/api/identity/*` - User profile and identity management
* `/api/escrow/*` - Escrow creation, funding, release, disputes
* `/api/payment/*` - Direct payments and transaction processing
* `/api/reputation/*` - Reputation score management
* `/api/transactions/*` - Transaction history and status
* `/api/vendors` - Vendor search and discovery

---

## Multi-Channel Integration

### WhatsApp (WaSender)

* **Webhook endpoint**: `/api/webhook/whatsapp`
* **WaSender API** for message sending/receiving
* **Conversational flow** maintained across sessions
* **Phone number-based** thread management

### Web Interface

* **Next.js mini-app** with chat interface
* **Real-time messaging** via OpenAI Agent API
* **Farcaster MiniKit** integration
* **Responsive design** for mobile/desktop

### Farcaster

* **Native Farcaster actions** via Mini Apps
* **Cast sending** and community interaction
* **MiniKit compatibility** for seamless UX
* **Base blockchain** native integration

---

## Backend Service Architecture

### Smart Contract Integration

* **EscrowManager** - Handles buyer-seller escrow with milestone releases
* **PaymentProcessor** - Processes payments and fee distribution
* **ReputationRegistry** - On-chain reputation scores tied to email/FID
* **DisputeResolution** - Multi-sig dispute resolution with arbitrator role

### Database Schema

**User Model:**
* Email (primary key), Farcaster FID (optional), wallet address
* Profile data (name, bio, vendor status, categories)
* Reputation scores and transaction history
* Verification status and preferences

**Transaction Model:**
* Transaction ID, escrow ID, buyer/seller emails
* Amount, currency, status, type (marketplace/service)
* Metadata (title, description, milestones, images)
* Conversation context and timeline
* Dispute information if applicable

### Service Modules

* **EscrowService** - Blockchain escrow operations
* **PaymentService** - Direct payment processing
* **ReputationService** - Reputation score management
* **DisputeService** - Dispute resolution workflows
* **IdentityService** - User profile management
* **TransactionService** - Transaction history and status

---

## OpenAI Agent Capabilities

### Enhanced Backend Tool Integration

* **create_escrow** - Create escrow for marketplace/service transactions
* **check_reputation** - Verify seller/buyer reputation before transactions
* **release_payment** - Release escrowed payments to sellers
* **file_dispute** - File disputes for unresolved transactions
* **search_vendors** - Search verified vendors by category
* **get_transaction_status** - Check transaction status and timeline

### Conversational AI

* **Intent classification** and entity extraction
* **Multi-step workflows** (onboarding, payments, disputes)
* **Context awareness** across channels
* **Tool orchestration** for complex tasks
* **Mini App sharing** based on context
* **Payment processing** workflows

---

## Deployment Architecture

* **Next.js application** with API routes and webhook endpoints
* **Unified backend service** (Node.js/TypeScript) on port 4000
* **MongoDB** for data persistence
* **Redis** for queue management and caching
* **Base blockchain** integration for smart contracts
* **Environment-based** configuration
* **Simplified architecture** - single backend service handles all operations