#!/bin/bash
# Google Cloud Run deployment script for SwipeHire backend

# 1. Install gcloud CLI if not already installed
# Download from: https://cloud.google.com/sdk/docs/install

# 2. Authenticate and set project
gcloud auth login
gcloud config set project [swipehire-3bscz]

# 3. Build the Docker image
gcloud builds submit \
  --tag gcr.io/[YOUR-PROJECT-ID]/swipehire-backend \
  ./swipehire-backend

# 4. Deploy to Cloud Run with secrets
gcloud run deploy swipehire-backend \
  --image gcr.io/[YOUR-PROJECT-ID]/swipehire-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production" \
  --update-secrets=DATABASE_URL=DATABASE_URL:latest \
  --update-secrets=GOOGLE_API_KEY=GOOGLE_API_KEY:latest \
  --update-secrets=GEMINI_API_KEY=GEMINI_API_KEY:latest \
  --update-secrets=MISTRAL_API_KEY=MISTRAL_API_KEY:latest \
  --update-secrets=SESSION_SECRET=SESSION_SECRET:latest \
  --update-secrets=CSRF_SECRET=CSRF_SECRET:latest \
  --update-secrets=SMTP_PASSWORD=SMTP_PASSWORD:latest \
  --port 5000

# 5. Map custom domain (after deployment succeeds)
# gcloud beta run domain-mappings create \
#   --service swipehire-backend \
#   --domain swipehire.top \
#   --region us-central1
