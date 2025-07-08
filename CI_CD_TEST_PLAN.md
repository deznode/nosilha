# CI/CD Pipeline Test Plan

This document outlines the comprehensive testing strategy for validating the Nos Ilha CI/CD pipeline.

## 🎯 Test Objectives

1. **Infrastructure Deployment**: Validate Terraform infrastructure provisioning
2. **CI/CD Pipeline**: Verify automated build, test, and deployment workflows
3. **Security Integration**: Confirm security scanning and SARIF reporting
4. **Monitoring**: Validate cost controls and service monitoring
5. **End-to-End**: Test complete deployment flow from code to production

## 🧪 Test Categories

### **1. Infrastructure Tests**

#### **A. Terraform Configuration**
- [ ] **Validation**: `terraform validate` passes without errors
- [ ] **Formatting**: `terraform fmt -check` passes
- [ ] **Security**: `tfsec` scan passes with no critical issues
- [ ] **State Management**: Remote state backend functions correctly
- [ ] **API Dependencies**: All required Google Cloud APIs are enabled

#### **B. Resource Provisioning**
- [ ] **GCS Buckets**: Media storage and Terraform state buckets created
- [ ] **Artifact Registry**: Backend and frontend repositories created
- [ ] **Cloud Run Services**: Services deployed with correct configuration
- [ ] **IAM Roles**: Service accounts and permissions properly configured
- [ ] **Monitoring**: Budget alerts and dashboards configured

#### **C. Infrastructure Validation Commands**
```bash
# Test Terraform validation
cd infrastructure/terraform
terraform validate
terraform fmt -check -recursive
terraform plan -detailed-exitcode

# Test API availability
gcloud services list --enabled --filter="name:run.googleapis.com"
gcloud services list --enabled --filter="name:artifactregistry.googleapis.com"
gcloud services list --enabled --filter="name:secretmanager.googleapis.com"

# Test resource creation
gcloud storage buckets describe gs://nosilha-terraform-state-bucket
gcloud artifacts repositories list --location=us-east1
gcloud run services list --region=us-east1
```

---

### **2. Backend CI/CD Tests**

#### **A. Security & Quality**
- [ ] **Trivy Scan**: Vulnerability scanning passes
- [ ] **detekt**: Kotlin static analysis passes
- [ ] **SARIF Upload**: Security findings uploaded to GitHub
- [ ] **Dependency Check**: No critical vulnerabilities in dependencies

#### **B. Testing & Build**
- [ ] **Unit Tests**: All JUnit tests pass
- [ ] **Code Coverage**: Jacoco reports generated
- [ ] **Gradle Build**: JAR file builds successfully
- [ ] **Docker Build**: Container image builds without errors

#### **C. Deployment**
- [ ] **Image Push**: Docker image pushed to Artifact Registry
- [ ] **Cloud Run Deploy**: Service updated with new image
- [ ] **Health Check**: `/actuator/health` endpoint responds
- [ ] **Environment Variables**: All secrets properly injected

#### **D. Backend Test Commands**
```bash
# Test backend locally
cd backend
./gradlew test
./gradlew bootRun --args='--spring.profiles.active=local'

# Test Docker build
./gradlew bootBuildImage --imageName=nosilha-backend:test

# Test health endpoint
curl -f http://localhost:8080/actuator/health
```

---

### **3. Frontend CI/CD Tests**

#### **A. Security & Quality**
- [ ] **Trivy Scan**: Vulnerability scanning passes
- [ ] **ESLint**: TypeScript linting passes
- [ ] **SARIF Upload**: Security findings uploaded to GitHub
- [ ] **Bundle Analysis**: Bundle size within acceptable limits

#### **B. Testing & Build**
- [ ] **Type Checking**: TypeScript compilation passes
- [ ] **Next.js Build**: Production build completes
- [ ] **Docker Build**: Container image builds without errors
- [ ] **Environment Variables**: API URL properly configured

#### **C. Deployment**
- [ ] **Image Push**: Docker image pushed to Artifact Registry
- [ ] **Cloud Run Deploy**: Service updated with new image
- [ ] **Health Check**: Frontend homepage loads correctly
- [ ] **API Integration**: Frontend can communicate with backend

