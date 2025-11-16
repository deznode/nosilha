#!/usr/bin/env bash
#
# Health Check Script for Nos Ilha Cultural Heritage Platform
#
# This script validates successful deployment of backend and frontend services
# to Google Cloud Run by checking health endpoints and service status.
#
# Usage:
#   ./health-check.sh [backend|frontend|all]
#
# Exit Codes:
#   0 - All health checks passed
#   1 - One or more health checks failed
#

set -euo pipefail

# Color output for better readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
REGION="${GCP_REGION:-us-east1}"
PROJECT="${GCP_PROJECT:-nosilha}"
BACKEND_SERVICE="backend"
FRONTEND_SERVICE="frontend"
TIMEOUT=30

# Function to print colored output
print_status() {
  local status=$1
  local message=$2

  if [ "$status" = "SUCCESS" ]; then
    echo -e "${GREEN}✓${NC} $message"
  elif [ "$status" = "FAILED" ]; then
    echo -e "${RED}✗${NC} $message"
  elif [ "$status" = "INFO" ]; then
    echo -e "${YELLOW}ℹ${NC} $message"
  fi
}

# Function to check service status
check_service_status() {
  local service_name=$1

  print_status "INFO" "Checking $service_name service status..."

  local status
  status=$(gcloud run services describe "$service_name" \
    --region="$REGION" \
    --format='value(status.conditions[0].status)' 2>/dev/null || echo "FAILED")

  if [ "$status" = "True" ]; then
    print_status "SUCCESS" "$service_name service is ready"
    return 0
  else
    print_status "FAILED" "$service_name service is not ready (status: $status)"
    return 1
  fi
}

# Function to get service URL
get_service_url() {
  local service_name=$1

  gcloud run services describe "$service_name" \
    --region="$REGION" \
    --format='value(status.url)' 2>/dev/null || echo ""
}

# Function to check HTTP health endpoint
check_health_endpoint() {
  local service_name=$1
  local health_path=$2

  print_status "INFO" "Checking $service_name health endpoint..."

  local service_url
  service_url=$(get_service_url "$service_name")

  if [ -z "$service_url" ]; then
    print_status "FAILED" "Could not retrieve $service_name URL"
    return 1
  fi

  local health_url="${service_url}${health_path}"
  print_status "INFO" "Testing: $health_url"

  local response
  local http_code

  response=$(curl -s -w "\n%{http_code}" --max-time "$TIMEOUT" "$health_url" 2>/dev/null || echo "000")
  http_code=$(echo "$response" | tail -n1)

  if [ "$http_code" = "200" ]; then
    print_status "SUCCESS" "$service_name health endpoint returned 200 OK"
    return 0
  else
    print_status "FAILED" "$service_name health endpoint returned $http_code"
    echo "$response" | head -n -1  # Print response body for debugging
    return 1
  fi
}

# Function to check backend service
check_backend() {
  local failed=0

  echo ""
  echo "=== Backend Service Health Check ==="
  echo ""

  if ! check_service_status "$BACKEND_SERVICE"; then
    failed=1
  fi

  if ! check_health_endpoint "$BACKEND_SERVICE" "/actuator/health"; then
    failed=1
  fi

  # Check database connectivity via health endpoint
  print_status "INFO" "Checking backend database connectivity..."
  local service_url
  service_url=$(get_service_url "$BACKEND_SERVICE")

  if [ -n "$service_url" ]; then
    local db_health
    db_health=$(curl -s "${service_url}/actuator/health" | grep -o '"db":{"status":"[A-Z]*"' || echo "")

    if echo "$db_health" | grep -q '"status":"UP"'; then
      print_status "SUCCESS" "Backend database connection is healthy"
    else
      print_status "FAILED" "Backend database connection issue: $db_health"
      failed=1
    fi
  fi

  return $failed
}

