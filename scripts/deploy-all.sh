#!/bin/bash

# Deploy all Linka services
# Usage: ./scripts/deploy-all.sh

set -e

echo "🚀 Deploying Linka Full Stack..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "📱 Deploying Mini App..."
cd apps/mini-app
npm install
vercel --prod
cd ../..

echo "🔧 Deploying Backend Services..."

# Deploy Wallet Core
echo "💰 Deploying Wallet Core..."
cd services/wallet-core
railway login
railway init
railway up
cd ../..

# Deploy Vendor Service
echo "🏪 Deploying Vendor Service..."
cd services/vendor-service
railway init
railway up
cd ../..

# Deploy Bread Proxy
echo "🍞 Deploying Bread Proxy..."
cd services/bread-proxy
railway init
railway up
cd ../..

# Deploy Adapter
echo "🔌 Deploying Adapter..."
cd apps/adapter
railway init
railway up
cd ../..

echo "🤖 Deploying AI Agent..."
cd apps/ai-agent
railway init
railway up
cd ../..

echo "✅ All services deployed!"
echo ""
echo "📋 Next steps:"
echo "1. Configure environment variables in each service"
echo "2. Set up MongoDB Atlas database"
echo "3. Configure Pinecone vector database"
echo "4. Test all service health endpoints"
echo "5. Update frontend environment variables"
