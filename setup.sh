#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# ResuMate – Automated Local Setup Script
# Usage:  bash setup.sh
# ─────────────────────────────────────────────────────────────
set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

echo ""
echo -e "${CYAN}${BOLD}"
echo "  ██████╗ ███████╗███████╗██╗   ██╗███╗   ███╗ █████╗ ████████╗███████╗"
echo "  ██╔══██╗██╔════╝██╔════╝██║   ██║████╗ ████║██╔══██╗╚══██╔══╝██╔════╝"
echo "  ██████╔╝█████╗  ███████╗██║   ██║██╔████╔██║███████║   ██║   █████╗  "
echo "  ██╔══██╗██╔══╝  ╚════██║██║   ██║██║╚██╔╝██║██╔══██║   ██║   ██╔══╝  "
echo "  ██║  ██║███████╗███████║╚██████╔╝██║ ╚═╝ ██║██║  ██║   ██║   ███████╗"
echo "  ╚═╝  ╚═╝╚══════╝╚══════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝"
echo -e "${NC}"
echo -e "${BOLD}  AI-Powered Student Resume Builder — Local Setup${NC}"
echo "──────────────────────────────────────────────────────────"

# ── Step 1: Node.js ──────────────────────────────────────────
if ! command -v node &>/dev/null; then
  echo -e "${RED}❌  Node.js not found.${NC}"
  echo "    Install from https://nodejs.org (v18+ required)"
  exit 1
fi
echo -e "${GREEN}✅  Node $(node -v) found${NC}"

# ── Step 2: npm ──────────────────────────────────────────────
if ! command -v npm &>/dev/null; then
  echo -e "${RED}❌  npm not found.${NC}"
  exit 1
fi
echo -e "${GREEN}✅  npm $(npm -v) found${NC}"

# ── Step 3: PostgreSQL client ────────────────────────────────
if ! command -v psql &>/dev/null; then
  echo -e "${YELLOW}⚠️   psql not found — trying to install PostgreSQL...${NC}"
  if command -v apt-get &>/dev/null; then
    sudo apt-get update -qq && sudo apt-get install -y postgresql postgresql-client
  elif command -v brew &>/dev/null; then
    brew install postgresql@15 && brew services start postgresql@15
  else
    echo -e "${RED}❌  Cannot auto-install PostgreSQL.${NC}"
    echo "    Please install it manually:"
    echo "    • Ubuntu/Debian:  sudo apt-get install postgresql"
    echo "    • macOS:          brew install postgresql"
    echo "    • Windows:        https://www.postgresql.org/download/windows/"
    echo "    Then re-run: bash setup.sh"
    exit 1
  fi
fi
echo -e "${GREEN}✅  PostgreSQL client found${NC}"

# ── Step 4: Start PostgreSQL service ────────────────────────
echo ""
echo -e "${BOLD}🔄  Ensuring PostgreSQL service is running...${NC}"

if command -v systemctl &>/dev/null; then
  # Linux systemd
  if ! systemctl is-active --quiet postgresql 2>/dev/null; then
    echo "    Starting PostgreSQL via systemctl..."
    sudo systemctl start postgresql 2>/dev/null || true
    sleep 2
  fi
elif command -v brew &>/dev/null; then
  # macOS Homebrew
  brew services start postgresql@15 2>/dev/null || brew services start postgresql 2>/dev/null || true
  sleep 2
elif command -v pg_ctl &>/dev/null; then
  pg_ctl start 2>/dev/null || true
  sleep 2
fi

# Quick connectivity test
if pg_isready -q 2>/dev/null; then
  echo -e "${GREEN}✅  PostgreSQL is running${NC}"
else
  echo -e "${YELLOW}⚠️   PostgreSQL may not be running. Attempting to continue...${NC}"
fi

# ── Step 5: .env setup ───────────────────────────────────────
echo ""
echo -e "${BOLD}📄  Configuring environment...${NC}"

if [ ! -f ".env" ]; then
  cp .env.example .env 2>/dev/null || echo "DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/resumate_db" > .env
  echo -e "${GREEN}✅  Created .env from template${NC}"
else
  echo -e "${GREEN}✅  .env already exists${NC}"
fi

