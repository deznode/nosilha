#!/bin/bash
# =============================================================================
# Security Scan Script
# Runs Trivy (vulnerability scanning) and Gitleaks (secret detection)
# =============================================================================
#
# Usage:
#   ./scripts/security-scan.sh          # Full scan (backend, frontend, IaC, git history)
#   ./scripts/security-scan.sh --quick  # Quick scan (skip git history)
#   ./scripts/security-scan.sh --help   # Show help
#
# Output:
#   - Console summary with pass/fail status
#   - JSON reports in security-reports/
#
# Prerequisites:
#   brew install trivy gitleaks
#
# =============================================================================

set -uo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
REPORTS_DIR="$PROJECT_ROOT/reviews/security"
SEVERITY="HIGH,CRITICAL"

# Counters
PASS_COUNT=0
FAIL_COUNT=0
SKIP_COUNT=0

# Options
QUICK_MODE=false

# =============================================================================
# Helper Functions
# =============================================================================

print_header() {
    echo ""
    echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}${BLUE}  $1${NC}"
    echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_status() {
    local status=$1
    local message=$2
    case $status in
        "pass")
            echo -e "  ${GREEN}✓${NC} $message"
            ((PASS_COUNT++))
            ;;
        "fail")
            echo -e "  ${RED}✗${NC} $message"
            ((FAIL_COUNT++))
            ;;
        "skip")
            echo -e "  ${YELLOW}○${NC} $message (skipped)"
            ((SKIP_COUNT++))
            ;;
        "info")
            echo -e "  ${BLUE}ℹ${NC} $message"
            ;;
    esac
}

check_command() {
    if ! command -v "$1" &> /dev/null; then
        echo -e "${RED}Error: $1 is not installed.${NC}"
        echo "Install with: brew install $1"
        exit 1
    fi
}

show_help() {
    echo "Security Scan Script - Trivy + Gitleaks"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --quick    Skip git history scan (faster)"
    echo "  --help     Show this help message"
    echo ""
    echo "Scans performed:"
    echo "  1. Trivy filesystem scan - apps/api (backend dependencies)"
    echo "  2. Trivy filesystem scan - apps/web (frontend dependencies)"
    echo "  3. Trivy config scan - infrastructure/terraform (IaC)"
    echo "  4. Gitleaks - git history for secrets (unless --quick)"
    echo ""
    echo "Output:"
    echo "  Reports saved to: security-reports/"
    echo ""
    echo "Prerequisites:"
    echo "  brew install trivy gitleaks"
}

# =============================================================================
# Parse Arguments
# =============================================================================

while [[ $# -gt 0 ]]; do
    case $1 in
        --quick)
            QUICK_MODE=true
            shift
            ;;
        --help|-h)
            show_help
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

# =============================================================================
# Main Script
# =============================================================================

cd "$PROJECT_ROOT"

print_header "Security Scan"
echo ""
echo -e "  ${BOLD}Project:${NC}  $PROJECT_ROOT"
echo -e "  ${BOLD}Mode:${NC}     $([ "$QUICK_MODE" = true ] && echo "Quick (no git history)" || echo "Full")"
echo -e "  ${BOLD}Severity:${NC} $SEVERITY"

# Check prerequisites
print_header "Checking Prerequisites"
check_command trivy
print_status "pass" "trivy installed ($(trivy --version 2>&1 | head -1))"
check_command gitleaks
print_status "pass" "gitleaks installed ($(gitleaks version 2>&1))"

# Create reports directory
mkdir -p "$REPORTS_DIR"
print_status "info" "Reports directory: $REPORTS_DIR"

# =============================================================================
# Trivy Scans
# =============================================================================

print_header "Trivy Vulnerability Scans"

# Backend scan
echo ""
echo -e "  ${BOLD}Scanning backend (apps/api)...${NC}"
if trivy fs apps/api \
    --severity "$SEVERITY" \
    --format json \
    --output "$REPORTS_DIR/trivy-backend.json" \
    --ignorefile .trivyignore \
    --quiet 2>/dev/null; then

    # Check if vulnerabilities found
    VULN_COUNT=$(jq '[.Results[]?.Vulnerabilities // [] | length] | add // 0' "$REPORTS_DIR/trivy-backend.json" 2>/dev/null || echo "0")
    if [ "$VULN_COUNT" -eq 0 ]; then
        print_status "pass" "Backend: No HIGH/CRITICAL vulnerabilities"
    else
        print_status "fail" "Backend: $VULN_COUNT vulnerabilities found"
    fi
