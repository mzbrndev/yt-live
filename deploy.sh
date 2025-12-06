#!/bin/bash

# Quick Deploy Script untuk VPS
# Usage: ./deploy.sh [production|staging]

set -e

echo "🚀 Starting deployment..."

# Configuration
APP_DIR="$HOME/apps/yt-live"
APP_NAME="yt-live"
BACKUP_DIR="$HOME/backups"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Create backup directory if not exists
mkdir -p "$BACKUP_DIR"

echo -e "${YELLOW}📦 Stopping application...${NC}"
pm2 stop $APP_NAME || echo "App not running"

echo -e "${YELLOW}💾 Creating backup...${NC}"
BACKUP_FILE="$BACKUP_DIR/yt-live-backup-$(date +%Y%m%d-%H%M%S).tar.gz"
cd "$HOME/apps"
tar -czf "$BACKUP_FILE" yt-live/uploads 2>/dev/null || echo "No uploads to backup"
echo -e "${GREEN}✓ Backup created: $BACKUP_FILE${NC}"

echo -e "${YELLOW}📥 Pulling latest changes...${NC}"
cd "$APP_DIR"
git pull origin main

echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install --production

echo -e "${YELLOW}🔄 Restarting application...${NC}"
pm2 restart $APP_NAME

echo -e "${YELLOW}📊 Checking status...${NC}"
pm2 status $APP_NAME

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${YELLOW}📝 View logs with: pm2 logs $APP_NAME${NC}"

# Show last 20 lines of logs
echo -e "\n${YELLOW}Recent logs:${NC}"
pm2 logs $APP_NAME --lines 20 --nostream
