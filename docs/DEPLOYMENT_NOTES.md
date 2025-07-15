# Google Cloud Run Deployment Guide

## Prerequisites
1. Google Cloud account with billing enabled
2. `gcloud` CLI installed and authenticated
3. Docker installed 

## Deployment Steps

1. **Update Dockerfile**:
   - Ensure PORT environment variable is used
   - Set NODE_ENV=production

2. **Configure Domain**:
   - Verify DNS records for swipehire.top
   - Set up Cloud DNS if needed

3. **Environment Variables**:
   - Production database credentials
   - API keys for services
   - CORS settings for production domain

## Post-Deployment
1. Set up monitoring and alerts
2. Configure auto-scaling as needed
3. Enable Cloud SQL if using managed database
4. Set up Cloud Build triggers for CI/CD

## Important URLs
- Cloud Run Dashboard: https://console.cloud.google.com/run
- Cloud Build History: https://console.cloud.google.com/cloud-build
