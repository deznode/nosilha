# Manual Testing Guide: ACT Workflow Testing MVP

**Purpose**: Validate the ACT workflow testing infrastructure implementation (T001-T010)
**Target**: Comprehensive validation of setup, configuration, and testing scripts
**Expected Duration**: 60-90 minutes for complete validation
**Prerequisites**: macOS, Linux, or Windows WSL with Docker installed

---

## Quick Reference

| Test Scenario | Script to Test | Expected Duration | Success Criteria |
|---------------|----------------|-------------------|------------------|
| 1. Setup Workflow | `setup.sh` | 5 min | Exit code 0, Docker network created |
| 2. Backend Testing | `test-backend.sh` | <7 min | Exit code 0, no deployment jobs |
| 3. Frontend Testing | `test-frontend.sh` | <4 min | Exit code 0, caching works |
| 4. Integration Testing | `test-integration.sh` | <6 min | Exit code 0, all services healthy |
| 5. PR Validation | `test-pr-validation.sh` | <5 min | Exit code 0, PR event handled |
| 6. Resource Constraints | `validate-resources.sh` | <1 min | Exit code 3 with low resources |
| 7. Cleanup | Docker commands | <2 min | Containers removed, volumes pruned |

---

## Prerequisites Validation

Before starting testing, verify your environment meets all requirements.

### Step 1: Check Docker Installation

```bash
# Check Docker is running
docker info
# Expected: Docker version info without errors

# Check Docker version (minimum: 20.10+)
docker --version
# Expected: Docker version 20.10.x or higher

# Check Docker Compose version (minimum: 2.x)
docker compose version
# Expected: Docker Compose version v2.x.x or higher
```

**Success Criteria**: ✅ All commands succeed, versions meet minimums

### Step 2: Check ACT Installation

```bash
# Check ACT is installed
which act
# Expected: /usr/local/bin/act (or similar path)

# Check ACT version (minimum: v0.2.82+)
act --version
# Expected: act version 0.2.82 or higher
```

**If ACT is not installed:**
```bash
# macOS
brew install act

# Linux
curl --proto '=https' --tlsv1.2 -sSf https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Windows (WSL)
# Use Linux installation method above
```

**Success Criteria**: ✅ ACT installed, version 0.2.82+

### Step 3: Check System Resources

```bash
# macOS: Check Docker Desktop memory allocation
# Open Docker Desktop → Settings → Resources → Advanced
# Verify: Memory allocated >= 8GB

# Linux: Check available memory
free -h
# Expected: Available memory >= 8GB

# Check available disk space
df -h /var/lib/docker
# Expected: Available space >= 20GB
```

**Success Criteria**: ✅ Memory ≥8GB, Disk ≥20GB

### Step 4: Navigate to Project Root

```bash
cd /Users/jcosta/Projects/nosilha

# Verify you're in the right directory
ls -la infrastructure/act-testing/
# Expected: .actrc, README.md, config/, docker/, scripts/, tests/
```

**Success Criteria**: ✅ All expected directories exist

---

## Test Scenario 1: Setup Workflow Validation

**Validates**: T001 (validate-resources.sh), T002 (setup.sh), T003 (validate-setup.sh)

### Step 1.1: Run Resource Validation

```bash
cd infrastructure/act-testing

# Run resource validation script
./scripts/validate-resources.sh
```

**Expected Output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ACT Testing - Resource Validation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Docker daemon is running
✓ ACT tool is installed (version: 0.2.82)
✓ Memory available: 16GB (minimum: 8GB)
✓ Disk space available: 50GB (minimum: 20GB)
✓ Port 5432 is available
✓ Port 6379 is available
✓ Port 8081 is available
✓ Port 8082 is available
✓ Docker network 'act-testing' exists

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ All resource checks passed!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Exit Code Check:**
```bash
echo $?
# Expected: 0 (success)
```

**What to Check:**
- [ ] Docker daemon running
- [ ] ACT version ≥ 0.2.82
- [ ] Memory ≥ 8GB
- [ ] Disk space ≥ 20GB
- [ ] All ports available (5432, 6379, 8081, 8082)
- [ ] Docker network 'act-testing' exists
- [ ] Exit code is 0

**Success Criteria**: ✅ All checks pass, exit code 0

**If Fails**: Skip to Troubleshooting section

### Step 1.2: Run Setup Script

```bash
# Run setup script (should be idempotent)
./scripts/setup.sh
```