#### **D. Frontend Test Commands**
```bash
# Test frontend locally
cd frontend
npm ci
npm run lint
npm run build
npm run dev

# Test Docker build
docker build -t nosilha-frontend:test .
docker run -p 3000:3000 -e API_URL=http://localhost:8080/api/v1 nosilha-frontend:test

# Test frontend health
curl -f http://localhost:3000
```

---

### **4. Infrastructure CI/CD Tests**

#### **A. Security & Validation**
- [ ] **tfsec**: Infrastructure security scan passes
- [ ] **Terraform Validate**: Configuration validation passes
- [ ] **Format Check**: Terraform formatting is correct
- [ ] **Plan Generation**: Terraform plan generates without errors

#### **B. Deployment**
- [ ] **State Management**: Remote state operations work
- [ ] **Resource Updates**: Infrastructure changes applied correctly
- [ ] **Output Values**: All outputs generate expected values
- [ ] **Drift Detection**: Configuration drift detection works

#### **C. Infrastructure Test Commands**
```bash
# Test infrastructure pipeline
cd infrastructure/terraform
terraform init -reconfigure
terraform plan
terraform apply -auto-approve

# Test state management
terraform state list
terraform state show google_cloud_run_v2_service.nosilha_backend_api

# Test outputs
terraform output
```

---

### **5. Security Tests**

#### **A. Vulnerability Scanning**
- [ ] **Container Images**: Trivy scans pass for all images
- [ ] **Dependencies**: No critical vulnerabilities in npm/gradle dependencies
- [ ] **Infrastructure**: tfsec scan passes with no high-severity issues
- [ ] **Code Quality**: detekt and ESLint pass with no critical issues

#### **B. SARIF Integration**
- [ ] **GitHub Security**: SARIF files uploaded to GitHub Security tab
- [ ] **Workflow Integration**: Security scans don't block deployment
- [ ] **Error Handling**: Graceful degradation when Advanced Security unavailable
- [ ] **Categorization**: Security findings properly categorized

#### **C. IAM & Permissions**
- [ ] **Service Accounts**: Minimal required permissions granted
- [ ] **Secret Access**: Services can access required secrets
- [ ] **Cross-Service**: Services can communicate as needed
- [ ] **Public Access**: Only intended endpoints publicly accessible

---

### **6. End-to-End Tests**

#### **A. Complete Deployment Flow**
1. **Code Change** → Create feature branch
2. **PR Creation** → CI/CD validation runs (no deployment)
3. **PR Merge** → Automatic deployment to production
4. **Service Update** → Both services updated with new code
5. **Health Verification** → All services healthy and responsive

#### **B. Integration Tests**
- [ ] **API Endpoints**: All REST endpoints respond correctly
- [ ] **Database Integration**: Backend connects to PostgreSQL
- [ ] **Media Storage**: File uploads work to GCS
- [ ] **Frontend-Backend**: API calls work end-to-end
- [ ] **Authentication**: JWT authentication flows work

#### **C. Monitoring & Alerts**
- [ ] **Cost Monitoring**: Budget alerts configured and working
- [ ] **Service Monitoring**: Uptime checks functional
- [ ] **Error Tracking**: Application errors logged and monitored
- [ ] **Performance**: Response times within acceptable limits

---

## 🚀 Test Execution Plan

### **Phase 1: Local Development Testing**
1. Run all local tests and builds
2. Verify Docker containers start correctly
3. Test API endpoints locally
4. Validate frontend/backend integration

### **Phase 2: Infrastructure Deployment**
1. Deploy Terraform infrastructure
2. Verify all resources created correctly
3. Test IAM permissions and secrets
4. Validate monitoring setup

### **Phase 3: CI/CD Pipeline Testing**
1. Create test branch and PR
2. Verify CI/CD validation runs
3. Merge to main and verify deployment
4. Test rollback procedures

### **Phase 4: Production Validation**
1. Verify services accessible via public URLs
2. Test all API endpoints in production
3. Validate monitoring and alerting
4. Perform load testing (if applicable)

---

## 🔍 Test Execution Commands

