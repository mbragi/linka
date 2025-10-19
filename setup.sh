#!/bin/bash

# Linka Development Environment Validation Script

echo "🔧 Linka Development Environment Setup"
echo "======================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local not found. Creating from template..."
    cp env.template .env.local
    echo "✅ Created .env.local from template"
    echo "📝 Please edit .env.local with your actual API keys and configuration"
fi

# Check if required directories exist
echo "📁 Checking project structure..."
required_dirs=("linka-core" "linka-adapter" "services/bread-proxy" "libs/ramp_core")
for dir in "${required_dirs[@]}"; do
    if [ -d "$dir" ]; then
        echo "✅ $dir exists"
    else
        echo "❌ $dir missing"
        exit 1
    fi
done

# Check if Docker Compose file exists
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ docker-compose.yml not found"
    exit 1
fi

echo "✅ Project structure validated"

# Start infrastructure services
echo "🚀 Starting infrastructure services..."
docker-compose up -d mongodb redis ollama

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
echo "🔍 Checking service health..."

# Check MongoDB
if docker-compose exec -T mongodb mongosh --eval "db.runCommand('ping')" > /dev/null 2>&1; then
    echo "✅ MongoDB is ready"
else
    echo "❌ MongoDB is not responding"
fi

# Check Redis
if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis is ready"
else
    echo "❌ Redis is not responding"
fi

# Check Ollama
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "✅ Ollama is ready"
else
    echo "❌ Ollama is not responding"
fi

echo ""
echo "🎉 Development environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your API keys"
echo "2. Start all services: docker-compose up -d"
echo "3. Run core service: cd linka-core && cargo run"
echo "4. Run adapter service: cd linka-adapter && npm run dev"
echo "5. Run Bread proxy: cd services/bread-proxy && npm run dev"
echo ""
echo "📚 See DEVELOPMENT.md for detailed instructions"