# Load DATABASE_URL from .env
if [ -f ".env" ]; then
  export $(grep -v '^#' .env | xargs 2>/dev/null) || true
fi

# Parse DB name and connection details from DATABASE_URL
DB_URL="${DATABASE_URL:-postgresql://postgres:postgres@127.0.0.1:5432/resumate_db}"
DB_NAME=$(echo "$DB_URL" | sed 's|.*\/||' | sed 's|?.*||')
DB_HOST=$(echo "$DB_URL" | sed 's|.*@||' | sed 's|:.*||' | sed 's|\/.*||')
DB_PORT=$(echo "$DB_URL" | sed 's|.*:\([0-9]*\)\/.*|\1|')
DB_USER=$(echo "$DB_URL" | sed 's|postgresql://||' | sed 's|:.*||')

echo "    Database: ${DB_NAME} @ ${DB_HOST}:${DB_PORT}"

# ── Step 6: Create database if it doesn't exist ──────────────
echo ""
echo -e "${BOLD}🗄️   Setting up database...${NC}"

# Try creating DB — ignore error if it already exists
if command -v createdb &>/dev/null; then
  createdb "$DB_NAME" 2>/dev/null && echo -e "${GREEN}✅  Database '${DB_NAME}' created${NC}" || echo -e "${GREEN}✅  Database '${DB_NAME}' already exists${NC}"
else
  # Fallback: use psql
  psql -U "$DB_USER" -h "$DB_HOST" -p "${DB_PORT:-5432}" postgres \
    -c "CREATE DATABASE \"$DB_NAME\";" 2>/dev/null \
    && echo -e "${GREEN}✅  Database '${DB_NAME}' created${NC}" \
    || echo -e "${GREEN}✅  Database already exists or psql not available — continuing...${NC}"
fi

# ── Step 7: Install npm dependencies ─────────────────────────
echo ""
echo -e "${BOLD}📦  Installing npm dependencies...${NC}"
npm install --silent
echo -e "${GREEN}✅  Dependencies installed${NC}"

# ── Step 8: Push schema ──────────────────────────────────────
echo ""
echo -e "${BOLD}🏗️   Pushing database schema (tables, constraints, indexes)...${NC}"

if npx drizzle-kit push 2>&1; then
  echo -e "${GREEN}✅  Database schema is ready${NC}"
else
  echo ""
  echo -e "${RED}❌  Schema push failed. Troubleshooting:${NC}"
  echo ""
  echo "  1. Verify PostgreSQL is running:"
  echo "     ${BOLD}sudo systemctl status postgresql${NC}  (Linux)"
  echo "     ${BOLD}brew services list${NC}                 (macOS)"
  echo ""
  echo "  2. Check your credentials in .env:"
  echo "     ${BOLD}cat .env${NC}"
  echo ""
  echo "  3. Manually create the database:"
  echo "     ${BOLD}sudo -u postgres createdb resumate_db${NC}       (Linux)"
  echo "     ${BOLD}createdb resumate_db${NC}                        (macOS)"
  echo ""
  echo "  4. Test connection:"
  echo "     ${BOLD}psql \"\$DATABASE_URL\" -c 'SELECT 1'${NC}"
  echo ""
  echo "  5. Then re-run:"
  echo "     ${BOLD}bash setup.sh${NC}"
  exit 1
fi

# ── Done ─────────────────────────────────────────────────────
echo ""
echo "──────────────────────────────────────────────────────────"
echo -e "${GREEN}${BOLD}🎉  Setup complete!${NC}"
echo ""
echo -e "  Start the app:  ${CYAN}${BOLD}npm run dev${NC}"
echo -e "  Then open:      ${CYAN}${BOLD}http://localhost:3000${NC}"
echo ""
echo "  Demo accounts (auto-seeded on first load):"
echo "  ┌──────────────────────────────────────────────┐"
echo "  │  alex.chen@berkeley.edu   (CS @ Berkeley)    │"
echo "  │  m.patel@jhu.edu          (Bio @ Hopkins)     │"
echo "  │  mvance@stern.nyu.edu     (Finance @ Stern)   │"
echo "  │  Password for all:  demo_password             │"
echo "  └──────────────────────────────────────────────┘"
echo "──────────────────────────────────────────────────────────"
