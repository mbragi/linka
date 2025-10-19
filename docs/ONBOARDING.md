# ONBOARDING.md

## Onboarding Flow for Linka

Linka's onboarding process prioritizes minimal UI friction, consent-first identity verification, and secure custodial wallet provisioning.

---

## 1. Entry Points

* **WhatsApp:** Via WaSender API, deep links from social and paid campaigns
* **Web App:** Direct chat entry or modal onboarding
* **Farcaster:** Linka button or cast reply kicks off onboarding

---

## 2. Consent + Identity Collection

### Required:

* GDPR-style consent banner (opt-in only)
* Acceptance of terms for storage and wallet issuance

### Data Points:

* **Primary Identifier:** User email (Google OAuth)
* **Display Name:** Optional during onboarding
* **Preferred Channel:** WhatsApp / Web / Farcaster

---

## 3. Custodial Wallet Setup

* Wallet is generated automatically post-consent
* Linked to user email + internal `user_ref`
* Wallet metadata stored in MongoDB
* Wallet address returned to frontend for confirmation

---

## 4. Fiat Onramp (Bread.africa Integration)

* **MCP-First Approach**: Linka connects as MCP client to Bread server
* **MCP Operations**: `create_account`, `get_quote`, `fund_wallet`, `kyc_verify`
* **Fallback Strategy**: If MCP unavailable, use REST API with conversational flow
* **Bread Handshake**: Automatic MCP connection on service startup
* **KYC Flow**: Bread handles verification, NUBAN issuance via MCP

## 5. Optional: Deferred Top-up (Paystack/Flutterwave)

* **Fallback Chain**: Bread MCP → Bread REST → Paystack → Flutterwave
* **Conversational Flow**: Card or bank detail collection via chat
* **Provider Abstraction**: All providers implement same interface
* **Wallet Attachment**: Funding method linked to custodial wallet

---

## 6. Session Continuity & Channel Sync

* User identity syncs across channels using email or ECN/Base name
* Session history cached and replayed across Farcaster/Web/WhatsApp

---

## 7. Developer Notes

* `.mcp.json` should allow local config and ignore bread-only secrets
* Use `user_ref` to bind wallets and ramps to internal account ID
* Maintain abstraction layers for replacing Bread or any other KYC provider
