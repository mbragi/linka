
## Core Agents

### 1. `nlu_dispatcher`

* **Purpose**: Receives user message → calls Wit.ai → routes to correct sub-agent.
* **Tech**: TypeScript (Adapter)
* **Trigger**: All user messages

### 2. `wallet_manager`

* **Purpose**: Creates and manages custodial wallets, handles crypto transfers
* **Tech**: Rust (wallet_core)
* **Trigger**: `wallet_create`, `wallet_balance`, `wallet_send`, `wallet_fund`

### 3. `vendor_search`

* **Purpose**: Search and list vendors based on category/location.
* **Tech**: Rust
* **Trigger**: `search_vendor`

### 4. `booking_agent`

* **Purpose**: Handles vendor bookings, time confirmation, and context binding
* **Tech**: Rust
* **Trigger**: `create_booking`, `list_slots`

### 5. `ramp_handler`

* **Purpose**: Interfaces with Bread MCP or fallback REST API to handle fiat top-up/off-ramp
* **Tech**: Rust (`ramp_core`), uses service abstraction
* **Trigger**: `wallet_fund`, `wallet_withdraw`

### 6. `chat_memory`

* **Purpose**: Maintains per-session state and caches temporary user info
* **Tech**: TypeScript + Redis (optional)
* **Trigger**: All intents needing context continuity

### 7. `system_logger`

* **Purpose**: Logs all major actions (wallet creation, booking, funding) for auditability
* **Tech**: Rust + MongoDB
* **Trigger**: All major flows

---

> These agents operate either as stateless microservice functions or embedded logic in backend crates. They must be testable independently, mockable in unit tests, and observable through logs and metrics.

---

To contribute new agents or rules, append them to this document and reference the relevant service folder in `/apps/linka/` or `/libs/`.
