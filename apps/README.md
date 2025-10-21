# Apps

Frontend applications for Linka's multi-channel conversational marketplace.

## Structure

### `mini-app/` - Farcaster Mini App
- Next.js 14 app for Base/Farcaster integration
- MiniKit compatible with manifest and webhooks
- Chat-native UI with wallet and vendor discovery
- **Status**: ✅ Complete and ready for deployment

### `web/` - Main Web Application
- Primary web interface for Linka
- Full-featured marketplace with advanced search
- User dashboard and vendor management
- **Status**: 🚧 To be implemented

### `adapter/` - Message Routing Adapter
- TypeScript/Node service for routing chat messages
- Supports: WhatsApp (WaSender), Web, Farcaster
- Routes intents via Wit.ai
- Connects to backend services
- **Status**: 🚧 To be implemented

## Development

```bash
# Run mini app
npm run dev:mini-app

# Run web app
npm run dev:web

# Run adapter
npm run dev:adapter
```

## Shared Dependencies

Apps can share:
- UI components from `libs/ui-components`
- TypeScript types from `libs/messaging_core`
- Common utilities and helpers