### **Complete Test Suite**
```bash
#!/bin/bash
# Complete CI/CD Pipeline Test Suite

echo "🧪 Starting CI/CD Pipeline Test Suite..."

# Phase 1: Infrastructure Tests
echo "📋 Phase 1: Infrastructure Validation"
cd infrastructure/terraform
terraform validate && echo "✅ Terraform validation passed" || echo "❌ Terraform validation failed"
terraform fmt -check -recursive && echo "✅ Terraform formatting passed" || echo "❌ Terraform formatting failed"
terraform plan -detailed-exitcode && echo "✅ Terraform plan passed" || echo "❌ Terraform plan failed"

# Phase 2: Backend Tests
echo "📋 Phase 2: Backend Testing"
cd ../../backend
./gradlew test && echo "✅ Backend tests passed" || echo "❌ Backend tests failed"
./gradlew detekt && echo "✅ Backend linting passed" || echo "❌ Backend linting failed"
./gradlew bootBuildImage --imageName=test-backend && echo "✅ Backend Docker build passed" || echo "❌ Backend Docker build failed"

# Phase 3: Frontend Tests
echo "📋 Phase 3: Frontend Testing"
cd ../frontend
npm ci && echo "✅ Frontend dependencies installed" || echo "❌ Frontend dependencies failed"
npm run lint && echo "✅ Frontend linting passed" || echo "❌ Frontend linting failed"
npm run build && echo "✅ Frontend build passed" || echo "❌ Frontend build failed"
docker build -t test-frontend . && echo "✅ Frontend Docker build passed" || echo "❌ Frontend Docker build failed"

echo "🎉 CI/CD Pipeline Test Suite Complete!"
```

---

## 📊 Test Results Template

### **Test Execution Report**
Date: `YYYY-MM-DD`
Executed by: `Your Name`
Environment: `Test/Staging/Production`

#### **Infrastructure Tests**
| Test Case | Status | Notes |
|-----------|--------|-------|
| Terraform Validation | ✅/❌ | |
| Resource Provisioning | ✅/❌ | |
| IAM Configuration | ✅/❌ | |
| Monitoring Setup | ✅/❌ | |

#### **Backend Tests**
| Test Case | Status | Notes |
|-----------|--------|-------|
| Unit Tests | ✅/❌ | |
| Security Scan | ✅/❌ | |
| Docker Build | ✅/❌ | |
| Cloud Run Deploy | ✅/❌ | |

#### **Frontend Tests**
| Test Case | Status | Notes |
|-----------|--------|-------|
| Type Checking | ✅/❌ | |
| Build Process | ✅/❌ | |
| Docker Build | ✅/❌ | |
| Cloud Run Deploy | ✅/❌ | |

#### **Security Tests**
| Test Case | Status | Notes |
|-----------|--------|-------|
| Vulnerability Scan | ✅/❌ | |
| SARIF Upload | ✅/❌ | |
| IAM Permissions | ✅/❌ | |
| Secret Management | ✅/❌ | |

#### **End-to-End Tests**
| Test Case | Status | Notes |
|-----------|--------|-------|
| Complete Deployment | ✅/❌ | |
| API Integration | ✅/❌ | |
| Health Checks | ✅/❌ | |
| Monitoring Alerts | ✅/❌ | |

---

## 🆘 Troubleshooting Guide

### **Common Issues & Solutions**

**Issue**: Terraform state bucket access denied
**Solution**: Ensure CI/CD service account has `storage.objectAdmin` role

**Issue**: Docker build fails in CI/CD
**Solution**: Check Dockerfile syntax and base image availability

**Issue**: Cloud Run deployment timeout
**Solution**: Increase timeout settings and check application startup time

**Issue**: Health check failures
**Solution**: Verify application exposes correct health endpoint

**Issue**: Secret Manager access denied
**Solution**: Confirm service account has `secretmanager.secretAccessor` role

---

## ✅ Success Criteria

The CI/CD pipeline is considered fully validated when:

1. **All automated tests pass** across all components
2. **Security scans complete** with no critical vulnerabilities
3. **Deployment pipeline executes** without manual intervention
4. **Services are accessible** via public URLs
5. **Monitoring and alerts** are functional
6. **Cost controls** are properly configured
7. **Documentation** is complete and accurate

**Pipeline Status**: 🚀 **READY FOR PRODUCTION**