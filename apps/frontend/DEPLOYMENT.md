# Linka Mini App - Deployment Guide

## Quick Start

1. **Deploy to Vercel**
   ```bash
   # Install dependencies
   npm install
   
   # Deploy to Vercel
   npx vercel --prod
   ```

2. **Configure Environment Variables**
   Create `.env.local` with:
   ```
   NEXT_PUBLIC_ROOT_URL=https://your-app-name.vercel.app
   NEXT_PUBLIC_PROJECT_NAME=Linka
   ```

3. **Update MiniKit Configuration**
   - Update `minikit.config.ts` with your Vercel URL
   - Replace placeholder values with your actual domain

4. **Create Account Association**
   - Go to [Base Build Account Association](https://www.base.dev/preview?tab=account)
   - Enter your Vercel app URL
   - Generate and copy the `accountAssociation` object
   - Update `minikit.config.ts` with the credentials

5. **Test Your App**
   - Visit [base.dev/preview](https://base.dev/preview)
   - Add your app URL to test embeds and functionality
   - Verify account association and metadata

6. **Publish to Base**
   - Create a post in the Base app with your app's URL
   - Your mini app will be discoverable and launchable

## Required Assets

Place these files in the `public/` directory:
- `linka-icon.png` (512x512px) - App icon
- `linka-hero.png` (1200x630px) - Hero/splash image  
- `screenshot-portrait.png` (375x812px) - App screenshot

## Features

- ✅ Chat-native UI following Linka brand guidelines
- ✅ Quick action buttons for common tasks
- ✅ Responsive design for mobile and desktop
- ✅ MiniKit integration for Base app compatibility
- ✅ Webhook endpoint for Farcaster events
- ✅ Ready for custodial wallet integration
- ✅ Vendor discovery placeholder

## Next Steps

1. Add actual vendor data and search functionality
2. Integrate custodial wallet creation and funding
3. Connect to Bread.africa for fiat on-ramp
4. Add WhatsApp and web chat adapters
5. Implement user onboarding flow