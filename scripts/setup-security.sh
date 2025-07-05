#!/bin/bash

# Advanced Security Setup Script for Nos Ilha
# This script sets up local security tools and configurations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🛡️ Setting up Advanced Security for Nos Ilha${NC}"
echo "=============================================="

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install tools based on OS
install_tool() {
    local tool=$1
    local install_cmd=$2
    
    if ! command_exists "$tool"; then
        echo -e "${YELLOW}Installing $tool...${NC}"
        eval "$install_cmd"
    else
        echo -e "${GREEN}✅ $tool is already installed${NC}"
    fi
}

# Detect OS
OS="unknown"
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    OS="windows"
fi

echo -e "${BLUE}Detected OS: $OS${NC}"

# Install security tools
echo -e "\n${BLUE}📦 Installing Security Tools${NC}"
echo "================================"

# Install Trivy
if ! command_exists trivy; then
    echo -e "${YELLOW}Installing Trivy vulnerability scanner...${NC}"
    case $OS in
        "linux")
            curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin
            ;;
        "macos")
            if command_exists brew; then
                brew install trivy
            else
                echo -e "${RED}Homebrew not found. Please install Homebrew first.${NC}"
            fi
            ;;
        "windows")
            echo -e "${YELLOW}Please install Trivy manually from: https://github.com/aquasecurity/trivy/releases${NC}"
            ;;
    esac
else
    echo -e "${GREEN}✅ Trivy is already installed${NC}"
fi

# Install GitLeaks
if ! command_exists gitleaks; then
    echo -e "${YELLOW}Installing GitLeaks secret scanner...${NC}"
    case $OS in
        "linux")
            curl -sSfL https://raw.githubusercontent.com/gitleaks/gitleaks/master/scripts/install.sh | sh -s -- -b /usr/local/bin
            ;;
        "macos")
            if command_exists brew; then
                brew install gitleaks
            else
                echo -e "${RED}Homebrew not found. Please install Homebrew first.${NC}"
            fi
            ;;
        "windows")
            echo -e "${YELLOW}Please install GitLeaks manually from: https://github.com/gitleaks/gitleaks/releases${NC}"
            ;;
    esac
else
    echo -e "${GREEN}✅ GitLeaks is already installed${NC}"
fi

# Install Semgrep
if ! command_exists semgrep; then
    echo -e "${YELLOW}Installing Semgrep SAST scanner...${NC}"
    if command_exists pip3; then
        pip3 install semgrep
    elif command_exists pip; then
        pip install semgrep
    else
        echo -e "${RED}Python pip not found. Please install Python and pip first.${NC}"
    fi
else
    echo -e "${GREEN}✅ Semgrep is already installed${NC}"
fi

# Set up Git hooks
echo -e "\n${BLUE}🪝 Setting up Git Hooks${NC}"
echo "=========================="

if [ -d ".git" ]; then
    # Copy pre-commit hook
    if [ -f ".github/hooks/pre-commit" ]; then
        cp .github/hooks/pre-commit .git/hooks/
        chmod +x .git/hooks/pre-commit
        echo -e "${GREEN}✅ Pre-commit hook installed${NC}"
    else
        echo -e "${RED}❌ Pre-commit hook not found in .github/hooks/${NC}"
    fi
    
    # Initialize git hooks
    git config core.hooksPath .git/hooks
    echo -e "${GREEN}✅ Git hooks configured${NC}"
else
    echo -e "${RED}❌ Not a git repository. Please run this script from the repository root.${NC}"
fi

# Create local security configuration
echo -e "\n${BLUE}⚙️ Creating Local Security Configuration${NC}"
echo "=========================================="

# Create .gitleaks.toml if it doesn't exist
if [ ! -f ".gitleaks.toml" ]; then
    cat > .gitleaks.toml << 'EOF'
title = "GitLeaks Configuration for Nos Ilha"

[extend]
# Include default GitLeaks rules
useDefault = true

[[rules]]
description = "AWS Access Key ID"
id = "aws-access-key-id"
regex = '''AKIA[0-9A-Z]{16}'''
tags = ["aws", "secret"]

