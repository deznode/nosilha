#!/bin/bash

# Setup script for Google Secret Manager secrets
# This script helps create the required secrets for Cloud Build deployments

set -e

echo "🔐 Setting up Google Secret Manager secrets for Nosilha..."

# Configuration
PROJECT_ID=${GCP_PROJECT_ID:-""}
BACKEND_API_URL="https://nosilha-backend-api-${PROJECT_ID}.us-east1.run.app"
FRONTEND_URL="https://nosilha-frontend-${PROJECT_ID}.us-east1.run.app"
GCS_BUCKET_NAME="nosilha-com-media-storage-useast1"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    echo "🔍 Checking prerequisites..."
    
    # Check if gcloud is installed
    if ! command -v gcloud &> /dev/null; then
        print_error "gcloud CLI is not installed. Please install it first."
        exit 1
    fi
    
    # Check if logged in to gcloud
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
        print_error "Please login to gcloud: gcloud auth login"
        exit 1
    fi
    
    print_status "Prerequisites check passed"
}

# Get or set project ID
setup_project() {
    if [ -z "$PROJECT_ID" ]; then
        PROJECT_ID=$(gcloud config get-value project)
        if [ -z "$PROJECT_ID" ]; then
            print_error "No GCP project set. Please set one with: gcloud config set project PROJECT_ID"
            exit 1
        fi
    fi
    
    echo "📁 Using GCP project: $PROJECT_ID"
    
    # Update URLs with actual project ID
    BACKEND_API_URL="https://nosilha-backend-api-${PROJECT_ID}.us-east1.run.app"
    FRONTEND_URL="https://nosilha-frontend-${PROJECT_ID}.us-east1.run.app"
}

# Enable required APIs
enable_apis() {
    echo "🔧 Enabling required APIs..."
    
    gcloud services enable \
        secretmanager.googleapis.com \
        --project=$PROJECT_ID
    
    print_status "Secret Manager API enabled"
}

# Create secrets
create_secrets() {
    echo "🔐 Creating secrets..."
    
    # Create GCP Project ID secret
    echo "Creating gcp-project-id secret..."
    if gcloud secrets describe gcp-project-id --project=$PROJECT_ID > /dev/null 2>&1; then
        print_warning "Secret gcp-project-id already exists"
    else
        echo -n "$PROJECT_ID" | gcloud secrets create gcp-project-id \
            --replication-policy="automatic" \
            --data-file=- \
            --project=$PROJECT_ID
        print_status "Created gcp-project-id secret"
    fi
    
    # Create GCS bucket name secret
    echo "Creating gcs-bucket-name secret..."
    if gcloud secrets describe gcs-bucket-name --project=$PROJECT_ID > /dev/null 2>&1; then
        print_warning "Secret gcs-bucket-name already exists"
    else
        echo -n "$GCS_BUCKET_NAME" | gcloud secrets create gcs-bucket-name \
            --replication-policy="automatic" \
            --data-file=- \
            --project=$PROJECT_ID
        print_status "Created gcs-bucket-name secret"
    fi
    
    # Create API URL secret for frontend
    echo "Creating nosilha-api-url secret..."
    if gcloud secrets describe nosilha-api-url --project=$PROJECT_ID > /dev/null 2>&1; then
        print_warning "Secret nosilha-api-url already exists"
        read -p "Do you want to update it? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo -n "$BACKEND_API_URL" | gcloud secrets versions add nosilha-api-url \
                --data-file=- \
                --project=$PROJECT_ID
            print_status "Updated nosilha-api-url secret"
        fi
    else
        echo -n "$BACKEND_API_URL" | gcloud secrets create nosilha-api-url \
            --replication-policy="automatic" \
            --data-file=- \
            --project=$PROJECT_ID
        print_status "Created nosilha-api-url secret"
    fi
}

# Set IAM permissions
set_permissions() {
    echo "🔑 Setting IAM permissions..."
    
    # Cloud Build service account
    CLOUD_BUILD_SA="nosilha-cloud-build-sa@${PROJECT_ID}.iam.gserviceaccount.com"
    
    # Grant Secret Manager Secret Accessor role to Cloud Build service account
    gcloud secrets add-iam-policy-binding gcp-project-id \
        --member="serviceAccount:$CLOUD_BUILD_SA" \
        --role="roles/secretmanager.secretAccessor" \
        --project=$PROJECT_ID
    
    gcloud secrets add-iam-policy-binding gcs-bucket-name \
        --member="serviceAccount:$CLOUD_BUILD_SA" \
        --role="roles/secretmanager.secretAccessor" \
        --project=$PROJECT_ID
    
    gcloud secrets add-iam-policy-binding nosilha-api-url \
        --member="serviceAccount:$CLOUD_BUILD_SA" \
        --role="roles/secretmanager.secretAccessor" \
        --project=$PROJECT_ID
    
    print_status "IAM permissions set for Cloud Build service account"
}

# Verify setup
verify_setup() {
    echo "🔍 Verifying setup..."
    
    # List all secrets
    echo "📋 Available secrets:"
    gcloud secrets list --project=$PROJECT_ID --format="table(name,createTime)"
    
    # Test secret access
    echo "🧪 Testing secret access..."
    
    if gcloud secrets versions access latest --secret="gcp-project-id" --project=$PROJECT_ID > /dev/null 2>&1; then
        print_status "gcp-project-id secret accessible"
    else
        print_error "gcp-project-id secret not accessible"
    fi
    
    if gcloud secrets versions access latest --secret="gcs-bucket-name" --project=$PROJECT_ID > /dev/null 2>&1; then
        print_status "gcs-bucket-name secret accessible"
    else
        print_error "gcs-bucket-name secret not accessible"
    fi
    
    if gcloud secrets versions access latest --secret="nosilha-api-url" --project=$PROJECT_ID > /dev/null 2>&1; then
        print_status "nosilha-api-url secret accessible"
    else
        print_error "nosilha-api-url secret not accessible"
    fi
}

# Show usage instructions
show_usage() {
    echo ""
    echo "🎯 Secrets Setup Complete!"
    echo "================================"
    echo ""
    echo "The following secrets have been created:"
    echo "1. gcp-project-id: $PROJECT_ID"
    echo "2. gcs-bucket-name: $GCS_BUCKET_NAME"
    echo "3. nosilha-api-url: $BACKEND_API_URL"
    echo ""
    echo "🔗 Useful commands:"
    echo "   - List secrets: gcloud secrets list --project=$PROJECT_ID"
    echo "   - View secret: gcloud secrets versions access latest --secret=SECRET_NAME --project=$PROJECT_ID"
    echo "   - Update secret: echo 'new_value' | gcloud secrets versions add SECRET_NAME --data-file=- --project=$PROJECT_ID"
    echo ""
    echo "📋 Next steps:"
    echo "1. Run the Cloud Build setup script: ./scripts/setup-cloud-build.sh"
    echo "2. Apply Terraform configuration: cd infrastructure/terraform && terraform apply"
    echo "3. Test the deployment by pushing to main branch"
}

# Main execution
main() {
    echo "🎯 Nosilha Secrets Setup Script"
    echo "==============================="
    
    check_prerequisites
    setup_project
    enable_apis
    create_secrets
    set_permissions
    verify_setup
    show_usage
    
    echo ""
    print_status "Secrets setup completed successfully!"
}

# Run main function
main "$@"