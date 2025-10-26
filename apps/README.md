# Linka Applications

This directory contains all applications for the Linka marketplace ecosystem.

## Directory Structure

```
apps/
├── backend/       # Node.js/Express backend service
├── contracts/     # Solidity smart contracts for Base
└── frontend/      # Next.js universal app (Web + Farcaster + WaSender)
```

---

## Applications

### `backend/` - Unified Backend Service

**Technology**: Node.js + Express + TypeScript + MongoDB + Ethers.js

**Purpose**: Handles all blockchain operations, user management, escrow processing, and vendor discovery.

**Key Features**:
- Identity and wallet management
- Escrow creation, funding, and release
- Reputation score management
- Dispute resolution workflows
- Transaction history and status
- Vendor search and discovery

**API Endpoints**:
- `GET /` - Health check
- `GET/POST /api/identity/*` - User management
- `GET/POST /api/escrow/*` - Escrow operations
- `GET/POST /api/reputation/*` - Reputation management
- `GET /api/transactions/*` - Transaction history
- `GET /api/vendors` - Vendor search

**Services**:
- `EscrowService` - Blockchain escrow operations
- `PaymentService` - Payment processing
- `ReputationService` - Reputation management
- `DisputeService` - Dispute resolution
- `WalletService` - Wallet operations
- `BlockchainService` - Base network integration

**Smart Contract Integration**:
- EscrowManager - Escrow lifecycle management
- PaymentProcessor - Payment distribution
- ReputationRegistry - On-chain reputation scores
- DisputeResolution - Dispute arbitration

**Development**:
```bash
cd apps/backend
npm install
npm run dev              # Development server (port 4000)
npm run build            # Build TypeScript
npm run start            # Production server
```

**Environment Variables**:
- `DATABASE_URL` - MongoDB connection string
- `PRIVATE_KEY` - Backend wallet private key
- `ESCROW_MANAGER_ADDRESS` - EscrowManager contract address
- `PAYMENT_PROCESSOR_ADDRESS` - PaymentProcessor contract address
- `REPUTATION_REGISTRY_ADDRESS` - ReputationRegistry contract address
- `DISPUTE_RESOLUTION_ADDRESS` - DisputeResolution contract address
- `BASE_RPC_URL` - Base network RPC endpoint

---

### `contracts/` - Smart Contracts

**Technology**: Solidity + Hardhat + OpenZeppelin

**Purpose**: On-chain escrow, payment, reputation, and dispute resolution contracts for Base network.

**Key Contracts**:

**EscrowManager** (`contracts/core/EscrowManager.sol`):
```solidity
- createEscrow() - Create escrow with milestones
- fundEscrow() - Buyer funds escrow
- releasePayment() - Release payment to seller
- fileDispute() - File dispute with reason
- cancelEscrow() - Cancel unfunded escrow
- expireEscrow() - Automatic refund on expiration
```

**ReputationRegistry** (`contracts/core/ReputationRegistry.sol`):
```solidity
- updateReputation() - Update reputation score
- getReputation() - Get user reputation
```

**PaymentProcessor** (`contracts/core/PaymentProcessor.sol`):
```solidity
- processPayment() - Process payment with fees
- distributeFees() - Distribute platform fees
```

**DisputeResolution** (`contracts/governance/DisputeResolution.sol`):
```solidity
- resolveDispute() - Resolve dispute with arbitrator
- escalateDispute() - Escalate to multi-sig
```

**Development**:
```bash
cd apps/contracts
npm install
npm run compile          # Compile contracts
npm run test             # Run tests
npm run deploy:sepolia   # Deploy to Base Sepolia testnet
npm run deploy:mainnet   # Deploy to Base mainnet
```

**Environment Variables**:
- `PRIVATE_KEY` - Deployer wallet private key
- `BASE_SEPOLIA_RPC` - Base Sepolia testnet RPC
- `BASE_MAINNET_RPC` - Base mainnet RPC

---

### `frontend/` - Universal Next.js Application

**Technology**: Next.js 15 + React + TypeScript + OpenAI + MiniKit

**Purpose**: Conversational marketplace interface for Web, Farcaster, and WhatsApp integration.

**Features**:
- OpenAI GPT-4o-mini AI agent
- Multi-channel support (Web, WhatsApp, Farcaster)
- Wallet management and balance checking
- Vendor discovery
- Escrow creation and payment processing
- Backend tool integration

**API Routes**:
- `POST /api/agent` - AI agent endpoint
- `POST /api/webhook/whatsapp` - WaSender webhook
- `GET /api/vendors` - Vendor search endpoint

