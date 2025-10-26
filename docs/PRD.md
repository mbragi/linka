# Linka Product Requirements Document (PRD)

## Overview

Linka is a conversational marketplace that enables users to discover vendors, chat naturally, and pay onchain through natural conversation. The platform supports three channels: WhatsApp (WaSender), Web, and Farcaster Mini Apps, with a unified AI agent providing seamless onboarding and transaction flows.

---

## Product Vision

**Mission**: Make commerce conversational and onchain accessible to everyone.

**Tagline**: "Conversations that close onchain."

**Target Users**:
- **Buyers**: Users seeking products and services with onchain payment options
- **Vendors**: Small businesses and freelancers accepting crypto payments

---

## Core User Flows

### 1. Onboarding Flow

#### Pre-Onboarding: Data Collection & Consent

**Requirements**:
- GDPR-compliant consent for data collection
- Minimal UI (maximum 2 screens)
- Google account integration (optional)

**Flow**:
1. User discovers Linka through any channel (WhatsApp, Web, Farcaster)
2. AI agent initiates conversation: "Welcome to Linka! Let's get you started."
3. Data collection prompts:
   - "I'll need your email and name for your account."
   - "Would you like to connect your Google account? (optional)"
   - "Do you have a Base name or ENS name for your onchain identity?"
4. User provides consent: "I consent to data collection and storage."
5. AI confirms: "Great! Your data is secure and encrypted."

#### Wallet Creation & Funding

**Requirements**:
- Automatic custodial wallet creation
- Funding via Bread.africa (primary) or Paystack/Flutterwave (fallback)
- Onboarding completion marker

**Flow**:
1. AI: "Let's create your wallet. I'll generate a secure wallet for you."
2. Wallet creation: Backend generates wallet and stores encrypted private key
3. AI: "Wallet created! Now let's fund it. Choose your method:"
   - Bread.africa (recommended) - Direct fiat-to-crypto
   - Paystack/Flutterwave - Card-based funding
4. User selects method
5. AI provides funding instructions with wallet address
6. User completes funding
7. AI: "Welcome to Linka! You're all set to discover vendors and make payments."

### 2. Vendor Discovery Flow

**User Intent**: "I'm looking for electronics vendors"

**Flow**:
1. AI: "I'll search for electronics vendors with good ratings."
2. Tool Call: `search_vendors({category: "electronics", minReputation: 700})`
3. Backend returns vendor list
4. AI: "Here are some top-rated electronics vendors:"
   - Vendor A: Electronics Store | Reputation: 850 | 150 transactions
   - Vendor B: Tech Solutions | Reputation: 780 | 89 transactions
5. User: "Show me Vendor A's profile"
6. AI displays vendor profile (bio, categories, ratings, completed transactions)
7. User: "I want to buy a laptop for 2 ETH"
8. AI initiates escrow creation

### 3. Transaction Flow

#### Escrow Creation

**User Input**: "I want to buy a laptop for 2 ETH from VendorA"

**Flow**:
1. AI: "I'll create an escrow to protect your purchase. Let me set that up."
2. Tool Call: `create_escrow({
   seller: "vendorA@example.com",
   amount: "2.0",
   tokenAddress: "0x0000...",
   deadline: 1737849600,
   buyerEmail: "buyer@example.com",
   sellerEmail: "vendorA@example.com",
   metadata: {title: "Laptop Purchase", description: "Gaming laptop", milestones: []}
 })`
3. Backend creates escrow:
   - Transaction record in MongoDB
   - Smart contract call to `EscrowManager.createEscrow()`
   - Escrow ID returned
4. AI: "Escrow created! Transaction ID: 0xabc123..."
5. AI: "To fund your escrow, send 2 ETH to: 0x... (I'll handle the rest!)"
6. User funds escrow
7. AI: "Escrow funded! Seller will deliver your laptop. I'll notify you when it's ready."

#### Payment Release

**Context**: Seller delivers laptop; buyer confirms receipt

