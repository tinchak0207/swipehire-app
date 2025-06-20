#!/bin/bash
# SwipeHire Backend Production Deployment Script
# Run this script on your Cloud Workstation

echo "🚀 SwipeHire Backend Production Deployment"
echo "=========================================="

# Set production environment variables
echo "📝 Setting production environment variables..."
export NODE_ENV=production
export FRONTEND_URL_PRIMARY=https://www.swipehire.top
export FRONTEND_URL_SECONDARY=https://swipehire.top
export FRONTEND_URL_TERTIARY=http://www.swipehire.top
export FRONTEND_URL_QUATERNARY=http://swipehire.top
export NEXTJS_INTERNAL_APP_URL=https://www.swipehire.top
export PORT=5000

echo "✅ Environment variables set:"
echo "   NODE_ENV=$NODE_ENV"
echo "   FRONTEND_URL_PRIMARY=$FRONTEND_URL_PRIMARY"
echo "   FRONTEND_URL_SECONDARY=$FRONTEND_URL_SECONDARY"
echo "   PORT=$PORT"

# Create .env.production file
echo "📄 Creating .env.production file..."
cat > .env.production << EOF
NODE_ENV=production
PORT=5000
FRONTEND_URL_PRIMARY=https://www.swipehire.top
FRONTEND_URL_SECONDARY=https://swipehire.top
FRONTEND_URL_TERTIARY=http://www.swipehire.top
FRONTEND_URL_QUATERNARY=http://swipehire.top
NEXTJS_INTERNAL_APP_URL=https://www.swipehire.top
MONGO_URI=mongodb://localhost:27017/swipehire
USE_REDIS_ADAPTER=false
EOF

echo "✅ .env.production file created"

# Load environment file
echo "🔄 Loading environment file..."
source .env.production

# Install dependencies (if needed)
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

# Test CORS configuration
echo "🧪 Testing CORS configuration..."
BACKEND_URL="https://5000-firebase-swipehire-new-1749729524468.cluster-sumfw3zmzzhzkx4mpvz3ogth4y.cloudworkstations.dev"

echo "Testing OPTIONS preflight request..."
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" \
  -H "Origin: https://www.swipehire.top" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS \
  "$BACKEND_URL/api/jobs" || echo "⚠️  Backend not yet accessible"

# Start the backend
echo "🚀 Starting backend in production mode..."
echo "Backend will be available at: $BACKEND_URL"
echo "Allowed origins: $FRONTEND_URL_PRIMARY, $FRONTEND_URL_SECONDARY"
echo ""
echo "📋 Next steps:"
echo "1. Check logs for CORS messages"
echo "2. Test API endpoints from frontend"
echo "3. Verify no CORS errors in browser console"
echo ""
echo "🔍 Debug commands:"
echo "curl -H 'Origin: https://www.swipehire.top' -X OPTIONS $BACKEND_URL/api/jobs"
echo "curl -H 'Origin: https://www.swipehire.top' $BACKEND_URL/api/jobs"
echo ""

# Start the server
npm start