**AI Agent Tools**:
- `search_vendors` - Search vendors by category
- `create_escrow` - Create escrow for transactions
- `release_payment` - Release escrowed payments
- `get_wallet_balance` - Get wallet balance
- `fund_wallet` - Get funding instructions
- `file_dispute` - File disputes
- `get_transaction_status` - Check transaction status

**Channels**:

**1. Web Interface** (`app/page.tsx`):
- Full chat interface
- Wallet balance display
- Quick actions (Find Vendors, Fund Wallet, Browse)
- Onboarding modal
- Vendor discovery modal
- Responsive design (mobile + desktop)

**2. WhatsApp (WaSender)** (`app/api/webhook/whatsapp/route.ts`):
- Webhook for incoming messages
- HMAC SHA-256 signature verification
- Phone number-based thread management
- WaSender API integration for responses

**3. Farcaster Mini App** (`minikit.config.ts`):
- MiniKit manifest configuration
- Farcaster cast integration
- On-chain profile linking
- Embedded chat interface

**Development**:
```bash
cd apps/frontend
npm install
npm run dev              # Development server (port 3000)
npm run build            # Build for production
npm run start            # Production server
```

**Environment Variables**:
- `OPENAI_API_KEY` - OpenAI API key for GPT-4o-mini
- `BACKEND_SERVICE_URL` - Backend service URL (default: http://localhost:4000)
- `WASENDER_API_URL` - WaSender API URL
- `WASENDER_API_TOKEN` - WaSender API token
- `WASENDER_VERIFY_TOKEN` - WaSender webhook verify token
- `WASENDER_WEBHOOK_SECRET` - WaSender webhook secret
- `NEXT_PUBLIC_ROOT_URL` - Public root URL for deployments
- `NEXT_PUBLIC_BACKEND_URL` - Public backend URL

---

## Development Workflow

### Local Development

**1. Start Backend**:
```bash
cd apps/backend
npm run dev              # Runs on port 4000
```

**2. Start Frontend**:
```bash
cd apps/frontend
npm run dev              # Runs on port 3000
```

**3. Deploy Contracts**:
```bash
cd apps/contracts
npm run deploy:sepolia   # Deploy to Base Sepolia
```

### Testing

**Backend Tests**:
```bash
cd apps/backend
npm test
```

**Contract Tests**:
```bash
cd apps/contracts
npm test
```

**Frontend Tests**:
```bash
cd apps/frontend
npm test
```

---

## Integration Flow

### User Message → Onchain Transaction

```
User (WhatsApp/Web/Farcaster)
  ↓
Next.js Mini App (`/api/agent`)
  ↓
OpenAI GPT-4o-mini (Intent Detection)
  ↓
Backend Tool Call (e.g., `create_escrow`)
  ↓
Backend Service (`/api/escrow/create`)
  ↓
Smart Contract (EscrowManager.createEscrow())
  ↓
Base Blockchain
```

### Example: Creating Escrow

1. User: "I want to buy a laptop for 2 ETH"
2. AI: Detects intent → calls `create_escrow({seller, amount, tokenAddress, deadline})`
3. Backend: Creates transaction record in MongoDB
4. Backend: Calls `EscrowManager.createEscrow()` on Base
5. Smart Contract: Creates escrow, returns ID
6. AI: Responds with escrow ID and funding instructions

---

## Environment Setup

See [ENVIRONMENT_SETUP.md](../../ENVIRONMENT_SETUP.md) for detailed setup instructions.

**Key Requirements**:
- Node.js 18+
- MongoDB 5+
- Redis (optional)
- Base network access (Base Sepolia testnet or mainnet)
- OpenAI API key
- WaSender API credentials (for WhatsApp integration)

---

## Deployment

### Backend Service

**Docker**:
```bash
docker-compose up -d
```

**Manual**:
```bash
cd apps/backend
npm run build
npm start
```

### Mini App

**Vercel**:
```bash
cd apps/mini-app
vercel --prod
```

### Smart Contracts

**Base Sepolia (Testnet)**:
```bash
cd apps/contracts
npm run deploy:sepolia
```

**Base Mainnet**:
```bash
cd apps/contracts
npm run deploy:mainnet
```

---

## Contributing

1. Follow the existing code structure
2. Use TypeScript for all new code
3. Maintain brand consistency per `docs/BRAND.md`
4. Keep chat UX as the primary interaction model
5. Write tests for new features

---

## Documentation

- [Architecture](../../docs/ARCHITECTURE.md) - System design
- [PRD](../../docs/PRD.md) - Product requirements
- [Brand Guidelines](../../docs/BRAND.md) - Visual identity
- [Onboarding Guide](../../docs/ONBOARDING.md) - User flows
