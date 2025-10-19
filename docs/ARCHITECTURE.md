# ARCHITECTURE.md

## System Overview

Linka is a modular, multi-channel conversational marketplace that interfaces users with vendors, payments, and blockchain services via conversational interfaces like WhatsApp, Web chat, and Farcaster. It emphasizes composability, fallback resiliency, and clean interfacing with third-party systems using optional MCP (Message Control Protocol) clients.

---

## Core Services

### 1. Adapter Layer

* **TypeScript/Node Service** for routing incoming chat messages
* Supports: WhatsApp (via WaSender), Web, Farcaster
* Routes intents via Wit.ai and connects to:

  * Wallet and user service
  * Vendor Discovery and Listings
  * Bread Integration (On/Off-Ramp)

### 2. Wallet & User Core (Rust)

* Custodial wallet manager
* Manages identity (email, ECN/Base names, Google auth)
* Calendar, social actions, reminders
* Handles generic and task-specific user commands
* Receives message payloads via adapter

### 3. Vendor Service (Rust)

* Vendor discovery + listing
* MongoDB-backed
* Exposes `/api/vendors/search`

### 4. Shared Crates (`libs/`)

* `ai_core` (Wit.ai, Ollama)
* `wallet_core` (custodial wallet generation)
* `messaging_core` (standard schemas)
* `db_core` (Mongo helper)

---

## On-Ramp Abstraction

### Bread.africa

* First-class integration as on-ramp/off-ramp provider
* Accessed via API or MCP server if available
* Modular fallback allows switching to Paystack/Flutterwave/others
* User funding flow:

  1. Ask user to fund wallet
  2. Show Bread-powered modal or generate account
  3. If declined, fallback to other flow

### Design Contract

All providers must support:

* `quote_request`
* `initiate_topup`
* `resolve_transaction`
* Optionally: `create_account`, `KYC_verify`

---

## Deployment Note

Linka is capable of acting as an MCP client when third-party services (e.g., Bread) expose compatible control servers. This allows higher reliability and circuit-breaker style switching.
