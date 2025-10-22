# Apps

Frontend applications for Linka's multi-channel conversational marketplace.

## Structure

### `mini-app/` - Universal Web Application
- Next.js 14 app for Base/Farcaster integration and web
- MiniKit compatible with manifest and webhooks
- Chat-native UI with wallet and vendor discovery
- Serves as both mini-app and primary web interface
- **Status**: ✅ Complete and ready for deployment

### `adapter/` - Message Routing Adapter
- TypeScript/Node service for routing chat messages
- Supports: WhatsApp (WaSender), Web, Farcaster
- Routes intents via Wit.ai
- Connects to backend services
- **Status**: 🚧 To be implemented

## Development

```bash
# Run mini app (universal web app)
npm run dev:mini-app

# Run adapter
npm run dev:adapter
```

## Shared Dependencies

Apps can share:
- UI components from `libs/ui-components`
- TypeScript types from `libs/messaging_core`
- Common utilities and helpers
