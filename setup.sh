#!/bin/bash

# OCR API Quick Start Script
# This script sets up and runs the OCR API

set -e

echo "🚀 OCR API - Quick Start"
echo "================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check PostgreSQL
echo -e "${BLUE}Step 1: Checking PostgreSQL...${NC}"
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install it using: brew install postgresql"
    exit 1
fi
echo -e "${GREEN}✓ PostgreSQL found${NC}"

# Step 2: Check if PostgreSQL is running
echo -e "${BLUE}Step 2: Checking if PostgreSQL is running...${NC}"
if ! pg_isready -q; then
    echo -e "${YELLOW}⚠ PostgreSQL is not running. Starting it...${NC}"
    brew services start postgresql
    sleep 2
fi
echo -e "${GREEN}✓ PostgreSQL is running${NC}"

# Step 3: Create database if it doesn't exist
echo -e "${BLUE}Step 3: Checking/Creating database...${NC}"
if psql -U postgres -lqt | cut -d \| -f 1 | grep -qw ocr; then
    echo -e "${GREEN}✓ Database 'ocr' already exists${NC}"
else
    echo -e "${YELLOW}Creating database 'ocr'...${NC}"
    psql -U postgres -c "CREATE DATABASE ocr;"
    echo -e "${GREEN}✓ Database 'ocr' created${NC}"
fi

# Step 4: Install dependencies
echo -e "${BLUE}Step 4: Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Step 5: Run migrations
echo -e "${BLUE}Step 5: Running migrations...${NC}"
npm run migrate
echo -e "${GREEN}✓ Migrations completed${NC}"

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✨ Setup Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "To start the server, run:"
echo -e "  ${BLUE}npm start${NC}       (production mode)"
echo -e "  ${BLUE}npm run dev${NC}    (development mode with auto-reload)"
echo ""
echo "API Documentation:"
echo -e "  ${BLUE}http://localhost:5001/api${NC}"
echo ""
echo "Health Check:"
echo -e "  ${BLUE}http://localhost:5001/api/health${NC}"
echo ""
