#!/bin/bash

# Deployment script for Nos Ilha platform
# Usage: ./scripts/deploy.sh [environment] [service] [image_tag]
# Example: ./scripts/deploy.sh staging backend develop-abc123

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT=${1:-production}
SERVICE=${2:-all}
IMAGE_TAG=${3:-latest}
PROJECT_ID=${GCP_PROJECT_ID}
REGION=${GCP_REGION:-us-east1}
REGISTRY=${REGISTRY:-us-east1-docker.pkg.dev}

# Validate inputs
if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}Error: GCP_PROJECT_ID environment variable is required${NC}"
    exit 1
fi

if [ "$ENVIRONMENT" != "production" ]; then
    echo -e "${RED}Error: Environment must be 'production' (staging removed for cost optimization)${NC}"
    exit 1
fi

if [ "$SERVICE" != "backend" ] && [ "$SERVICE" != "frontend" ] && [ "$SERVICE" != "all" ]; then
    echo -e "${RED}Error: Service must be 'backend', 'frontend', or 'all'${NC}"
    exit 1
fi

echo -e "${GREEN}🚀 Deploying Nos Ilha to ${ENVIRONMENT} environment${NC}"
echo -e "${YELLOW}Service: ${SERVICE}${NC}"
echo -e "${YELLOW}Image tag: ${IMAGE_TAG}${NC}"
echo -e "${YELLOW}Project: ${PROJECT_ID}${NC}"
echo -e "${YELLOW}Region: ${REGION}${NC}"
echo ""

# Function to deploy backend
deploy_backend() {
    local env=$1
    local tag=$2
    
    echo -e "${GREEN}Deploying backend service...${NC}"
    
    # Production-only configuration (cost-optimized for community project)
    SERVICE_NAME="nosilha-backend"
    MEMORY="1Gi"
    CPU="1"
    MIN_INSTANCES="0"
    MAX_INSTANCES="10"
    SPRING_PROFILE="prod"
    
    # Deploy to Cloud Run
    gcloud run deploy "$SERVICE_NAME" \
        --image="$REGISTRY/$PROJECT_ID/nosilha-backend:$tag" \
        --platform=managed \
        --region="$REGION" \
        --allow-unauthenticated \
        --set-env-vars="SPRING_PROFILES_ACTIVE=$SPRING_PROFILE" \
        --memory="$MEMORY" \
        --cpu="$CPU" \
        --min-instances="$MIN_INSTANCES" \
        --max-instances="$MAX_INSTANCES" \
        --timeout=300 \
        --port=8080 \
        --quiet
        
    # Get service URL
    BACKEND_URL=$(gcloud run services describe "$SERVICE_NAME" --region="$REGION" --format="value(status.url)")
    echo -e "${GREEN}✅ Backend deployed successfully: $BACKEND_URL${NC}"
}

