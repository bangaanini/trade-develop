#!/bin/bash

# ================================================
# PostgreSQL Database Restore Script for VPS
# ================================================
# Purpose: Restore database backup on VPS
# Usage: ./restore-database.sh backup-YYYY-MM-DD-HHMMSS.sql
# ================================================

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}PostgreSQL Database Restore Tool${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if backup file is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: No backup file specified${NC}"
    echo "Usage: ./restore-database.sh <backup-file.sql>"
    echo "Example: ./restore-database.sh backups/backup-2025-12-16-172451.sql"
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}Error: Backup file not found: ${BACKUP_FILE}${NC}"
    exit 1
fi

# Load environment variables from .env
if [ -f .env ]; then
    export $(cat .env | grep -E '^(DATABASE_URL|DB_HOST|DB_PORT|DB_USER|DB_PASSWORD|DB_NAME)=' | xargs)
    echo -e "${GREEN}✓${NC} Loaded database config from .env"
else
    echo -e "${YELLOW}⚠${NC}  .env file not found"
fi

# Build DATABASE_URL from separate variables if needed
if [ -z "$DATABASE_URL" ]; then
    if [ -n "$DB_HOST" ] && [ -n "$DB_USER" ] && [ -n "$DB_NAME" ]; then
        DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT:-5432}/${DB_NAME}"
        echo -e "${GREEN}✓${NC} Built DATABASE_URL from separate credentials"
    else
        echo -e "${RED}Error: Database credentials not found in .env${NC}"
        exit 1
    fi
fi

# Display connection info (without password)
echo -e "${BLUE}Database:${NC} ${DB_NAME}"
echo -e "${BLUE}Host:${NC} ${DB_HOST}:${DB_PORT}"
echo -e "${BLUE}User:${NC} ${DB_USER}"
echo ""
echo -e "${YELLOW}⚠ WARNING: This will REPLACE all data in your database!${NC}"
echo -e "Backup file: ${BLUE}${BACKUP_FILE}${NC}"
echo ""
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

echo ""
echo -e "${BLUE}Starting restore...${NC}"
echo ""

# Apply database migration first (for price_cache index)
if [ -f "migrations/add_price_cache_index.sql" ]; then
    echo -e "${BLUE}Applying migrations...${NC}"
    psql "$DATABASE_URL" -f migrations/add_price_cache_index.sql 2>&1 || true
    echo ""
fi

# Restore backup
psql "$DATABASE_URL" -f "$BACKUP_FILE" 2>&1

# Check if restore was successful
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✓ Database restored successfully!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "1. Verify database contents:"
    echo -e "   ${BLUE}psql -h ${DB_HOST} -U ${DB_USER} -d ${DB_NAME} -c \"\\dt\"${NC}"
    echo ""
    echo "2. Start your application:"
    echo -e "   ${BLUE}pm2 start ecosystem.config.js${NC}"
    echo ""
    echo "   Or manually:"
    echo -e "   ${BLUE}pm2 start npm --name next-app -- start${NC}"
    echo -e "   ${BLUE}pm2 start npm --name worker -- run worker${NC}"
    echo ""
else
    echo ""
    echo -e "${RED}⚠ Restore failed! Check the error messages above.${NC}"
    exit 1
fi

