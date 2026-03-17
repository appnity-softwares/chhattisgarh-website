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
APP_NAME="shaadi-admin"

echo -e "${BLUE}=== Starting Admin Panel Redeploy ===${NC}"

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

# 5. Restart with PM2
echo -e "${YELLOW}Step 5: Restarting PM2 process on port 3001...${NC}"
if pm2 list | grep -q "$APP_NAME"; then
    pm2 delete "$APP_NAME"
fi

# Force PORT=3001 to override any .env settings
PORT=3001 pm2 start npm --name "$APP_NAME" -- start -- -p 3001

# 6. Save PM2 state
pm2 save

echo -e "${GREEN}=== Admin Panel is LIVE! ===${NC}"
echo -e "Check status: ${BLUE}pm2 status${NC}"
echo -e "View logs: ${BLUE}pm2 logs $APP_NAME${NC}"
