# Linka — Discover, Chat, and Pay

**Linka** is a conversational onchain marketplace connecting chat to e-commerce via WhatsApp, Web, and Farcaster.

> **"Conversations that close onchain."**

---

## 🏗️ Monorepo Structure

```
linka/
├── apps/                    # Frontend applications
│   ├── mini-app/           # ✅ Farcaster mini app (Base integration)
│   ├── web/                # 🚧 Main web application
│   └── adapter/            # 🚧 Message routing service
│
├── services/               # Backend services (Rust)
│   ├── wallet-core/        # 🚧 Custodial wallet management
│   ├── vendor-service/     # 🚧 Vendor discovery & listings
│   └── bread-proxy/        # 🚧 Fiat on/off-ramp integration
│
├── libs/                   # Shared libraries
│   ├── ai_core/           # 🚧 Rust: Wit.ai, Ollama
│   ├── wallet_core/       # 🚧 Rust: Wallet generation
│   ├── messaging_core/    # 🚧 Rust: Message schemas
│   ├── db_core/           # 🚧 Rust: MongoDB helpers
│   └── ui-components/     # 🚧 TypeScript: React components
│
└── docs/                  # Documentation
    ├── ARCHITECTURE.md
    ├── BRAND.md
    ├── ONBOARDING.md
    └── PRD.md
```

**Legend**: ✅ Complete | 🚧 To be implemented

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (for TypeScript apps)
- Rust 1.70+ (for backend services)
- MongoDB (for data persistence)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd linka

# Install all dependencies
npm install

# Run the mini app
npm run dev:mini-app
```

### Available Commands

```bash
npm run dev              # Run mini app (default)
npm run dev:mini-app     # Run Farcaster mini app
npm run dev:web          # Run main web app
npm run dev:adapter      # Run message adapter

npm run build            # Build all workspaces
npm run lint             # Lint all workspaces
npm run clean            # Clean all node_modules
```

---

## 📱 Applications

### Mini App (Farcaster/Base)
The Farcaster mini app is **complete and ready for deployment**:

- ✅ Chat-native UI with Linka branding
- ✅ Wallet funding (Bread.africa + card payments)
- ✅ Vendor discovery and search
- ✅ MiniKit integration with manifest
- ✅ Webhook endpoint for Farcaster events

**Deploy**: See [apps/mini-app/DEPLOYMENT.md](apps/mini-app/DEPLOYMENT.md)

### Web App
Full-featured marketplace with advanced vendor management (coming soon)

### Adapter
Message routing service for WhatsApp, Web, and Farcaster channels (coming soon)

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

### Multi-Channel Support
- **Farcaster**: Mini app with MiniKit integration
- **WhatsApp**: Via WaSender API
- **Web**: Direct browser access

### Backend Services (Rust)
- **Wallet Core**: Custodial wallet management, identity, calendar
- **Vendor Service**: Discovery, listings, ratings, MongoDB-backed
- **Bread Proxy**: Fiat on-ramp via Bread.africa (with fallbacks)

### Shared Libraries
- **Rust**: AI core, wallet utilities, messaging schemas, DB helpers
- **TypeScript**: UI components, shared types, utilities

### Design Principles
- 🧩 **Modular**: Swappable services and providers
- 💬 **Chat-Native**: Messages first, UI optional
- 🔄 **Composable**: MCP client support for third-party integrations
- 🛡️ **Resilient**: Fallback mechanisms for critical services

---

## 🔧 Development

### Workspace Management
This project uses **npm workspaces** for monorepo management.

```bash
# Install dependencies for all workspaces
npm install

# Add a dependency to specific workspace
npm install <package> --workspace=apps/mini-app

# Run script in specific workspace
npm run dev --workspace=apps/mini-app
```

### Building Services

#### TypeScript Apps
```bash
cd apps/mini-app
npm run build
```

#### Rust Services
```bash
cd services/wallet-core
cargo build --release
```

---

## 📚 Documentation

- [**ARCHITECTURE.md**](docs/ARCHITECTURE.md) - System design and service contracts
- [**BRAND.md**](docs/BRAND.md) - Visual identity and design guidelines
- [**PRD.md**](docs/PRD.md) - Product requirements and user flows
- [**ONBOARDING.md**](docs/ONBOARDING.md) - User onboarding process

---

## 🚢 Deployment

### Mini App (Vercel)
```bash
cd apps/mini-app
npx vercel --prod
```

### Backend Services (Docker)
```bash
docker-compose up -d
```

---

## 🧪 Testing

```bash
# Test TypeScript workspaces
npm run test --workspaces

# Test Rust workspaces
cargo test --workspace
```

---

## 🤝 Contributing

1. Follow the existing code structure
2. Use TypeScript for frontend/adapter, Rust for backend services
3. Maintain brand consistency per `docs/BRAND.md`
4. Keep chat UX as the primary interaction model
5. Write tests for new features

---

## 📄 License

<!-- [Your License Here] -->

---

**Linka** — Conversations that close onchain 🔗
