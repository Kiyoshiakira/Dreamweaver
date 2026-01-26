#!/bin/bash

# ============================================================================
# API Configuration Verification Script
# ============================================================================
# 
# This script verifies that the Dreamweaver application is properly configured
# to connect to AI services ONLY through Firebase Functions using the .env file.
# 
# Usage: ./verify-api-connection.sh
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_header() {
    echo ""
    echo "=========================================="
    echo "$1"
    echo "=========================================="
}

# Check counter
ERRORS=0
WARNINGS=0

print_header "Dreamweaver API Connection Verification"
echo "This script verifies that AI connects ONLY via Firebase Functions"
echo ""

# ============================================================================
# Check 1: Verify .env is in .gitignore
# ============================================================================
print_header "Check 1: Verifying .env is NOT tracked by git"

if grep -q "^\.env$" .gitignore 2>/dev/null || grep -q "^server/functions/\.env$" .gitignore 2>/dev/null; then
    print_success ".env files are properly excluded from git"
else
    print_error ".env is NOT in .gitignore! API keys could be exposed!"
    ERRORS=$((ERRORS + 1))
fi

# Check if .env is actually tracked
if git ls-files --error-unmatch server/functions/.env >/dev/null 2>&1; then
    print_error "WARNING: server/functions/.env IS TRACKED BY GIT!"
    print_error "Run: git rm --cached server/functions/.env"
    ERRORS=$((ERRORS + 1))
else
    print_success ".env file is not tracked by git"
fi

# ============================================================================
# Check 2: Verify .env.example exists
# ============================================================================
print_header "Check 2: Verifying .env.example exists"

if [ -f "server/functions/.env.example" ]; then
    print_success ".env.example file exists"
else
    print_error ".env.example file is missing"
    ERRORS=$((ERRORS + 1))
fi

# ============================================================================
# Check 3: Check if .env file exists
# ============================================================================
print_header "Check 3: Checking for .env file"

if [ -f "server/functions/.env" ]; then
    print_success ".env file exists for local development"
    
    # Check if it has an API key
    if grep -q "^DREAMWEAVER_APIKEY=" server/functions/.env 2>/dev/null; then
        if grep -q "^DREAMWEAVER_APIKEY=your_api_key_here" server/functions/.env 2>/dev/null; then
            print_warning "API key is still set to placeholder value"
            print_info "Edit server/functions/.env and add your actual API key"
            WARNINGS=$((WARNINGS + 1))
        elif grep -q "^DREAMWEAVER_APIKEY=AIza" server/functions/.env 2>/dev/null; then
            print_success "API key appears to be configured in .env"
        else
            print_warning "DREAMWEAVER_APIKEY is set but may be invalid"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        print_warning "No DREAMWEAVER_APIKEY found in .env"
        print_info "Add: DREAMWEAVER_APIKEY=your_api_key_here"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    print_warning ".env file not found (OK if using Firebase config)"
    print_info "For local development: cp server/functions/.env.example server/functions/.env"
fi

# ============================================================================
# Check 4: Verify Firebase Functions config
# ============================================================================
print_header "Check 4: Checking Firebase Functions configuration"

if command -v firebase &> /dev/null; then
    print_success "Firebase CLI is installed"
    
    # Try to get Firebase config
    if firebase functions:config:get 2>/dev/null | grep -q "genai"; then
        print_success "Firebase Functions config includes genai.key"
    else
        print_warning "Firebase Functions config does not include genai.key"
        print_info "For production: firebase functions:config:set genai.key=\"YOUR_KEY\""
        WARNINGS=$((WARNINGS + 1))
    fi
else
    print_warning "Firebase CLI not found"
    print_info "Install: npm install -g firebase-tools"
    WARNINGS=$((WARNINGS + 1))
fi

# ============================================================================
# Check 5: Verify no direct API calls in frontend
# ============================================================================
print_header "Check 5: Verifying no direct API calls from frontend"

