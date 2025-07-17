#!/bin/bash

# Cloudflare Workers Deployment Script
# This script sets up environment variables and deploys the backend

echo "🚀 Starting Cloudflare Workers deployment..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

# Login to Cloudflare (if not already logged in)
echo "🔐 Checking Cloudflare authentication..."
wrangler whoami || wrangler login

# Set environment variables
echo "⚙️  Setting up environment variables..."

# Check if .env file exists
if [ -f ".env" ]; then
    echo "✅ Found .env file, using existing configuration"
    source .env
else
    echo "⚠️  No .env file found. Please create .env file with your configuration"
    echo "Required variables:"
    echo "- MONGODB_URI"
    echo "- FORMSAPP_WEBHOOK_SECRET"
    echo "- FIREBASE_PROJECT_ID"
    echo "- FIREBASE_PRIVATE_KEY"
    echo "- FIREBASE_CLIENT_EMAIL"
    exit 1
fi

# Set secrets in Cloudflare Workers
echo "🔒 Setting secrets in Cloudflare Workers..."

# MongoDB URI (required for database connection)
if [ ! -z "$MONGODB_URI" ]; then
    echo "Setting MONGODB_URI secret..."
    echo "$MONGODB_URI" | wrangler secret put MONGODB_URI
else
    echo "❌ MONGODB_URI not found in environment variables"
    exit 1
fi

# Forms webhook secret (if available)
if [ ! -z "$FORMSAPP_WEBHOOK_SECRET" ]; then
    echo "Setting FORMSAPP_WEBHOOK_SECRET..."
    echo "$FORMSAPP_WEBHOOK_SECRET" | wrangler secret put FORMSAPP_WEBHOOK_SECRET
fi

# Firebase configuration
if [ ! -z "$FIREBASE_PROJECT_ID" ]; then
    echo "Setting Firebase secrets..."
    echo "$FIREBASE_PROJECT_ID" | wrangler secret put FIREBASE_PROJECT_ID
    echo "$FIREBASE_PRIVATE_KEY" | wrangler secret put FIREBASE_PRIVATE_KEY
    echo "$FIREBASE_CLIENT_EMAIL" | wrangler secret put FIREBASE_CLIENT_EMAIL
fi

# Deploy to Cloudflare Workers
echo "🚀 Deploying to Cloudflare Workers..."
wrangler deploy

# Check deployment status
if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Backend URL: https://swipehire-backend.swipehire.workers.dev"
    echo "🩺 Health check: https://swipehire-backend.swipehire.workers.dev/health"
else
    echo "❌ Deployment failed!"
    exit 1
fi

# Test endpoints after deployment
echo "🔍 Running basic health check..."
sleep 5

# Test health endpoint
if curl -s "https://swipehire-backend.swipehire.workers.dev/health" > /dev/null; then
    echo "✅ Health check passed"
else
    echo "⚠️  Health check failed - check logs"
fi

echo "🎉 Deployment complete!"