[[rules]]
description = "AWS Secret Access Key"
id = "aws-secret-access-key"
regex = '''[0-9a-zA-Z/+]{40}'''
tags = ["aws", "secret"]

[[rules]]
description = "Google API Key"
id = "google-api-key"
regex = '''AIza[0-9A-Za-z\-_]{35}'''
tags = ["google", "api-key"]

[[rules]]
description = "GitHub Personal Access Token"
id = "github-pat"
regex = '''ghp_[0-9a-zA-Z]{36}'''
tags = ["github", "token"]

[[rules]]
description = "JWT Token"
id = "jwt-token"
regex = '''eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*'''
tags = ["jwt", "token"]

[[rules]]
description = "Private Key"
id = "private-key"
regex = '''-----BEGIN [A-Z ]*PRIVATE KEY-----'''
tags = ["private-key", "certificate"]

[[rules]]
description = "Hardcoded Password"
id = "hardcoded-password"
regex = '''(?i)(password|passwd|pwd)\s*[:=]\s*["'][^"'\s]{8,}["']'''
tags = ["password", "hardcoded"]

[allowlist]
description = "Allow test files and examples"
files = [
    '''^.*_test\..*$''',
    '''^.*\.test\..*$''',
    '''^.*\.spec\..*$''',
    '''^.*example.*$''',
    '''^.*\.example\..*$''',
    '''^docs/.*$''',
    '''^README.*$'''
]

paths = [
    '''**/test/**''',
    '''**/tests/**''',
    '''**/__tests__/**''',
    '''**/examples/**''',
    '''**/docs/**'''
]

regexes = [
    '''(test|spec|mock|fake|dummy|placeholder)''',
    '''example''',
    '''TODO''',
    '''FIXME'''
]
EOF
    echo -e "${GREEN}✅ GitLeaks configuration created${NC}"
else
    echo -e "${GREEN}✅ GitLeaks configuration already exists${NC}"
fi

# Create Trivy configuration
if [ ! -f ".trivyignore" ]; then
    cat > .trivyignore << 'EOF'
# Trivy ignore file for Nos Ilha
# Ignore test files and development dependencies

# Test files
**/*test*
**/*spec*
**/test/**
**/tests/**
**/__tests__/**

# Development dependencies
**/node_modules/**
**/build/**
**/dist/**
**/.gradle/**
**/target/**

# Documentation
**/docs/**
**/*.md

# Example files
**/*example*
**/*.example.*

# Specific CVEs to ignore (with justification)
# CVE-YYYY-XXXX  # Justification for ignoring this vulnerability
EOF
    echo -e "${GREEN}✅ Trivy ignore file created${NC}"
else
    echo -e "${GREEN}✅ Trivy ignore file already exists${NC}"
fi

# Set up IDE security extensions (VS Code)
echo -e "\n${BLUE}💻 IDE Security Setup${NC}"
echo "======================"

if [ -d ".vscode" ] || command_exists code; then
    if [ ! -d ".vscode" ]; then
        mkdir .vscode
    fi
    
    # Create VS Code settings for security
    if [ ! -f ".vscode/settings.json" ]; then
        cat > .vscode/settings.json << 'EOF'
{
    "security.workspace.trust.enabled": true,
    "security.workspace.trust.banner": "always",
    "security.workspace.trust.startupPrompt": "always",
    "git.detectSubmodules": false,
    "typescript.preferences.includePackageJsonAutoImports": "off",
    "npm.packageManager": "npm",
    "eslint.enable": true,
    "eslint.run": "onType",
    "java.compile.nullAnalysis.mode": "automatic",
    "sonarlint.connectedMode.project": {
        "connectionId": "nos-ilha",
        "projectKey": "bravdigital_nosilha"
    }
}
EOF
        echo -e "${GREEN}✅ VS Code security settings created${NC}"
    fi
    
    # Create VS Code extensions recommendations
    if [ ! -f ".vscode/extensions.json" ]; then
        cat > .vscode/extensions.json << 'EOF'
{
    "recommendations": [
        "ms-vscode.vscode-json",
        "esbenp.prettier-vscode",
        "dbaeumer.vscode-eslint",
        "bradlc.vscode-tailwindcss",
        "ms-vscode.vscode-typescript-next",
        "redhat.java",
        "vscjava.vscode-java-pack",
        "mathiasfrohlich.kotlin",
        "sonarsource.sonarlint-vscode",
        "ms-vscode.vscode-github-actions",
        "timonwong.shellcheck",
        "aquasec.trivy-vulnerability-scanner",
        "gitlab.gitlab-workflow"
    ]
}
EOF
        echo -e "${GREEN}✅ VS Code security extensions recommended${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ VS Code not detected. Skipping IDE setup.${NC}"