**Expected Output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ACT Testing Infrastructure - Setup
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 1: Validating prerequisites...
✓ Resource validation passed

Step 2: Configuring Docker network...
✓ Docker network 'act-testing' already exists

Step 3: Verifying configuration files...
✓ .actrc configuration exists
✓ docker-compose.act.yml exists
✓ config/secrets.env.example exists
✓ config/variables.env exists

Step 4: Checking secrets configuration...
⚠ config/secrets.env not found
  Copy config/secrets.env.example to config/secrets.env and fill in values

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Setup completed successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**What to Check:**
- [ ] Resource validation passes
- [ ] Docker network exists
- [ ] All configuration files present
- [ ] Warning about secrets.env is acceptable
- [ ] Exit code is 0

**Success Criteria**: ✅ Setup completes, all prerequisites validated

### Step 1.3: Configure Secrets (Required for Workflow Testing)

```bash
# Copy secrets template
cp config/secrets.env.example config/secrets.env

# Edit secrets file with your values
vim config/secrets.env
# Or use your preferred editor
```

**Minimum Required Secrets for Testing:**
```bash
# Essential for basic workflow testing
GITHUB_TOKEN=ghp_your_github_personal_access_token_here

# Can use mock values for initial testing
GCP_SA_KEY={"type":"service_account","project_id":"test"}
GCP_PROJECT_ID=test-project
PRODUCTION_API_URL=http://localhost:8080
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.test_token
NEXT_PUBLIC_SUPABASE_URL=https://test.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=test_anon_key
```

**Success Criteria**: ✅ secrets.env file created and populated

### Step 1.4: Run Setup Validation Test

```bash
# Run setup validation test
./tests/validate-setup.sh
```

**Expected Output:**
```
ACT Setup Validation Tests
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Test 1: Validate Resources Script
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ validate-resources.sh exists
✓ validate-resources.sh is executable

Test 2: Resource Validation Execution
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Resource validation passed

Test 3: Docker Network
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Docker network 'act-testing' exists

Test 4: Configuration Files
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ .actrc configuration file exists
✓ docker-compose.act.yml exists
✓ config/ directory exists
✓ secrets.env.example template exists

Test 5: Script Executability
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ setup.sh is executable
✓ validate-resources.sh is executable
✓ test-backend.sh is executable
✓ test-frontend.sh is executable
✓ test-integration.sh is executable

Test 6: ACT Installation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ ACT tool is installed
✓ ACT version: 0.2.82

Test 7: Docker Images
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Image available: catthehacker/ubuntu:act-22.04
✓ Image available: postgres:15
✓ Image available: redis:7-alpine

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Test Results
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tests Passed: 17
Tests Failed: 0

✓ All validation tests passed!

Setup workflow is correctly configured.
Ready to run ACT workflow tests.
```

**What to Check:**
- [ ] All 17 tests pass
- [ ] 0 tests fail
- [ ] Exit code is 0

**Success Criteria**: ✅ All validation tests pass

---

## Test Scenario 2: Backend Workflow Testing

**Validates**: T007 (test-backend.sh with job filtering and service integration)

### Step 2.1: Verify Backend Workflow Configuration

```bash
# Check backend workflow file exists
ls -la ../../.github/workflows/backend-ci.yml
# Expected: File exists

# List available backend jobs using ACT
act -l -W ../../.github/workflows/backend-ci.yml
# Expected: List of jobs in backend workflow
```

**What to Check:**
- [ ] backend-ci.yml file exists
- [ ] Jobs are listed (security-scan, test-and-lint, build, deploy-production, etc.)

### Step 2.2: Run Backend Tests with Verbose Output

```bash
# Start timer
START_TIME=$(date +%s)

# Run backend tests with verbose output
./scripts/test-backend.sh --verbose

# Calculate duration
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
echo "Test duration: ${DURATION}s"
```

**Expected Output (Key Sections):**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Backend Workflow Testing
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[1/6] Pre-flight validation...
✓ Resource validation passed
✓ Backend workflow file exists

[2/6] Starting services...
✓ PostgreSQL starting... (postgres)
✓ Waiting for services to be healthy (timeout: 60s)
✓ PostgreSQL is healthy

[3/6] Executing workflow jobs...
Jobs to execute: security-scan, test-and-lint
Jobs excluded: build, deploy-production

Running job: security-scan
  [ACT output showing security scan execution]