# Function to deploy frontend
deploy_frontend() {
    local env=$1
    local tag=$2
    
    echo -e "${GREEN}Deploying frontend service...${NC}"
    
    # Production-only configuration (cost-optimized for community project)
    SERVICE_NAME="nosilha-frontend"
    MEMORY="512Mi"
    CPU="1"
    MIN_INSTANCES="0"
    MAX_INSTANCES="10"
    API_URL_VAR="PRODUCTION_API_URL"
    
    # Get API URL from environment variable
    API_URL=$(eval echo "\$$API_URL_VAR")
    if [ -z "$API_URL" ]; then
        echo -e "${YELLOW}Warning: $API_URL_VAR not set, using default${NC}"
        API_URL="http://localhost:8080/api/v1"
    fi
    
    # Deploy to Cloud Run
    gcloud run deploy "$SERVICE_NAME" \
        --image="$REGISTRY/$PROJECT_ID/nosilha-frontend:$tag" \
        --platform=managed \
        --region="$REGION" \
        --allow-unauthenticated \
        --set-env-vars="NODE_ENV=production,API_URL=$API_URL" \
        --memory="$MEMORY" \
        --cpu="$CPU" \
        --min-instances="$MIN_INSTANCES" \
        --max-instances="$MAX_INSTANCES" \
        --timeout=300 \
        --port=3000 \
        --quiet
        
    # Get service URL
    FRONTEND_URL=$(gcloud run services describe "$SERVICE_NAME" --region="$REGION" --format="value(status.url)")
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
    
    # Wait for service to be ready
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "$url/health" > /dev/null 2>&1 || curl -s -f "$url" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ $service_name is healthy${NC}"
            return 0
        fi
        
        echo -e "${YELLOW}Attempt $attempt/$max_attempts: $service_name not ready yet...${NC}"
        sleep 10
        ((attempt++))
    done
    
    echo -e "${RED}❌ $service_name health check failed after $max_attempts attempts${NC}"
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
            deploy_backend "$ENVIRONMENT" "$IMAGE_TAG"
            
            # Health check for backend
            BACKEND_URL=$(gcloud run services describe "nosilha-backend" --region="$REGION" --format="value(status.url)")
            
            health_check "$BACKEND_URL" "backend"
        else
            echo -e "${RED}Skipping backend deployment - image not found${NC}"
        fi
    fi
    
    if [ "$SERVICE" = "frontend" ] || [ "$SERVICE" = "all" ]; then
        FRONTEND_IMAGE="$REGISTRY/$PROJECT_ID/nosilha-frontend:$IMAGE_TAG"
        if check_image_exists "$FRONTEND_IMAGE"; then
            deploy_frontend "$ENVIRONMENT" "$IMAGE_TAG"
            
            # Health check for frontend
            FRONTEND_URL=$(gcloud run services describe "nosilha-frontend" --region="$REGION" --format="value(status.url)")
            
            health_check "$FRONTEND_URL" "frontend"
        else
            echo -e "${RED}Skipping frontend deployment - image not found${NC}"
        fi
    fi
    
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    
    # Show final URLs
    echo ""
    echo -e "${GREEN}📋 Deployment Summary:${NC}"
    echo -e "${YELLOW}Environment: $ENVIRONMENT${NC}"
    echo -e "${YELLOW}Services deployed: $SERVICE${NC}"
    echo -e "${YELLOW}Image tag: $IMAGE_TAG${NC}"
    
    if [ "$SERVICE" = "backend" ] || [ "$SERVICE" = "all" ]; then
        echo -e "${GREEN}Backend URL: $(gcloud run services describe "nosilha-backend" --region="$REGION" --format="value(status.url)")${NC}"
    fi
    
    if [ "$SERVICE" = "frontend" ] || [ "$SERVICE" = "all" ]; then
        echo -e "${GREEN}Frontend URL: $(gcloud run services describe "nosilha-frontend" --region="$REGION" --format="value(status.url)")${NC}"
    fi
}

# Help function
show_help() {
    echo "Nos Ilha Deployment Script"
    echo ""
    echo "Usage: $0 [environment] [service] [image_tag]"
    echo ""
    echo "Arguments:"
    echo "  environment    Target environment (production only) [default: production]"
    echo "  service        Service to deploy (backend|frontend|all) [default: all]"
    echo "  image_tag      Docker image tag to deploy [default: latest]"
    echo ""
    echo "Environment Variables:"
    echo "  GCP_PROJECT_ID      Google Cloud project ID (required)"
    echo "  GCP_REGION          Google Cloud region [default: us-east1]"
    echo "  REGISTRY            Container registry [default: gcr.io]"
    echo "  STAGING_API_URL     API URL for staging environment"
    echo "  PRODUCTION_API_URL  API URL for production environment"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Deploy all services to production with latest tag"
    echo "  $0 production                         # Deploy all services to production with latest tag"
    echo "  $0 production backend v1.0.0          # Deploy backend to production with specific tag"
    echo "  $0 production frontend v1.0.1         # Deploy frontend to production with version tag"
    echo ""
}

# Check for help flag
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    show_help
    exit 0
fi

# Run main function
main