#!/bin/bash

# ============================================
# Chhattisgarh Shaadi Admin Panel (v2) - Deployment Script
# For VPS (Ubuntu 22.04+)
# ============================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  Chhattisgarh Shaadi Admin Panel Deployment${NC}"
echo -e "${BLUE}============================================${NC}"

# Configuration
APP_NAME="shaadi-admin-v2"
APP_DIR="/var/www/chhattisgarh-admin-v2"
DOMAIN="admin.chhattisgarhshadi.com"
PORT=3001
REPO_URL="https://github.com/appnity-softwares/Chhatishgarh-shadi.git"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Please run as root (use: sudo bash deploy_admin.sh)${NC}"
  exit 1
fi

# Step 1: Install Dependencies (Assumes Node & PM2 are already installed via backend/website scripts)
echo -e "\n${YELLOW}[1/5] Checking dependencies...${NC}"
if ! command -v pm2 &> /dev/null; then
    echo -e "${RED}PM2 not found. Installing PM2 globally...${NC}"
    npm install -g pm2
fi
if ! command -v nginx &> /dev/null; then
    echo -e "${RED}Nginx not found. Installing Nginx...${NC}"
    apt update && apt install -y nginx
fi

# Step 2: Setup Application Directory
echo -e "\n${YELLOW}[2/5] Setting up application...${NC}"

# Create app directory if it doesn't exist
if [ ! -d "$APP_DIR" ]; then
    echo "📂 Creating directory $APP_DIR..."
    mkdir -p $APP_DIR
    git clone $REPO_URL $APP_DIR
    cd $APP_DIR
    git checkout develop || git checkout main
else
    echo "🔄 Directory exists. Pulling latest changes..."
    cd $APP_DIR
    git pull origin develop || git pull origin main
fi

# Install dependencies for the admin panel
echo "Installing npm dependencies in $APP_DIR/UIUX/chhattisgarh-shadi-admin-v2..."
cd "$APP_DIR/UIUX/chhattisgarh-shadi-admin-v2" || { echo -e "${RED}Path not found inside repository!${NC}"; exit 1; }
npm install

# Step 3: Build & Start Next.js App
echo -e "\n${YELLOW}[3/5] Building & starting Admin panel...${NC}"
npm run build

# Start or restart with PM2 on port 3001
pm2 delete "$APP_NAME" 2>/dev/null || true
pm2 start npm --name "$APP_NAME" -- start -- -p $PORT

pm2 save

# Step 4: Configure Nginx
echo -e "\n${YELLOW}[4/5] Configuring Nginx acting as a reverse proxy for Admin Panel...${NC}"

cat > /etc/nginx/sites-available/$APP_NAME << EOF
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://localhost:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/

# Test and reload Nginx
nginx -t && systemctl reload nginx
echo -e "${GREEN}Nginx configured successfully for $DOMAIN${NC}"

echo -e "\n${GREEN}============================================${NC}"
echo -e "${GREEN}  Admin Panel Deployment Complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo -e ""
echo -e "${YELLOW}NEXT STEPS:${NC}"
echo -e ""
echo -e "1. ${BLUE}Create your production .env file in the VPS:${NC}"
echo -e "   nano $APP_DIR/.env.production"
echo -e ""
echo -e "2. ${BLUE}Create DNS record mapping ${DOMAIN} -> YOUR_VPS_IP${NC}"
echo -e ""
echo -e "3. ${BLUE}Setup SSL (after DNS propagates):${NC}"
echo -e "   certbot --nginx -d $DOMAIN"
echo -e ""
echo -e "4. ${BLUE}Verify the deployment:${NC}"
echo -e "   curl http://localhost:$PORT"
echo -e ""