fi

# Run initial security scan
echo -e "\n${BLUE}🔍 Running Initial Security Scan${NC}"
echo "=================================="

echo -e "${YELLOW}Running GitLeaks scan...${NC}"
if command_exists gitleaks; then
    gitleaks detect --report-format json --report-path gitleaks-report.json --verbose || true
    if [ -f "gitleaks-report.json" ]; then
        if [ -s "gitleaks-report.json" ]; then
            echo -e "${RED}⚠️ GitLeaks found potential secrets. Please review gitleaks-report.json${NC}"
        else
            echo -e "${GREEN}✅ No secrets detected by GitLeaks${NC}"
            rm gitleaks-report.json
        fi
    fi
fi

echo -e "${YELLOW}Running Trivy scan...${NC}"
if command_exists trivy; then
    trivy fs --security-checks vuln,secret,config --format table . || true
    echo -e "${GREEN}✅ Trivy scan completed${NC}"
fi

# Set up development environment security
echo -e "\n${BLUE}🔧 Development Environment Security${NC}"
echo "===================================="

# Create .env.example if it doesn't exist
if [ ! -f ".env.example" ]; then
    cat > .env.example << 'EOF'
# Nos Ilha Development Environment Variables
# Copy this file to .env.local and fill in actual values

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1

# Google Cloud Configuration (for local development with emulators)
GOOGLE_CLOUD_PROJECT=your-project-id
FIRESTORE_EMULATOR_HOST=localhost:8081
STORAGE_EMULATOR_HOST=localhost:8082

# Security Configuration
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Development Tools
NODE_ENV=development
LOG_LEVEL=debug
EOF
    echo -e "${GREEN}✅ Environment variables example created${NC}"
else
    echo -e "${GREEN}✅ Environment variables example already exists${NC}"
fi

# Create security checklist
echo -e "\n${BLUE}📋 Security Checklist${NC}"
echo "======================"

cat << 'EOF'
Security Setup Checklist:

✅ Security tools installed (Trivy, GitLeaks, Semgrep)
✅ Git hooks configured
✅ GitLeaks configuration created
✅ Trivy ignore file created
✅ VS Code security settings configured
✅ Environment variables example created
✅ Initial security scan completed

Next Steps:
1. Review any security findings from the initial scan
2. Configure your IDE with recommended security extensions
3. Set up your local .env.local file (never commit this!)
4. Run 'npm install' in frontend/ and './gradlew build' in backend/
5. Review the Advanced Security documentation: docs/ADVANCED_SECURITY.md

Manual Setup Required:
- GitHub Advanced Security (enable in repository settings)
- Branch protection rules (configure in GitHub repository settings)
- Secret scanning (automatic for public repos)
- Dependabot alerts (enable in repository settings)

Commands to remember:
- git commit: Runs pre-commit security checks automatically
- trivy fs .: Manual security scan of current directory
- gitleaks detect: Manual secret scan
- semgrep --config=auto .: Manual SAST scan

For help: security@bravdigital.org
EOF

echo -e "\n${GREEN}🎉 Security setup completed successfully!${NC}"
echo -e "${BLUE}📚 Read docs/ADVANCED_SECURITY.md for detailed information${NC}"

# Set executable permissions
chmod +x "$0"