#!/bin/bash

# SwipeHire Backend Local Development Starter
# ==========================================

echo "🚀 Starting SwipeHire Backend Development Environment"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found! Make sure you're in the swipehire-backend-copy directory"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2)
print_info "Node.js version: $NODE_VERSION"

# Check if .env exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found, creating from template..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_step "Created .env from template"
        print_warning "Please edit .env file with your configuration"
    else
        print_error ".env.example not found"
        exit 1
    fi
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    print_step "Installing dependencies..."
    npm install
else
    print_step "Dependencies already installed"
fi

# Create uploads directory
mkdir -p uploads

# Check MongoDB connection
print_info "Testing MongoDB connection..."
cat > test-db.js << 'EOF'
const mongoose = require('mongoose');
require('dotenv').config();

if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env');
    process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅ MongoDB connected successfully');
        return mongoose.connection.db.admin().ping();
    })
    .then(() => {
        console.log('✅ Database is responding');
        mongoose.connection.close();
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1);
    });
EOF

# Run database test
node test-db.js
DB_TEST_RESULT=$?
rm test-db.js

if [ $DB_TEST_RESULT -ne 0 ]; then
    print_error "Database connection failed. Please check your MONGODB_URI in .env"
    print_info "MongoDB Atlas Setup:"
    print_info "1. Go to https://cloud.mongodb.com"
    print_info "2. Create free cluster (M0 tier)"
    print_info "3. Add your IP to whitelist"
    print_info "4. Create database user"
    print_info "5. Copy connection string to .env"
    exit 1
fi

# Check for Redis (optional)
if command -v redis-server &> /dev/null; then
    print_step "Redis is available"
    # Start Redis if not running
    if ! pgrep redis-server > /dev/null; then
        print_info "Starting Redis server..."
        redis-server --daemonize yes --port 6379
    fi
else
    print_warning "Redis not found - caching will use in-memory storage"
fi

# Start development server
print_step "Starting development server..."
print_info "Server will be available at: http://localhost:3000"
print_info "Health check: http://localhost:3000/api/health"
print_info "API docs: http://localhost:3000/api"

# Choose development mode
echo ""
echo "Choose development mode:"
echo "1. Standard development (nodemon)"
echo "2. Debug mode (detailed logging)"
echo "3. Production mode"
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        print_step "Starting with nodemon..."
        npm run start:dev
        ;;
    2)
        print_step "Starting in debug mode..."
        DEBUG=swipehire:* npm run start:dev
        ;;
    3)
        print_step "Starting in production mode..."
        npm start
        ;;
    *)
        print_step "Starting with nodemon (default)..."
        npm run start:dev
        ;;
esac