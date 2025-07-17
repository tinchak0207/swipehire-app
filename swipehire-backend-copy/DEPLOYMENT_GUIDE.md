# SwipeHire Backend Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Cloudflare account with Workers enabled
- MongoDB Atlas cluster
- Firebase project (optional)

### 1. Environment Setup

Create a `.env` file in the backend directory:

```bash
# Required - MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/swipehire?retryWrites=true&w=majority

# Required - Forms webhook secret
FORMSAPP_WEBHOOK_SECRET=your_forms_webhook_secret_here

# Optional - Firebase Admin SDK
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Frontend URLs (for CORS)
FRONTEND_URL_PRIMARY=https://swipehire.top
FRONTEND_URL_SECONDARY=https://www.swipehire.top
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Deploy to Cloudflare Workers

#### Option A: Automated Script (Recommended)
```bash
npm run deploy:setup
```

#### Option B: Manual Steps
```bash
# Login to Cloudflare
wrangler login

# Set secrets
wrangler secret put MONGODB_URI
wrangler secret put FORMSAPP_WEBHOOK_SECRET

# Deploy
npm run deploy
```

### 4. Verify Deployment

After deployment, test the endpoints:

```bash
npm test
```

## 🔧 Configuration Details

### Database Connection
The backend now uses optimized MongoDB connection settings:
- **Connection Pool**: 20 max connections
- **Timeout**: 10 seconds for server selection
- **Retry Logic**: 3 retry attempts with exponential backoff
- **Health Checks**: Automatic connection monitoring

### Cloudflare Workers Settings

#### wrangler.toml Configuration
```toml
name = "swipehire-backend"
main = "index-optimized.mjs"
compatibility_date = "2024-12-01"
compatibility_flags = ["nodejs_compat"]

[vars]
NODE_ENV = "production"
ENVIRONMENT = "workers"
FRONTEND_URL_PRIMARY = "https://swipehire.top"
FRONTEND_URL_SECONDARY = "https://www.swipehire.top"

# Secrets (set via wrangler secret put)
# MONGODB_URI - MongoDB Atlas connection string
# FORMSAPP_WEBHOOK_SECRET - Webhook authentication
```

### API Endpoints

#### Health Check
```
GET https://swipehire-backend.swipehire.workers.dev/health
```

#### Jobs
```
GET    /api/jobs/public           # Get public jobs
GET    /api/users/:id/jobs        # Get user's jobs
POST   /api/users/:id/jobs        # Create new job
PUT    /api/users/:id/jobs/:jobId # Update job
DELETE /api/users/:id/jobs/:jobId # Delete job
```

#### Users
```
GET    /api/users/:id             # Get user profile
GET    /api/users/profiles/jobseekers  # Get jobseeker profiles
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Database Connection Timeout
**Symptoms**: 503 Service Unavailable, "Database query timeout"
**Solution**: 
- Check MongoDB Atlas connection string
- Verify firewall settings allow Cloudflare IPs
- Increase timeout values in `config/database-optimized.mjs`

#### 2. CORS Issues
**Symptoms**: Browser blocks requests with CORS errors
**Solution**:
- Verify FRONTEND_URL_* variables in wrangler.toml
- Check allowed origins in `config/constants.mjs`

#### 3. Rate Limiting
**Symptoms**: 429 Too Many Requests
**Solution**:
- Default rate limit is 100 requests/minute per IP
- Adjust in `index-optimized.mjs` if needed

### Debug Commands

```bash
# Check deployment status
wrangler deployments

# View real-time logs
wrangler tail

# Test locally
npm run start:dev

# Check secrets
wrangler secret list

# Health check
curl https://swipehire-backend.swipehire.workers.dev/health
```

## 📊 Performance Monitoring

### Built-in Metrics
The backend tracks:
- Request count
- Cache hits/misses
- Response times
- Error rates

### Access Metrics
```bash
# View metrics endpoint
curl https://swipehire-backend.swipehire.workers.dev/health
```

## 🔒 Security Best Practices

### Environment Variables
- Never commit secrets to GitHub
- Use `wrangler secret put` for sensitive data
- Rotate secrets regularly

### Database Security
- Use MongoDB Atlas with IP whitelisting
- Enable database encryption at rest
- Regular security audits

### CORS Configuration
- Only allow specific origins
- Use HTTPS for all endpoints
- Validate all inputs

## 🔄 Continuous Deployment

### GitHub Actions (Optional)
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Workers
on:
  push:
    branches: [main]
  
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

## 📞 Support

If you encounter issues:
1. Check the logs with `wrangler tail`
2. Verify all environment variables are set
3. Test endpoints with the provided test script
4. Review the troubleshooting section above

For additional help, check the [Cloudflare Workers documentation](https://developers.cloudflare.com/workers/).