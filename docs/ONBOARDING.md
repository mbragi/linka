# Linka User Onboarding Guide

## Overview

This document outlines the complete user onboarding flow for Linka, focusing on multi-channel data collection, consent management, and wallet setup across WhatsApp (WaSender), Web, and Farcaster.

---

## Multi-Channel Onboarding

### Anonymous-First Approach

**Key Principle**: All users are anonymous by default. Users can browse vendors and view information without signing in, but must authenticate to:
- Make purchases and create escrows
- Access wallet management
- Become a vendor
- Access transaction history

### Channel Support

Linka supports three channels for onboarding:

1. **Web Interface** - Full browser-based experience with anonymous home screen
2. **WhatsApp (WaSender)** - Conversational onboarding via WhatsApp messaging
3. **Farcaster Mini App** - Seamless onboarding within Farcaster cast interactions

---

## Pre-Onboarding: Data Collection & Consent

### Data Collection Requirements

Before wallet creation, Linka collects essential user data for compliance and platform functionality.

**Required Data**:
- Email address (primary identifier)
- Name
- Consent flag for GDPR compliance
- Channel-specific identifier:
  - Web: Email or Google OAuth
  - WhatsApp: Phone number
  - Farcaster: FID (Farcaster ID)

**Optional Data**:
- Google account information (for enhanced identity)
- Base name or ENS name (for onchain identity)
- Profile bio and avatar
- Location and website (for vendor profiles)

### Consent Flow

**GDPR-Compliant Process**:
1. User initiates conversation on any channel
2. AI agent requests consent: "I'll need your email, name, and consent for data storage to create your account."
3. User provides consent: "Yes, I consent to data collection and storage."
4. Data stored: Backend creates user record with encrypted private key
5. Confirmation: "Account created! Your data is encrypted and secure."

**Minimal UI Approach**:
- Maximum 2 screens across all channels
- Conversation-first design (WhatsApp, Farcaster)
- Modal overlays for Web interface only

---

## Wallet Creation & Funding

### Automatic Wallet Generation

**Process**:
1. Backend generates Ethereum wallet (Base network)
2. Encrypts private key with user-specific salt
3. Stores encrypted key in MongoDB
4. Associates wallet with user email

**User Schema** (`apps/backend/src/models/User.ts`):
```typescript
{
  email: string;                    // Primary key
  username: string;                  // Unique username (e.g., "johndoe" displayed as "johndoe.linka")
  password: string;                 // Bcrypt hashed password
  walletAddress: string;             // Generated wallet address
  encryptedPrivateKey: string;       // Encrypted private key
  consentGiven: boolean;             // GDPR compliance
  onboardingCompleted: boolean;      // Onboarding status
  channel: 'web' | 'whatsapp' | 'farcaster';
  profile: {
    name: string;
    bio?: string;
    isVendor: boolean;
  };
}
```

### Funding Options

**Current Implementation**:
- Direct Base network funding (send ETH to wallet address)
- Balance checking via `WalletService.getBalance()`

**Planned Integration** (Not yet implemented):
- **Bread.africa** - Fiat-to-crypto on-ramp (primary)

**Funding Flow**:
1. AI agent: "Wallet created! Here's your wallet address: 0x..."
2. AI agent: "Fund your wallet by sending ETH to this address on Base network."
3. User sends ETH from external wallet (e.g., MetaMask, Coinbase)
4. AI agent checks balance: "Balance confirmed! You now have 2 ETH."

---

## Channel-Specific Onboarding Flows

### Web Interface

**Location**: `apps/mini-app/app/page.tsx`

**Flow**:
1. User visits web interface
2. System checks for existing user session
3. If new user: Shows `OnboardingModal` component
4. User provides email, name, consent
5. Modal calls backend API to create user and wallet
6. User redirected to chat interface with wallet balance displayed

**Components**:
- `OnboardingModal.tsx` - Full-screen or modal onboarding
- `WalletFund.tsx` - Wallet funding modal
- `VendorDiscovery.tsx` - Vendor search interface

**UI Elements**:
- Wallet balance in header (top-right)
- Quick actions: Find Vendors, Fund Wallet, Browse Marketplace
- Chat interface for AI agent interaction

### WhatsApp (WaSender)

**Location**: `apps/mini-app/app/api/webhook/whatsapp/route.ts`

**Flow**:
1. User sends first message to Linka WhatsApp number
2. WaSender webhook forwards to `/api/webhook/whatsapp`
3. AI agent responds: "Welcome to Linka! Let's get you started."
4. Conversational onboarding via message exchange
5. AI requests email, name, consent
6. Backend creates user with phone number as thread ID
7. AI confirms: "Account created! Your wallet: 0x..."

**Thread Management**:
- Phone number used as `threadId`
- Conversation context maintained across messages
- Session-based authentication (no login required)

**Example Flow**:
```
User: "Hi"
AI: "Welcome to Linka! I'll need your email and name to create your account."
User: "My email is user@example.com, my name is John"
AI: "Great! I consent to data collection and storage."
AI: "Account created! Your wallet address is 0x123... Send ETH to fund it."
User: "How do I fund my wallet?"
AI: "Send ETH to 0x123... from any wallet. I'll check your balance once funded."
```

### Farcaster Mini App

**Location**: `apps/mini-app/minikit.config.ts`

**Flow**:
1. User discovers Linka through Farcaster cast
2. Clicks to open mini app
3. Embedded chat interface loads
4. AI agent: "Welcome! Connect your Farcaster account?"
5. User confirms (FID linked to email)
6. Backend creates/updates user with FID
7. AI confirms: "Connected! Here's your wallet: 0x..."

