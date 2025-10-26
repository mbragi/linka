# Linka Architecture

## System Overview

Linka is a conversational marketplace powered by OpenAI GPT-4o-mini, providing multi-channel AI agents that interface users with vendors, payments, and blockchain services via WhatsApp (WaSender), Web chat, and Farcaster Mini Apps. The system emphasizes composability, fallback resiliency, and seamless Base blockchain integration.

![Architecture Overview](assets/architecture-overview.mmd)

---

## Core Components

### 1. AI Agent Layer (Next.js Mini App)

**Location**: `apps/mini-app/app/api/agent/route.ts`

**Technology**: 
- OpenAI GPT-4o-mini
- Next.js 15 API Routes
- Function calling with backend tool integration

**Capabilities**:
- Intent classification and entity extraction
- Multi-step conversational workflows
- Context-aware responses across channels
- Backend tool orchestration
- Mini App sharing based on context

**Available Tools**:
- `search_vendors`: Search vendors by category and reputation
- `create_escrow`: Create escrow for marketplace transactions
- `check_reputation`: Verify user reputation before transactions
- `release_payment`: Release escrowed payments to sellers
- `file_dispute`: File disputes for unresolved transactions
- `get_transaction_status`: Check transaction status
- `create_vendor`: Create vendor profile
- `get_wallet_balance`: Get user wallet balance
- `fund_wallet`: Get wallet funding information

### 2. Backend Service

**Location**: `apps/backend/src/`

**Technology**:
- Node.js/Express
- MongoDB for data persistence
- Ethers.js v6 for blockchain interactions
- Redis (optional) for queue management

**Architecture**:
```
apps/backend/src/
├── controllers/         # Route handlers
│   ├── EscrowController.ts
│   ├── IdentityController.ts
│   ├── ReputationController.ts
│   └── TransactionController.ts
├── services/           # Business logic
│   ├── EscrowService.ts
│   ├── PaymentService.ts
│   ├── ReputationService.ts
│   ├── DisputeService.ts
│   ├── WalletService.ts
│   └── BlockchainService.ts
├── models/            # Database schemas
│   ├── User.ts
│   └── Transaction.ts
└── routes/            # API endpoints
    ├── escrow.ts
    ├── identity.ts
    ├── reputation.ts
    ├── transactions.ts
    └── vendors.ts
```

**API Endpoints**:

**Identity** (`/api/identity/*`):
- `GET /:email/wallet/balance` - Get wallet balance
- `POST /create` - Create user profile
- `GET /:email` - Get user profile

**Escrow** (`/api/escrow/*`):
- `POST /create` - Create escrow
- `POST /:id/fund` - Fund escrow
- `POST /:id/release` - Release payment
- `POST /:id/dispute` - File dispute
- `GET /:id` - Get escrow details

**Reputation** (`/api/reputation/*`):
- `GET /:address` - Get reputation score
- `POST /update` - Update reputation

**Transactions** (`/api/transactions/*`):
- `GET /:email/:id` - Get transaction status
- `GET /:email` - List user transactions

### 3. Smart Contract Layer

**Location**: `apps/contracts/contracts/`

**Network**: Base (Base Sepolia testnet / Base mainnet)

**Contracts**:

**EscrowManager** (`contracts/core/EscrowManager.sol`):
```solidity
- createEscrow(): Create escrow with milestones
- fundEscrow(): Buyer funds escrow
- releasePayment(): Release payment to seller
- fileDispute(): File dispute
- cancelEscrow(): Cancel unfunded escrow
- expireEscrow(): Refund on expiration
```

**ReputationRegistry** (`contracts/core/ReputationRegistry.sol`):
```solidity
- updateReputation(): Update on-chain reputation
- getReputation(): Get user reputation score
```

**PaymentProcessor** (`contracts/core/PaymentProcessor.sol`):
```solidity
- processPayment(): Process payment with fees
- distributeFees(): Distribute platform fees
```

**DisputeResolution** (`contracts/governance/DisputeResolution.sol`):
```solidity
- resolveDispute(): Resolve dispute with arbitrator
- escalateDispute(): Escalate to multi-sig
```

### 4. Multi-Channel Integration

#### WhatsApp (WaSender)

**Location**: `apps/mini-app/app/api/webhook/whatsapp/route.ts`

**Flow**:
1. WaSender receives message → Webhook to `/api/webhook/whatsapp`
2. Extract message text and phone number
3. Call AI agent with context
4. Send response via WaSender API

**Features**:
- Phone number-based thread management
- Signature verification for webhook security
- Conversational flow maintained across sessions

#### Web Interface

**Location**: `apps/mini-app/app/page.tsx`

**Features**:
- Full chat interface
- Wallet balance display
- Vendor discovery modal
- Direct blockchain interaction
- Responsive design for mobile/desktop

#### Farcaster Mini App

**Configuration**: `apps/mini-app/minikit.config.ts`

**Features**:
- MiniKit manifest for Farcaster integration
- Embedded chat interface
- On-chain profile integration
- Cast sharing capabilities

---

## Data Flow

![System Flow](assets/system-flow.mmd)

### Example: Creating an Escrow Transaction

1. **User Input**: "I want to buy a laptop from VendorX for 2 ETH"
2. **AI Agent**: Detects intent `create_escrow` with params `{seller, amount, tokenAddress, metadata}`
3. **Backend API**: `POST /api/escrow/create`
   - Create transaction record in MongoDB
   - Call EscrowManager contract `createEscrow()`
