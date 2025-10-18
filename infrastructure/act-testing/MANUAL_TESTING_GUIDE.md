# Quickstart Validation Guide: ACT Workflow Testing

**Purpose**: Manual validation scenarios for ACT workflow testing infrastructure
**Target**: Developers validating ACT setup for first-time use and ongoing development
**Expected Duration**: 20-30 minutes for complete validation
**Prerequisites**: macOS, Linux, or Windows WSL with Docker installed

> **Note**: For comprehensive troubleshooting, resource requirements, and cross-platform considerations, see [README.md](README.md).

---

## Quick Reference

| Scenario | Script | Duration | Success Criteria |
|----------|--------|----------|------------------|
| 1. First-Time Setup | `setup.sh` | 5 min | Exit code 0, Docker network created |
| 2. Backend Workflow Testing | `test-backend.sh` | <7 min | Exit code 0, no deployment jobs, performance target met |
| 3. Frontend Workflow Testing | `test-frontend.sh` | <4 min | Exit code 0, caching validated, selective jobs work |
| 4. Integration Workflow Testing | `test-integration.sh` | <6 min | Exit code 0, all 4 services healthy |
| 5. Resource Constraint Handling | `validate-resources.sh` | <1 min | Exit code 3 with insufficient resources, clear error |
| 6. Log Export for Debugging | `export-logs.sh` | <1 min | Logs exported with service-specific naming |
| 7. Complete Cleanup | `cleanup.sh` | <2 min | Containers removed, volumes pruned, network preserved |

---

## Prerequisites Validation

Before starting validation scenarios, verify your environment meets all requirements.

