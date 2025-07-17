#!/bin/bash
# Extract and Deploy SwipeHire Backend - One-Click Solution

set -e

echo "🚀 SwipeHire Backend Extraction & Deployment"
echo "============================================"

# Configuration
BACKEND_FOLDER="swipehire-backend-copy"
DEPLOYMENT_FOLDER="swipehire-backend-deployment"
GITHUB_REPO="https://github.com/your-username/swipehire-backend.git"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if backend folder exists
if [ ! -d "$BACKEND_FOLDER" ]; then
    print_error "Backend folder '$BACKEND_FOLDER' not found!"
    echo "Make sure you're running this from the swipehire-app root directory"
    exit 1
fi

print_step "Found backend folder: $BACKEND_FOLDER"

# Create deployment directory
if [ -d "$DEPLOYMENT_FOLDER" ]; then
    print_warning "Deployment folder exists, removing..."
    rm -rf "$DEPLOYMENT_FOLDER"
fi

print_step "Creating deployment directory..."
mkdir -p "$DEPLOYMENT_FOLDER"

# Copy backend files
cp -r "$BACKEND_FOLDER"/* "$DEPLOYMENT_FOLDER/"
print_step "Backend files copied"

# Navigate to deployment folder
cd "$DEPLOYMENT_FOLDER"

# Clean up unnecessary files
print_step "Cleaning up unnecessary files..."
rm -rf node_modules uploads/* .git* 2>/dev/null || true

# Create deployment configuration files
cat > fly.toml << 'EOF'
app = "swipehire-backend"
primary_region = "fra"

[build]
  builder = "heroku/buildpacks:20"

[env]
  PORT = "8080"
  NODE_ENV = "production"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = false
  auto_start_machines = true
  min_machines_running = 1

[[mounts]]
  source = "uploads_data"
  destination = "/app/uploads"
EOF

cat > railway.json << 'EOF'
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node index.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
EOF

cat > render.yaml << 'EOF'
services:
  - type: web
    name: swipehire-backend
    env: node
    buildCommand: npm install
    startCommand: node index.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
EOF

# Create .env template
cat > .env.template << 'EOF'
# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/swipehire

# Authentication
JWT_SECRET=your-super-secret-jwt-key
FORMSAPP_WEBHOOK_SECRET=your-formsapp-webhook-secret

# File Storage
GCS_BUCKET_NAME=your-gcs-bucket-name
UPLOAD_PATH=/app/uploads

# Firebase (if using)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-client-email

# Optional Redis
REDIS_URL=redis://default:password@redis-host:12345
EOF

# Create deployment scripts
cat > deploy-railway.sh << 'EOF'
#!/bin/bash
echo "🚂 Deploying to Railway..."
railway login
railway up
echo "✅ Railway deployment complete!"
EOF

cat > deploy-render.sh << 'EOF'
#!/bin/bash
echo "🎨 Deploying to Render..."
git add .
git commit -m "Deploy to Render" || true
git push origin main
echo "✅ Render deployment triggered!"
EOF

cat > deploy-fly.sh << 'EOF'
#!/bin/bash
echo "🪰 Deploying to Fly.io..."
fly deploy
echo "✅ Fly.io deployment complete!"
EOF

# Make scripts executable
chmod +x deploy-*.sh

# Install dependencies
print_step "Installing dependencies..."
npm install --production

# Create README for deployment
cat > DEPLOYMENT.md << 'EOF'
# SwipeHire Backend Deployment

## Quick Start

### Option 1: Railway.app (Fastest)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway login
railway up
```

### Option 2: Render.com (Simplest)
```bash
# Push to GitHub and connect on render.com
# Or use the script:
./deploy-render.sh
```

### Option 3: Fly.io (Most Control)
```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Deploy
./deploy-fly.sh
```

## Environment Variables

Copy `.env.template` to `.env` and configure:

```bash
cp .env.template .env
# Edit .env with your values
```

## Required Variables
- `MONGODB_URI`: MongoDB Atlas connection string
- `JWT_SECRET`: Random string for JWT signing
- `FORMSAPP_WEBHOOK_SECRET`: Forms.app webhook secret

## Optional Variables
- `REDIS_URL`: Redis connection string
- `GCS_BUCKET_NAME`: Google Cloud Storage bucket

## Testing

```bash
# Start locally
npm start

# Test health endpoint
curl http://localhost:3000/api/health
```
EOF

# Create .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment
.env
.env.local
.env.production

# Logs
logs/
*.log

# Runtime
tmp/
temp/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Uploads
uploads/*
!uploads/.gitkeep
EOF

# Create uploads directory with .gitkeep
mkdir -p uploads
touch uploads/.gitkeep

# Create package-lock.json if missing
if [ ! -f package-lock.json ]; then
    print_warning "Creating package-lock.json..."
    npm install --package-lock-only
fi

# Final summary
cd ..

echo ""
echo "🎉 Backend extraction complete!"
echo "=============================="
echo ""
echo "📁 Location: $(pwd)/$DEPLOYMENT_FOLDER"
echo ""
echo "🚀 Ready to deploy with:"
echo "   1. cd $DEPLOYMENT_FOLDER"
echo "   2. Configure environment variables"
echo "   3. Choose your platform:"
echo "      • Railway: ./deploy-railway.sh"
echo "      • Render: ./deploy-render.sh"
echo "      • Fly.io: ./deploy-fly.sh"
echo ""
echo "📋 Environment setup:"
echo "   1. Copy .env.template to .env"
echo "   2. Add your MongoDB Atlas URI"
echo "   3. Add other required secrets"
echo ""
echo "🔗 Quick start commands:"
echo "   cd $DEPLOYMENT_FOLDER"
echo "   cp .env.template .env"
echo "   # Edit .env with your configuration"
echo "   # Then deploy with your chosen platform"