✓ Job 'security-scan' completed

Running job: test-and-lint
  [ACT output showing tests and linting]
✓ Job 'test-and-lint' completed

[4/6] Performance validation...
✓ Execution time: 380s (target: <420s/7min)

[5/6] Cleanup...
✓ Stopping services
✓ Removing containers
✓ Cleaning artifacts

[6/6] Test Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Backend workflow tests passed!
Executed jobs: 2/2
Duration: 6m 20s
Exit code: 0
```

**What to Check:**
- [ ] Pre-flight validation passes
- [ ] PostgreSQL service starts and becomes healthy
- [ ] Security scan job executes
- [ ] Test-and-lint job executes
- [ ] Build job is NOT executed (deployment excluded)
- [ ] Deploy-production job is NOT executed (deployment excluded)
- [ ] Duration < 7 minutes (420 seconds)
- [ ] Cleanup completes successfully
- [ ] Exit code is 0

**Success Criteria**: ✅ Tests pass, duration <7min, no deployment jobs, exit code 0

### Step 2.3: Test Job Filtering

```bash
# Test running a specific job
./scripts/test-backend.sh --job security-scan --verbose
```

**What to Check:**
- [ ] Only security-scan job executes
- [ ] Other jobs are skipped
- [ ] Faster execution than full workflow
- [ ] Exit code is 0

**Success Criteria**: ✅ Single job executes correctly

### Step 2.4: Verify Container Cleanup

```bash
# Check no backend containers are running
docker ps -a --filter "label=act" | grep backend
# Expected: Empty output (no containers)

# Check Docker network still exists (for reuse)
docker network ls | grep act-testing
# Expected: act-testing network present
```

**What to Check:**
- [ ] No ACT containers running after test
- [ ] Docker network persists for reuse

**Success Criteria**: ✅ Clean environment, network persists

---

## Test Scenario 3: Frontend Workflow Testing

**Validates**: T008 (test-frontend.sh with caching and performance optimization)

### Step 3.1: Run Frontend Tests (First Run)

```bash
# Start timer for first run
START_TIME=$(date +%s)

# Run frontend tests
./scripts/test-frontend.sh --verbose

# Calculate duration
END_TIME=$(date +%s)
FIRST_RUN_DURATION=$((END_TIME - START_TIME))
echo "First run duration: ${FIRST_RUN_DURATION}s"
```

**Expected Output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Frontend Workflow Testing
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[1/5] Pre-flight validation...
✓ Resource validation passed
✓ Frontend workflow file exists

[2/5] Executing workflow jobs...
Jobs to execute: security-scan, test-and-build, bundle-analysis
Jobs excluded: build, deploy-production

Running job: security-scan
✓ Job 'security-scan' completed

Running job: test-and-build
  [NPM install, TypeScript check, ESLint, tests]
✓ Job 'test-and-build' completed

Running job: bundle-analysis
✓ Job 'bundle-analysis' completed

[3/5] Performance validation...
✓ Execution time: 210s (target: <240s/4min)

[4/5] Cleanup...
✓ Removing containers

[5/5] Test Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Frontend workflow tests passed!
Executed jobs: 3/3
Duration: 3m 30s
Exit code: 0
```

**What to Check:**
- [ ] All 3 jobs execute (security-scan, test-and-build, bundle-analysis)
- [ ] Deployment jobs excluded
- [ ] Duration < 4 minutes (240 seconds)
- [ ] Exit code is 0

### Step 3.2: Run Frontend Tests (Second Run - Test Caching)

```bash
# Start timer for second run
START_TIME=$(date +%s)

# Run frontend tests again
./scripts/test-frontend.sh --verbose

# Calculate duration
END_TIME=$(date +%s)
SECOND_RUN_DURATION=$((END_TIME - START_TIME))
echo "Second run duration: ${SECOND_RUN_DURATION}s"

# Compare durations
if [ $SECOND_RUN_DURATION -lt $FIRST_RUN_DURATION ]; then
    echo "✓ Caching is working! Second run faster by $((FIRST_RUN_DURATION - SECOND_RUN_DURATION))s"
else
    echo "⚠ Warning: Second run not faster - caching may not be working"
fi
```

**What to Check:**
- [ ] Second run completes successfully
- [ ] Second run is faster than first run (caching working)
- [ ] npm dependencies cached
- [ ] Exit code is 0

