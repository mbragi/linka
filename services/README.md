# Services

Backend services for Linka, primarily written in Rust for performance and reliability.

## Structure

### `wallet-core/` - Custodial Wallet Service
- Rust service for custodial wallet management
- Manages identity (email, ECN/Base names, Google auth)
- Calendar, social actions, reminders
- Handles user commands and wallet operations
- **Tech**: Rust, MongoDB
- **Status**: 🚧 To be implemented

### `vendor-service/` - Vendor Discovery Service
- Vendor discovery and listing management
- MongoDB-backed search and filtering
- Exposes `/api/vendors/search`
- Rating and review system
- **Tech**: Rust, MongoDB
- **Status**: 🚧 To be implemented

### `bread-proxy/` - Bread.africa Integration
- Proxy service for Bread.africa API
- Handles fiat on-ramp and off-ramp
- KYC verification and account management
- Fallback support for Paystack/Flutterwave
- **Tech**: TypeScript/Node or Rust
- **Status**: 🚧 To be implemented

## API Contracts

All services expose REST APIs that the adapter layer consumes:

- `wallet-core`: `/api/wallet/*`
- `vendor-service`: `/api/vendors/*`
- `bread-proxy`: `/api/ramp/*`

## Development

```bash
# Build all Rust services
cd services/wallet-core && cargo build
cd services/vendor-service && cargo build

# Run services
cargo run --bin wallet-core
cargo run --bin vendor-service
```

## Shared Libraries

Services use shared crates from `libs/`:
- `ai_core` - Wit.ai, Ollama integration
- `wallet_core` - Wallet generation utilities
- `messaging_core` - Message schemas
- `db_core` - MongoDB helpers
