#!/bin/bash

# Frostline Setup Script
# This script helps you get started quickly

echo "🌨️  Setting up Frostline..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first:"
    echo "   https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm found: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚠️  IMPORTANT: Mapbox Token Required"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Before running the app, you need to set up your Mapbox token:"
echo ""
echo "1. Go to https://account.mapbox.com/access-tokens/"
echo "2. Sign up or log in (free account is fine)"
echo "3. Copy your default public token"
echo "4. Open .env.local in this directory"
echo "5. Replace 'pk.your_actual_mapbox_token_here' with your token"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if .env.local exists and has a placeholder token
if [ -f ".env.local" ]; then
    if grep -q "pk.your_actual_mapbox_token_here" .env.local; then
        echo "⚠️  .env.local still contains placeholder token!"
        echo "   Please update it before running the app."
        echo ""
    else
        echo "✅ .env.local exists and appears configured"
        echo ""
    fi
else
    echo "❌ .env.local file not found!"
    echo "   Creating it now..."
    cat > .env.local << 'EOF'
# Mapbox API Key Configuration
# 
# REQUIRED: Get your free Mapbox access token at:
# https://account.mapbox.com/access-tokens/

VITE_MAPBOX_TOKEN=pk.your_actual_mapbox_token_here
EOF
    echo "✅ Created .env.local - please add your Mapbox token!"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo "1. Add your Mapbox token to .env.local"
echo "2. Run: npm run dev"
echo "3. Open: http://localhost:5173"
echo ""
echo "For more info, read README.md or DEMO_GUIDE.md"
echo ""
echo "Good luck with your hackathon! 🎉"
