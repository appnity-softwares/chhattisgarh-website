#!/bin/bash

# Configuration
PROJECT_DIR="/var/www/chhattisgarh-website"
REPO_URL="https://github.com/appnity-softwares/chhattisgarh-website.git"
APP_NAME="shadi-website"
DOMAIN="chhattisgarhshadi.com"

echo "🚀 Starting Deployment for $DOMAIN"

# 0. Stop on error
set -e

# 1. Ensure Directory Exists
if [ ! -d "$PROJECT_DIR" ]; then
    echo "📂 Creating directory $PROJECT_DIR..."
    sudo mkdir -p $PROJECT_DIR
    sudo chown $USER:$USER $PROJECT_DIR
    git clone $REPO_URL $PROJECT_DIR
else
    echo "🔄 Directory exists. Pulling latest changes..."
    cd $PROJECT_DIR
    git pull origin main
fi

cd $PROJECT_DIR

# 2. Install Dependencies
echo "📦 Installing dependencies (with --legacy-peer-deps)..."
npm install --legacy-peer-deps

# 3. Create/Update .env file
# Note: You should manually edit this file on the VPS to include your production secrets
if [ ! -f ".env" ]; then
    echo "📝 Creating .env from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
    else
        touch .env
    fi
    echo "⚠️  REMINDER: Please update /var/www/chhattisgarh-website/.env with production credentials!"
fi

# 4. Build the Project
echo "🏗️  Building Next.js application..."
npm run build

echo "📂 Copying static assets for standalone server..."
cp -r public .next/standalone/ 2>/dev/null || true
cp -r .next/static .next/standalone/.next/ 2>/dev/null || true

# 5. Start/Restart with PM2 (Standalone mode)
echo "⚡ Starting application with PM2 (Standalone mode)..."
pm2 delete $APP_NAME 2>/dev/null || true
PORT=3000 pm2 start .next/standalone/server.js --name "$APP_NAME"

# 6. Save PM2 state
pm2 save

echo "----------------------------------------------------"
echo "✅ Deployment Complete!"
echo "📍 Website is running on port 3000."
echo "🌍 Domain: https://$DOMAIN"
echo "----------------------------------------------------"
echo "💡 IMPORTANT: If this is your first time, remember to:"
echo "1. Setup Nginx reverse proxy for port 3000."
echo "2. Run 'sudo certbot --nginx -d $DOMAIN' for SSL."
echo "----------------------------------------------------"
