# Apps

Frontend applications for Linka's multi-channel conversational marketplace.

## Structure

### `mini-app/` - Universal Web Application
- Next.js 14 app for Base/Farcaster integration and web
- MiniKit compatible with manifest and webhooks
- Chat-native UI with wallet and vendor discovery
- Serves as both mini-app and primary web interface
- **Direct webhook endpoints** for external integrations (WhatsApp, etc.)
- **Status**: ✅ Complete and ready for deployment

## Development

```bash
# Run mini app (universal web app with webhooks)
npm run dev:mini-app
```