# Function to check frontend service
check_frontend() {
  local failed=0

  echo ""
  echo "=== Frontend Service Health Check ==="
  echo ""

  if ! check_service_status "$FRONTEND_SERVICE"; then
    failed=1
  fi

  if ! check_health_endpoint "$FRONTEND_SERVICE" "/api/health"; then
    failed=1
  fi

  # Check if frontend can reach backend API
  print_status "INFO" "Checking frontend → backend connectivity..."
  local service_url
  service_url=$(get_service_url "$FRONTEND_SERVICE")

  if [ -n "$service_url" ]; then
    local api_test
    api_test=$(curl -s --max-time "$TIMEOUT" "${service_url}/" | grep -o 'Nos Ilha' || echo "")

    if [ -n "$api_test" ]; then
      print_status "SUCCESS" "Frontend rendering successfully"
    else
      print_status "FAILED" "Frontend not rendering correctly"
      failed=1
    fi
  fi

  return $failed
}

# Function to check deployment metadata
check_deployment_metadata() {
  local service_name=$1

  echo ""
  echo "=== $service_name Deployment Metadata ==="
  echo ""

  local revision
  local image
  local created_time

  revision=$(gcloud run services describe "$service_name" \
    --region="$REGION" \
    --format='value(status.latestCreatedRevisionName)' 2>/dev/null || echo "unknown")

  image=$(gcloud run services describe "$service_name" \
    --region="$REGION" \
    --format='value(spec.template.spec.containers[0].image)' 2>/dev/null || echo "unknown")

  created_time=$(gcloud run revisions describe "$revision" \
    --region="$REGION" \
    --format='value(metadata.creationTimestamp)' 2>/dev/null || echo "unknown")

  echo "Latest Revision: $revision"
  echo "Container Image: $image"
  echo "Created: $created_time"

  # Check traffic split
  local traffic
  traffic=$(gcloud run services describe "$service_name" \
    --region="$REGION" \
    --format='value(status.traffic[0].percent)' 2>/dev/null || echo "0")

  if [ "$traffic" = "100" ]; then
    print_status "SUCCESS" "100% traffic routed to latest revision"
  else
    print_status "FAILED" "Traffic split: $traffic% to latest revision"
    return 1
  fi
}

# Main script logic
main() {
  local target="${1:-all}"
  local failed=0

  echo "╔═══════════════════════════════════════════════════════════════════╗"
  echo "║  Nos Ilha Cultural Heritage Platform - Deployment Health Check   ║"
  echo "╚═══════════════════════════════════════════════════════════════════╝"
  echo ""
  echo "Region: $REGION"
  echo "Project: $PROJECT"
  echo ""

  case "$target" in
    backend)
      if ! check_backend; then
        failed=1
      fi
      check_deployment_metadata "$BACKEND_SERVICE"
      ;;
    frontend)
      if ! check_frontend; then
        failed=1
      fi
      check_deployment_metadata "$FRONTEND_SERVICE"
      ;;
    all)
      if ! check_backend; then
        failed=1
      fi
      check_deployment_metadata "$BACKEND_SERVICE"

      if ! check_frontend; then
        failed=1
      fi
      check_deployment_metadata "$FRONTEND_SERVICE"
      ;;
    *)
      echo "Usage: $0 [backend|frontend|all]"
      exit 1
      ;;
  esac

  echo ""
  echo "═══════════════════════════════════════════════════════════════════"
  if [ $failed -eq 0 ]; then
    print_status "SUCCESS" "All health checks passed! Deployment successful."
    echo ""
    print_status "INFO" "Services are ready to serve the Cape Verdean diaspora community"
    exit 0
  else
    print_status "FAILED" "One or more health checks failed. Review logs above."
    echo ""
    print_status "INFO" "Check service logs with:"
    echo "  gcloud logging read 'resource.type=cloud_run_revision' --limit=50"
    exit 1
  fi
}

# Run main function with all arguments
main "$@"