**Flow**:
1. User: "The laptop arrived! Release payment."
2. AI: "Perfect! I'll release the payment to Vendor A."
3. Tool Call: `release_payment({escrowId: "0xabc123"})`
4. Backend:
   - Calls `EscrowManager.releasePayment()`
   - Updates transaction status
   - Updates reputation scores
5. AI: "Payment released! 2 ETH sent to Vendor A. Your reputation updated."
6. AI: "Would you like to leave a review?"

#### Dispute Flow

**Context**: Buyer receives wrong item

**Flow**:
1. User: "This is the wrong laptop. I want to dispute."
2. AI: "I'll help you file a dispute. What's the reason?"
3. Tool Call: `file_dispute({
   escrowId: "0xabc123",
   reason: "Wrong item received",
   evidence: ["photo1.jpg", "order_confirmation.pdf"]
 })`
4. Backend creates dispute:
   - Calls `EscrowManager.fileDispute()`
   - Stores evidence in MongoDB
   - Notifies arbitrator
5. AI: "Dispute filed! An arbitrator will review within 48 hours."
6. Arbitrator resolves dispute
7. AI: "Dispute resolved! Your refund has been processed."

### 4. Wallet Management Flow

**User Input**: "What's my wallet balance?"

**Flow**:
1. Tool Call: `get_wallet_balance()`
2. Backend returns balance from MongoDB and onchain
3. AI: "Your wallet balance: 5.2 ETH on Base Sepolia network."
4. AI: "Wallet address: 0x... (you can receive funds here)"

**Funding Request**: "I want to add 100 USD to my wallet"

**Flow**:
1. AI: "I'll help you fund your wallet. Here are your options:"
   - Bread.africa (recommended) - Virtual bank account
   - Paystack - Card payment
   - Flutterwave - Card payment
2. Tool Call: `fund_wallet()`
3. AI: "Fund your wallet via Bread.africa: Link below."
4. User completes funding
5. AI: "Funds received! Your balance updated: 5.7 ETH."

### 5. Vendor Registration Flow

**User Input**: "I want to become a vendor"

**Flow**:
1. AI: "Great! Let's set up your vendor profile. I'll need some information."
2. AI: "Business name?"
3. User: "Tech Solutions Inc"
4. AI: "Description?"
5. User: "Electronics and tech solutions"
6. AI: "Categories (electronics, clothing, food, services)?"
7. User: "electronics"
8. Tool Call: `create_vendor({
   name: "Tech Solutions Inc",
   bio: "Electronics and tech solutions",
   categories: ["electronics"],
   location: "Lagos, Nigeria"
 })`
9. Backend creates vendor profile
10. AI: "Vendor profile created! You're now listed on Linka."

---

## Technical Requirements

### AI Agent Requirements

**Model**: OpenAI GPT-4o-mini

**System Prompt**:
```
You are Linka, a conversational marketplace assistant. You help users:
- Discover vendors and products
- Manage their wallet and payments
- Browse the marketplace
- Make onchain transactions

Available tools:
- search_vendors: Search vendors by category
- create_escrow: Create escrow for transactions
- release_payment: Release escrowed payments
- get_wallet_balance: Check wallet balance
- fund_wallet: Fund user wallet
- file_dispute: File disputes
- get_transaction_status: Check transaction status
```

**Intent Classification**:
- `search` - Vendor discovery
- `purchase` - Create escrow
- `wallet` - Wallet operations
- `status` - Transaction status
- `dispute` - Dispute filing
- `vendor` - Vendor registration

### Backend API Requirements

**Endpoints**:
- `POST /api/identity/create` - Create user
- `GET /api/identity/:email/wallet/balance` - Get balance
- `POST /api/escrow/create` - Create escrow
- `POST /api/escrow/:id/release` - Release payment
- `POST /api/escrow/:id/dispute` - File dispute
- `GET /api/vendors?category=X` - Search vendors
- `GET /api/transactions/:email/:id` - Get transaction

