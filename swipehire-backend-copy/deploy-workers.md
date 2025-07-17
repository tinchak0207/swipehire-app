# Cloudflare Workers Deployment Guide

## Overview
This guide helps deploy the optimized SwipeHire backend to Cloudflare Workers with MongoDB Data API integration.

## Prerequisites
- Cloudflare account
- MongoDB Atlas account with Data API enabled
- Wrangler CLI installed

## Setup Instructions

### 1. MongoDB Atlas Setup
1. Go to MongoDB Atlas Dashboard
2. Select your cluster → Data API
3. Enable Data API
4. Create API key with project access
5. Note your:
   - Data API URL (e.g., `https://data.mongodb-api.com/app/data-xxx/endpoint/data/v1`)
   - Data Source name (usually `Cluster0`)

### 2. Cloudflare Workers Setup
1. Create KV namespace:
   ```bash
   wrangler kv:namespace create CACHE
   wrangler kv:namespace create CACHE --preview
   ```

2. Set environment variables:
   ```bash
   wrangler secret put MONGO_DATA_API_URL
   wrangler secret put MONGO_DATA_API_KEY
   ```

3. Update wrangler.toml with your values:
   ```bash
   wrangler kv:namespace list
   # Copy the IDs and update wrangler-optimized.toml
   ```

### 3. Deploy to Workers

#### Option A: Deploy to Cloudflare Workers
```bash
# Rename config file
mv wrangler-optimized.toml wrangler.toml

# Deploy
wrangler deploy

# Test
curl https://your-worker.your-subdomain.workers.dev/api/health
```

#### Option B: Local Development
```bash
# Install dependencies
npm install

# Start local dev server
wrangler dev
```

### 4. Environment Configuration

#### Required Secrets:
```bash
wrangler secret put MONGO_DATA_API_URL
# Enter: https://data.mongodb-api.com/app/data-xxx/endpoint/data/v1

wrangler secret put MONGO_DATA_API_KEY
# Enter: your-mongodb-data-api-key
```

#### Optional Variables (in wrangler.toml):
```toml
[vars]
MONGO_DATA_SOURCE = "Cluster0"
MONGO_DATABASE = "swipehire"
```

## API Endpoints

### Health Check
```bash
GET /api/health
```

### Users
```bash
GET /api/users?id={userId}
PUT /api/users
```

### Jobs
```bash
GET /api/jobs?limit=20&page=1
POST /api/jobs
```

### Events
```bash
GET /api/events?industry=tech&location=london
```

### Matches
```bash
GET /api/matches?userId={userId}
```

### Search
```bash
GET /api/search?type=jobs&q=javascript&location=london
```

### Dashboard
```bash
GET /api/dashboard?userId={userId}
```

### Stats
```bash
GET /api/stats?type=users
```

## Performance Monitoring

### Check Cache Performance
```bash
curl https://your-worker.workers.dev/api/health
```

### Monitor Workers Analytics
- Go to Cloudflare Dashboard → Workers → Analytics
- Monitor:
  - Requests per day (stay under 100K free limit)
  - CPU time (stay under 30ms)
  - Memory usage (stay under 128MB)

## Cost Management

### Free Tier Limits
- ✅ 100,000 requests/day
- ✅ 30ms CPU time per request
- ✅ 128MB memory
- ✅ 50 subrequests
- ✅ KV storage (1GB total)

### Optimization Tips
1. **Use aggressive caching**: 5min for users, 1min for jobs
2. **Batch requests**: Use /api/dashboard instead of multiple calls
3. **Limit query results**: Max 50 items per request
4. **Use indexes**: Ensure MongoDB has proper indexes
5. **Monitor usage**: Set up alerts for approaching limits

### Scaling Beyond Free Tier

#### Option 1: Workers Paid Plan
- $5/month for 10M requests
- 30s CPU time per request
- 128MB memory

#### Option 2: Alternative Hosting
Consider migrating to:
- **Railway**: $5/month, MongoDB integration
- **Supabase**: Free tier includes 500MB database
- **Fly.io**: $1.94/month for 256MB RAM

## Migration from Original Backend

### Key Changes
1. **No MongoDB driver**: Uses Data API instead
2. **No Redis**: Uses Workers KV for caching
3. **Simplified endpoints**: Optimized for Workers
4. **Rate limiting**: Built-in per-IP limits

### Database Indexes Required
```javascript
// Run in MongoDB Atlas
// Users collection
db.users.createIndex({ "selectedRole": 1 })
db.users.createIndex({ "profileVisibility": 1 })

// Jobs collection
db.jobs.createIndex({ "isPublic": 1, "createdAt": -1 })
db.jobs.createIndex({ "jobType": 1 })
db.jobs.createIndex({ "location": "text", "title": "text", "company": "text" })

// Events collection
db.industryevents.createIndex({ "status": 1, "startDateTime": 1 })
db.industryevents.createIndex({ "industry": 1 })

// Matches collection
db.matches.createIndex({ "userA_Id": 1, "createdAt": -1 })
db.matches.createIndex({ "userB_Id": 1, "createdAt": -1 })
```

## Troubleshooting

### Common Issues

#### 1. "MongoDB Data API error"
- Check MONGO_DATA_API_URL format
- Verify API key has correct permissions
- Ensure Data API is enabled in Atlas

#### 2. "Rate limit exceeded"
- Check if hitting 100K/day limit
- Implement client-side caching
- Consider paid plan upgrade

#### 3. "CPU time exceeded"
- Optimize queries with indexes
- Reduce response payload size
- Use more aggressive caching

### Debug Commands
```bash
# Check logs
wrangler tail

# Test specific endpoint
curl -X GET "https://your-worker.workers.dev/api/users?id=123"

# Check KV data
wrangler kv:key list --binding CACHE
```

## Next Steps
1. Deploy with current configuration
2. Test all endpoints
3. Monitor usage for 24-48 hours
4. Optimize based on real usage patterns
5. Consider paid plan or alternative hosting if limits exceeded