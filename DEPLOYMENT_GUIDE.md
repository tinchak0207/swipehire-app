# SwipeHire Backend Railway Deployment Guide

## 🚀 Quick Deploy to Railway (5 minutes)

### Prerequisites
- Railway account (free at [railway.app](https://railway.app))
- MongoDB Atlas account (free tier)
- GitHub repository with your code

### Step 1: Railway Setup

#### 1.1 Install Railway CLI
```bash
npm install -g @railway/cli
railway login
```

#### 1.2 Initialize Railway Project
```bash
cd swipehire-backend
railway init --name swipehire-backend
```

### Step 2: Deploy to Railway

#### 2.1 Automatic Deployment via GitHub
1. Go to [railway.app](https://railway.app)
2. Create new project → "Deploy from GitHub"
3. Select your repository
4. Railway auto-detects Node.js app

#### 2.2 Manual Deployment
```bash
railway deploy
```

### Step 3: Environment Variables

Add these variables in Railway dashboard → Settings → Variables:

```bash
# Required
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/swipehire
NODE_ENV=production
PORT=8080

# Optional
JWT_SECRET=your-jwt-secret
FRONTEND_URL=https://swipehire.top
ALLOWED_ORIGINS=https://swipehire.top,https://www.swipehire.top
```

### Step 4: Test Deployment

```bash
# Check health endpoint
curl https://swipehire-backend-production.up.railway.app/health

# Test API
curl https://swipehire-backend-production.up.railway.app/api/users
```

## 🔧 Frontend Configuration

### Step 1: Update Environment Variable
Add to your frontend environment:
```bash
NEXT_PUBLIC_RAILWAY_URL=https://your-app.railway.app
```

### Step 2: Verify CORS Configuration
The backend is already configured to accept requests from:
- `https://swipehire.top`
- `https://www.swipehire.top`
- Local development (`localhost:3000`, `localhost:3001`)

## 📋 Complete Deployment Checklist

### Backend Setup
- [ ] Railway project created
- [ ] Environment variables configured
- [ ] MongoDB Atlas connection string added
- [ ] Deployment successful
- [ ] Health endpoint accessible
- [ ] CORS configured for swipehire.top

### Frontend Setup
- [ ] Environment variable `NEXT_PUBLIC_RAILWAY_URL` set
- [ ] Frontend rebuilt and deployed
- [ ] API calls working correctly
- [ ] No CORS errors in browser console

## 🚨 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Error
```bash
# Ensure Atlas IP whitelist includes 0.0.0.0/0
# In MongoDB Atlas → Network Access → Add IP → 0.0.0.0/0
```

#### 2. CORS Issues
- Check `ALLOWED_ORIGINS` includes your frontend domain
- Verify HTTPS is used for production

#### 3. Port Issues
Railway automatically assigns port via `process.env.PORT`

#### 4. Build Failures
```bash
# Ensure all dependencies are in dependencies (not devDependencies)
npm install --save express mongoose cors dotenv
```

## 🔄 Update Frontend API

### Option 1: Environment Variable (Recommended)
```bash
# In Railway dashboard, add:
NEXT_PUBLIC_RAILWAY_URL=https://your-app.railway.app
```

### Option 2: Update config/api.ts
Edit `/src/config/api.ts` and change the base URL:
```typescript
const RAILWAY_URL = 'https://your-app.railway.app';
```

## 🧪 Testing Commands

```bash
# Test backend health
curl https://your-app.railway.app/health

# Test API endpoints
curl https://your-app.railway.app/api/users
curl https://your-app.railway.app/api/jobs

# Check logs
railway logs --tail
```

## 🎯 Railway Free Tier Limits

| Resource | Free Limit | SwipeHire Usage |
|----------|------------|-----------------|
| **Compute** | 500 hours/month | ✅ Sufficient |
| **Memory** | 512MB RAM | ✅ Sufficient |
| **Storage** | 1GB persistent | ✅ Sufficient |
| **Bandwidth** | 100GB/month | ✅ Sufficient |

## 🔗 Useful Commands

```bash
# Railway CLI
railway login          # Login to Railway
railway status         # Check deployment status
railway logs --tail    # View live logs
railway variables      # List environment variables
railway deploy         # Deploy current changes

# Database
railway add --service mongodb  # Add MongoDB service
railway add --service redis    # Add Redis service
```

## 🆘 Support

- Railway Discord: [discord.gg/railway](https://discord.gg/railway)
- Railway Docs: [docs.railway.app](https://docs.railway.app)
- Railway Status: [status.railway.app](https://status.railway.app)

## 🚀 Next Steps After Deployment

1. **Update Frontend**: Change API base URL to Railway URL
2. **Test Integration**: Verify frontend can communicate with backend
3. **Monitor**: Set up monitoring and alerts
4. **Scale**: Upgrade Railway plan if needed for higher traffic

**Ready to deploy? Run:**
```bash
cd swipehire-backend
railway deploy
```

Your backend will be live in 2-3 minutes!