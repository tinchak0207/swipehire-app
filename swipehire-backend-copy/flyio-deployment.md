# Fly.io Free Deployment Guide

## Quick Start - Deploy in 3 Minutes

Fly.io offers **3 free VMs** with **3GB persistent storage** - perfect for 24/7 backend hosting.

## Prerequisites
- Fly.io account (free)
- MongoDB Atlas account (free tier)
- Fly CLI installed

## Step 1: Fly.io Setup

### 1.1 Install Fly CLI
```bash
# Install fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login
```

### 1.2 Create App
```bash
# Navigate to backend directory
cd swipehire-backend-copy

# Create fly app
fly launch --name swipehire-backend --region fra

# Answer prompts:
# ? Select builder: NodeJS
# ? Select region: fra (Frankfurt) or lhr (London)
# ? Would you like to set up Postgres? No
# ? Would you like to deploy now? No
```

## Step 2: Configuration

### 2.1 Create fly.toml
```toml
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
  processes = ["app"]

[[mounts]]
  source = "uploads_data"
  destination = "/app/uploads"

[[services]]
  internal_port = 8080
  protocol = "tcp"

  [[services.ports]]
    handlers = ["http"]
    port = 80

  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443

[checks]
  [checks.alive]
    grace_period = "5s"
    interval = "30s"
    method = "GET"
    path = "/api/health"
    port = 8080
    timeout = "2s"
```

### 2.2 Create Volume for File Storage
```bash
# Create persistent storage (3GB free)
fly volumes create uploads_data --region fra --size 3
```

## Step 3: Environment Variables

### 3.1 Set Secrets
```bash
# Set environment variables
fly secrets set MONGODB_URI="mongodb+srv://user:pass@cluster0.x.mongodb.net/swipehire"
fly secrets set JWT_SECRET="your-jwt-secret"
fly secrets set NODE_ENV="production"

# Optional Redis
fly secrets set REDIS_URL="redis://default:password@redis-12345.c1.us-east-1-2.ec2.cloud.redislabs.com:12345"
```

### 3.2 MongoDB Atlas Configuration
Add Fly.io IP to MongoDB Atlas whitelist:
1. Go to MongoDB Atlas → Network Access
2. Add IP Address → `0.0.0.0/0` (for testing)
3. Or get Fly.io IPs: `fly ips list`

## Step 4: Deploy

### 4.1 Deploy Application
```bash
# Deploy to Fly.io
fly deploy

# Check deployment status
fly status

# View logs
fly logs
```

### 4.2 Custom Domain (Optional)
```bash
# Add custom domain
fly certs add yourdomain.com

# Update DNS to point to Fly.io
# They'll provide IP addresses
```

## Step 5: Test Deployment

### 5.1 Health Check
```bash
# Get your app URL
fly info

# Test endpoints
curl https://swipehire-backend.fly.dev/api/health
curl https://swipehire-backend.fly.dev/api/users
curl "https://swipehire-backend.fly.dev/api/jobs?limit=10"
```

### 5.2 Scale Configuration
```bash
# Check current scale
fly scale show

# Scale to 2 VMs (paid)
fly scale count 2

# Scale memory (paid)
fly scale memory 512
```

## Fly.io Free Tier Details

| Feature | Free Limit | SwipeHire Suitability |
|---------|------------|----------------------|
| **VMs** | 3 shared VMs | ✅ Perfect |
| **Memory** | 256MB per VM | ✅ Sufficient |
| **Storage** | 3GB total | ✅ Sufficient |
| **Bandwidth** | 160GB/month | ✅ Sufficient |
| **Build Time** | 60 min/month | ✅ Sufficient |
| **Custom Domain** | Free | ✅ Included |
| **SSL** | Automatic | ✅ Included |

## Step 6: Performance Optimization

### 6.1 Add MongoDB Indexes
```javascript
// Run in MongoDB Atlas
// Essential indexes
db.users.createIndex({ "selectedRole": 1 })
db.users.createIndex({ "email": 1 }, { unique: true })

// Jobs
db.jobs.createIndex({ "isPublic": 1, "createdAt": -1 })
db.jobs.createIndex({ "location": "text", "title": "text" })

// Matches
db.matches.createIndex({ "userA_Id": 1, "createdAt": -1 })
db.matches.createIndex({ "userB_Id": 1, "createdAt": -1 })
```

### 6.2 Docker Optimization
Create `Dockerfile` for better performance:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/api/health || exit 1

# Start application
CMD ["node", "index.js"]
```

Update fly.toml:
```toml
[build]
  dockerfile = "Dockerfile"
```

## Step 7: Monitoring

### 7.1 Fly.io Dashboard
- **Metrics**: CPU, memory, bandwidth usage
- **Logs**: Real-time application logs
- **Scaling**: Manual scaling controls
- **Regions**: Global deployment options

### 7.2 Health Checks
```bash
# Check app health
fly checks list

# View machine status
fly machines list

# SSH into machine
fly ssh console
```

## Step 8: Redis Setup (Optional)

### 8.1 Redis Cloud Free
1. Go to [redis.com](https://redis.com/redis-enterprise-cloud)
2. Create free Redis database
3. Add connection string to secrets

### 8.2 Upstash Redis (Fly.io native)
```bash
# Add Upstash Redis
fly redis create

# Get connection string
fly redis connect
```

## Troubleshooting

### Common Issues

#### 9.1 "MongoDB connection timeout"
- Add Fly.io IP to MongoDB Atlas whitelist
- Check `MONGODB_URI` format
- Verify database user permissions

#### 9.2 "Port binding error"
- Fly.io uses `8080` by default
- Ensure your app listens on `process.env.PORT || 8080`

#### 9.3 "Build fails"
- Check Node.js version in `package.json`
- Ensure all dependencies are in `dependencies`
- Check for build scripts in `package.json`

### Debug Commands
```bash
# Check logs
fly logs

# SSH into machine
fly ssh console

# Check machine status
fly status

# Restart deployment
fly deploy --strategy=immediate
```

## Migration from Cloudflare Workers

### Zero Code Changes Required
Your existing backend works exactly as-is. Fly.io:
- ✅ Runs full Node.js environment
- ✅ Supports MongoDB native driver
- ✅ Handles file uploads to persistent storage
- ✅ Provides Redis integration (optional)
- ✅ Custom domains with SSL certificates
- ✅ 24/7 uptime (no sleeping)

### Database Connection
Your existing MongoDB Atlas connection string works unchanged.

### File Uploads
Fly.io provides **persistent volumes** - files persist across restarts and deployments.

## Quick Commands Summary

```bash
# Deploy in 5 commands:
fly launch --name swipehire-backend --region fra
fly volumes create uploads_data --region fra --size 3
fly secrets set MONGODB_URI="your-mongodb-uri"
fly deploy

# Your app will be live at:
# https://swipehire-backend.fly.dev

# Monitor
fly logs --tail
```

## Advanced Features

### Global Deployment
```bash
# Deploy to multiple regions
fly regions add lhr  # London
fly regions add nrt  # Tokyo
fly deploy --strategy=immediate
```

### Scaling (Paid)
```bash
# Scale memory
fly scale memory 512

# Scale CPU
fly scale cpu 2

# Scale VM count
fly scale count 3
```

## Support
- Fly.io Community: [community.fly.io](https://community.fly.io)
- Documentation: [fly.io/docs](https://fly.io/docs)
- Status: [status.fly.io](https://status.fly.io)

**Ready to deploy? Run the commands above and your backend will be live in 5 minutes!**