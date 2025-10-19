# Linka Development Environment

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- Rust 1.75+ (for core services)

### Environment Setup

1. **Copy environment template:**
   ```bash
   cp .env.example .env.local
   ```

2. **Configure your environment variables:**
   - Add your Bread.africa API key
   - Add your WaSender API key
   - Add your Wit.ai access token
   - Configure MongoDB and Redis URLs

3. **Start all services:**
   ```bash
   docker-compose up -d
   ```

### Service Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   WhatsApp      │    │      Web        │    │   Farcaster     │
│   (WaSender)    │    │     Chat        │    │   Casts         │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │    Linka Adapter         │
                    │   (TypeScript/Node)      │
                    │   - Wit.ai NLU           │
                    │   - Intent Routing       │
                    └─────────────┬─────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │     Linka Core           │
                    │   (Rust Services)        │
                    │   - Wallet Agent         │
                    │   - Vendor Agent         │
                    │   - Calendar Agent       │
                    │   - User Agent           │
                    │   - Payment Agent        │
                    └─────────────┬─────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │    Bread Proxy           │
                    │   (MCP Integration)      │
                    │   - Account Creation     │
                    │   - Funding/Withdrawal   │
                    │   - KYC Verification      │
                    └─────────────┬─────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │   External Services      │
                    │   - Bread.africa API     │
                    │   - MongoDB              │
                    │   - Redis                │
                    │   - Ollama AI            │
                    └─────────────────────────┘
```

## 🔧 Development Workflow

### Local Development

1. **Start infrastructure services:**
   ```bash
   docker-compose up mongodb redis ollama -d
   ```

2. **Run core service locally:**
   ```bash
   cd linka-core
   cargo run
   ```

3. **Run adapter service locally:**
   ```bash
   cd linka-adapter
   npm install
   npm run dev
   ```

4. **Run Bread proxy locally:**
   ```bash
   cd services/bread-proxy
   npm install
   npm run dev
   ```

### Testing MCP Integration

1. **Test Bread MCP connection:**
   ```bash
   curl -X POST http://localhost:8080/mcp \
     -H "Content-Type: application/json" \
     -d '{
       "method": "create_account",
       "params": {
         "email": "test@example.com",
         "phone": "+2348012345678",
         "name": "Test User"
       },
       "id": "test-1"
     }'
   ```

2. **Test WaSender webhook:**
   ```bash
   curl -X POST http://localhost:3001/webhook/wasender \
     -H "Content-Type: application/json" \
     -d '{
       "phone_number": "+2348012345678",
       "message": "Find tailors in Lekki",
       "message_id": "msg-1"
     }'
   ```

## 📁 Project Structure

```
linka/
├── .cursor/
│   ├── AGENTS.md              # Agent architecture documentation
│   └── rules/
│       └── rule.mdc           # Project development rules
├── docs/                      # Project documentation
├── linka-core/                # Rust backend services
│   ├── src/
│   │   ├── lib.rs
│   │   ├── wallet_agent.rs
│   │   ├── vendor_agent.rs
│   │   ├── calendar_agent.rs
│   │   ├── user_agent.rs
│   │   └── payment_agent.rs
│   ├── Cargo.toml
│   └── Dockerfile
├── linka-adapter/             # TypeScript adapter layer
│   ├── src/
│   │   └── index.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── services/
│   └── bread-proxy/           # Bread.africa MCP proxy
│       ├── src/
│       │   └── index.ts
│       ├── package.json
│       └── Dockerfile
├── libs/
│   └── ramp_core/             # MCP client abstraction
│       ├── src/
│       │   └── lib.rs
│       └── Cargo.toml
├── scripts/
│   └── mongo-init.js          # MongoDB initialization
├── docker-compose.yml         # Service orchestration
└── .env.example              # Environment template
```

## 🔄 MCP Integration Flow

### Bread.africa MCP Client

1. **Connection:** Linka connects to Bread MCP server on startup
2. **Operations:** 
   - `create_account` - User onboarding
   - `get_quote` - Funding quotes
   - `fund_wallet` - Wallet funding
   - `withdraw_funds` - Withdrawal processing
   - `kyc_verify` - Identity verification

3. **Fallback:** If MCP unavailable, falls back to REST API calls

### WaSender MCP Client

1. **Connection:** WhatsApp message routing via MCP
2. **Operations:**
   - `send_message` - Outbound WhatsApp messages
   - `receive_webhook` - Inbound message processing
   - `get_chat_status` - Chat state management

## 🧪 Testing

### Unit Tests
```bash
# Rust services
cd linka-core
cargo test

# TypeScript adapter
cd linka-adapter
npm test
```

### Integration Tests
```bash
# Start all services
docker-compose up -d

# Run integration tests
npm run test:integration
```

## 🚀 Deployment

### Production Build
```bash
# Build all services
docker-compose build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables
- Copy `.env.example` to `.env.local`
- Configure all required API keys and URLs
- Ensure MCP server URLs are accessible

## 📊 Monitoring

### Health Checks
- **Core Service:** `http://localhost:8081/health`
- **Adapter:** `http://localhost:3001/health`
- **Bread Proxy:** `http://localhost:8080/health`

### Logs
```bash
# View all service logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f linka-core
```

## 🔧 Troubleshooting

### Common Issues

1. **MCP Connection Failed:**
   - Check Bread proxy service is running
   - Verify MCP server URL configuration
   - Check network connectivity

2. **Database Connection Issues:**
   - Ensure MongoDB is running
   - Check connection string format
   - Verify database initialization

3. **Wit.ai Processing Errors:**
   - Verify access token
   - Check API rate limits
   - Ensure proper message format

### Debug Mode
```bash
# Enable debug logging
export LOG_LEVEL=debug
docker-compose up
```
