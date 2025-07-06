#!/bin/bash
# Google Cloud Run deployment script for SwipeHire backend

# 1. Install gcloud CLI if not already installed
# Download from: https://cloud.google.com/sdk/docs/install

# 2. Authenticate and set project
gcloud auth login
gcloud config set project [YOUR-PROJECT-ID]

# 3. Build the Docker image
gcloud builds submit \
  --tag gcr.io/[YOUR-PROJECT-ID]/swipehire-backend \
  ./swipehire-backend

# 4. Deploy to Cloud Run
gcloud run deploy swipehire-backend \
  --image gcr.io/[YOUR-PROJECT-ID]/swipehire-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production" \
  --port 5000

# 5. Map custom domain (after deployment succeeds)
# gcloud beta run domain-mappings create \
#   --service swipehire-backend \
#   --domain swipehire.top \
#   --region us-central1