**Success Criteria**: ✅ Second run faster than first run, exit code 0

### Step 3.3: Test Selective Job Execution

```bash
# Run only security-scan and test-and-build
./scripts/test-frontend.sh --job security-scan --job test-and-build
```

**What to Check:**
- [ ] Only specified jobs execute
- [ ] bundle-analysis job skipped
- [ ] Faster than full workflow
- [ ] Exit code is 0

**Success Criteria**: ✅ Selective jobs execute correctly

---

## Test Scenario 4: Integration Workflow Testing

**Validates**: T009 (test-integration.sh with all 4 services and health checks)

### Step 4.1: Run Integration Tests

```bash
# Start timer
START_TIME=$(date +%s)

# Run integration tests with verbose output
./scripts/test-integration.sh --verbose

# Calculate duration
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
echo "Test duration: ${DURATION}s"
```

**Expected Output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Integration Workflow Testing
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[1/7] Pre-flight validation...
✓ Resource validation passed
✓ Integration workflow file exists

[2/7] Starting services (Phase 1)...
✓ PostgreSQL starting...
✓ Redis starting...
✓ Waiting for Phase 1 services to be healthy (timeout: 60s)
✓ PostgreSQL is healthy
✓ Redis is healthy

[3/7] Starting services (Phase 2)...
✓ Firestore emulator starting...
✓ GCS emulator starting...
✓ Waiting for Phase 2 services to be healthy (timeout: 60s)
✓ Firestore emulator is healthy
✓ GCS emulator is healthy

[4/7] Verifying service connectivity...
✓ PostgreSQL connection test passed
✓ Redis connection test passed
✓ Firestore emulator accessible
✓ GCS emulator accessible

[5/7] Executing workflow jobs...
Running job: api-integration-tests
✓ Job 'api-integration-tests' completed

[6/7] Performance validation...
✓ Execution time: 320s (target: <360s/6min)

[7/7] Cleanup...
✓ Stopping services
✓ Removing containers
✓ Cleaning artifacts

Test Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Integration workflow tests passed!
Services: 4/4 healthy
Executed jobs: 1/1
Duration: 5m 20s
Exit code: 0
```

**What to Check:**
- [ ] Phase 1 services start (PostgreSQL, Redis)
- [ ] Phase 1 services become healthy within 60s
- [ ] Phase 2 services start (Firestore, GCS)
- [ ] Phase 2 services become healthy within 60s
- [ ] All 4 services connectivity verified
- [ ] Integration tests execute
- [ ] Duration < 6 minutes (360 seconds)
- [ ] Cleanup completes
- [ ] Exit code is 0

**Success Criteria**: ✅ All 4 services healthy, tests pass, duration <6min, exit code 0

### Step 4.2: Verify Service Health Checks

```bash
# During test execution, open another terminal and check service status
docker ps --filter "network=act-testing" --format "table {{.Names}}\t{{.Status}}"

# Expected output (while tests running):
# NAMES                    STATUS
# postgres                 Up 2 minutes (healthy)
# redis                    Up 2 minutes (healthy)
# firestore-emulator       Up 1 minute (healthy)
# gcs-emulator             Up 1 minute (healthy)
```

**What to Check:**
- [ ] All services show "healthy" status
- [ ] Services on act-testing network

### Step 4.3: Test Service Startup Sequencing

Check test output logs to verify phased startup:
- [ ] Phase 1 services (PostgreSQL, Redis) start first
- [ ] Phase 1 health checks complete before Phase 2
- [ ] Phase 2 services (Firestore, GCS) start after Phase 1
- [ ] Each phase has 60s timeout

**Success Criteria**: ✅ Correct startup sequence, all services healthy

---

## Test Scenario 5: PR Validation Workflow Testing

**Validates**: T010 (test-pr-validation.sh with pull_request event handling)

### Step 5.1: Run PR Validation Tests

```bash
# Run PR validation tests
./scripts/test-pr-validation.sh --verbose
```

**Expected Output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PR Validation Workflow Testing
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[1/5] Pre-flight validation...
✓ Resource validation passed
✓ PR validation workflow file exists

[2/5] Preparing pull_request event...
✓ Using event type: pull_request
✓ Event payload validated

[3/5] Executing workflow jobs...
Jobs to execute: (PR validation jobs)
Jobs excluded: (deployment jobs)

Running PR validation...
✓ PR validation completed

[4/5] Performance validation...
✓ Execution time: 280s (target: <300s/5min)

[5/5] Cleanup...
✓ Removing containers

Test Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ PR validation workflow tests passed!
Duration: 4m 40s
Exit code: 0
```

