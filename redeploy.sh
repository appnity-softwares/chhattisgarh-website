#!/bin/bash

# ============================================
# Admin Panel Redeploy Script
# ============================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

APP_NAME="shaadi-admin"

echo -e "${BLUE}=== Admin Panel Redeploy ===${NC}"

# 1. Pull latest code
echo -e "${YELLOW}Pulling latest code...${NC}"
git pull origin main

# 2. Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
# Using --legacy-peer-deps to avoid conflicts with React 19/Next 16 alpha versions if any
npm install --legacy-peer-deps

# 3. Clean previous build
echo -e "${YELLOW}Cleaning old build...${NC}"
rm -rf .next

# 4. Build application
echo -e "${YELLOW}Building application...${NC}"
npm run build

# 5. Restart process with PM2
echo -e "${YELLOW}Restarting application with PM2...${NC}"
if pm2 list | grep -q "$APP_NAME"; then
    echo -e "Reloading existing PM2 process: $APP_NAME"
    pm2 reload "$APP_NAME"
else
    echo -e "Starting new PM2 process: $APP_NAME"
    # Start Next.js in production mode
    pm2 start npm --name "$APP_NAME" -- start
fi

# 6. Save PM2 state
pm2 save

echo -e "${GREEN}=== Redeploy Complete! ===${NC}"
echo -e "Check status: ${BLUE}pm2 status${NC}"
echo -e "View logs: ${BLUE}pm2 logs $APP_NAME${NC}"
