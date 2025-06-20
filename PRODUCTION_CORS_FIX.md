# Production CORS Fix Guide

## 🚨 Problem Analysis

**Error:** `Access to fetch at 'https://5000-firebase-swipehire-new-1749729524468.cluster-sumfw3zmzzhzkx4mpvz3ogth4y.cloudworkstations.dev/api/jobs' from origin 'https://www.swipehire.top' has been blocked by CORS policy`

**Root Cause:** The backend running on Cloud Workstation is not properly configured to allow requests from the production frontend domain.

## ✅ Solution Steps

### 1. **Backend Configuration (Cloud Workstation)**

#### Step 1.1: Set Environment Variables
In your Cloud Workstation terminal, set these environment variables:

```bash
export NODE_ENV=production
export FRONTEND_URL_PRIMARY=https://www.swipehire.top
export FRONTEND_URL_SECONDARY=https://swipehire.top
export FRONTEND_URL_TERTIARY=http://www.swipehire.top
export FRONTEND_URL_QUATERNARY=http://swipehire.top
export PORT=5000
```

#### Step 1.2: Create Production Environment File
Create `.env.production` in your backend directory:

```bash
# In Cloud Workstation
cd swipehire-backend
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
```

#### Step 1.3: Load Environment and Restart Backend
```bash
# Load production environment
source .env.production

# Restart the backend
npm start
```

### 2. **Verify Backend CORS Configuration**

The updated `config/constants.js` now includes:
- Enhanced logging for debugging
- All SwipeHire domain variations
- Proper CORS headers

#### Test CORS Configuration:
```bash
# Test OPTIONS preflight request
curl -v \
  -H "Origin: https://www.swipehire.top" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS \
  https://5000-firebase-swipehire-new-1749729524468.cluster-sumfw3zmzzhzkx4mpvz3ogth4y.cloudworkstations.dev/api/jobs

# Test actual GET request
curl -v \
  -H "Origin: https://www.swipehire.top" \
  https://5000-firebase-swipehire-new-1749729524468.cluster-sumfw3zmzzhzkx4mpvz3ogth4y.cloudworkstations.dev/api/jobs
```

**Expected Response Headers:**
```
Access-Control-Allow-Origin: https://www.swipehire.top
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-HTTP-Method-Override, X-Firebase-AppCheck, X-Firebase-Auth, Accept, Origin, User-Agent, Cache-Control
Access-Control-Allow-Credentials: true
```

### 3. **Frontend Configuration**

#### Step 3.1: Update Production Environment
Ensure your frontend deployment uses:

```bash
NEXT_PUBLIC_CUSTOM_BACKEND_URL=https://5000-firebase-swipehire-new-1749729524468.cluster-sumfw3zmzzhzkx4mpvz3ogth4y.cloudworkstations.dev
```

#### Step 3.2: Rebuild and Redeploy Frontend
After updating the environment variable, rebuild and redeploy your frontend.

### 4. **Debugging Steps**

#### Step 4.1: Check Backend Logs
In your Cloud Workstation, check the backend logs for CORS messages:

```bash
# The enhanced logging will show:
[CORS Check] Request origin: https://www.swipehire.top
[CORS Check] NODE_ENV: production
[CORS Check] Allowed origins: https://www.swipehire.top, https://swipehire.top, ...
[CORS Allowed] Origin: https://www.swipehire.top
```

#### Step 4.2: Browser Developer Tools
1. Open browser Developer Tools (F12)
2. Go to Network tab
3. Try to make an API request
4. Check the failed request details
5. Look for CORS-related headers

#### Step 4.3: Test from Browser Console
In your browser console on `https://www.swipehire.top`, test:

```javascript
// Test fetch request
fetch('https://5000-firebase-swipehire-new-1749729524468.cluster-sumfw3zmzzhzkx4mpvz3ogth4y.cloudworkstations.dev/api/jobs')
  .then(response => response.json())
  .then(data => console.log('Success:', data))
  .catch(error => console.error('Error:', error));
```

## 🔧 Advanced Troubleshooting

### Issue 1: Environment Variables Not Loading
**Solution:** Explicitly set variables in the startup command:
```bash
NODE_ENV=production FRONTEND_URL_PRIMARY=https://www.swipehire.top npm start
```

### Issue 2: CORS Still Blocked After Changes
**Solution:** Add a catch-all CORS policy temporarily for debugging:

```javascript
// Temporary debug CORS (in constants.js)
corsOptions: {
  origin: true, // Allow all origins temporarily
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['*']
}
```

**⚠️ Remove this after debugging!**

### Issue 3: Cloud Workstation URL Changes
If your Cloud Workstation URL changes, update:
1. Frontend environment variable
2. Rebuild and redeploy frontend

## 📋 Deployment Checklist

### Backend (Cloud Workstation):
- [ ] Environment variables set correctly
- [ ] `.env.production` file created
- [ ] Backend restarted with production environment
- [ ] CORS logs showing allowed origins
- [ ] OPTIONS requests returning proper headers

### Frontend (Production):
- [ ] `NEXT_PUBLIC_CUSTOM_BACKEND_URL` updated
- [ ] Frontend rebuilt and redeployed
- [ ] Browser cache cleared
- [ ] API calls working from production site

### Testing:
- [ ] CORS preflight test passes
- [ ] Actual API requests succeed
- [ ] Browser console shows no CORS errors
- [ ] Network tab shows successful requests

## 🎯 Quick Fix Commands

### On Cloud Workstation:
```bash
# Set environment and restart backend
export NODE_ENV=production
export FRONTEND_URL_PRIMARY=https://www.swipehire.top
export FRONTEND_URL_SECONDARY=https://swipehire.top
cd swipehire-backend
npm start
```

### Test CORS:
```bash
curl -H "Origin: https://www.swipehire.top" -X OPTIONS https://5000-firebase-swipehire-new-1749729524468.cluster-sumfw3zmzzhzkx4mpvz3ogth4y.cloudworkstations.dev/api/jobs
```

### Expected Success:
- No CORS errors in browser console
- API requests return data successfully
- Network tab shows 200 OK responses

## 🔒 Security Notes

1. **Production CORS:** Only allow specific origins in production
2. **Environment Variables:** Keep sensitive data in environment variables
3. **HTTPS:** Always use HTTPS in production
4. **Headers:** Limit allowed headers to what's actually needed

The CORS issue should be completely resolved after following these steps!