**Farcaster-Specific Features**:
- FID (Farcaster ID) integration
- Profile integration with Farcaster identity
- On-chain profile linking (Base network)
- Cast sharing with transaction details

---

## Backend Onboarding API

### Identity Endpoints

**Create User** (`POST /api/identity/create`):
```typescript
{
  email: string;
  username: string;  // Unique username (e.g., "johndoe" displayed as "johndoe.linka")
  password: string;  // Plain text password (will be hashed with bcrypt)
  profile: {
    name: string;
    bio?: string;
    isVendor: boolean;
  };
  consentGiven: boolean;
  channel: 'web' | 'whatsapp' | 'farcaster';
  phoneNumber?: string;
  farcasterFid?: number;
  googleId?: string;
}
```

**Sign In** (`POST /api/identity/signin`):
```typescript
{
  email: string;
  password: string;
}
```

**Get Wallet Balance** (`GET /api/identity/:email/wallet/balance`):
```typescript
{
  walletAddress: string;
  balance: string;        // ETH balance
  currency: string;       // 'ETH'
  network: {
    name: string;         // 'Base Sepolia' or 'Base'
    chainId: number;      // 84532 or 8453
  };
}
```

---

## AI Agent Onboarding Prompts

### System Prompt

The AI agent uses a system prompt that includes onboarding context:

```typescript
`You are Linka, a conversational marketplace assistant. You help users:
- Discover vendors and products
- Manage their wallet and payments
- Browse the marketplace
- Make onchain transactions

User Context: ${userEmail ? `Current user: ${userEmail}` : 'No user context available'}

Available tools:
- search_vendors: Search vendors by category
- create_escrow: Create escrow for transactions
- fund_wallet: Get wallet funding information
- get_wallet_balance: Get user's wallet balance
...`
```

### Onboarding Intent Detection

**User Intent**: New user asking about signup
**AI Response**: "I'll help you create an account. I'll need your email, username, password, and name."

**User Intent**: First-time user messaging
**AI Response**: "Welcome to Linka! You can browse vendors anonymously. If you want to make purchases, you'll need to sign up with your email, username, password, and name."

**Authentication Required Actions**:
- Making purchases (create_escrow)
- Wallet management (get_wallet_balance, fund_wallet)
- Transaction management (release_payment, file_dispute)
- Becoming a vendor (create_vendor)

**Anonymous User Actions**:
- Browse vendors (search_vendors)
- View vendor profiles
- Get information about services

---

## Database Schema

### User Model

**Full Schema** (`apps/backend/src/models/User.ts`):
- Email (unique, indexed)
- Wallet address (unique, indexed)
- Encrypted private key
- Profile data (name, bio, categories, location)
- Reputation scores (0-1000)
- Verification status (email, phone, KYC)
- Consent flags (GDPR compliance)

**Indexes**:
- Email (primary)
- Wallet address
- Phone number (sparse)
- FID (sparse)
- Profile categories
- Reputation score

---

## Security Considerations

### Private Key Storage

- **Encryption**: Private keys encrypted with bcrypt before storage
- **Salt**: User-specific salt per wallet
- **Access**: Private key only decrypted for transaction signing
- **Rotation**: Planned future feature for key rotation

### Data Privacy

- **GDPR Compliance**: Consent required for all data collection
- **Minimal Data**: Only collect data necessary for platform functionality
- **Encryption**: All sensitive data encrypted at rest
- **Access Control**: User data only accessible by authenticated user

---

## Onboarding Completion Checklist

### Required Steps

- [ ] User provides email and name
- [ ] User gives consent for data collection
- [ ] Backend creates user record in MongoDB
- [ ] Backend generates wallet and stores encrypted private key
- [ ] Wallet funding instructions provided to user
- [ ] User funds wallet (optional, but required for transactions)
- [ ] Onboarding marked as complete

### Optional Steps

- [ ] Google account linked
- [ ] Base name or ENS name provided
- [ ] Profile completed (bio, avatar, location)
- [ ] Vendor profile created (if vendor)

---

## Error Handling

### Common Issues

**Invalid Email**:
- AI: "Please provide a valid email address."

**Missing Consent**:
- AI: "I need your consent to create your account. Type 'I consent' to continue."

**Wallet Creation Failure**:
- AI: "I'm having trouble creating your wallet. Please try again."
- Backend logs error for debugging
- Support contact information provided

**Funding Issues**:
- AI: "No balance detected. Make sure you're sending ETH to the correct address on Base network."
- AI provides wallet address again
- AI offers to check balance: "Type 'check balance' to verify funding."

---

## User Journey Summary

1. **Discovery**: User finds Linka on Web, WhatsApp, or Farcaster
2. **Conversation**: User initiates conversation with AI agent
3. **Onboarding**: AI collects email, name, consent
4. **Account Creation**: Backend creates user and wallet
5. **Funding**: User funds wallet via Base network
6. **Platform Access**: User starts discovering vendors and making transactions
7. **Transactions**: User creates escrows and releases payments

---

## Future Enhancements

### Planned Features

**Phase 1** (Current - MVP):
- ✅ Multi-channel onboarding
- ✅ Automatic wallet creation
- ✅ Balance checking
- ✅ Direct Base network funding

**Phase 2** (Next 3 months):
- Bread.africa integration for fiat on-ramp
- KYC verification flow
- Multi-wallet support
- Social login (Google, GitHub)

**Phase 3** (6 months):
- Mobile app onboarding
- Biometric authentication
- Recovery phrase backup
- Hardware wallet integration
