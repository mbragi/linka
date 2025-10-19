# Linka

A conversational onchain marketplace that enables vendor discovery, chat, and payments through natural language interfaces across WhatsApp, Web, and Farcaster channels.

## Overview

Linka provides a channel-agnostic conversational commerce platform built on Base blockchain. Users can discover vendors, initiate bookings, and complete transactions entirely through chat interfaces, with automatic custodial wallet provisioning and fiat on/off-ramp capabilities.

## Key Features

- **Multi-channel Support**: WhatsApp (WaSender API), Web chat, Farcaster
- **Conversational Commerce**: Complete transaction flows through natural language
- **Custodial Wallets**: Auto-generated Base wallets for all users
- **Fiat Integration**: Bread.africa on/off-ramp with Paystack/Flutterwave fallbacks
- **NLU Processing**: Wit.ai integration for intent classification
- **Vendor Discovery**: Searchable vendor listings with booking capabilities

---

## 🚀 Quick Start

1. **Choose your channel**: WhatsApp, Web, or Farcaster
2. **Complete onboarding**: Email verification + automatic wallet creation
3. **Fund your wallet**: Via Bread.africa or card payments
4. **Start chatting**: "Find tailors in Lekki" → discover → book → pay

---

## 📚 Documentation

- **[Pitch Deck](docs/PITCH.md)** - Project overview and value proposition
- **[Product Requirements](docs/PRD.md)** - Complete product specification
- **[Architecture](docs/ARCHITECTURE.md)** - Technical system design
- **[Brand Guidelines](docs/BRAND.md)** - Visual identity and tone
- **[Onboarding Flow](docs/ONBOARDING.md)** - User journey details

---

## 🛠 Technical Stack

- **Frontend**: TypeScript/Node.js adapter layer
- **Backend**: Rust services for wallet, vendor, and user management
- **Blockchain**: Base network with custodial wallet infrastructure
- **AI**: Wit.ai for NLU, Ollama for conversational AI
- **Payments**: Bread.africa (MCP-first), Paystack/Flutterwave fallbacks
- **Database**: MongoDB for vendor listings and user data

---

*Linka — Conversations that close onchain.*

---

## ⚡️ Powered by Base

Linka leverages [Base](https://base.org) as its primary onchain infrastructure, providing affordable and scalable transactions. Making onchain activity accessible to users regardless of prior crypto experience. However, while wallets and payments use Base, not all external flows (e.g., fiat on/off-ramp, vendor API integrations) are fully onchain.

---
