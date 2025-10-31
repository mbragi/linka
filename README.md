# Linka - Decentralized Escrow Platform — Discover, Chat, and Pay

**Linka** is a conversational marketplace, providing seamless in-conversation experiences across WhatsApp (WaSender), Web, and Farcaster. Users can discover vendors, manage wallets, and make onchain payments through natural conversation.

> **"Conversations that close onchain."**

---

## 🏗️ Monorepo Structure

```
linka/
├── apps/
│   ├── backend/          # Node.js/Express backend service
│   ├── contracts/         # Solidity smart contracts for Base
│   └── mini-app/         # Next.js universal app (Web + Farcaster + WaSender webhooks)
├── docs/                  # Documentation
│   ├── assets/           # Architecture diagrams (Mermaid)
│   ├── ARCHITECTURE.md
│   ├── BRAND.md
│   ├── ONBOARDING.md
│   └── PRD.md
└── docker-compose.yml
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB 5+
- Redis (optional, for queue management)
- Hardhat (for smart contract deployment)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd linka

# Install dependencies
npm install

# Install contract dependencies
cd apps/contracts
npm install
```

### Environment Setup

1. Copy environment files:
```bash
cp apps/backend/env.example apps/backend/.env
cp apps/mini-app/env.example apps/mini-app/.env
cp apps/contracts/env.example apps/contracts/.env
```

2. Configure environment variables (see [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md))

3. Start services:
```bash
# Start backend service
cd apps/backend
npm run dev

# Start mini-app
cd apps/mini-app
npm run dev
```

### Available Commands

**Root:**
```bash
npm run dev                  # Run mini app
npm run build                # Build all apps
npm run lint                 # Lint code
```

**Backend:**
```bash
cd apps/backend
npm run dev                  # Run backend service
npm run build                # Build backend
npm run start                # Run production server
```

**Mini App:**
```bash
cd apps/mini-app
npm run dev                  # Run Next.js dev server
npm run build                # Build for production
npm run start                # Start production server
```

**Contracts:**
```bash
cd apps/contracts
npm run compile              # Compile contracts
npm run test                 # Run tests
npm run deploy:sepolia       # Deploy to Base Sepolia testnet
npm run deploy:mainnet       # Deploy to Base mainnet
```

---

## 📱 Applications

### Mini App (Next.js Universal App)

The conversational marketplace supports three channels:

- ✅ **Web**: Full chat interface with wallet management
- ✅ **Farcaster Mini App**: MiniKit integration for Farcaster cast embeds
- ✅ **WhatsApp (WaSender)**: Webhook-based messaging integration

**Features:**
- OpenAI-powered conversational AI (GPT-4o-mini)
- Multi-channel support (Web, WhatsApp, Farcaster)
- Wallet management and balance checking
- Vendor discovery and search
- Escrow creation and payment processing
- Backend tool integration for onchain operations

**Deploy**: See [apps/mini-app/DEPLOYMENT.md](apps/mini-app/DEPLOYMENT.md)

### Backend Service

Unified Node.js/Express backend handling all blockchain operations:

- ✅ Identity and wallet management
- ✅ Escrow creation, funding, and release
- ✅ Reputation score management
- ✅ Dispute resolution workflows
- ✅ Transaction history and status
- ✅ Vendor search and discovery

**Smart Contracts:**
- **EscrowManager**: Handles buyer-seller escrow with milestone releases
- **PaymentProcessor**: Processes payments and fee distribution
- **ReputationRegistry**: On-chain reputation scores tied to email/wallet
- **DisputeResolution**: Multi-sig dispute resolution with arbitrator role

---

## 🎨 Brand Identity

- **Colors**: 
  - `#1B1B1E` - Soft charcoal black
  - `#DFF5FF` - Icy blue highlights
  - `#F6FBF4` - Gentle off-white
  - `#10B981` - Emerald (wallet/CTAs)
  - `#FFB800` - Warm accent

- **Typography**: Inter (primary), JetBrains Mono (secondary)
- **Style**: Clean, modern, professional with friendly tone
- **UX**: Chat-first, minimal modals, optional interactions

---

## 🏛️ Architecture

### Dual-Channel Architecture

**Farcaster Mini App:**
- Web-based interface with MiniKit integration
- Embedded in Farcaster casts
- Direct access to blockchain operations

**WhatsApp (WaSender):**
- Webhook-based message handling
- Conversational AI processing
- Phone number-based session management

### AI Agent Flow

```
User Message → OpenAI GPT-4o-mini → Intent Detection → Backend Tool Execution → Onchain Transaction → Response
```

### Backend Services

- **WalletService**: Custodial wallet management
- **EscrowService**: Blockchain escrow operations
- **PaymentService**: Payment processing
- **ReputationService**: On-chain reputation management
- **DisputeService**: Dispute resolution workflows
- **IdentityService**: User profile management

### Blockchain Integration

- **Network**: Base (Base Sepolia testnet / Base mainnet)
- **Smart Contracts**: EscrowManager, PaymentProcessor, ReputationRegistry, DisputeResolution
- **Provider**: Ethers.js v6
- **Accounts**: Managed private keys (encrypted in database)

---

## 📚 Documentation

- [**ARCHITECTURE.md**](docs/ARCHITECTURE.md) - System design and service contracts
- [**PRD.md**](docs/PRD.md) - Product requirements and user flows
- [**BRAND.md**](docs/BRAND.md) - Visual identity and design guidelines
- [**ONBOARDING.md**](docs/ONBOARDING.md) - User onboarding process
- [**apps/README.md**](apps/README.md) - Application-level documentation

---

## 🚢 Deployment

### Backend Service
```bash
cd apps/backend
docker-compose up -d
```

### Mini App (Vercel)
```bash
cd apps/mini-app
npx vercel --prod
```

### Smart Contracts
```bash
cd apps/contracts
npm run deploy:mainnet
```

---

## 🧪 Testing

```bash
# Test TypeScript workspaces
npm run test --workspaces

# Test contracts
cd apps/contracts
npm run test
```

---

## 🤝 Contributing

1. Follow the existing code structure
2. Use TypeScript for frontend/adapter, Solidity for smart contracts
3. Maintain brand consistency per `docs/BRAND.md`
4. Keep chat UX as the primary interaction model
5. Write tests for new features

---

## 📄 License

<!-- [Your License Here] -->

---

**Linka** — Conversations that close onchain 🔗
