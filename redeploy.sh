#!/bin/bash

# ============================================
# Admin Panel Redeploy Script (VPS Edition)
# ============================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# VPS Path
APP_DIR="/var/www/chhattisgarh-website"
APP_NAME="shadi-website"

echo -e "${BLUE}=== Starting Website & Admin Redeploy ===${NC}"

cd $APP_DIR

# 1. Pull latest code
echo -e "${YELLOW}Step 1: Pulling latest code from GitHub...${NC}"
git pull origin main

# 2. Install dependencies
echo -e "${YELLOW}Step 2: Installing dependencies...${NC}"
npm install --legacy-peer-deps

# 3. CRITICAL: Clean old build
echo -e "${YELLOW}Step 3: Deleting old build (.next folder)...${NC}"
rm -rf .next

# 4. Build application
echo -e "${YELLOW}Step 4: Creating new production build...${NC}"
npm run build

echo -e "${YELLOW}Step 4.5: Copying static assets for standalone server...${NC}"
cp -r public .next/standalone/ 2>/dev/null || true
cp -r .next/static .next/standalone/.next/ 2>/dev/null || true

# 5. Restart with PM2
echo -e "${YELLOW}Step 5: Restarting PM2 process...${NC}"
pm2 restart "$APP_NAME" || PORT=3000 pm2 start .next/standalone/server.js --name "$APP_NAME"

# 6. Save PM2 state
pm2 save

echo -e "${GREEN}=== App is LIVE! ===${NC}"
echo -e "Check status: ${BLUE}pm2 status${NC}"
echo -e "View logs: ${BLUE}pm2 logs $APP_NAME${NC}"
