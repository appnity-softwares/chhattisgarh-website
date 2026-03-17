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

# 5. Restart with PM2
echo -e "${YELLOW}Step 5: Restarting PM2 process...${NC}"
pm2 restart "$APP_NAME" || pm2 start npm --name "$APP_NAME" -- start -- -p 3000

# 6. Save PM2 state
pm2 save

echo -e "${GREEN}=== App is LIVE! ===${NC}"
echo -e "Check status: ${BLUE}pm2 status${NC}"
echo -e "View logs: ${BLUE}pm2 logs $APP_NAME${NC}"