**Database Schema**:
- Users: Email, wallet, profile, reputation
- Transactions: Escrow ID, parties, amount, status, metadata

### Smart Contract Requirements

**EscrowManager**:
- Create escrow with amount, seller, deadline
- Fund escrow (buyer)
- Release payment (buyer) or milestone release (seller)
- File dispute
- Cancel escrow (buyer, pending only)
- Platform fee: 2.5%

**ReputationRegistry**:
- Update reputation on transaction completion
- Get reputation score (0-1000)
- Track total transactions

**DisputeResolution**:
- File dispute with arbitrator
- Resolve dispute with outcome
- Timeout handling

---

## Channel-Specific Requirements

### WhatsApp (WaSender)

**Webhook Integration**:
- Endpoint: `/api/webhook/whatsapp`
- HMAC SHA-256 signature verification
- Phone number as thread ID
- Template message support for transaction updates

**Message Format**:
- Text messages only
- Emoji support for visual feedback
- Structured messages for complex data (escrow details, vendor lists)

### Web Interface

**UI Components**:
- Chat interface with message history
- Wallet balance display (header)
- Quick actions (Find Vendors, Fund Wallet, Browse Marketplace)
- Modal overlays for onboarding and vendor discovery

**Responsive Design**:
- Mobile-first approach
- Desktop: Sidebar chat, modal overlays
- Tablet: Stacked layout

### Farcaster Mini App

**MiniKit Configuration**:
- Manifest file for Farcaster integration
- Webhook URL for cast interactions
- On-chain profile linking

**Features**:
- Embedded chat in casts
- Transaction casting
- Profile integration with Farcaster identity

---

## Success Metrics

### User Metrics
- User signups (per channel)
- Onboarding completion rate
- Wallet funding success rate
- Active user transactions

### Transaction Metrics
- Escrow creation rate
- Payment release rate
- Dispute rate
- Average transaction size

### Platform Metrics
- Vendor signups
- Vendor transaction volume
- Platform fee collection
- Smart contract gas usage

### Reputation Metrics
- Average reputation score
- Reputation distribution
- High-reputation vendor utilization

---

## Future Enhancements

### Phase 1 (Current)
- ✅ Multi-channel support
- ✅ OpenAI AI agent
- ✅ Escrow smart contracts
- ✅ Reputation system

### Phase 2 (Next 3 months)
- Bread.africa integration for fiat on-ramp
- Multi-sig wallet support
- Advanced dispute resolution with DAO voting
- Vendor verification with document upload

### Phase 3 (6 months)
- Mobile apps (iOS/Android)
- Payment in multiple tokens (ERC-20)
- Subscription-based vendor plans
- Analytics dashboard for vendors

---

## Risk Mitigation

### Security Risks
- **Private key storage**: Encrypted in MongoDB
- **Webhook verification**: HMAC SHA-256
- **Smart contract audits**: Planned for mainnet deployment

### Operational Risks
- **Wallet funding failures**: Multiple fallback options (Bread, Paystack, Flutterwave)
- **High dispute rate**: Automated reputation degradation
- **Smart contract bugs**: Pause mechanism for emergency stops

### Product Risks
- **Low adoption**: Focus on one channel (Farcaster) for early adoption
- **High transaction fees**: Optimize for Base L2 (low fees)
- **User education**: Conversational onboarding with AI guidance

---

## Acceptance Criteria

### MVP (Minimum Viable Product)
- [x] Multi-channel AI agent (WhatsApp, Web, Farcaster)
- [x] Wallet creation and funding
- [x] Escrow creation and release
- [x] Vendor discovery
- [x] Reputation system
- [x] Dispute filing

### V1.0 (Production Ready)
- [ ] Bread.africa integration
- [ ] WhatsApp template messages
- [ ] Smart contract audits
- [ ] Comprehensive error handling
- [ ] Analytics dashboard
- [ ] Documentation for vendors
