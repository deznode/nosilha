#!/bin/bash

# Deployment script for Nos Ilha platform
# Usage: ./scripts/deploy.sh [service] [image_tag]
# Example: ./scripts/deploy.sh backend v1.0.0

set -e

# Check for help flag or no arguments
if [ "$1" = "-h" ] || [ "$1" = "--help" ] || [ $# -eq 0 ]; then
    # Colors for output
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    NC='\033[0m' # No Color

    # Help function
    show_help() {
        echo "Nos Ilha Manual Deployment Script"
        echo ""
        echo "⚠️  IMPORTANT: This script is for EMERGENCY deployments only."
        echo "    Prefer CI/CD workflows (.github/workflows/) for routine deployments."
        echo ""
        echo "Usage: $0 [service] [image_tag]"
        echo ""
        echo "Arguments:"
        echo "  service        Service to deploy (backend|frontend|all) [default: all]"
        echo "  image_tag      Docker image tag to deploy [default: latest]"
        echo ""
        echo "Cost-Optimized Resource Limits (aligned with Terraform):"
        echo "  Backend:  256Mi memory, 3 max instances, cpu-idle enabled"
        echo "  Frontend: 256Mi memory, 2 max instances, cpu-idle enabled"
        echo ""
        echo "Environment Variables:"
        echo "  GCP_PROJECT_ID      Google Cloud project ID [default: nosilha]"
        echo "  GCP_REGION          Google Cloud region [default: us-east1]"
        echo "  REGISTRY            Container registry [default: us-east1-docker.pkg.dev]"
        echo "  PRODUCTION_API_URL  API URL for production environment"
        echo ""
        echo "Examples:"
        echo "  $0                                    # Show this help"
        echo "  $0 all                                # Deploy all services with latest tag"
        echo "  $0 backend                            # Deploy backend with latest tag"
        echo "  $0 frontend v1.0.0                    # Deploy frontend with specific tag"
        echo ""
        echo "Documentation:"
        echo "  CI/CD Guide: docs/40-operations/ci-cd-pipeline.md"
        echo ""
    }

    show_help
    exit 0
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID=${GCP_PROJECT_ID:-nosilha}
REGION=${GCP_REGION:-us-east1}
REGISTRY=${REGISTRY:-us-east1-docker.pkg.dev}

# Service configuration (cost-optimized, aligned with Terraform)
BACKEND_SERVICE_NAME="nosilha-backend-api"
FRONTEND_SERVICE_NAME="nosilha-frontend"
BACKEND_MEMORY="256Mi"
FRONTEND_MEMORY="256Mi"
BACKEND_MAX_INSTANCES="3"
FRONTEND_MAX_INSTANCES="2"
CPU="1"
MIN_INSTANCES="0"
TIMEOUT="300"

# Arguments
SERVICE=${1:-all}
IMAGE_TAG=${2:-latest}

# Validate inputs
if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}Error: GCP_PROJECT_ID environment variable is required${NC}"
    exit 1
fi

if [ "$SERVICE" != "backend" ] && [ "$SERVICE" != "frontend" ] && [ "$SERVICE" != "all" ]; then
    echo -e "${RED}Error: Service must be 'backend', 'frontend', or 'all'${NC}"
    exit 1
fi

echo -e "${GREEN}🚀 Deploying Nos Ilha to production${NC}"
echo -e "${YELLOW}Service: ${SERVICE}${NC}"
echo -e "${YELLOW}Image tag: ${IMAGE_TAG}${NC}"
echo -e "${YELLOW}Project: ${PROJECT_ID}${NC}"
echo -e "${YELLOW}Region: ${REGION}${NC}"
echo ""
echo -e "${YELLOW}⚠️  EMERGENCY USE ONLY - Prefer CI/CD workflows for routine deployments${NC}"
echo -e "${YELLOW}Cost-optimized: Backend 256Mi/3, Frontend 256Mi/2 instances${NC}"
echo ""

# Function to deploy backend
deploy_backend() {
    local tag=$1

    echo -e "${GREEN}Deploying backend service...${NC}"
    
    # Deploy to Cloud Run
    gcloud run deploy "$BACKEND_SERVICE_NAME" \
        --image="$REGISTRY/$PROJECT_ID/nosilha-backend:$tag" \
        --region="$REGION" \
        --allow-unauthenticated \
        --service-account="nosilha-backend-runner@$PROJECT_ID.iam.gserviceaccount.com" \
        --set-env-vars="SPRING_PROFILES_ACTIVE=production" \
        --memory="$BACKEND_MEMORY" \
        --cpu="$CPU" \
        --cpu-idle \
        --min-instances="$MIN_INSTANCES" \
        --max-instances="$BACKEND_MAX_INSTANCES" \
        --timeout="$TIMEOUT" \
        --port=8080 \
        --quiet

    # Get service URL
    BACKEND_URL=$(gcloud run services describe "$BACKEND_SERVICE_NAME" --region="$REGION" --format="value(status.url)")
    echo -e "${GREEN}✅ Backend deployed successfully: $BACKEND_URL${NC}"
}

