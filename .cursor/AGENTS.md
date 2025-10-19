# Linka Agents Architecture

## Core Agent Services

### Wallet Agent (`wallet.rs`)
- **Purpose**: Custodial wallet management and funding operations
- **Intents**: `wallet_fund`, `wallet_balance`, `wallet_withdraw`, `wallet_create`
- **Dependencies**: `wallet_core`, `ramp_core` (Bread integration)
- **MCP Integration**: Bread.africa client for on/off-ramp operations

### Vendor Agent (`vendor.rs`)
- **Purpose**: Vendor discovery, search, and booking management
- **Intents**: `search_vendor`, `book_vendor`, `vendor_details`, `vendor_list`
- **Dependencies**: `db_core` (MongoDB), `messaging_core`
- **External APIs**: Vendor directory services

### Calendar Agent (`calendar.rs`)
- **Purpose**: Appointment scheduling and time management
- **Intents**: `schedule_appointment`, `check_availability`, `reschedule`, `cancel_booking`
- **Dependencies**: `db_core`, `messaging_core`
- **Integration**: Vendor availability systems

### User Agent (`user.rs`)
- **Purpose**: User identity, onboarding, and session management
- **Intents**: `user_onboard`, `user_profile`, `user_preferences`, `user_sync`
- **Dependencies**: `db_core`, `wallet_core`
- **External**: Google OAuth, email verification

### Payment Agent (`payment.rs`)
- **Purpose**: Transaction processing and payment orchestration
- **Intents**: `process_payment`, `payment_status`, `refund_request`, `payment_history`
- **Dependencies**: `wallet_core`, `ramp_core`
- **Fallbacks**: Paystack, Flutterwave integration

## Intent Classification Flow

1. **Wit.ai Processing**: Raw message → intent classification
2. **Intent Routing**: Intent → specific agent service
3. **Agent Execution**: Agent processes request with dependencies
4. **Response Generation**: Agent → conversational response
5. **Fallback Handling**: Unknown intents → clarification prompts

## MCP Integration Points

### Bread.africa MCP Client
- **Location**: `/libs/ramp_core/src/bread_mcp.rs`
- **Operations**: `create_account`, `get_quote`, `fund_wallet`, `withdraw_funds`
- **Fallback**: REST API calls if MCP unavailable

### WaSender MCP Client
- **Location**: `/libs/messaging_core/src/wasender_mcp.rs`
- **Operations**: `send_message`, `receive_webhook`, `get_chat_status`
- **Privacy**: No local phone number storage

## Service Communication

- **Adapter → Core**: HTTP/gRPC calls to Rust services
- **Core → External**: MCP clients for third-party services
- **Inter-Agent**: Shared message schemas via `messaging_core`
- **State Management**: Redis for session persistence

## Error Handling & Fallbacks

- **MCP Unavailable**: Automatic fallback to REST APIs
- **Agent Failure**: Graceful degradation with user notification
- **Payment Failure**: Multiple provider fallback chain
- **Unknown Intent**: Clarification prompts with context