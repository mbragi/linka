# Libraries

Shared libraries and utilities used across Linka services and applications.

## Structure

### Rust Crates

#### `ai_core/`
- Wit.ai integration for NLU
- Ollama integration for local AI
- Intent classification and entity extraction
- **Status**: 🚧 To be implemented

#### `wallet_core/`
- Custodial wallet generation
- Key management utilities
- Blockchain interaction helpers
- **Status**: 🚧 To be implemented

#### `messaging_core/`
- Standard message schemas
- Protocol buffers or JSON schemas
- Shared types across services
- **Status**: 🚧 To be implemented

#### `db_core/`
- MongoDB connection management
- Common queries and helpers
- Migration utilities
- **Status**: 🚧 To be implemented

### TypeScript/React Libraries

#### `ui-components/`
- Shared React components
- Linka brand-consistent UI elements
- Chat components, modals, forms
- **Tech**: React, Tailwind CSS
- **Status**: 🚧 To be implemented

## Development

### Rust Libraries

```bash
# Build a specific library
cd libs/ai_core && cargo build

# Test libraries
cargo test --workspace
```

### TypeScript Libraries

```bash
# Build UI components
cd libs/ui-components
npm run build

# Use in apps
# Automatically linked via npm workspaces
```

## Design Principles

- **Modularity**: Each library has a single, clear purpose
- **Swappability**: Abstractions allow provider switching
- **Type Safety**: Strong typing in both Rust and TypeScript
- **Testing**: Comprehensive test coverage
- **Documentation**: Clear API docs and examples