# Function to deploy frontend
deploy_frontend() {
    local tag=$1

    echo -e "${GREEN}Deploying frontend service...${NC}"
    
    # Get API URL from environment variable
    API_URL=${PRODUCTION_API_URL:-"http://localhost:8080/api/v1"}
    if [ "$API_URL" = "http://localhost:8080/api/v1" ]; then
        echo -e "${YELLOW}Warning: PRODUCTION_API_URL not set, using default${NC}"
    fi
    
    # Deploy to Cloud Run
    gcloud run deploy "$FRONTEND_SERVICE_NAME" \
        --image="$REGISTRY/$PROJECT_ID/nosilha-frontend:$tag" \
        --region="$REGION" \
        --allow-unauthenticated \
        --service-account="nosilha-frontend-runner@$PROJECT_ID.iam.gserviceaccount.com" \
        --set-env-vars="NODE_ENV=production,API_URL=$API_URL" \
        --memory="$FRONTEND_MEMORY" \
        --cpu="$CPU" \
        --cpu-idle \
        --min-instances="$MIN_INSTANCES" \
        --max-instances="$FRONTEND_MAX_INSTANCES" \
        --timeout="$TIMEOUT" \
        --port=3000 \
        --quiet

    # Get service URL
    FRONTEND_URL=$(gcloud run services describe "$FRONTEND_SERVICE_NAME" --region="$REGION" --format="value(status.url)")
    echo -e "${GREEN}✅ Frontend deployed successfully: $FRONTEND_URL${NC}"
}

# Function to check if image exists
check_image_exists() {
    local image_name=$1
    echo -e "${YELLOW}Checking if image exists: $image_name${NC}"

    if gcloud container images describe "$image_name" --quiet > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Image found${NC}"
        return 0
    else
        echo -e "${RED}❌ Image not found: $image_name${NC}"
        return 1
    fi
}

# Function to run health checks
health_check() {
    local url=$1
    local service_name=$2

    echo -e "${YELLOW}Running health check for $service_name...${NC}"

    for attempt in $(seq 1 30); do
        if curl -s -f "$url/health" > /dev/null 2>&1 || curl -s -f "$url" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ $service_name is healthy${NC}"
            return 0
        fi
        echo -e "${YELLOW}Attempt $attempt/30: $service_name not ready yet...${NC}"
        sleep 10
    done

    echo -e "${RED}❌ $service_name health check failed after 30 attempts${NC}"
    return 1
}

# Main deployment logic
main() {
    # Check if we're authenticated with gcloud
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
        echo -e "${RED}Error: Not authenticated with gcloud. Please run 'gcloud auth login'${NC}"
        exit 1
    fi
    
    # Set the project
    gcloud config set project "$PROJECT_ID"
    
    # Deploy services based on selection
    if [ "$SERVICE" = "backend" ] || [ "$SERVICE" = "all" ]; then
        BACKEND_IMAGE="$REGISTRY/$PROJECT_ID/nosilha-backend:$IMAGE_TAG"
        if check_image_exists "$BACKEND_IMAGE"; then
            deploy_backend "$IMAGE_TAG"

            # Health check for backend
            BACKEND_URL=$(gcloud run services describe "$BACKEND_SERVICE_NAME" --region="$REGION" --format="value(status.url)")

            health_check "$BACKEND_URL" "backend"
        else
            echo -e "${RED}Skipping backend deployment - image not found${NC}"
        fi
    fi
    
    if [ "$SERVICE" = "frontend" ] || [ "$SERVICE" = "all" ]; then
        FRONTEND_IMAGE="$REGISTRY/$PROJECT_ID/nosilha-frontend:$IMAGE_TAG"
        if check_image_exists "$FRONTEND_IMAGE"; then
            deploy_frontend "$IMAGE_TAG"

            # Health check for frontend
            FRONTEND_URL=$(gcloud run services describe "$FRONTEND_SERVICE_NAME" --region="$REGION" --format="value(status.url)")

            health_check "$FRONTEND_URL" "frontend"
        else
            echo -e "${RED}Skipping frontend deployment - image not found${NC}"
        fi
    fi
    
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    
    # Show final URLs
    echo ""
    echo -e "${GREEN}📋 Deployment Summary:${NC}"
    echo -e "${YELLOW}Services deployed: $SERVICE${NC}"
    echo -e "${YELLOW}Image tag: $IMAGE_TAG${NC}"

    if [ "$SERVICE" = "backend" ] || [ "$SERVICE" = "all" ]; then
        echo -e "${GREEN}Backend URL: $(gcloud run services describe "$BACKEND_SERVICE_NAME" --region="$REGION" --format="value(status.url)")${NC}"
    fi

    if [ "$SERVICE" = "frontend" ] || [ "$SERVICE" = "all" ]; then
        echo -e "${GREEN}Frontend URL: $(gcloud run services describe "$FRONTEND_SERVICE_NAME" --region="$REGION" --format="value(status.url)")${NC}"
    fi
}

# Run main function
main