**What to Check:**
- [ ] pull_request event type used
- [ ] PR validation jobs execute
- [ ] Deployment jobs excluded
- [ ] Duration < 5 minutes (300 seconds)
- [ ] Exit code is 0

**Success Criteria**: ✅ PR validation passes, duration <5min, exit code 0

---

## Test Scenario 6: Resource Constraint Validation

**Validates**: FR-021 (Fail-fast with specific error messages for resource constraints)

### Step 6.1: Test with Sufficient Resources

```bash
# Run validation with normal resources
./scripts/validate-resources.sh
echo "Exit code: $?"
# Expected: Exit code 0
```

**Success Criteria**: ✅ Exit code 0 with sufficient resources

### Step 6.2: Simulate Low Memory (macOS Docker Desktop)

**Manual Steps:**
1. Open Docker Desktop
2. Navigate to: Settings → Resources → Advanced
3. Set Memory to 4GB (below 8GB minimum)
4. Click "Apply & Restart"
5. Wait for Docker to restart

```bash
# Run validation with reduced memory
./scripts/validate-resources.sh
echo "Exit code: $?"
# Expected: Exit code 3 (resource constraint)
```

**Expected Output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ACT Testing - Resource Validation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Docker daemon is running
✓ ACT tool is installed
✗ Memory available: 4GB (minimum: 8GB required)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✗ Resource constraint violation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Insufficient resources detected:
- Memory: 4GB available, 8GB required

Suggested actions:
1. Increase Docker Desktop memory allocation
   → Docker Desktop → Settings → Resources → Advanced → Memory: 8GB
2. Close memory-intensive applications
3. Review resource requirements in README.md

For detailed guidance: infrastructure/act-testing/README.md#resource-requirements
```

**What to Check:**
- [ ] Exit code is 3 (resource constraint)
- [ ] Clear error message identifies memory issue
- [ ] Specific values shown (4GB vs 8GB)
- [ ] Actionable suggestions provided
- [ ] Documentation reference included
- [ ] Fail-fast behavior (stops immediately)

**Success Criteria**: ✅ Exit code 3, clear error message, actionable suggestions

**Restore Normal Resources:**
1. Open Docker Desktop → Settings → Resources
2. Set Memory back to 8GB or higher
3. Click "Apply & Restart"

### Step 6.3: Test with Restored Resources

```bash
# Verify validation passes after resource restoration
./scripts/validate-resources.sh
echo "Exit code: $?"
# Expected: Exit code 0
```

**Success Criteria**: ✅ Exit code 0 after resource restoration

---

## Test Scenario 7: Cleanup Verification

**Validates**: FR-007 (Efficient cleanup of artifacts, containers, and volumes)

### Step 7.1: Run Backend Tests

```bash
# Run backend tests to create containers and artifacts
./scripts/test-backend.sh
```

### Step 7.2: Verify Automatic Cleanup

```bash
# Check for ACT containers (should be empty)
docker ps -a --filter "label=act" --format "table {{.Names}}\t{{.Status}}"
# Expected: Empty output (no containers)

# Check for volumes (should be pruned)
docker volume ls --filter "label=project=act-testing"
# Expected: Empty output (volumes removed)

# Check Docker network (should persist for reuse)
docker network ls | grep act-testing
# Expected: act-testing network present
```

**What to Check:**
- [ ] No ACT containers running
- [ ] No ACT containers stopped
- [ ] No act-testing volumes exist
- [ ] act-testing network persists (for reuse)

**Success Criteria**: ✅ Containers removed, volumes pruned, network persists

### Step 7.3: Check Artifact Cleanup

```bash
# Check artifact directory (should be empty or cleaned)
ls -la /tmp/act-artifacts/ 2>/dev/null || echo "Artifact directory cleaned"
# Expected: Empty or does not exist
```

**What to Check:**
- [ ] /tmp/act-artifacts is empty or removed

**Success Criteria**: ✅ Artifacts cleaned up

---

## Troubleshooting Guide

### Issue 1: ACT Not Found

**Symptoms:**
```
bash: act: command not found
```

**Solutions:**
```bash
# macOS
brew install act

