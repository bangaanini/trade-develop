#!/bin/bash

# ================================================
# PostgreSQL Database Backup Script
# ================================================
# Purpose: Create full backup of local database for VPS migration
# Usage: ./backup-database.sh
# Output: backup-YYYY-MM-DD-HHMMSS.sql
# ================================================

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}PostgreSQL Database Backup Tool${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

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
        echo -e "${YELLOW}⚠${NC}  Database credentials not found"
        echo "Please enter your PostgreSQL connection details:"
        read -p "Host (default: localhost): " DB_HOST
        DB_HOST=${DB_HOST:-localhost}
        read -p "Port (default: 5432): " DB_PORT
        DB_PORT=${DB_PORT:-5432}
        read -p "User: " DB_USER
        read -sp "Password: " DB_PASSWORD
        echo ""
        read -p "Database name: " DB_NAME
        DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
    fi
fi

# Display connection info (without password)
echo -e "${BLUE}Database:${NC} ${DB_NAME}"
echo -e "${BLUE}Host:${NC} ${DB_HOST}:${DB_PORT}"
echo -e "${BLUE}User:${NC} ${DB_USER}"

# Generate timestamp for backup filename
TIMESTAMP=$(date +"%Y-%m-%d-%H%M%S")
BACKUP_DIR="backups"
BACKUP_FILE="${BACKUP_DIR}/backup-${TIMESTAMP}.sql"

# Create backups directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo ""
echo -e "${BLUE}Starting backup...${NC}"
echo -e "Backup file: ${GREEN}${BACKUP_FILE}${NC}"
echo ""

# Create backup using pg_dump
# Using separate parameters instead of DATABASE_URL to avoid socket issues on macOS
# --clean: Add DROP statements before CREATE
# --if-exists: Use IF EXISTS with DROP statements
# --no-owner: Don't output commands to set ownership
# --no-privileges: Don't output commands to set privileges
PGPASSWORD="$DB_PASSWORD" pg_dump \
    -h "$DB_HOST" \
    -p "${DB_PORT:-5432}" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --clean \
    --if-exists \
    --no-owner \
    --no-privileges \
    --verbose \
    --file="$BACKUP_FILE" 2>&1

# Check if backup was successful
if [ $? -eq 0 ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✓ Backup completed successfully!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "Backup file: ${BLUE}${BACKUP_FILE}${NC}"
    echo -e "File size: ${BLUE}${BACKUP_SIZE}${NC}"
    echo ""
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "1. Copy this file to your VPS:"
    echo -e "   ${BLUE}scp ${BACKUP_FILE} user@your-vps:/path/to/backup/${NC}"
    echo ""
    echo "2. On VPS, restore the database:"
    echo -e "   ${BLUE}./restore-database.sh ${BACKUP_FILE}${NC}"
    echo ""
    echo "3. Or restore manually:"
    echo -e "   ${BLUE}psql -h HOST -U USER -d DATABASE -f ${BACKUP_FILE}${NC}"
    echo ""
else
    echo ""
    echo -e "${YELLOW}⚠ Backup failed! Check the error messages above.${NC}"
    exit 1
fi

