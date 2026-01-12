#!/bin/bash

# Configuration Test Script for Dreamweaver
# This script helps verify that your API keys are properly configured

echo "🔍 Dreamweaver Configuration Check"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Firebase CLI is installed
echo "1. Checking Firebase CLI..."
if command -v firebase &> /dev/null; then
    echo -e "${GREEN}✓${NC} Firebase CLI is installed"
    firebase --version
else
    echo -e "${RED}✗${NC} Firebase CLI is not installed"
    echo "   Install with: npm install -g firebase-tools"
fi
echo ""

# Check if logged into Firebase
echo "2. Checking Firebase authentication..."
if firebase projects:list &> /dev/null; then
    echo -e "${GREEN}✓${NC} Logged into Firebase"
    firebase projects:list | head -5
else
    echo -e "${RED}✗${NC} Not logged into Firebase"
    echo "   Run: firebase login"
fi
echo ""

# Check Firebase Functions config
echo "3. Checking Firebase Functions config..."
if [ -f ".firebaserc" ]; then
    # Try to extract project ID, handle parsing failures gracefully
    PROJECT_ID=$(cat .firebaserc 2>/dev/null | grep "default" 2>/dev/null | cut -d'"' -f4 2>/dev/null)
    if [ -n "$PROJECT_ID" ]; then
        echo "   Project ID: $PROJECT_ID"
    else
        echo "   Could not parse project ID from .firebaserc"
    fi
    
    CONFIG_OUTPUT=$(firebase functions:config:get 2>&1)
    if echo "$CONFIG_OUTPUT" | grep -q "genai"; then
        echo -e "${GREEN}✓${NC} API key is configured in Firebase Functions config"
        echo "   Config found: genai.key"
    else
        echo -e "${YELLOW}⚠${NC} API key not found in Firebase Functions config"
        echo "   Set with: firebase functions:config:set genai.key=\"YOUR_API_KEY\""
    fi
else
    echo -e "${RED}✗${NC} .firebaserc not found - not a Firebase project"
    echo "   Run: firebase init"
fi
echo ""

# Check for .env file
echo "4. Checking local .env file..."
if [ -f "server/functions/.env" ]; then
    echo -e "${GREEN}✓${NC} .env file exists"
    
    if grep -q "DREAMWEAVER_APIKEY" server/functions/.env; then
        echo -e "${GREEN}✓${NC} DREAMWEAVER_APIKEY found in .env"
    elif grep -q "GEN_API_KEY" server/functions/.env; then
        echo -e "${GREEN}✓${NC} GEN_API_KEY found in .env"
    elif grep -q "GENAI_KEY" server/functions/.env; then
        echo -e "${GREEN}✓${NC} GENAI_KEY found in .env"
    else
        echo -e "${YELLOW}⚠${NC} No API key variable found in .env"
        echo "   Add one of: DREAMWEAVER_APIKEY, GEN_API_KEY, or GENAI_KEY"
    fi
else
    echo -e "${YELLOW}⚠${NC} .env file not found"
    echo "   Create with: cp server/functions/.env.example server/functions/.env"
fi
echo ""

# Check for hardcoded keys (security check)
echo "5. Security check: Scanning for hardcoded API keys..."
FOUND_KEYS=0

if grep -r "AIzaSy" public/ 2>/dev/null | grep -v "YOUR_"; then
    echo -e "${RED}✗${NC} Found potential hardcoded API keys!"
    echo "   Remove them immediately and use Firebase Functions config instead"
    FOUND_KEYS=1
fi

if [ $FOUND_KEYS -eq 0 ]; then
    echo -e "${GREEN}✓${NC} No hardcoded API keys found"
fi
echo ""

# Check Firebase hosting config
echo "6. Checking Firebase hosting configuration..."
if [ -f "firebase.json" ]; then
    echo -e "${GREEN}✓${NC} firebase.json exists"
    
    if grep -q "generateStory" firebase.json; then
        echo -e "${GREEN}✓${NC} generateStory function rewrite configured"
    else
        echo -e "${YELLOW}⚠${NC} generateStory function rewrite not found"
        echo "   Add to firebase.json rewrites section"
    fi
else
    echo -e "${YELLOW}⚠${NC} firebase.json not found"
fi
echo ""

# Summary
echo "===================================="
echo "Summary"
echo "===================================="
echo ""
echo "Configuration methods (in priority order):"
echo "  1. Firebase Functions config: firebase functions:config:set genai.key=\"KEY\""
echo "  2. Environment variable: DREAMWEAVER_APIKEY in .env"
echo "  3. Environment variable: GEN_API_KEY in .env"
echo "  4. Environment variable: GENAI_KEY in .env"
echo ""
echo "Recommendations:"
echo "  • For production: Use Firebase Functions config (method 1)"
echo "  • For local dev: Use .env file (methods 2-4)"
echo "  • Never commit API keys to version control"
echo ""
echo "Next steps:"
echo "  1. If configuration is missing, set up using one of the methods above"
echo "  2. Deploy functions: firebase deploy --only functions"
echo "  3. Test the app: http://localhost:8000/public/index.html"
echo ""
