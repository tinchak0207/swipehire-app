# Render.com Free Deployment Guide

## Quick Start - Deploy in 5 Minutes

Render offers a **completely free** tier that runs 24/7 with **no time limits**.

## Prerequisites
- Render account (free)
- MongoDB Atlas account (free tier)
- GitHub/GitLab repository

## Step 1: Render Setup

### 1.1 Connect Repository
1. Go to [render.com](https://render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub/GitLab repository
4. Select `swipehire-backend-copy` repository

### 1.2 Service Configuration
```yaml
# Render will auto-detect this
Name: swipehire-backend
Environment: Node
Region: Frankfurt (EU) or Oregon (US)
Branch: main
Build Command: npm install
Start Command: node index.js
```

## Step 2: Environment Variables

### 2.1 Add Environment Variables
In Render Dashboard → Settings → Environment:

```bash
# Database (use existing Atlas)
MONGODB_URI=mongodb+srv://user:pass@cluster0.x.mongodb.net/swipehire

# Redis (optional - use Redis Cloud free tier)
REDIS_URL=redis://default:password@redis-12345.c1.us-east-1-2.ec2.cloud.redislabs.com:12345

# App Settings
PORT=10000  # Render uses 10000
NODE_ENV=production
JWT_SECRET=your-jwt-secret-key

# File Storage
UPLOAD_PATH=/opt/render/project/src/uploads
```

### 2.2 MongoDB Atlas Whitelist
Add Render IP ranges to Atlas:
```
# Render IP ranges (add these to Atlas Network Access)
34.74.226.0/24
35.196.128.0/24
35.196.64.0/24
35.196.192.0/24
```

Or use `0.0.0.0/0` for testing (not recommended for production)

## Step 3: Deploy

### 3.1 Automatic Deployment
1. Click "Create Web Service"
2. Render builds and deploys automatically
3. Takes 2-3 minutes for first deployment

### 3.2 Custom Domain (Optional)
1. Settings → Custom Domains
2. Add your domain
3. Render provides SSL certificate automatically

## Step 4: Redis Setup (Optional)

### 4.1 Redis Cloud Free
1. Go to [redis.com](https://redis.com/redis-enterprise-cloud)
2. Create free Redis database (30MB)
3. Copy connection string to environment variables

## Step 5: File Storage

### 5.1 Persistent Storage
Render provides **persistent storage** on free tier:
- Path: `/opt/render/project/src/uploads`
- Size: 100MB (sufficient for images)
- Persists across deployments

### 5.2 Environment Update
```bash
UPLOAD_PATH=/opt/render/project/src/uploads
```

## Step 6: Test Deployment

### 6.1 Health Check
```bash
# Render provides auto-generated URL
curl https://swipehire-backend.onrender.com/api/health

# Your URL will be:
# https://your-app-name.onrender.com
```

### 6.2 Test Endpoints
```bash
# Test all major endpoints
curl https://your-app.onrender.com/api/users
curl "https://your-app.onrender.com/api/jobs?limit=10"
curl "https://your-app.onrender.com/api/events"
```

## Render Free Tier Details

| Feature | Free Limit | SwipeHire Suitability |
|---------|------------|----------------------|
| **Runtime** | 24/7 (no sleep) | ✅ Perfect |
| **CPU** | Shared | ✅ Sufficient |
| **RAM** | 512MB | ✅ Sufficient |
| **Storage** | 100GB | ✅ Sufficient |
| **Bandwidth** | 100GB/month | ✅ Sufficient |
| **Build Time** | 15 min/month | ✅ Sufficient |
| **Custom Domain** | Free | ✅ Included |

## Zero Configuration Required

### No Code Changes Needed
Your existing backend works exactly as-is. Render:
- ✅ Runs full Node.js environment
- ✅ Supports MongoDB native driver
- ✅ Handles file uploads to persistent storage
- ✅ Provides Redis integration (optional)
- ✅ Custom domains with SSL certificates
- ✅ 24/7 uptime (no sleeping)

## Step 7: Performance Optimization

### 7.1 Add MongoDB Indexes
```javascript
// Run in MongoDB Atlas
// Essential indexes for performance
db.users.createIndex({ "selectedRole": 1 })
db.users.createIndex({ "email": 1 }, { unique: true })

// Jobs
db.jobs.createIndex({ "isPublic": 1, "createdAt": -1 })
db.jobs.createIndex({ "location": "text", "title": "text", "company": "text" })

// Matches
db.matches.createIndex({ "userA_Id": 1, "createdAt": -1 })
db.matches.createIndex({ "userB_Id": 1, "createdAt": -1 })

// Events
db.industryevents.createIndex({ "status": 1, "startDateTime": 1 })
```

### 7.2 Connection Pooling
```javascript
// Your existing MongoDB connection will work
// Render supports full MongoDB driver
```

## Step 8: Monitoring

### 8.1 Render Dashboard
- **Logs**: Real-time streaming logs
- **Metrics**: CPU, memory, bandwidth usage
- **Alerts**: Email notifications for issues
- **Deploys**: Automatic on git push

### 8.2 Health Monitoring
```bash
# Check logs
render logs --tail

# Check status
render status
```

## Troubleshooting

### Common Issues

#### 9.1 "MongoDB connection timeout"
- Add Render IP ranges to MongoDB Atlas whitelist
- Check `MONGODB_URI` format
- Ensure database user has proper permissions

#### 9.2 "Port binding error"
- Render uses port `10000` - your app should use `process.env.PORT`
- Don't hardcode port numbers

#### 9.3 "Build fails"
- Ensure `engines.node` in package.json: `"node": ">=18.0.0"`
- All dependencies should be in `dependencies` (not `devDependencies`)

### Debug Commands
```bash
# Check real-time logs
render logs --tail

# Check service status
render services list

# Redeploy
render deploy --restart
```

## Migration from Cloudflare Workers

### Immediate Migration Steps
1. **Copy your backend directory** to new repository
2. **Use existing MongoDB Atlas** (no database migration needed)
3. **Deploy to Render** (5 minutes)
4. **Update frontend API URLs** to new Render URL

### Database Connection
Your existing MongoDB Atlas connection string works unchanged.

### File Uploads
Render provides **persistent storage** - files persist across restarts.

## Advanced Configuration

### Environment-Specific Deployments
```bash
# Production (default)
render deploy

# Staging
render deploy --env staging
```

### Scaling (Paid Options)
If needed:
- **Starter**: $7/month (1GB RAM)
- **Standard**: $25/month (2GB RAM)

## Quick Commands Summary

```bash
# Deploy in 4 steps:
# 1. Connect GitHub repo on render.com
# 2. Add environment variables
# 3. Click "Create Web Service"
# 4. Done!

# Your app will be live at:
# https://your-app-name.onrender.com
```

## Support
- Render Discord: [discord.gg/render](https://discord.gg/render)
- Documentation: [docs.render.com](https://docs.render.com)
- Status: [status.render.com](https://status.render.com)

**Ready to deploy? Go to [render.com](https://render.com) and your backend will be live in 5 minutes!**