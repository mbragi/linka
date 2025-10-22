# Linka: The Conversational Onchain Marketplace
## Overview
Linka connects conversations to commerce. Users discover vendors, chat naturally, and pay with a custodial wallet — across WhatsApp, Web, and Farcaster.

---

## 📋 User Onboarding & Data Collection

### Pre-Onboarding Requirements
Before wallet creation, Linka implements a comprehensive data collection and consent flow:

- **GDPR Compliance**: Mandatory consent for data collection and storage
- **Multi-Channel Collection**: Data gathered through chat, web interface, and Farcaster modals
- **Minimal UI Approach**: Maximum 2 screens to maintain user engagement
- **Google Integration**: Optional Google account data collection (with explicit consent)
- **Future-Ready Infrastructure**: Prepared for legal-to-legal transaction compliance

### Communication Channels
- **Chat-based**: Primary interaction through WhatsApp, Web chat, and Farcaster
- **Web Interface**: Dedicated onboarding flow with streamlined consent process
- **Farcaster Integration**: Modal-based consent flow for seamless user experience

---

## 🧾 Fiat On-Ramp & Off-Ramp

Linka integrates Bread.africa via API for fiat on- and off-ramping. After completing data collection and consent, during wallet funding or whenever a wallet top-up is requested, the user will be offered two flows:

- **Embedded Onboarding:** If the user consents, Bread.africa is used to generate a virtual Naira account (or equivalent). Bread handles KYC and wallet linking.
- **Deferred Top-up:** If the user declines, Linka can still accept fiat funding via Paystack or Flutterwave by linking an external bank card or account.

Bread.africa is accessed through an abstraction layer to ensure swappability. In case of performance, pricing, or reliability issues, the backend can switch providers without breaking the chat UX.

All quote requests and wallet top-ups are kept within the natural conversational flow, with visual UI modals or message cards used only for confirmations.

---

## 🔄 Complete User Flow

### Phase 1: Discovery & Initial Contact
- User discovers Linka through WhatsApp, Web, or Farcaster
- Initiates conversation with Linka bot

### Phase 2: Data Collection & Consent
- GDPR consent for data collection and storage
- Google account information collection (optional, with consent)
- Maximum 2-screen consent flow across all platforms

### Phase 3: Wallet Creation & Funding
- Custodial wallet creation after consent completion
- Funding via Bread.africa or alternative methods (Paystack/Flutterwave)
- KYC handling through Bread.africa integration

### Phase 4: Platform Access & Transactions
- Vendor discovery and chat initiation
- Seamless payment processing through custodial wallet
- Future-ready infrastructure for legal-to-legal transactions
