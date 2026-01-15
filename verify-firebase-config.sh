#!/usr/bin/env bash
# Firebase Configuration Verification Script
# This script checks that all Firebase configuration files point to the correct project

echo "================================================"
echo "Firebase Configuration Verification"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Expected project ID
EXPECTED_PROJECT="dreamweaver-10d8e"

echo "Expected Firebase Project: $EXPECTED_PROJECT"
echo ""

# Check .firebaserc
echo "Checking .firebaserc..."
if [ ! -f ".firebaserc" ]; then
    echo -e "${RED}✗ .firebaserc not found${NC}"
    ERRORS=$((ERRORS+1))
else
    # Try to use jq if available, otherwise fall back to grep
    if command -v jq &> /dev/null; then
        PROJECT_ID=$(jq -r '.projects.default // empty' .firebaserc 2>/dev/null)
    else
        # Fallback to grep/cut with error handling
        PROJECT_ID=$(grep -o '"default"[[:space:]]*:[[:space:]]*"[^"]*"' .firebaserc 2>/dev/null | cut -d'"' -f4)
    fi
    
    if [ -z "$PROJECT_ID" ]; then
        echo -e "${RED}✗ Could not parse .firebaserc (file may be malformed)${NC}"
        ERRORS=$((ERRORS+1))
    elif [ "$PROJECT_ID" == "$EXPECTED_PROJECT" ]; then
        echo -e "${GREEN}✓ .firebaserc correctly configured: $PROJECT_ID${NC}"
    else
        echo -e "${RED}✗ .firebaserc has wrong project: $PROJECT_ID (expected: $EXPECTED_PROJECT)${NC}"
        ERRORS=$((ERRORS+1))
    fi
fi
echo ""

# Check firebase.json
echo "Checking firebase.json..."
if [ ! -f "firebase.json" ]; then
    echo -e "${RED}✗ firebase.json not found${NC}"
    ERRORS=$((ERRORS+1))
else
    echo -e "${GREEN}✓ firebase.json exists${NC}"
    
    # Check hosting configuration
    if grep -q '"hosting"' firebase.json; then
        echo -e "${GREEN}  ✓ Hosting configuration found${NC}"
    else
        echo -e "${YELLOW}  ⚠ Hosting configuration not found${NC}"
        WARNINGS=$((WARNINGS+1))
    fi
    
    # Check functions configuration
    if grep -q '"functions"' firebase.json; then
        echo -e "${GREEN}  ✓ Functions configuration found${NC}"
    else
        echo -e "${YELLOW}  ⚠ Functions configuration not found${NC}"
        WARNINGS=$((WARNINGS+1))
    fi
fi
echo ""

# Check GitHub Actions workflows
echo "Checking GitHub Actions workflows..."
WORKFLOW_MERGE=".github/workflows/firebase-hosting-merge.yml"
WORKFLOW_PR=".github/workflows/firebase-hosting-pull-request.yml"

if [ -f "$WORKFLOW_MERGE" ]; then
    if grep -q "projectId: $EXPECTED_PROJECT" "$WORKFLOW_MERGE"; then
        echo -e "${GREEN}✓ Merge workflow correctly configured${NC}"
    else
        echo -e "${RED}✗ Merge workflow has wrong project ID${NC}"
        ERRORS=$((ERRORS+1))
    fi
else
    echo -e "${YELLOW}⚠ Merge workflow not found${NC}"
    WARNINGS=$((WARNINGS+1))
fi

if [ -f "$WORKFLOW_PR" ]; then
    if grep -q "projectId: $EXPECTED_PROJECT" "$WORKFLOW_PR"; then
        echo -e "${GREEN}✓ PR workflow correctly configured${NC}"
    else
        echo -e "${RED}✗ PR workflow has wrong project ID${NC}"
        ERRORS=$((ERRORS+1))
    fi
else
    echo -e "${YELLOW}⚠ PR workflow not found${NC}"
    WARNINGS=$((WARNINGS+1))
fi
echo ""

# Check public directory
echo "Checking public directory..."
if [ -d "public" ]; then
    echo -e "${GREEN}✓ Public directory exists${NC}"
    
    if [ -f "public/index.html" ]; then
        echo -e "${GREEN}  ✓ index.html found${NC}"
    else
        echo -e "${RED}  ✗ index.html not found${NC}"
        ERRORS=$((ERRORS+1))
    fi
else
    echo -e "${RED}✗ Public directory not found${NC}"
    ERRORS=$((ERRORS+1))
fi
echo ""

# Check server functions
echo "Checking server functions..."
if [ -d "server/functions" ]; then
    echo -e "${GREEN}✓ Functions directory exists${NC}"
    
    if [ -f "server/functions/index.js" ]; then
        echo -e "${GREEN}  ✓ index.js found${NC}"
    else
        echo -e "${RED}  ✗ index.js not found${NC}"
        ERRORS=$((ERRORS+1))
    fi
    
    if [ -f "server/functions/package.json" ]; then
        echo -e "${GREEN}  ✓ package.json found${NC}"
    else
        echo -e "${RED}  ✗ package.json not found${NC}"
        ERRORS=$((ERRORS+1))
    fi
else
    echo -e "${YELLOW}⚠ Functions directory not found${NC}"
    WARNINGS=$((WARNINGS+1))
fi
echo ""

# Check Firebase CLI
echo "Checking Firebase CLI..."
if command -v firebase &> /dev/null; then
    echo -e "${GREEN}✓ Firebase CLI installed${NC}"
    
    # Check current project with error handling
    FIREBASE_PROJECT=$(firebase use 2>&1)
    FIREBASE_EXIT_CODE=$?
    
    if [ $FIREBASE_EXIT_CODE -ne 0 ]; then
        echo -e "${YELLOW}⚠ Firebase CLI not initialized or not logged in${NC}"
        echo "  Run: firebase login"
        echo "  Then: firebase use $EXPECTED_PROJECT"
        WARNINGS=$((WARNINGS+1))
    elif echo "$FIREBASE_PROJECT" | grep -q "$EXPECTED_PROJECT"; then
        echo -e "${GREEN}✓ Firebase CLI is using correct project${NC}"
    else
        echo -e "${YELLOW}⚠ Firebase CLI may be using different project${NC}"
        echo "  Run: firebase use $EXPECTED_PROJECT"
        WARNINGS=$((WARNINGS+1))
    fi
else
    echo -e "${YELLOW}⚠ Firebase CLI not installed${NC}"
    echo "  Install with: npm install -g firebase-tools"
    WARNINGS=$((WARNINGS+1))
fi
echo ""

# Summary
echo "================================================"
echo "Summary"
echo "================================================"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo ""
    echo "Your Firebase configuration is correct."
    echo "You can deploy with: firebase deploy"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ $WARNINGS warning(s) found${NC}"
    echo ""
    echo "Configuration is mostly correct, but some optional components are missing."
    exit 0
else
    echo -e "${RED}✗ $ERRORS error(s) found${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠ $WARNINGS warning(s) found${NC}"
    fi
    echo ""
    echo "Please fix the errors above before deploying."
    exit 1
fi
