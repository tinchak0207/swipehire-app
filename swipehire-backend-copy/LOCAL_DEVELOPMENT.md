# SwipeHire Backend - Local Development Guide

## 🚀 Quick Start (2 minutes)

### **Step 1: Navigate to Backend Directory**
```bash
cd swipehire-backend-copy
```

### **Step 2: Install Dependencies**
```bash
npm install
```

### **Step 3: Set Up Environment**
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your local configuration
nano .env  # or use VS Code editor
```

### **Step 4: Start Development Server**
```bash
# Option 1: Standard Express server
npm run dev

# Option 2: Nodemon (auto-restart on changes)
npm run dev:nodemon

# Option 3: Direct node
npm start
```

## 📋 Environment Setup

### **Required Environment Variables**
Create `.env` file in the backend directory:

```bash
# Database (MongoDB Atlas - Free Tier)
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/swipehire

# JWT Secret (Generate random string)
JWT_SECRET=your-super-secret-jwt-key-here

# Forms.app Webhook Secret
FORMSAPP_WEBHOOK_SECRET=your-formsapp-webhook-secret

# Google Cloud Storage (Optional for file uploads)
GCS_BUCKET_NAME=your-gcs-bucket-name

# Redis (Optional for caching)
REDIS_URL=redis://localhost:6379

# Server Configuration
PORT=3000
NODE_ENV=development
```

### **MongoDB Atlas Setup (Free)**
1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create free cluster (M0 tier)
3. Add your IP to whitelist (0.0.0.0/0 for testing)
4. Create database user
5. Copy connection string

### **Redis Setup (Optional)**
```bash
# Install Redis locally
# Ubuntu/Debian:
sudo apt-get install redis-server

# macOS:
brew install redis

# Start Redis
redis-server
```

## 🛠️ Development Commands

### **Available Scripts**
```bash
# Development with auto-restart
npm run dev

# Production start
npm start

# Test with Jest
npm test

# Test with coverage
npm run test:coverage

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Build (if using TypeScript)
npm run build
```

### **Package.json Scripts**
```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "dev:nodemon": "nodemon --ignore uploads/ index.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  }
}
```

## 🔗 Database Setup

### **MongoDB Collections Required**
```bash
# The backend will auto-create collections on first use
# But you can manually create them for better control

# Connect to MongoDB
mongosh "mongodb+srv://username:password@cluster0.mongodb.net/swipehire"

# Create collections
db.createCollection("users")
db.createCollection("jobs")
db.createCollection("matches")
db.createCollection("chatmessages")
db.createCollection("industryevents")
db.createCollection("companyreviews")
db.createCollection("diaryposts")
```

### **Essential Indexes**
```javascript
// Run in MongoDB shell
// Users
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "selectedRole": 1 })

// Jobs
db.jobs.createIndex({ "isPublic": 1, "createdAt": -1 })
db.jobs.createIndex({ "location": "text", "title": "text", "company": "text" })

// Matches
db.matches.createIndex({ "userA_Id": 1, "createdAt": -1 })
db.matches.createIndex({ "userB_Id": 1, "createdAt": -1 })

// Chat Messages
db.chatmessages.createIndex({ "matchId": 1, "createdAt": 1 })
```

## 🧪 Testing Setup

### **Test Database Setup**
```bash
# Create test database
mongosh "mongodb+srv://username:password@cluster0.mongodb.net/test"

# Or use local MongoDB
mongosh "mongodb://localhost:27017/swipehire-test"
```

### **Test Environment Variables**
Create `.env.test`:
```bash
MONGODB_URI=mongodb://localhost:27017/swipehire-test
JWT_SECRET=test-secret-key
NODE_ENV=test
PORT=3001
```

### **Run Tests**
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- --testNamePattern="User"
```

## 🌐 API Endpoints Testing

### **Health Check**
```bash
curl http://localhost:3000/api/health
```

### **User Registration**
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "selectedRole": "jobseeker",
    "firebaseUid": "test123"
  }'
```

### **Job Creation**
```bash
curl -X POST http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Full Stack Developer",
    "company": "Tech Corp",
    "location": "Remote",
    "salary": 75000,
    "jobType": "full-time",
    "description": "Great opportunity",
    "requiredSkills": ["JavaScript", "Node.js", "React"]
  }'
```

### **Job Search**
```bash
curl "http://localhost:3000/api/jobs?limit=10&page=1&location=Remote"
```

## 🛡️ Security Setup

### **JWT Configuration**
```bash
# Generate secure JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### **Forms.app Webhook Setup**
1. Go to forms.app → Your Form → Integrations
2. Add webhook URL: `http://localhost:3000/api/webhooks/formsapp`
3. Copy webhook secret for `.env`

## 🔍 Debugging

### **Debug Mode**
```bash
# Enable debug logging
DEBUG=swipehire:* npm run dev

# Or set in .env
DEBUG=true
```

### **Database Connection Test**
```bash
# Create test connection script
cat > test-connection.js << 'EOF'
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    return mongoose.connection.db.admin().ping();
  })
  .then(() => {
    console.log('✅ Database is responding');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });
EOF

node test-connection.js
```

## 🐳 Docker Development (Optional)

### **Docker Setup**
```bash
# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/swipehire
      - REDIS_URL=redis://redis:6379
      - NODE_ENV=development
    depends_on:
      - mongo
      - redis
    volumes:
      - ./uploads:/app/uploads

  mongo:
    image: mongo:5.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  mongo_data:
EOF

# Start with Docker
docker-compose up
```

## 🚨 Troubleshooting

### **Port Already in Use**
```bash
# Check what's using port 3000
lsof -i :3000
# Kill process if needed
kill -9 [PID]
```

### **MongoDB Connection Issues**
```bash
# Test MongoDB connection
mongosh "mongodb+srv://username:password@cluster0.mongodb.net/swipehire"

# Check if MongoDB is running
sudo systemctl status mongod
```

### **CORS Issues**
```bash
# Frontend development server should point to:
# http://localhost:3000
```

## 📊 Development Tools

### **API Testing Tools**
- **Postman**: Import the collection from `docs/postman-collection.json`
- **Insomnia**: Use the environment file from `docs/insomnia-environment.json`
- **curl**: Use the examples above

### **Database GUI Tools**
- **MongoDB Compass**: Download from [mongodb.com](https://www.mongodb.com/products/compass)
- **Robo 3T**: Free MongoDB GUI
- **TablePlus**: Multi-database management tool

## 🔧 Development Workflow

### **Daily Development**
```bash
# 1. Start MongoDB
mongod

# 2. Start Redis (if using)
redis-server

# 3. Start backend
npm run dev

# 4. Test endpoints
curl http://localhost:3000/api/health
```

### **Git Workflow**
```bash
# Create feature branch
git checkout -b feature/new-endpoint

# Make changes and test
npm run test

# Commit and push
git add .
git commit -m "Add new endpoint"
git push origin feature/new-endpoint
```

## 🎯 Quick Validation Checklist

- [ ] MongoDB is running and accessible
- [ ] Environment variables are configured
- [ ] Dependencies are installed (`npm install`)
- [ ] Server starts without errors (`npm run dev`)
- [ ] Health endpoint responds (`curl http://localhost:3000/api/health`)
- [ ] Database connection works (check logs)
- [ ] Basic CRUD operations work

## 📞 Support

### **Local Development Issues**
1. Check MongoDB connection first
2. Verify environment variables
3. Check server logs for errors
4. Ensure port 3000 is available
5. Test with Postman/curl

**Ready to start? Run `cd swipehire-backend-copy && npm install && npm run dev` to get started!**