4. **Smart Contract**: Create escrow on Base blockchain
   - Return escrow ID
   - Emit `EscrowCreated` event
5. **Backend Response**: Return escrow ID and funding instructions
6. **AI Response**: "Escrow created! Transaction ID: 0x123... Fund your escrow to proceed."
7. **User Display**: Show transaction details and funding steps

---

## Data Normalization

### WhatsApp Message Format

**Raw WaSender Message**:
```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "changes": [{
      "field": "messages",
      "value": {
        "messages": [{
          "from": "2348012345678",
          "id": "wamid.xxx",
          "timestamp": "1234567890",
          "text": {"body": "I want to buy something"}
        }],
        "contacts": [{
          "profile": {"name": "John Doe"},
          "wa_id": "2348012345678"
        }]
      }
    }]
  }]
}
```

**Normalized Internal Format**:
```json
{
  "channel": "whatsapp",
  "threadId": "2348012345678",
  "userEmail": "2348012345678@whatsapp.link",
  "message": "I want to buy something",
  "context": {
    "profileName": "John Doe",
    "phoneNumber": "2348012345678"
  }
}
```

### User Model Schema

```typescript
interface IUser {
  email: string;                    // Primary key
  farcasterFid?: number;            // Farcaster integration
  walletAddress: string;             // On-chain identity
  encryptedPrivateKey: string;       // Wallet private key
  phoneNumber?: string;              // WhatsApp integration
  googleId?: string;                 // Google OAuth
  
  consentGiven: boolean;             // GDPR compliance
  onboardingCompleted: boolean;     // Onboarding status
  baseName?: string;                // Base name (for identity)
  ensName?: string;                  // ENS name (for identity)
  
  profile: {
    name: string;
    bio?: string;
    isVendor: boolean;
    categories?: string[];
    avatar?: string;
    location?: string;
    website?: string;
  };
  
  reputation: {
    score: number;                   // 0-1000
    totalTransactions: number;
    completedTransactions: number;
    disputes: number;
    totalVolume: number;
    lastUpdated: Date;
  };
  
  verification: {
    emailVerified: boolean;
    phoneVerified: boolean;
    kycCompleted: boolean;
    documentsUploaded: boolean;
  };
}
```

---

## Security Considerations

### Backend Service

- **Private Keys**: Encrypted storage in MongoDB
- **Webhook Verification**: HMAC SHA-256 signature verification for WaSender
- **Rate Limiting**: Express rate limiter (100 req/15min per IP)
- **Helmet**: Security headers via Helmet middleware
- **CORS**: Configured for production domains

### Smart Contracts

- **Access Control**: OpenZeppelin Ownable for admin functions
- **ReentrancyGuard**: Protection against reentrancy attacks
- **Pausable**: Emergency pause mechanism
- **Timeouts**: Escrow expiration (30 days) and dispute timeout (7 days)

---

## Deployment Architecture

### Production Environment

**Mini App**:
- Hosting: Vercel
- Edge Functions: API routes at edge
- Environment: Production Base network

**Backend Service**:
- Hosting: Docker container (via docker-compose)
- Database: MongoDB Atlas
- Redis: Optional for queue management
- Network: Base mainnet

**Smart Contracts**:
- Network: Base mainnet
- Deployment: Hardhat scripts
- Verification: Etherscan verification

### Development Environment

- **Backend**: Local MongoDB, Base Sepolia testnet
- **Mini App**: Next.js dev server
- **Contracts**: Local Hardhat network or Base Sepolia
- **Environment Variables**: `.env.local` files per app

---

## API Service Contracts

### Escrow Service

```typescript
interface EscrowService {
  createEscrow(params: {
    seller: string;
    amount: string;
    tokenAddress: string;
    deadline: number;
    buyerEmail: string;
    sellerEmail: string;
    metadata: TransactionMetadata;
    conversationContext: ConversationContext;
  }): Promise<{ escrowId: string; transactionHash: string }>;
  
  releasePayment(escrowId: string, milestoneIndex: number): Promise<TransactionReceipt>;
  
  fileDispute(escrowId: string, reason: string, evidence: string[]): Promise<void>;
  
  getEscrow(escrowId: string): Promise<Escrow>;
}
```

### Wallet Service

```typescript
interface WalletService {
  getBalance(email: string): Promise<{
    walletAddress: string;
    balance: string;
    currency: string;
    network: NetworkInfo;
  }>;
  
  createWallet(email: string, profile: UserProfile): Promise<WalletInfo>;
  
  fundWallet(email: string, amount: string, source: 'bread' | 'paystack' | 'flutterwave'): Promise<FundingInstructions>;
}
```

---

## Design Principles

- 🧩 **Modular**: Swappable services and providers
- 💬 **Chat-Native**: Messages first, UI optional
- 🔄 **Composable**: MCP client support for third-party integrations
- 🛡️ **Resilient**: Fallback mechanisms for critical services
- 🔗 **Onchain-First**: All transactions recorded on Base blockchain
- 📊 **Reputation-Based**: On-chain reputation scores for trust

---

## Next Steps

1. Implement Bread.africa integration for fiat on-ramp
2. Add WhatsApp template messages for transaction updates
3. Build vendor verification flow with document upload
4. Add multi-sig wallet support for high-value transactions
5. Implement on-chain dispute resolution with DAO voting
