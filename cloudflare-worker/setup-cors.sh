#!/bin/bash
# Script to set CORS origins for Cloudflare Worker

echo "Setting ALLOWED_ORIGINS for Cloudflare Worker..."
echo "This will allow requests from:"
echo "  - https://subit-ai.vercel.app (production)"
echo "  - http://localhost:3000 (local development)"
echo ""

# Set the ALLOWED_ORIGINS secret
echo "Please enter the ALLOWED_ORIGINS value (comma-separated):"
echo "Example: https://subit-ai.vercel.app,http://localhost:3000"
read -p "ALLOWED_ORIGINS: " origins

if [ -z "$origins" ]; then
  origins="https://subit-ai.vercel.app,http://localhost:3000"
  echo "Using default: $origins"
fi

echo ""
echo "Setting Cloudflare Worker secret..."
wrangler secret put ALLOWED_ORIGINS <<< "$origins"

echo ""
echo "✅ CORS configuration updated!"
echo "The worker will now accept requests from: $origins"