else
    print_status "fail" "Backend scan failed"
fi

# Frontend scan
echo ""
echo -e "  ${BOLD}Scanning frontend (apps/web)...${NC}"
if trivy fs apps/web \
    --severity "$SEVERITY" \
    --format json \
    --output "$REPORTS_DIR/trivy-frontend.json" \
    --ignorefile .trivyignore \
    --quiet 2>/dev/null; then

    VULN_COUNT=$(jq '[.Results[]?.Vulnerabilities // [] | length] | add // 0' "$REPORTS_DIR/trivy-frontend.json" 2>/dev/null || echo "0")
    if [ "$VULN_COUNT" -eq 0 ]; then
        print_status "pass" "Frontend: No HIGH/CRITICAL vulnerabilities"
    else
        print_status "fail" "Frontend: $VULN_COUNT vulnerabilities found"
    fi
else
    print_status "fail" "Frontend scan failed"
fi

# Infrastructure scan
echo ""
echo -e "  ${BOLD}Scanning infrastructure (terraform)...${NC}"
if trivy config infrastructure/terraform \
    --severity "$SEVERITY" \
    --format json \
    --output "$REPORTS_DIR/trivy-infrastructure.json" \
    --ignorefile .trivyignore \
    --quiet 2>/dev/null; then

    MISCONFIG_COUNT=$(jq '[.Results[]?.Misconfigurations // [] | length] | add // 0' "$REPORTS_DIR/trivy-infrastructure.json" 2>/dev/null || echo "0")
    if [ "$MISCONFIG_COUNT" -eq 0 ]; then
        print_status "pass" "Infrastructure: No HIGH/CRITICAL misconfigurations"
    else
        print_status "fail" "Infrastructure: $MISCONFIG_COUNT misconfigurations found"
    fi
else
    print_status "fail" "Infrastructure scan failed"
fi

# =============================================================================
# Gitleaks Scan
# =============================================================================

print_header "Gitleaks Secret Detection"

if [ "$QUICK_MODE" = true ]; then
    print_status "skip" "Git history scan (--quick mode)"
else
    echo ""
    echo -e "  ${BOLD}Scanning git history for secrets...${NC}"
    if gitleaks detect \
        --source . \
        --report-path "$REPORTS_DIR/gitleaks.json" \
        --report-format json \
        --verbose 2>&1 | tail -5; then
        print_status "pass" "No secrets detected in git history"
    else
        LEAK_COUNT=$(jq 'length' "$REPORTS_DIR/gitleaks.json" 2>/dev/null || echo "?")
        print_status "fail" "Secrets detected: $LEAK_COUNT findings"
    fi
fi

# =============================================================================
# Summary
# =============================================================================

print_header "Summary"
echo ""
echo -e "  ${GREEN}Passed:${NC}  $PASS_COUNT"
echo -e "  ${RED}Failed:${NC}  $FAIL_COUNT"
echo -e "  ${YELLOW}Skipped:${NC} $SKIP_COUNT"
echo ""
echo -e "  ${BOLD}Reports:${NC} $REPORTS_DIR/"
ls -1 "$REPORTS_DIR"/*.json 2>/dev/null | sed 's/^/    /'
echo ""

# Pre-commit hook reminder
if [ ! -f ".git/hooks/pre-commit" ]; then
    echo -e "  ${YELLOW}Tip:${NC} Install pre-commit hook to prevent secret commits:"
    echo "       cp scripts/hooks/pre-commit .git/hooks/pre-commit"
    echo "       chmod +x .git/hooks/pre-commit"
    echo ""
fi

# Exit with appropriate code
if [ "$FAIL_COUNT" -gt 0 ]; then
    echo -e "${RED}${BOLD}Security scan found issues. Review reports above.${NC}"
    exit 1
else
    echo -e "${GREEN}${BOLD}Security scan passed!${NC}"
    exit 0
fi
