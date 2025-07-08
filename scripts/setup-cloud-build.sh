#!/bin/bash

# Setup script for Cloud Build triggers
# This script helps set up Cloud Build triggers for the Nosilha project

set -e

echo "🚀 Setting up Cloud Build triggers for Nosilha..."

# Configuration
PROJECT_ID=${GCP_PROJECT_ID:-""}
GITHUB_OWNER="bravdigital"
GITHUB_REPO="nosilha"
TERRAFORM_DIR="infrastructure/terraform"

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
    
    # Check if terraform is installed
    if ! command -v terraform &> /dev/null; then
        print_error "terraform is not installed. Please install it first."
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
}

# Enable required APIs
enable_apis() {
    echo "🔧 Enabling required APIs..."
    
    gcloud services enable \
        cloudbuild.googleapis.com \
        cloudrun.googleapis.com \
        artifactregistry.googleapis.com \
        secretmanager.googleapis.com \
        iam.googleapis.com \
        --project=$PROJECT_ID
    
    print_status "APIs enabled successfully"
}

# Connect GitHub repository
connect_github_repo() {
    echo "🔗 Connecting GitHub repository..."
    
    print_warning "You need to manually connect your GitHub repository to Cloud Build:"
    echo "1. Install the Cloud Build GitHub App:"
    echo "   - Go to: https://github.com/apps/google-cloud-build"
    echo "   - Click 'Install' or 'Configure'"
    echo "   - Select the 'bravdigital' organization"
    echo "   - Choose 'Only select repositories' and select '$GITHUB_REPO'"
    echo "   - Click 'Install'"
    echo ""
    echo "2. Connect the repository in Cloud Build:"
    echo "   - Go to: https://console.cloud.google.com/cloud-build/triggers?project=$PROJECT_ID"
    echo "   - Click 'Connect Repository'"
    echo "   - Select 'GitHub (Cloud Build GitHub App)'"
    echo "   - Authenticate with GitHub and select '$GITHUB_OWNER/$GITHUB_REPO'"
    echo "   - Click 'Connect'"
    echo ""
    read -p "Press Enter after completing both steps..."
}

# Apply Terraform configuration
apply_terraform() {
    echo "🏗️  Applying Terraform configuration..."
    
    cd $TERRAFORM_DIR
    
    # Check if terraform is initialized
    if [ ! -d ".terraform" ]; then
        print_warning "Terraform not initialized. Running terraform init..."
        terraform init
    fi
    
    # Validate configuration
    terraform validate
    print_status "Terraform configuration is valid"
    
    # Plan changes
    echo "📋 Planning Terraform changes..."
    terraform plan -var="gcp_project_id=$PROJECT_ID"
    
    # Apply changes
    echo "🚀 Applying Terraform changes..."
    read -p "Do you want to apply these changes? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        terraform apply -var="gcp_project_id=$PROJECT_ID" -auto-approve
        print_status "Terraform applied successfully"
    else
        print_warning "Terraform apply cancelled"
        exit 1
    fi
    
    cd - > /dev/null
}

# Verify setup
verify_setup() {
    echo "🔍 Verifying setup..."
    
    # Check if triggers exist
    BACKEND_TRIGGER=$(gcloud builds triggers list --filter="name:nosilha-backend-deploy" --format="value(name)" --project=$PROJECT_ID)
    FRONTEND_TRIGGER=$(gcloud builds triggers list --filter="name:nosilha-frontend-deploy" --format="value(name)" --project=$PROJECT_ID)
    
    if [ -n "$BACKEND_TRIGGER" ]; then
        print_status "Backend trigger created: $BACKEND_TRIGGER"
    else
        print_error "Backend trigger not found"
    fi
    
    if [ -n "$FRONTEND_TRIGGER" ]; then
        print_status "Frontend trigger created: $FRONTEND_TRIGGER"
    else
        print_error "Frontend trigger not found"
    fi
    
    # Check if Cloud Build service account exists
    SERVICE_ACCOUNT=$(gcloud iam service-accounts list --filter="email:nosilha-cloud-build-sa@$PROJECT_ID.iam.gserviceaccount.com" --format="value(email)" --project=$PROJECT_ID)
    
    if [ -n "$SERVICE_ACCOUNT" ]; then
        print_status "Cloud Build service account created: $SERVICE_ACCOUNT"
    else
        print_error "Cloud Build service account not found"
    fi
}

# Test trigger
test_trigger() {
    echo "🧪 Testing trigger functionality..."
    
    print_warning "To test the triggers:"
    echo "1. Make a small change to your code"
    echo "2. Push to the main branch: git push origin main"
    echo "3. Monitor builds at: https://console.cloud.google.com/cloud-build/builds?project=$PROJECT_ID"
    echo "4. Check Cloud Run services: https://console.cloud.google.com/run?project=$PROJECT_ID"
}

# Main execution
main() {
    echo "🎯 Nosilha Cloud Build Setup Script"
    echo "=================================="
    
    check_prerequisites
    setup_project
    enable_apis
    connect_github_repo
    apply_terraform
    verify_setup
    test_trigger
    
    echo ""
    print_status "Cloud Build setup completed successfully!"
    echo "🔗 Useful links:"
    echo "   - Cloud Build Triggers: https://console.cloud.google.com/cloud-build/triggers?project=$PROJECT_ID"
    echo "   - Build History: https://console.cloud.google.com/cloud-build/builds?project=$PROJECT_ID"
    echo "   - Cloud Run Services: https://console.cloud.google.com/run?project=$PROJECT_ID"
}

# Run main function
main "$@"