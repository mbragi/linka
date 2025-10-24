# Environment Setup for Linka

## Backend Environment Variables

Create a `.env` file in `apps/backend/` with the following variables:

```bash
# Server Configuration
BACKEND_PORT=4000
NODE_ENV=development

# Database
DATABASE_URL=mongodb://localhost:27017/linka

# Blockchain Configuration
BASE_RPC_URL=https://sepolia.base.org
PRIVATE_KEY=your_private_key_here

# Contract Addresses (deploy contracts first)
ESCROW_MANAGER_ADDRESS=
PAYMENT_PROCESSOR_ADDRESS=
REPUTATION_REGISTRY_ADDRESS=
DISPUTE_RESOLUTION_ADDRESS=

# External Services
OPENAI_API_KEY=your_openai_api_key_here
WASENDER_API_KEY=your_wasender_api_key_here
NEYNAR_API_KEY=your_neynar_api_key_here

# Redis (for queue management)
REDIS_URL=redis://localhost:6379

# Email Service (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# JWT Secret (for authentication)
JWT_SECRET=your_jwt_secret_here

# Wallet Encryption (REQUIRED - 32 character key)
ENCRYPTION_KEY=your_32_character_encryption_key_here

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## Mini App Environment Variables

Create a `.env.local` file in `apps/mini-app/` with the following variables:

```bash
# Next.js Configuration
NEXT_PUBLIC_ROOT_URL=http://localhost:3000
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000

# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here

# Backend Service URL
BACKEND_SERVICE_URL=http://localhost:4000

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# MiniKit Configuration
MINIKIT_API_KEY=your_minikit_api_key_here
```

## Setup Instructions

1. **Database Setup**: Start MongoDB locally or use MongoDB Atlas
2. **Backend Setup**: 
   - Copy `env.example` to `.env` in `apps/backend/`
   - Fill in all required variables
   - Run `npm install` and `npm run dev`
3. **Mini App Setup**:
   - Create `.env.local` in `apps/mini-app/`
   - Fill in all required variables
   - Run `npm install` and `npm run dev`
4. **Seed Database**: Run the vendor seed script:
   ```bash
   cd apps/backend
   npx ts-node scripts/seedVendors.ts
   ```

## Required Variables

- `ENCRYPTION_KEY`: Must be exactly 32 characters for wallet encryption
- `OPENAI_API_KEY`: Required for AI agent functionality
- `DATABASE_URL`: MongoDB connection string
- `PRIVATE_KEY`: Ethereum private key for blockchain operations
