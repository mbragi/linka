# Anonymous-First Architecture Updates

## Overview

This document outlines the updates made to implement an anonymous-first user experience for Linka, where users can browse vendors without authentication but must sign in for purchases, wallet management, and vendor registration.

## Changes Summary

### 1. User Model Updates

**File**: `apps/backend/src/models/User.ts`

**Changes**:
- Added `username` field (unique, indexed)
- Added `password` field (required, will be hashed with bcrypt)
- Added username validation regex (lowercase letters, numbers, dots, underscores, hyphens)
- Added index for username for performance

**Example**:
```typescript
{
  email: string;
  username: string;  // e.g., "johndoe" (displayed as "johndoe.linka")
  password: string;  // Bcrypt hashed
  walletAddress: string;
  encryptedPrivateKey: string;
  ...
}
```

### 2. Backend Authentication

**File**: `apps/backend/src/controllers/IdentityController.ts`

**Changes**:
- Updated `createUser` to accept username and password
- Added bcrypt password hashing (10 rounds)
- Added username uniqueness validation
- Added email uniqueness validation
- Created new `signIn` method for password-based authentication

**New Endpoint**: `POST /api/identity/signin`
```typescript
{
  email: string;
  password: string;
}
```

**Updated Endpoint**: `POST /api/identity/create`
```typescript
{
  email: string;
  username: string;
  password: string;
  profile: { name: string, isVendor: boolean };
  consentGiven: boolean;
}
```

### 3. Frontend Anonymous Home Screen

**File**: `apps/frontend/app/page.tsx`

**Changes**:
- Added anonymous home screen that shows by default
- Added quick links for anonymous users: "Find Vendors", "Become a Vendor", "Sign In"
- Removed automatic onboarding modal
- Added `showAnonymousHome` state management
- Created separate actions for anonymous vs authenticated users

**Anonymous Home Screen Features**:
- Hero section with tagline "Conversations that close onchain"
- Quick action buttons
- Message prompting sign-in for wallet access and purchases

### 4. Onboarding Modal Updates

**File**: `apps/frontend/components/OnboardingModal.tsx`

**Changes**:
- Added username field (for new users)
- Added password field (for new users)
- Added confirm password field (for new users)
- Added password validation (min 8 characters, matching passwords)
- Updated sign-in flow to require password
- Updated API calls to include username and password

**New Fields**:
- `username`: Required for new users, shown as "johndoe.linka"
- `password`: Required for all users, minimum 8 characters
- `confirmPassword`: Required for new users, must match password

### 5. AI Agent Authentication Checks

**File**: `apps/frontend/app/api/agent/route.ts`

**Changes**:
- Added authentication state checking in system prompt
- Created `callBackendToolWithAuth` function to validate authentication before tool calls
- Updated system prompt to inform AI about authentication requirements
- Added list of authenticated-only tools

**Authentication-Required Tools**:
- `create_escrow`: Creating escrow transactions
- `release_payment`: Releasing payments
- `file_dispute`: Filing disputes
- `get_transaction_status`: Transaction status
- `get_wallet_balance`: Wallet balance
- `fund_wallet`: Wallet funding
- `create_vendor`: Vendor registration
- `check_reputation`: Reputation checking

**Anonymous-Allowed Tools**:
- `search_vendors`: Browse vendors and information

### 6. Documentation Updates

**Files Updated**:
- `docs/ONBOARDING.md`: Added anonymous-first approach section
- `docs/ARCHITECTURE.md`: Updated system overview with anonymous-first architecture
- `docs/PRD.md`: Updated user flows with anonymous-first approach

## User Flow

### Anonymous User Flow

1. User visits Linka home screen (anonymous by default)
2. User sees hero section and quick links
3. User can click "Find Vendors" to browse without signing in
4. User can view vendor profiles and information
5. If user attempts to make a purchase: AI prompts for sign-in
6. User clicks "Sign In" → Onboarding modal opens
7. User provides email and password → Authenticated state

### Authenticated User Flow

1. User signs in with email and password
2. User session stored in localStorage
3. Home screen shows chat interface with wallet balance
4. User can make purchases, manage wallet, become vendor
5. All features available without additional prompts

## Key Features

### Username.linka Identity

- All users have a unique username
- Username is displayed with `.linka` suffix (e.g., `johndoe.linka`)
- Username must be lowercase, alphanumeric with dots, underscores, hyphens
- Username is indexed for fast lookups

### Password Security

- Passwords hashed with bcrypt (10 rounds)
- Minimum 8 characters
- Password confirmation required on sign up
- No password recovery flow (yet)

### Authentication Enforcement

The AI agent enforces authentication by:
1. Checking authentication state before tool calls
2. Informing user they need to sign in
3. Providing guidance on how to sign up
4. Allowing anonymous browsing of public information

## Migration Notes

### For Existing Users

- Existing users without passwords will need to reset/update accounts
- Username field added as required field
- Password required for all new accounts

### Database Migration

The User schema now requires:
- `username`: String (required, unique)
- `password`: String (required, hashed)

## Testing Checklist

- [x] Anonymous users can browse vendors
- [x] Anonymous users prompted to sign in for purchases
- [x] Username validation works correctly
- [x] Password hashing works with bcrypt
- [x] Sign in flow works with email/password
- [x] AI agent enforces authentication for protected tools
- [x] Quick links work on anonymous home screen
- [x] Onboarding modal collects username and password
- [x] Documentation updated to reflect changes

## Next Steps

1. Add password reset functionality
2. Add "Forgot Password" flow
3. Add username change functionality (keeping .linka suffix)
4. Add email verification
5. Consider adding 2FA for enhanced security

