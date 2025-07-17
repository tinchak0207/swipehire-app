# Railway.app Free Deployment Guide

## Quick Start - Deploy in 10 Minutes

Railway offers the best free tier for your SwipeHire backend with **zero code changes** required.

## Prerequisites
- Railway account (free)
- MongoDB Atlas account (free tier works)
- GitHub repository access

## Step 1: Railway Setup

### 1.1 Create Railway Project
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Create new project
railway init --name swipehire-backend
```

### 1.2 Connect GitHub
1. Go to [railway.app](https://railway.app)
2. Create new project → "Deploy from GitHub"
3. Select your `swipehire-backend-copy` repository
4. Railway auto-detects Node.js app

## Step 2: Environment Variables

### 2.1 Add Required Variables
In Railway dashboard → Settings → Variables:

```bash
# Database (use your existing Atlas)
MONGODB_URI=mongodb+srv://your-user:your-pass@cluster0.x.mongodb.net/swipehire

# Optional Redis (Railway provides free Redis)
REDIS_URL=redis://default:your-redis-url.railway.app:6379

# App Settings
PORT=8080
NODE_ENV=production
JWT_SECRET=your-jwt-secret

# File Storage (Railway persistent storage)
UPLOAD_PATH=/app/uploads
```

### 2.2 MongoDB Atlas Connection
```bash
# If you need new Atlas connection:
# 1. Atlas → Database → Connect → "Connect your application"
# 2. Copy connection string
# 3. Replace password and database name
```

## Step 3: Deploy

### 3.1 Automatic Deployment
```bash
# Railway auto-deploys on git push
# Just push your changes:
git add .
git commit -m "Deploy to Railway"
git push origin main
```

### 3.2 Manual Deployment
```bash
# Deploy current directory
railway up

# Check deployment status
railway status
```

## Step 4: Add Redis (Optional)

### 4.1 Add Redis Service
1. Railway Dashboard → Add Service → "Redis"
2. Copy connection string
3. Add to environment variables

### 4.2 Update Environment
```bash
REDIS_URL=redis://default:password@containers-us-west-123.railway.app:6379
REDIS_PASSWORD=your-redis-password
```

## Step 5: File Storage (Optional)

### 5.1 Persistent Storage
1. Railway Dashboard → Settings → Volumes
2. Add Volume → Mount path: `/app/uploads`
3. Size: 1GB (free tier)

### 5.2 Update Upload Path
```bash
UPLOAD_PATH=/app/uploads
GCS_BUCKET=your-backup-bucket (optional)
```

## Step 6: Custom Domain (Optional)

### 6.1 Add Custom Domain
1. Railway Dashboard → Settings → Domains
2. Add your domain
3. Railway provides SSL certificate automatically

## Step 7: Test Deployment

### 7.1 Health Check
```bash
# Railway provides auto-generated URL
curl https://swipehire-backend-production.up.railway.app/api/health

# Or use Railway CLI
railway logs
```

### 7.2 Test Endpoints
```bash
# Test user endpoint
curl https://your-app.railway.app/api/users

# Test with query parameters
curl "https://your-app.railway.app/api/jobs?limit=10"
```

## Railway Free Tier Limits

| Resource | Free Limit | SwipeHire Usage |
|----------|------------|-----------------|
| **Compute** | 500 hours/month | ✅ Sufficient |
| **Memory** | 512MB RAM | ✅ Sufficient |
| **Storage** | 1GB persistent | ✅ Sufficient |
| **Bandwidth** | 100GB/month | ✅ Sufficient |
| **Build time** | 30 min/month | ✅ Sufficient |

## Performance Optimization

### 8.1 Add MongoDB Indexes
```javascript
// Run in MongoDB Atlas
// Users
db.users.createIndex({ "selectedRole": 1 })
db.users.createIndex({ "email": 1 }, { unique: true })

// Jobs
db.jobs.createIndex({ "isPublic": 1, "createdAt": -1 })
db.jobs.createIndex({ "location": "text", "title": "text" })

// Matches
db.matches.createIndex({ "userA_Id": 1, "createdAt": -1 })
db.matches.createIndex({ "userB_Id": 1, "createdAt": -1 })
```

### 8.2 Connection Pooling
Railway handles this automatically - no changes needed.

## Monitoring

### 9.1 Railway Dashboard
- **Deployments**: Live logs and metrics
- **Usage**: Track compute hours and storage
- **Errors**: Real-time error tracking

### 9.2 Health Monitoring
```bash
# Add health endpoint check
railway logs --follow
```

## Troubleshooting

### Common Issues

#### 10.1 "Cannot connect to MongoDB"
- Check `MONGODB_URI` format in Railway variables
- Ensure Atlas IP whitelist includes `0.0.0.0/0`
- Verify database user permissions

#### 10.2 "Port already in use"
- Railway automatically assigns port - use `process.env.PORT`
- Don't hardcode port 3000/8080

#### 10.3 "Build fails"
- Check Node.js version in `package.json`
- Ensure all dependencies are in `dependencies` (not `devDependencies`)

### Debug Commands
```bash
# Check logs
railway logs --tail

# Check environment
railway variables

# Redeploy
railway up --restart
```

## Migration from Cloudflare Workers

### Zero Code Changes Required
Your existing backend works exactly as-is. Railway:
- ✅ Runs full Node.js environment
- ✅ Supports MongoDB native driver
- ✅ Handles file uploads
- ✅ Provides Redis (optional)
- ✅ Custom domains with SSL

### Database Migration
If using new MongoDB:
1. Export from existing Atlas
2. Import to new Atlas (if needed)
3. Update `MONGODB_URI` in Railway

## Advanced Configuration

### Environment-Specific Deployments
```bash
# Production
railway deploy --env production

# Staging
railway deploy --env staging
```

### Scaling (Paid Options)
If free limits exceeded:
- **Starter**: $5/month (unlimited hours)
- **Pro**: $20/month (team features)

## Quick Commands Summary
```bash
# Deploy in 3 commands
railway login
railway init
railway deploy

# Monitor
railway logs --tail

# Update environment
railway variables set MONGODB_URI="your-uri"
```

## Support
- Railway Discord: [discord.gg/railway](https://discord.gg/railway)
- Documentation: [docs.railway.app](https://docs.railway.app)
- Status: [status.railway.app](https://status.railway.app)

**Ready to deploy? Run `railway deploy` and your backend will be live in 2-3 minutes!**