> **Detailed Prerequisites**: See [README.md § Prerequisites & Version Requirements](README.md#prerequisites--version-requirements) for comprehensive installation instructions.

### Quick Prerequisites Check

```bash
# Navigate to ACT testing directory
cd infrastructure/act-testing

# Check Docker (minimum: 20.10+)
docker --version && docker info

# Check Docker Compose (minimum: 2.x)
docker compose version

# Check ACT (minimum: v0.2.82+)
act --version

# Check system resources
# macOS: Docker Desktop → Settings → Resources (8GB+ RAM, 20GB+ disk)
# Linux: free -h (8GB+ available), df -h (20GB+ available)
```

**Success Criteria**: ✅ Docker running, ACT installed, resources sufficient

**If Prerequisites Missing**: See [README.md § Prerequisites](README.md#prerequisites--version-requirements) for installation guides by platform.

---

## Scenario 1: First-Time Setup

**Goal**: Validate prerequisite installation and configuration

**Validates**: Setup script, resource validation, Docker network, configuration files

### Steps

```bash
cd infrastructure/act-testing

# Run setup script
./scripts/setup.sh
```

**Expected Output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ACT Testing Infrastructure - Setup
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Docker daemon running (version 24.0.5)
✅ ACT tool installed (version v0.2.82)
✅ Memory available: 16GB (minimum: 8GB)
✅ Disk space available: 45GB (minimum: 20GB)
✅ Docker network 'act-testing' created
✅ Configuration files validated

✅ Setup complete! Ready to run workflow tests.
```

### Validation Checklist

- [ ] All checks pass with green checkmarks
- [ ] Docker network exists: `docker network ls | grep act-testing`
- [ ] Configuration files present: `.actrc`, `docker-compose.yml`
- [ ] Exit code: 0 (`echo $?`)

### On Failure

- Check Docker Desktop is running and allocated 8GB+ memory
- Install ACT: `brew install act` (macOS) or see [README.md § Prerequisites](README.md#prerequisites--version-requirements)
- Review troubleshooting: [README.md § Troubleshooting](README.md#troubleshooting)

**Success Criteria**: ✅ Setup completes, Docker network created, exit code 0

---

## Scenario 2: Backend Workflow Testing

**Goal**: Execute backend workflow with full test suite and validate performance

**Validates**: Backend testing script, job filtering, service integration, deployment exclusion

### Steps

```bash
cd infrastructure/act-testing

# Start timer and run backend workflow test
START_TIME=$(date +%s)
./scripts/test-backend.sh --verbose
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
echo "Test duration: ${DURATION}s"
```

**Expected Timeline:**
```
[0:00] Pre-flight validation
[0:10] Service startup (PostgreSQL, Redis)
[0:30] Job 'security-scan' execution
[2:00] Job 'test-and-lint' execution
[7:00] Workflow complete
```

**Expected Output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Backend Workflow Testing
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Pre-flight validation passed
🐳 Starting test services...
   - PostgreSQL: healthy
   - Redis: healthy
🏃 Running workflow jobs...
   - test-and-lint: passed
✅ Workflow execution completed successfully
⏱️  Duration: 5m 30s
```

**Note**: The `security-scan` job is excluded by default because it uses a reusable workflow (`workflow_call`), which ACT doesn't support. Security scanning still runs in GitHub Actions CI/CD.

### Validation Checklist

- [ ] Exit code: 0
- [ ] test-and-lint job shows "passed" status
- [ ] Duration: <7 minutes (420s)
- [ ] **No deployment jobs executed** (build, deploy-production excluded)
- [ ] **security-scan excluded** (ACT limitation with reusable workflows)
- [ ] Services cleaned up: `docker ps | grep act-testing` (empty)
- [ ] PostgreSQL and Redis services healthy during execution

### On Failure

- Export logs: `./scripts/export-logs.sh ./debug-logs`
- Check service logs: `docker-compose logs postgresql`
- Review ACT output for specific job failures
- See [README.md § Troubleshooting](README.md#troubleshooting)

**Success Criteria**: ✅ Tests pass, duration <7min, no deployment jobs, exit code 0

---

## Scenario 3: Frontend Workflow Testing

**Goal**: Execute frontend workflow with build and type checking, validate caching

**Validates**: Frontend testing script, npm caching, selective job execution, deployment exclusion

### Steps

```bash
cd infrastructure/act-testing

# Run frontend workflow test with selective jobs
./scripts/test-frontend.sh --job security-scan --job test-and-build
```

**Expected Timeline:**
```
[0:00] Pre-flight validation
[0:10] Service startup (minimal services)
[0:20] Job 'security-scan' execution
[1:00] Job 'test-and-build' execution (npm install, TypeScript, ESLint)
[4:00] Workflow complete
```

**Expected Output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Frontend Workflow Testing
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Pre-flight validation passed
🏃 Running workflow jobs: security-scan, test-and-build
   - security-scan: passed
   - test-and-build: passed
✅ Workflow execution completed successfully
⏱️  Duration: 3m 52s
```

### Validation Checklist

- [ ] Exit code: 0
- [ ] npm cache utilized for faster builds
- [ ] TypeScript type checking passed
- [ ] ESLint checks passed
- [ ] **No deployment jobs executed** (build, deploy-production excluded)
- [ ] Selective job execution works (--job flag)

### Caching Validation (Optional)

```bash
# Run again to test caching
time ./scripts/test-frontend.sh --job test-and-build

# Second run should be faster due to npm cache
# Verify: Check for "npm cache" messages in output
```

### On Failure

- Check npm cache: `ls ~/.npm/_cacache`
- Verify Node.js version compatibility
- Review frontend build logs in ACT output
- See [README.md § Troubleshooting](README.md#troubleshooting)

**Success Criteria**: ✅ Tests pass, duration <4min, caching validated, exit code 0

---

## Scenario 4: Integration Workflow Testing

**Goal**: Execute integration tests with all services and validate health checks

**Validates**: Integration testing script, all 4 services startup, phased health checks, service connectivity

### Steps

```bash
cd infrastructure/act-testing

# Run integration workflow test
./scripts/test-integration.sh --verbose
```

**Expected Timeline:**
```
[0:00] Pre-flight validation
[0:10] Service startup (all 4 services)
[0:30] Job 'integration-tests' execution
[6:00] Workflow complete
```

**Expected Output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Integration Workflow Testing
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Pre-flight validation passed
🐳 Starting test services...
   - PostgreSQL: healthy
   - Redis: healthy
   - Firestore emulator: healthy
   - GCS emulator: healthy
🏃 Running workflow jobs...
   - integration-tests: passed
✅ Workflow execution completed successfully
⏱️  Duration: 5m 41s
```

### Validation Checklist

- [ ] All 4 services start and reach healthy state
- [ ] Integration tests connect to all services
- [ ] API endpoints respond correctly
- [ ] Database migrations run successfully
- [ ] Duration: <6 minutes (360s)
- [ ] Exit code: 0

### Service Health Verification (Optional)

```bash
# During test execution, check service status in another terminal
docker ps --filter "network=act-testing" --format "table {{.Names}}\t{{.Status}}"

# Expected: All services show "healthy" status
```

### On Failure

- Check service health: `docker-compose ps`
- Verify port availability before startup
- Check Firestore logs: `docker-compose logs firestore-emulator`
- Verify network connectivity: `docker network inspect act-testing`
- See [README.md § Troubleshooting](README.md#troubleshooting)

**Success Criteria**: ✅ All 4 services healthy, tests pass, duration <6min, exit code 0

---

## Scenario 5: Resource Constraint Handling

**Goal**: Validate fail-fast behavior on insufficient resources

**Validates**: Resource validation script, fail-fast strategy, clear error messages, actionable suggestions

### Steps

```bash
cd infrastructure/act-testing

# Simulate low memory constraint (requires manual Docker Desktop config change)
# 1. Set Docker Desktop memory to 4GB (below 8GB minimum)
# 2. Restart Docker Desktop
# 3. Run validation

./scripts/validate-resources.sh
```

**Expected Output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ACT Testing - Resource Validation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Docker daemon running
✅ ACT tool installed
❌ ERROR: Resource Constraint Violation
   Insufficient memory: 4GB (minimum: 8GB)

💡 Suggested Actions:
   - Increase Docker Desktop memory allocation to 8GB+
   - Close memory-intensive applications
   - Review Docker resource settings

📚 Documentation: infrastructure/act-testing/README.md#resource-requirements
```

### Validation Checklist

- [ ] Exit code: 3 (resource constraint violation)
- [ ] Clear error message identifies specific constraint
- [ ] Actionable suggestions provided
- [ ] Documentation reference included
- [ ] Fail-fast behavior (stops immediately, no services started)

### Cleanup

```bash
# Restore Docker Desktop memory to 8GB+ before continuing
# Docker Desktop → Settings → Resources → Memory: 8GB+
# Click "Apply & Restart"

# Verify restoration
./scripts/validate-resources.sh
# Expected: Exit code 0
```

**Success Criteria**: ✅ Exit code 3 on constraint, clear error, exit code 0 after restoration

---

## Scenario 6: Log Export for Debugging

**Goal**: Validate log export functionality for debugging workflow failures

**Validates**: Log export utility, service-specific naming, compression support

### Steps

```bash
cd infrastructure/act-testing

# Run backend test first to generate logs
./scripts/test-backend.sh

# Export logs to debug directory
./scripts/export-logs.sh ./debug-logs
```

**Expected Output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ACT Testing Log Export
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Docker is available
✅ Found 4 container(s)
📝 Exporting logs to ./debug-logs

  Exporting postgresql → postgresql.log... ✓ (2.1MB)
  Exporting redis → redis.log... ✓ (45KB)
  Exporting firestore-emulator → firestore.log... ✓ (1.3MB)
  Exporting gcs-emulator → gcs.log... ✓ (890KB)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Export Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total Containers: 4
Logs Exported: 4
Total Size: 4.3MB

✅ All logs exported successfully
ℹ  Logs saved to: ./debug-logs
```

### Validation Checklist

- [ ] Exit code: 0
- [ ] Logs exported to specified directory
- [ ] Service-specific naming (postgresql.log, redis.log, firestore.log, gcs.log)
- [ ] Log files contain relevant debugging information
- [ ] Export summary metadata created (export-summary.txt)
- [ ] Compression triggered if total size >100MB (optional)

### Inspect Exported Logs

```bash
# Review exported logs
ls -lh ./debug-logs/
cat ./debug-logs/export-summary.txt
tail -n 50 ./debug-logs/postgresql.log

# Cleanup debug logs after review
rm -rf ./debug-logs
```

### On Failure

- Verify Docker containers exist: `docker ps -a --filter "network=act-testing"`
- Check Docker daemon: `docker info`
- See [README.md § Troubleshooting](README.md#troubleshooting)

**Success Criteria**: ✅ Logs exported successfully with service-specific naming, exit code 0

---

## Scenario 7: Complete Cleanup

**Goal**: Validate cleanup removes all test artifacts while preserving network

**Validates**: Cleanup utility, container removal, volume pruning, network preservation, artifact cleanup

### Steps

```bash
cd infrastructure/act-testing

# Run backend test to create containers and artifacts
./scripts/test-backend.sh

# Verify cleanup with manual utility
./scripts/cleanup.sh --force
```

**Expected Output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ACT Testing Cleanup
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 1: Stopping containers on act-testing network...
  Stopping postgres... ✓
  Stopping redis... ✓
✓ Stopped 2 container(s)

Step 2: Removing stopped containers...
  Removing postgres... ✓
  Removing redis... ✓
✓ Removed 2 container(s)

Step 3: Removing volumes with project=act-testing label...
✓ Removed 3 volume(s)

Step 4: Cleaning /tmp/act-artifacts directory...
✓ Cleaned artifacts directory

Step 5: Preserving act-testing network for reuse

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Cleanup Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Containers stopped: 2
Containers removed: 2
Volumes removed: 3
Artifacts cleaned: Yes
Network removed: Preserved for reuse

✓ Cleanup completed successfully
```

### Validation Checklist

- [ ] No containers running on act-testing network
- [ ] No volumes with act-testing label
- [ ] Network persists for reuse: `docker network ls | grep act-testing`
- [ ] /tmp/act-artifacts cleaned
- [ ] Exit code: 0

### Verify Clean Environment

```bash
# Verify no ACT containers exist
docker ps -a --filter network=act-testing
# Expected: Empty list

# Verify no ACT volumes exist
docker volume ls --filter label=project=act-testing
# Expected: Empty list

# Verify network still exists
docker network ls | grep act-testing
# Expected: act-testing network present
```

### On Failure

- Force cleanup: `./scripts/cleanup.sh --force`
- Manual container removal: `docker rm -f $(docker ps -aq --filter network=act-testing)`
- Manual volume removal: `docker volume prune -f`
- See [README.md § Troubleshooting](README.md#troubleshooting)

**Success Criteria**: ✅ Containers removed, volumes pruned, network preserved, exit code 0

---

## Troubleshooting Reference

For comprehensive troubleshooting guidance, see [README.md § Troubleshooting](README.md#troubleshooting).

### Common Issues Quick Reference

| Issue | Exit Code | Solution Reference |
|-------|-----------|-------------------|
| **"unsupported object type"** | **1** | **Reusable workflow limitation - use --job test-and-lint** |
| Docker not running | 2 | [README.md § Docker Installation](README.md#prerequisites--version-requirements) |
| ACT not installed | 4 | [README.md § ACT Installation](README.md#prerequisites--version-requirements) |
| Insufficient memory | 3 | [README.md § Resource Requirements](README.md#resource-requirements--optimization) |
| Port conflicts | 5 | [README.md § Port Conflicts](README.md#troubleshooting) |
| Service startup timeout | 5 | [README.md § Service Health Checks](README.md#troubleshooting) |
| Slow execution | - | [README.md § Performance Optimization](README.md#resource-requirements--optimization) |
| Workflow file not found | 4 | [README.md § Troubleshooting](README.md#troubleshooting) |
| Secrets not loaded | 4 | [README.md § Troubleshooting](README.md#troubleshooting) |

#### ACT Reusable Workflow Limitation

The `security-scan` job uses GitHub's reusable workflow feature (`workflow_call`), which ACT doesn't support. This is a known ACT limitation, not an infrastructure issue.

**Solution**: The job is now excluded by default. Backend tests run successfully with the `test-and-lint` job, which includes JUnit tests, detekt analysis, and Jacoco coverage reporting.

### Quick Fixes

```bash
# Force cleanup on stuck containers
./scripts/cleanup.sh --force

# Export logs for debugging
./scripts/export-logs.sh ./debug-logs

# Restart Docker daemon
# macOS: Docker Desktop → Restart
# Linux: sudo systemctl restart docker
```

---

## Complete Validation Checklist

Use this checklist to track your quickstart validation progress:

### Prerequisites
- [ ] Docker installed and running (≥20.10)
- [ ] Docker Compose installed (≥2.x)
- [ ] ACT installed (≥0.2.82)
- [ ] Memory ≥8GB allocated to Docker
- [ ] Disk space ≥20GB available

### Scenario 1: First-Time Setup
- [ ] Setup script completes successfully (exit code 0)
- [ ] Docker network 'act-testing' created
- [ ] All configuration files validated
- [ ] Docker and ACT versions confirmed

### Scenario 2: Backend Workflow Testing
- [ ] Backend tests execute successfully (exit code 0)
- [ ] Security scan and test-and-lint jobs run
- [ ] **No deployment jobs executed**
- [ ] Duration <7 minutes
- [ ] Containers cleaned up after test

### Scenario 3: Frontend Workflow Testing
- [ ] Frontend tests execute successfully (exit code 0)
- [ ] Selective job execution works (--job flag)
- [ ] npm caching validated (second run faster)
- [ ] **No deployment jobs executed**
- [ ] Duration <4 minutes

### Scenario 4: Integration Workflow Testing
- [ ] Integration tests execute successfully (exit code 0)
- [ ] All 4 services start and become healthy (PostgreSQL, Redis, Firestore, GCS)
- [ ] Service connectivity verified
- [ ] Duration <6 minutes

### Scenario 5: Resource Constraint Handling
- [ ] Validation passes with sufficient resources (exit 0)
- [ ] Validation fails with low memory (exit 3)
- [ ] Clear error message with actionable suggestions
- [ ] Fail-fast behavior confirmed
- [ ] Validation passes after resource restoration (exit 0)

### Scenario 6: Log Export for Debugging
- [ ] Logs exported successfully (exit code 0)
- [ ] Service-specific naming (postgresql.log, redis.log, etc.)
- [ ] Export summary metadata created
- [ ] Logs contain relevant debugging information

### Scenario 7: Complete Cleanup
- [ ] Cleanup completes successfully (exit code 0)
- [ ] Containers removed after tests
- [ ] Volumes pruned after tests
- [ ] Network persists for reuse
- [ ] Artifacts cleaned up (/tmp/act-artifacts)

---

## Performance Validation

After completing all scenarios, validate performance targets:

```bash
# Run comprehensive test suite and measure time
time ./scripts/test-backend.sh && \
     ./scripts/test-frontend.sh && \
     ./scripts/test-integration.sh

# Target: Total execution <10 minutes
```

| Workflow | Target Duration | Your Result |
|----------|----------------|-------------|
| Backend | <7 minutes | _____ min |
| Frontend | <4 minutes | _____ min |
| Integration | <6 minutes | _____ min |
| **Total Comprehensive Testing** | **<10 minutes** | **_____ min** |

**Performance Checklist**:
- [ ] Backend workflow: <7 minutes
- [ ] Frontend workflow: <4 minutes
- [ ] Integration workflow: <6 minutes
- [ ] Total comprehensive testing: <10 minutes
- [ ] Container reuse working (second run faster)
- [ ] Caching strategies effective

---

## Success Criteria

Quickstart validation is complete when:

- [ ] All 7 scenarios executed successfully
- [ ] Performance targets met (<10 min total comprehensive testing)
- [ ] No deployment jobs executed in any scenario
- [ ] Resource validation working correctly (fail-fast on constraints)
- [ ] Log export functionality verified
- [ ] Cleanup working as expected (containers removed, network preserved)
- [ ] Cross-platform compatibility confirmed

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

> **Comprehensive Exit Codes**: See [README.md § Exit Codes](README.md#troubleshooting) for detailed troubleshooting by exit code.

---

## Next Steps

After successful quickstart validation:

1. **Integrate into Development Workflow**
   - Use ACT testing for pre-push validation (manual, no git hooks)
   - Test workflow changes locally before pushing to GitHub
   - Validate CI/CD configurations before deployment

2. **Advanced Usage**
   - Review [README.md](README.md) for advanced usage patterns
   - Explore event payload customization in `payloads/` directory
   - Optimize caching strategies for faster execution

3. **Team Onboarding**
   - Share this quickstart guide with team members
   - Document platform-specific considerations for your team
   - Set up pre-push testing routine (manual workflow)

4. **Continuous Improvement**
   - Provide feedback on performance and usability
   - Document new troubleshooting solutions
   - Share optimization strategies with the team

---

## Documentation Resources

- **Main Guide**: [README.md](README.md) - Comprehensive ACT testing documentation
- **Troubleshooting**: [README.md § Troubleshooting](README.md#troubleshooting) - Detailed troubleshooting guide
- **Prerequisites**: [README.md § Prerequisites](README.md#prerequisites--version-requirements) - Installation guides
- **Performance**: [README.md § Resource Requirements](README.md#resource-requirements--optimization) - Optimization strategies
- **Cross-Platform**: [README.md § Cross-Platform](README.md#cross-platform-considerations) - Platform-specific guidance

---

**Estimated Time**: 20-30 minutes for complete quickstart validation
**Prerequisites Met**: Docker, ACT, 8GB+ RAM, 20GB+ disk

**Happy Testing!** 🎉
