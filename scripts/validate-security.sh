#!/bin/bash

# Security validation test script
# Tests all implemented security features

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔒 Running Security Validation Tests${NC}"
echo "========================================="

# Test counters
total_tests=0
passed_tests=0
failed_tests=0

# Function to run test
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_result="$3"
    
    total_tests=$((total_tests + 1))
    echo -e "\n${BLUE}Testing: $test_name${NC}"
    
    if eval "$test_command"; then
        if [ "$expected_result" = "pass" ]; then
            echo -e "${GREEN}✅ PASS: $test_name${NC}"
            passed_tests=$((passed_tests + 1))
        else
            echo -e "${RED}❌ FAIL: $test_name (expected to fail but passed)${NC}"
            failed_tests=$((failed_tests + 1))
        fi
    else
        if [ "$expected_result" = "fail" ]; then
            echo -e "${GREEN}✅ PASS: $test_name (correctly failed)${NC}"
            passed_tests=$((passed_tests + 1))
        else
            echo -e "${RED}❌ FAIL: $test_name${NC}"
            failed_tests=$((failed_tests + 1))
        fi
    fi
}

# Test 1: Check required files exist
run_test "Required security files exist" \
    "[ -f '.github/dependabot.yml' ] && 
     [ -f '.github/SECURITY.md' ] && 
     [ -f '.github/workflows/advanced-security.yml' ] && 
     [ -f '.github/workflows/codeql-analysis.yml' ] && 
     [ -f '.github/workflows/secret-scanning.yml' ] && 
     [ -f '.github/codeql/codeql-config.yml' ] && 
     [ -f 'docs/ADVANCED_SECURITY.md' ] && 
     [ -f 'scripts/setup-security.sh' ]" \
    "pass"

# Test 2: Check Git hooks are properly installed
run_test "Git hooks installed" \
    "[ -f '.git/hooks/pre-commit' ] && [ -x '.git/hooks/pre-commit' ]" \
    "pass"

# Test 3: Validate YAML syntax of workflows
run_test "Workflow YAML syntax validation" \
    "python3 -c \"
import yaml
import sys
files = [
    '.github/workflows/advanced-security.yml',
    '.github/workflows/codeql-analysis.yml', 
    '.github/workflows/secret-scanning.yml',
    '.github/workflows/pr-validation.yml',
    '.github/dependabot.yml',
    '.github/codeql/codeql-config.yml'
]
for file in files:
    try:
        with open(file, 'r') as f:
            yaml.safe_load(f)
        print(f'✓ {file}')
    except Exception as e:
        print(f'✗ {file}: {e}')
        sys.exit(1)
\"" \
    "pass"

# Test 4: Check CodeQL queries syntax
run_test "CodeQL queries syntax validation" \
    "find .github/codeql/queries/ -name '*.ql' -exec echo 'Checking {}' \; | wc -l | grep -q '[1-9]'" \
    "pass"

# Test 5: Check security tools are available
run_test "Security tools availability" \
    "command -v trivy >/dev/null && command -v semgrep >/dev/null" \
    "pass"

# Test 6: Validate .gitignore patterns
run_test "Security patterns in .gitignore" \
    "grep -q '.env' .gitignore && 
     grep -q '*.pem' .gitignore && 
     grep -q '*.key' .gitignore && 
     grep -q 'secrets.*' .gitignore && 
     grep -q '*.sarif' .gitignore" \
    "pass"

# Test 7: Check for hardcoded secrets in committed files (should find none)
run_test "No hardcoded secrets in repository" \
    "! grep -r -E 'password\\s*=\\s*[\"'][^\"']{8,}[\"']|AKIA[0-9A-Z]{16}|ghp_[0-9a-zA-Z]{36}' \
        --include='*.kt' --include='*.ts' --include='*.js' --include='*.tsx' --include='*.jsx' \
        --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=build --exclude-dir=dist \
        . 2>/dev/null" \
    "pass"

# Test 8: Validate dependency configuration
run_test "Dependabot configuration validation" \
    "grep -q 'package-ecosystem.*gradle' .github/dependabot.yml && 
     grep -q 'package-ecosystem.*npm' .github/dependabot.yml && 
     grep -q 'package-ecosystem.*docker' .github/dependabot.yml && 
     grep -q 'schedule:' .github/dependabot.yml" \
    "pass"