# Linux
curl --proto '=https' --tlsv1.2 -sSf https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Verify installation
which act
act --version
```

### Issue 2: Docker Not Running

**Symptoms:**
```
✗ Docker daemon is not running
```

**Solutions:**
```bash
# macOS
open -a Docker

# Linux
sudo systemctl start docker

# Verify
docker info
```

### Issue 3: Port Conflicts

**Symptoms:**
```
✗ Port 5432 is not available
```

**Solutions:**
```bash
# Check what's using the port
lsof -i :5432

# Option 1: Stop conflicting service
# Example: brew services stop postgresql

# Option 2: Modify docker-compose.act.yml port mapping
# Change "5432:5432" to "5433:5432"
```

### Issue 4: Service Health Check Timeout

**Symptoms:**
```
✗ PostgreSQL health check timeout after 60s
```

**Solutions:**
```bash
# Check service logs
docker logs postgres

# Restart Docker
# macOS: Docker Desktop → Restart
# Linux: sudo systemctl restart docker

# Increase timeout in test script (temporary)
# Edit scripts/test-*.sh and increase HEALTH_CHECK_TIMEOUT
```

### Issue 5: Insufficient Memory

**Symptoms:**
```
✗ Memory available: 4GB (minimum: 8GB required)
Exit code: 3
```

**Solutions:**
```bash
# macOS Docker Desktop
# 1. Open Docker Desktop
# 2. Settings → Resources → Advanced
# 3. Set Memory to 8GB or higher
# 4. Click "Apply & Restart"

# Linux: Check available system memory
free -h

# If insufficient, close applications or upgrade hardware
```

### Issue 6: Workflow File Not Found

**Symptoms:**
```
✗ Backend workflow file not found
```

**Solutions:**
```bash
# Verify you're in the correct directory
pwd
# Expected: /Users/jcosta/Projects/nosilha/infrastructure/act-testing

# Check workflow file exists
ls -la ../../.github/workflows/backend-ci.yml

# If missing, check you're on the correct branch
git branch
```

### Issue 7: Secrets Not Loaded

**Symptoms:**
```
Error: Required secret 'GITHUB_TOKEN' not found
```

**Solutions:**
```bash
# Verify secrets.env exists
ls -la config/secrets.env

# If missing, copy template
cp config/secrets.env.example config/secrets.env

# Edit and add real values
vim config/secrets.env

# Verify secrets format (no spaces around =)
cat config/secrets.env | grep "^[A-Z]"
```

### Issue 8: Container Cleanup Fails

**Symptoms:**
```
Error: Cannot remove container - still running
```

**Solutions:**
```bash
# Force stop all ACT containers
docker ps -a --filter "label=act" -q | xargs docker stop

# Force remove all ACT containers
docker ps -a --filter "label=act" -q | xargs docker rm -f

# Prune volumes
docker volume prune -f --filter "label=project=act-testing"
```

### Issue 9: Network Already Exists Error

**Symptoms:**
```
Error: network act-testing already exists
```

**Solution:**
```bash
# This is actually fine - the network should persist for reuse
# If you need to recreate it:
docker network rm act-testing
docker network create act-testing
```

### Issue 10: Slow Test Execution

**Symptoms:**
- Tests take longer than expected
- First run very slow

**Solutions:**
```bash
# Pre-pull Docker images
docker pull catthehacker/ubuntu:act-22.04
docker pull postgres:15
docker pull redis:7-alpine

# Enable Docker BuildKit for better caching
export DOCKER_BUILDKIT=1

# Check Docker Desktop resource allocation
# Increase CPUs if available

