# PRD.md

## Product Title

**Linka: The Conversational Onchain Marketplace**

## Overview

Linka is a multi-channel, conversational interface that enables users to discover vendors, initiate chat, and perform transactions with embedded onchain capabilities. Accessible via WhatsApp (WaSender API), Web, and Farcaster, Linka maintains context-rich, fluid NLU-based interactions while supporting fiat and crypto onboarding, vendor management, and secure custodial wallet experiences.

---

## Core Capabilities

* **Custodial Wallets** for every onboarded user (auto-generated)
* **NLU-powered chat interface** via Wit.ai and Ollama
* **Fiat On/Off-Ramp** via Bread.africa (MCP client or fallback API)
* **Fallback Payment Integration** (Paystack, Flutterwave)
* **Multi-channel access**: Web, WhatsApp, Farcaster
* **Vendor Discovery & Search** (indexed + filterable)
* **Booking & Transaction flow** with contextual routing
* **Abstraction layer for ramping and payments** to allow swappability

---

## Target Users

* Young professionals using mobile-first platforms
* Small business vendors in digital-first markets
* Onchain-curious users in emerging regions (e.g., Nigeria)

---

## User Personas

* **Amina**, a beauty vendor in Lagos who accepts payments via WhatsApp
* **Kelvin**, a crypto-savvy user who wants a seamless ramp-to-wallet flow
* **Ify**, a client who books appointments via chat and prefers Web/Farcaster

---

## Success Metrics

* Wallet activation rate post-onboarding
* Vendor booking conversion through chat
* % of transactions processed via onchain infrastructure
* User retention across channels (Web, WhatsApp, Farcaster)

---

## Constraints

* Regulatory compliance on custodial wallets
* Bread API must be optionally accessed via MCP
* All critical payment actions must work conversationally without UI dependency

---

## Key User Journeys

1. **Onboarding**
   * Channel entry → Consent Flow → Google/Email Identity → Wallet auto-creation
   * MCP handshake with Bread.africa for KYC/account setup
   * Fallback to Paystack/Flutterwave if Bread unavailable

2. **Discovery**
   * Chat: "Find tailors in Lekki" → Vendor listing with embedded action cards
   * NLU processing via Wit.ai → Intent routing to vendor agent
   * MongoDB-backed vendor search with filtering

3. **Transaction**
   * "Book Jane for 3PM" → Confirmation → Quote → Bread/Wallet flow
   * Calendar agent handles scheduling
   * Payment agent orchestrates transaction

4. **Funding**
   * MCP-first Bread integration → If declined → fallback prompt
   * Conversational funding flow without UI dependency
   * Multiple provider fallback chain

5. **Off-ramping**
   * User selects "Withdraw funds" → Bread MCP flow → Confirm → Tx receipt
   * Custodial wallet integration with Base network

## Technical Requirements

### MCP Integration
- Primary: Bread.africa MCP client for on/off-ramp
- Secondary: WaSender MCP client for WhatsApp integration
- Fallback: REST API calls when MCP unavailable

### Service Architecture
- **linka-core/**: Rust services (wallet, vendor, calendar, user agents)
- **linka-adapter/**: TypeScript routing and channel management
- **services/**: Swappable external service integrations
- **libs/ramp_core**: MCP client abstraction layer

### Development Environment
- Docker Compose for local development
- MongoDB + Redis for data persistence
- Ollama for conversational AI
- Environment configuration via `.env.local`