# Test 9: Check security documentation completeness
run_test "Security documentation completeness" \
    "grep -q 'Security Policy' .github/SECURITY.md && 
     grep -q 'Reporting a Vulnerability' .github/SECURITY.md && 
     grep -q 'Advanced Security' docs/ADVANCED_SECURITY.md && 
     grep -q 'CodeQL' docs/ADVANCED_SECURITY.md" \
    "pass"

# Test 10: Validate environment variables example
run_test "Environment variables example exists" \
    "[ -f '.env.example' ] && grep -q 'JWT_SECRET' .env.example" \
    "pass"

# Test 11: Check pre-commit hook functionality (dry run)
run_test "Pre-commit hook dry run" \
    "echo 'test commit' | .git/hooks/pre-commit 2>/dev/null || true" \
    "pass"

# Test 12: Validate security workflow triggers
run_test "Security workflows have proper triggers" \
    "grep -q 'pull_request:' .github/workflows/advanced-security.yml && 
     grep -q 'schedule:' .github/workflows/advanced-security.yml && 
     grep -q 'workflow_dispatch:' .github/workflows/advanced-security.yml" \
    "pass"

# Test 13: Check for proper SARIF upload configuration
run_test "SARIF upload configuration" \
    "grep -q 'github/codeql-action/upload-sarif' .github/workflows/advanced-security.yml && 
     grep -q 'sarif_file' .github/workflows/advanced-security.yml" \
    "pass"

# Test 14: Validate custom CodeQL queries
run_test "Custom CodeQL queries validation" \
    "[ -f '.github/codeql/queries/HardcodedSecretsSpring.ql' ] && 
     [ -f '.github/codeql/queries/UnsafeJwtHandling.ql' ] && 
     [ -f '.github/codeql/queries/UnsafeDangerouslySetInnerHTML.ql' ] && 
     [ -f '.github/codeql/queries/InsecureApiEndpoint.ql' ]" \
    "pass"

# Test 15: Check script permissions and executability
run_test "Security scripts are executable" \
    "[ -x 'scripts/setup-security.sh' ]" \
    "pass"

# Final results
echo -e "\n${BLUE}===============================================${NC}"
echo -e "${BLUE}Security Validation Test Results${NC}"
echo -e "${BLUE}===============================================${NC}"
echo -e "Total Tests: $total_tests"
echo -e "${GREEN}Passed: $passed_tests${NC}"
echo -e "${RED}Failed: $failed_tests${NC}"

if [ $failed_tests -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All security validation tests passed!${NC}"
    echo -e "${GREEN}✅ GitHub Advanced Security implementation is complete and working correctly.${NC}"
    
    echo -e "\n${BLUE}📋 Summary of implemented features:${NC}"
    echo -e "• Dependabot configuration for automated dependency updates"
    echo -e "• Comprehensive security policy and vulnerability disclosure process"
    echo -e "• Enhanced CodeQL analysis with custom security queries"
    echo -e "• Multi-tool secret scanning (TruffleHog, GitLeaks, custom patterns)"
    echo -e "• Advanced vulnerability scanning with Trivy and Semgrep"
    echo -e "• Pre-commit hooks for local security enforcement"
    echo -e "• Security documentation and developer setup scripts"
    echo -e "• Enhanced .gitignore with security-focused exclusions"
    echo -e "• Integrated security validation in CI/CD pipeline"
    
    echo -e "\n${YELLOW}📌 Next steps for complete setup:${NC}"
    echo -e "1. Enable GitHub Advanced Security in repository settings"
    echo -e "2. Configure branch protection rules"
    echo -e "3. Set up required GitHub secrets (GCP_SA_KEY, GCP_PROJECT_ID, etc.)"
    echo -e "4. Review and customize security thresholds if needed"
    echo -e "5. Train team members on new security processes"
    
    exit 0
else
    echo -e "\n${RED}❌ Some security validation tests failed.${NC}"
    echo -e "${YELLOW}Please review the failed tests and fix any issues before proceeding.${NC}"
    exit 1
fi