# Use --reuse flag (should be default in .actrc)
# Verify in .actrc:
grep "reuse" .actrc
```

---

## Complete Validation Checklist

Use this checklist to track your validation progress:

### Prerequisites
- [ ] Docker installed and running (≥20.10)
- [ ] Docker Compose installed (≥2.x)
- [ ] ACT installed (≥0.2.82)
- [ ] Memory ≥8GB allocated to Docker
- [ ] Disk space ≥20GB available
- [ ] secrets.env configured

### Test Scenario 1: Setup Workflow
- [ ] validate-resources.sh passes (exit code 0)
- [ ] setup.sh completes successfully
- [ ] Docker network 'act-testing' created
- [ ] validate-setup.sh passes all 17 tests
- [ ] Exit codes: 0

### Test Scenario 2: Backend Testing
- [ ] Backend tests execute successfully
- [ ] Security scan job runs
- [ ] Test-and-lint job runs
- [ ] Build job excluded (deployment)
- [ ] Deploy-production job excluded (deployment)
- [ ] Duration <7 minutes
- [ ] Job filtering works (--job flag)
- [ ] Containers cleaned up after test
- [ ] Exit codes: 0

### Test Scenario 3: Frontend Testing
- [ ] Frontend tests execute successfully
- [ ] First run completes
- [ ] Second run faster (caching works)
- [ ] Security scan job runs
- [ ] Test-and-build job runs
- [ ] Bundle analysis job runs
- [ ] Deployment jobs excluded
- [ ] Duration <4 minutes
- [ ] Selective jobs work (--job flag)
- [ ] Exit codes: 0

### Test Scenario 4: Integration Testing
- [ ] Integration tests execute successfully
- [ ] Phase 1 services start (PostgreSQL, Redis)
- [ ] Phase 1 health checks pass
- [ ] Phase 2 services start (Firestore, GCS)
- [ ] Phase 2 health checks pass
- [ ] All 4 services healthy
- [ ] Service connectivity verified
- [ ] Integration job executes
- [ ] Duration <6 minutes
- [ ] Exit codes: 0

### Test Scenario 5: PR Validation
- [ ] PR validation tests execute
- [ ] pull_request event handled
- [ ] PR validation jobs run
- [ ] Deployment jobs excluded
- [ ] Duration <5 minutes
- [ ] Exit codes: 0

### Test Scenario 6: Resource Constraints
- [ ] Validation passes with sufficient resources (exit 0)
- [ ] Validation fails with low memory (exit 3)
- [ ] Error message clear and specific
- [ ] Actionable suggestions provided
- [ ] Fail-fast behavior confirmed
- [ ] Validation passes after resource restoration

### Test Scenario 7: Cleanup
- [ ] Containers removed after tests
- [ ] Volumes pruned after tests
- [ ] Network persists for reuse
- [ ] Artifacts cleaned up
- [ ] Clean environment verified

---

## Performance Targets Summary

| Workflow | Target Duration | Acceptable Range | Your Result |
|----------|----------------|------------------|-------------|
| Backend | <7 minutes | 5-7 minutes | _____ min |
| Frontend | <4 minutes | 3-4 minutes | _____ min |
| Integration | <6 minutes | 5-6 minutes | _____ min |
| PR Validation | <5 minutes | 4-5 minutes | _____ min |
| **Total (if run sequentially)** | **<22 minutes** | **17-22 minutes** | **_____ min** |

---

## Next Steps After Validation

Once all test scenarios pass:

1. **Document Results**
   - Record performance metrics
   - Note any issues encountered
   - Update troubleshooting guide if new issues found

2. **Ready for Remaining Tasks**
   - T011-T012: Utility scripts (export-logs.sh, cleanup.sh enhancement)
   - T013-T016: Event payload updates
   - T017-T020: Documentation enhancements
   - T021-T027: Formal quickstart validation scenarios

3. **Team Onboarding**
   - Share this guide with team members
   - Run through validation together
   - Gather feedback for improvements

4. **CI/CD Integration** (Future)
   - Consider adding ACT pre-commit hooks
   - Document workflow testing best practices
   - Create team training materials

---

## Exit Codes Reference

| Exit Code | Meaning | When to Expect |
|-----------|---------|----------------|
| 0 | Success | All tests passed, no issues |
| 1 | Workflow failure | ACT workflow execution failed |
| 2 | Service startup failure | Docker services failed to start/health check |
| 3 | Resource constraint | Insufficient memory/disk/ports |
| 4 | Prerequisite failed | Docker/ACT not installed or misconfigured |
| 5 | Configuration error | Invalid .actrc or secrets.env |
| 6 | Timeout | Tests exceeded maximum duration |

---

## Support & Feedback

**Documentation:**
- Main README: `infrastructure/act-testing/README.md`
- ACT Research: `plan/research/local-github-actions-testing-guide.md`
- Contracts: `plan/specs/002-refactor-act-workflows/contracts/`

**Getting Help:**
1. Check this troubleshooting guide
2. Review main README
3. Check Docker and ACT documentation
4. Create GitHub issue with logs and error messages

---

**Happy Testing!** 🎉

This guide validates the ACT workflow testing MVP (T001-T010) and prepares you for completing the remaining implementation tasks.