# Check for direct API calls (excluding CSP headers and comments)
DIRECT_CALLS=$(grep -r "fetch.*generativelanguage.googleapis.com" public/*.js public/*.html 2>/dev/null | grep -v "CSP\|connect-src\|Content-Security\|//" || true)

if [ -z "$DIRECT_CALLS" ]; then
    print_success "No direct API calls found in frontend code"
else
    print_error "Found potential direct API calls in frontend:"
    echo "$DIRECT_CALLS"
    ERRORS=$((ERRORS + 1))
fi

# Check that proxy calls exist
if grep -q "/generateStory" public/index.html && \
   grep -q "/generateTTS" public/index.html && \
   grep -q "/generateImage" public/index.html; then
    print_success "Frontend uses Firebase Functions proxies"
else
    print_error "Frontend does not appear to use Firebase Functions proxies"
    ERRORS=$((ERRORS + 1))
fi

# ============================================================================
# Check 6: Verify Firebase Functions implementation
# ============================================================================
print_header "Check 6: Verifying Firebase Functions implementation"

if [ -f "server/functions/index.js" ]; then
    print_success "Firebase Functions file exists"
    
    # Check for getApiKey function
    if grep -q "function getApiKey()" server/functions/index.js; then
        print_success "getApiKey() function found"
    else
        print_error "getApiKey() function not found in index.js"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Check for exports
    if grep -q "exports.generateStory" server/functions/index.js && \
       grep -q "exports.generateTTS" server/functions/index.js && \
       grep -q "exports.generateImage" server/functions/index.js; then
        print_success "All three proxy functions are exported"
    else
        print_error "Not all proxy functions are exported"
        ERRORS=$((ERRORS + 1))
    fi
else
    print_error "server/functions/index.js not found"
    ERRORS=$((ERRORS + 1))
fi

# ============================================================================
# Check 7: Verify firebase.json configuration
# ============================================================================
print_header "Check 7: Verifying firebase.json rewrites"

if [ -f "firebase.json" ]; then
    print_success "firebase.json exists"
    
    # Check for hosting rewrites
    if grep -q "generateStory" firebase.json && \
       grep -q "generateTTS" firebase.json && \
       grep -q "generateImage" firebase.json; then
        print_success "Firebase hosting rewrites are configured"
    else
        print_error "Firebase hosting rewrites not properly configured"
        ERRORS=$((ERRORS + 1))
    fi
else
    print_error "firebase.json not found"
    ERRORS=$((ERRORS + 1))
fi

# ============================================================================
# Check 8: Verify no API keys in HTML
# ============================================================================
print_header "Check 8: Verifying no API keys exposed in HTML"

# Check for API keys in HTML (excluding Firebase config and reCAPTCHA)
EXPOSED_KEYS=$(grep -i "AIza" public/index.html 2>/dev/null | grep -v "__firebase_config\|Firebase\|firebase" || true)

if [ -z "$EXPOSED_KEYS" ]; then
    print_success "No exposed API keys found in HTML"
else
    print_warning "Found potential API key references (verify they're Firebase, not Generative AI):"
    echo "$EXPOSED_KEYS"
    WARNINGS=$((WARNINGS + 1))
fi

# ============================================================================
# Summary
# ============================================================================
print_header "Verification Summary"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    print_success "All checks passed! Your API connection is properly configured."
    echo ""
    echo "✓ API keys are secure"
    echo "✓ Frontend uses Firebase Functions only"
    echo "✓ No direct API calls from client"
    echo ""
    echo "You can safely use:"
    echo "  • firebase deploy (to deploy)"
    echo "  • git pull (to update)"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo ""
    print_warning "Verification completed with $WARNINGS warning(s)"
    echo ""
    echo "Your configuration is functional but has minor issues."
    echo "Review the warnings above and address them if needed."
    exit 0
else
    echo ""
    print_error "Verification failed with $ERRORS error(s) and $WARNINGS warning(s)"
    echo ""
    echo "Please address the errors above before deploying."
    echo ""
    echo "For help, see:"
    echo "  • API_CONNECTION_GUIDE.md"
    echo "  • server/README.md"
    exit 1
fi
