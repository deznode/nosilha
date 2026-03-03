# Act Testing Infrastructure for Nos Ilha

This directory contains a comprehensive setup for locally testing GitHub Actions workflows using the `act` tool. It provides a fast feedback loop for workflow development and debugging without the need to push changes to GitHub.

## 🚀 Quick Start

1. **Initial Setup**
   ```bash
   ./infrastructure/act-testing/scripts/setup.sh
   ```

2. **Configure Secrets**
   ```bash
   # Edit the secrets file with your actual values
   vim infrastructure/act-testing/config/secrets.env
   ```

3. **Test a Workflow**
   ```bash
   # Test backend workflow
   ./infrastructure/act-testing/scripts/test-backend.sh

   # Or test any specific workflow
   ./infrastructure/act-testing/scripts/test-workflows.sh backend push
   ```

## 📋 Prerequisites & Version Requirements

### Minimum Requirements

This infrastructure requires the following tools and minimum versions:

| Tool | Minimum Version | Recommended | Purpose |
|------|----------------|-------------|---------|
| **Docker** | 20.10+ | 24.0+ | Container runtime |
| **Docker Compose** | 2.x | 2.20+ | Service orchestration |
| **ACT** | v0.2.82+ | v0.2.82+ | Local GitHub Actions |
| **Bash** | 5.x | 5.2+ | Script execution |

**Note**: Version checking is manual (no automated validation per design decision). Use the verification commands below to check your versions.

### Installation Instructions

#### macOS

```bash
# Install Docker Desktop
# Download from: https://www.docker.com/products/docker-desktop

# Install ACT via Homebrew
brew install act

# Verify installations
docker --version          # Should show 20.10+
docker-compose --version  # Should show 2.x
act --version            # Should show v0.2.82+
bash --version           # Should show 5.x
```

#### Linux

```bash
# Install Docker Engine (recommended for best performance)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER  # Add user to docker group
newgrp docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install ACT
curl -s https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Verify installations
docker --version
docker-compose --version
act --version
bash --version
```

#### Windows (WSL2)

```bash
# Install Docker Desktop with WSL2 backend
# Download from: https://www.docker.com/products/docker-desktop
# Enable WSL2 integration: Docker Desktop → Settings → Resources → WSL Integration

# Inside WSL2 terminal:
# Install ACT via Scoop
scoop install act

# Or use the Linux installation method above

# Verify installations (from WSL2)
docker --version
docker-compose --version
act --version
bash --version
```

### Version Verification Commands

Run these commands to verify your environment meets minimum requirements:

```bash
# Quick verification
docker --version && \
docker-compose --version && \
act --version && \
bash --version

# Detailed verification with resource check
./scripts/validate-resources.sh
```

### Latest Stable Versions (as of October 2025)

- **Docker**: 24.0.5+ (stable)
- **Docker Compose**: 2.20+ (stable)
- **ACT**: v0.2.82 (latest with full feature support)
- **Bash**: 5.2+ (included in most modern systems)

### Additional Requirements

- **Git**: For repository operations (2.x+)
- **Network Access**: Initial setup requires internet for image pulls
- **Disk Space**: 20GB minimum, 60GB+ recommended (see [Resource Requirements](#resource-requirements--optimization))
- **Memory**: 8GB minimum allocated to Docker (see [Resource Requirements](#resource-requirements--optimization))

## 🏗️ Project Structure

```
infrastructure/act-testing/
├── README.md                    # This file
├── .actrc                       # Act configuration
├── config/
│   ├── secrets.env              # Your actual secrets (gitignored)
│   ├── secrets.env.example      # Template for secrets
│   ├── variables.env            # Non-sensitive environment variables
│   ├── .gitignore              # Protects secrets
│   └── event-payloads/         # Custom GitHub event payloads
│       ├── push.json
│       ├── pull_request.json
│       ├── workflow_dispatch.json
│       └── schedule.json
├── scripts/
│   ├── setup.sh                # Initial setup script
│   ├── test-workflows.sh       # Main testing script
│   ├── test-backend.sh         # Backend-specific tests
│   ├── test-frontend.sh        # Frontend-specific tests
│   ├── test-integration.sh     # Integration tests with services
│   └── clean.sh                # Cleanup containers and resources
└── docker/
    ├── docker-compose.yaml     # Services for testing
    └── init-scripts/           # Database initialization
        └── 01-init-test-db.sql
```

## ⚙️ Configuration

### Required Secrets

Copy `config/secrets.env.example` to `config/secrets.env` and fill in:

```bash
# GitHub Access
GITHUB_TOKEN=ghp_your_github_token_here

# Google Cloud Platform
GCP_SA_KEY={"type":"service_account","project_id":"..."}
GCP_PROJECT_ID=your-gcp-project-id

# API URLs
PRODUCTION_API_URL=https://your-production-api-url
NEXT_PUBLIC_API_URL=https://your-api-url

# External Services
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your_mapbox_token
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Act Configuration

The `.actrc` file contains optimized settings:
- Uses medium-size Docker image (500MB)
- Enables verbose logging
- Configures container networking
- Sets up bind mounts for performance
- Enables container reuse

## 🧪 Testing Workflows

### Available Testing Scripts

1. **Main Testing Script**
   ```bash
   ./scripts/test-workflows.sh [workflow] [event] [options]
   ```

2. **Workflow-Specific Scripts**
   ```bash
   # Backend tests with PostgreSQL
   ./scripts/test-backend.sh

   # Frontend tests
   ./scripts/test-frontend.sh

   # Integration tests with full service stack
   ./scripts/test-integration.sh
   ```

### Usage Examples

```bash
# Test backend workflow on push event
./scripts/test-workflows.sh backend push

# Test frontend with verbose output
./scripts/test-workflows.sh frontend push --verbose

# Test specific job in integration workflow
./scripts/test-workflows.sh integration --job api-integration-tests

# List all available jobs
./scripts/test-workflows.sh --list

# Dry run (syntax check)
./scripts/test-workflows.sh backend --dry-run

# Test all workflows
./scripts/test-workflows.sh all push

# Test with pull request event
./scripts/test-workflows.sh backend pull_request
```

### Advanced Usage

```bash
# Clean environment and start fresh
./scripts/test-workflows.sh backend push --clean --services

# Test with custom event payload
act push --eventpath config/event-payloads/push.json

# Test specific workflow file
act push --workflows .github/workflows/backend-ci.yml
```

## 🐳 Service Containers

The `docker-compose.yaml` provides testing services:

- **PostgreSQL 16**: Database for backend tests
- **Firestore Emulator**: Metadata storage testing
- **GCS Emulator**: File storage testing
- **Redis**: Caching layer testing

### Service Management

```bash
# Start all services
docker-compose -f docker/docker-compose.yaml up -d

# Stop services
docker-compose -f docker/docker-compose.yaml down

# View service logs
docker-compose -f docker/docker-compose.yaml logs

# Check service health
docker-compose -f docker/docker-compose.yaml ps
```

## 🎯 Testing Different Scenarios

### 1. Backend Testing
```bash
# Basic backend test
./scripts/test-backend.sh

# Test specific backend job
./scripts/test-workflows.sh backend push --job "Build & Package"

# Test backend with database integration
./scripts/test-integration.sh --job api-integration-tests
```

### 2. Frontend Testing
```bash
# Basic frontend test
./scripts/test-frontend.sh

# Frontend with service integration
./scripts/test-frontend.sh --with-services

# Test frontend build process
./scripts/test-workflows.sh frontend push --job "Build & Package"
```

### 3. Integration Testing
```bash
# Full integration test suite
./scripts/test-integration.sh

# Test specific integration scenario
./scripts/test-workflows.sh integration workflow_dispatch
```

### 4. Pull Request Testing
```bash
# Test PR validation workflow
./scripts/test-workflows.sh pr-validation pull_request

# Test with custom PR payload
act pull_request --eventpath config/event-payloads/pull_request.json
```

## 🔧 Troubleshooting

### Troubleshooting Decision Tree

```
Issue? → Check Docker → Check ACT → Check Resources → Check Services → Check Logs
         ↓              ↓            ↓                 ↓                ↓
         Exit code 4    Exit code 4  Exit code 3       Exit code 5      Exit code 6
```

### Common Failure Modes

#### 1. Docker Daemon Not Running (Exit Code: 4)

**Symptoms**: `Cannot connect to the Docker daemon`

**Solutions**:
```bash
# macOS - Start Docker Desktop
open -a Docker

# Linux - Start Docker daemon
sudo systemctl start docker
sudo systemctl enable docker  # Auto-start on boot

# Windows WSL - Ensure Docker Desktop integration enabled
# Docker Desktop → Settings → Resources → WSL Integration → Enable for your distro

# Verify Docker is running
docker info
```

#### 2. ACT Tool Not Installed or Wrong Version (Exit Code: 4)

**Symptoms**: `act: command not found` or version mismatch errors

**Solutions**:
```bash
# macOS
brew install act
brew upgrade act  # Update to latest

# Linux
curl -s https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Windows (with Scoop)
scoop install act

# Verify installation (requires v0.2.82+)
act --version
```

#### 3. Port Conflicts (Exit Code: 5)

**Symptoms**: `port is already allocated`, service fails to start

**Ports Used**: 5432 (PostgreSQL), 6379 (Redis), 8081 (Firestore), 8082 (GCS)

**Solutions**:
```bash
# Check what's using ports
lsof -i :5432  # macOS/Linux
netstat -ano | findstr :5432  # Windows

# Stop conflicting services
docker stop $(docker ps -q --filter "publish=5432")

# Or change ports in docker-compose.override.yml
cp docker/docker-compose.override.yml.example docker/docker-compose.override.yml
# Edit port mappings as needed
```

#### 4. Service Startup Timeouts (Exit Code: 5)

**Symptoms**: Services fail health checks, timeout errors

**Solutions**:
```bash
# Check service logs
docker-compose -f docker/docker-compose.yaml logs postgres

# Increase startup timeout (edit docker-compose.yaml)
# Change healthcheck.start_period from 30s to 60s

# Restart services
docker-compose -f docker/docker-compose.yaml restart

# Verify health
docker-compose -f docker/docker-compose.yaml ps
```

#### 5. Resource Constraints (Exit Code: 3)

**Symptoms**: `Resource constraint violation`, `insufficient memory/disk`

**Solutions**:
```bash
# Check current allocation
docker info | grep -E "Memory|CPUs|Total Space"

# Increase Docker resources:
# macOS/Windows: Docker Desktop → Settings → Resources
#   - Memory: 8GB minimum, 16GB recommended
#   - CPUs: 4 minimum, 8 recommended
#   - Disk: 40GB minimum, 60GB+ recommended

# Linux: Edit /etc/docker/daemon.json
{
  "default-ulimits": {
    "memlock": {"Hard": -1, "Name": "memlock", "Soft": -1}
  }
}

# Restart Docker after changes
# Then run validation
./scripts/validate-resources.sh
```

#### 6. Network Issues (Exit Code: 5)

**Symptoms**: Containers can't communicate, network not found

**Solutions**:
```bash
# Recreate network
docker network rm act-testing
docker network create act-testing

# Verify network exists
docker network ls | grep act-testing

# Check containers are on network
docker network inspect act-testing
```

#### 7. Workflow Execution Failures (Exit Code: 6)

**Symptoms**: Workflow fails, jobs don't execute as expected

**Solutions**:
```bash
# Enable verbose logging
./scripts/test-backend.sh --verbose

# Export logs for debugging
./scripts/test-backend.sh --export-logs ./debug-logs

# Dry run to validate syntax
act push --dryrun

# Check specific job
act push --job test-and-lint
```

### Script Exit Codes Reference

All testing scripts use standardized exit codes:

| Exit Code | Meaning | Action |
|-----------|---------|--------|
| 0 | Success | No action needed |
| 1 | Invalid arguments | Check command syntax |
| 2 | Docker not available | Start Docker daemon |
| 3 | Resource constraints | Increase Docker resources |
| 4 | Prerequisites missing | Install ACT, Docker, etc. |
| 5 | Service failures | Check service logs |
| 6 | Workflow execution failed | Review workflow syntax/logs |

### Platform-Specific Troubleshooting

#### macOS (Docker Desktop)

**Memory Allocation**:
```bash
# Check current allocation
docker info --format '{{.MemTotal}}'

# Increase memory:
# Docker Desktop → Settings → Resources → Memory → 8GB+
```

**M1/M2 ARM Architecture**:
```bash
# Use ARM64 images when available
act --container-architecture linux/arm64

# Or force AMD64 with emulation (slower)
act --container-architecture linux/amd64
```

**File Sync Performance**:
- Enable VirtioFS: Docker Desktop → Settings → General → "Enable VirtioFS"
- Use named volumes instead of bind mounts for better performance

#### Linux (Native Docker)

**Best Performance**:
```bash
# Use Docker Engine (not Docker Desktop)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group (no sudo needed)
sudo usermod -aG docker $USER
newgrp docker
```

**Gateway IP for Host Access**:
```bash
# Access host from container
172.17.0.1  # Default Docker bridge
# Or use host.docker.internal (add to /etc/hosts)
```

#### Windows WSL

**WSL2 Integration**:
```bash
# Store project in WSL filesystem (faster)
/home/<user>/projects/nosilha  # ✓ Fast
/mnt/c/Users/<user>/projects/nosilha  # ✗ Slow

# Allocate memory to WSL2 (C:\Users\<user>\.wslconfig)
[wsl2]
memory=8GB
processors=4
swap=2GB
```

**File Path Considerations**:
- Use WSL paths: `/home/user/` not `/mnt/c/`
- Docker volume mounts work best with WSL filesystem

### Performance Optimization Tips

**Docker Layer Caching**:
```bash
# Enable BuildKit
export DOCKER_BUILDKIT=1

# Use cache mounts in Dockerfiles
RUN --mount=type=cache,target=/root/.gradle ./gradlew build
RUN --mount=type=cache,target=/root/.npm npm ci
```

**Gradle Caching**:
```bash
# Cache directory location
~/.gradle/caches

# Enable in gradle.properties
org.gradle.caching=true
org.gradle.parallel=true
```

**npm Caching**:
```bash
# Cache directory
~/.npm

# Use offline mode after first run
npm ci --prefer-offline
```

**Container Reuse** (enabled by default in `.actrc`):
```bash
# Reuse containers between runs (faster)
act --reuse

# Clean rebuild when needed
act --rm
```

### Validation Scenarios

For comprehensive troubleshooting validation, see [quickstart.md](./quickstart.md):
- Scenario 1: First-Time Setup
- Scenario 5: Resource Constraint Handling
- Scenario 6: Log Export for Debugging
- Scenario 7: Complete Cleanup

### Still Having Issues?

1. **Export logs**:
   ```bash
   ./scripts/export-logs.sh ./troubleshooting-logs
   ```

2. **Check service health**:
   ```bash
   docker-compose -f docker/docker-compose.yaml ps
   ```

3. **Verify resources**:
   ```bash
   ./scripts/validate-resources.sh
   ```

4. **Review documentation**:
   - [Prerequisites & Version Requirements](#prerequisites--version-requirements)
   - [Resource Requirements & Optimization](#resource-requirements--optimization)
   - [Cross-Platform Considerations](#cross-platform-considerations)

## 💻 Resource Requirements & Optimization

### System Requirements

#### Minimum Requirements

| Resource | Minimum | Recommended | Purpose |
|----------|---------|-------------|---------|
| **RAM** | 8GB | 16GB | Docker containers + host OS |
| **CPU** | 4 cores | 8 cores | Parallel test execution |
| **Disk** | 20GB | 60GB+ | Images, volumes, artifacts |
| **Network** | Stable | Fast | Image pulls, ACT downloads |

**Note**: These requirements are for **Docker allocation**, not total system resources. Your host system should have more available.

#### Docker Resource Allocation

**macOS / Windows (Docker Desktop)**:
```bash
# Check current allocation
docker info --format '{{.MemTotal}}' | numfmt --to=iec-i --suffix=B
docker info --format '{{.NCPU}}'

# Adjust resources:
# Docker Desktop → Settings → Resources
#   Memory: 8GB minimum, 16GB recommended
#   CPUs: 4 minimum, 8 recommended
#   Disk Image Size: 60GB+ recommended
```

**Linux (Native Docker)**:
```bash
# Check system resources
docker info | grep -E "Total Memory|CPUs"

# Linux uses host resources directly
# Ensure adequate free memory: free -h
# CPU cores available: nproc
```

### Resource Validation

Run resource validation before testing:

```bash
# Automated validation (fail-fast on constraints)
./scripts/validate-resources.sh

# Expected output:
# ✓ Docker daemon running
# ✓ Memory available: 16GB (minimum: 8GB)
# ✓ CPUs available: 8 (minimum: 4)
# ✓ Disk space available: 85GB (minimum: 20GB)
# ✓ ACT tool installed (v0.2.82)
```

**Exit Codes**:
- `0`: All requirements met
- `3`: Resource constraint violation
- `4`: Prerequisites missing

### Performance Targets

#### Execution Time Goals

| Test Type | Target | Typical | Notes |
|-----------|--------|---------|-------|
| **Backend** | <7 min | 5-7 min | Includes Gradle build + tests |
| **Frontend** | <4 min | 3-4 min | Includes npm install + build |
| **Integration** | <6 min | 4-6 min | All 4 services + API tests |
| **Total (Comprehensive)** | <10 min | 8-10 min | All workflows sequentially |

**Performance tracked automatically** by test scripts with warnings if targets exceeded.

### Caching Strategies

#### Docker Layer Caching

Enable BuildKit for optimal layer caching:

```bash
# Enable BuildKit (add to ~/.bashrc or ~/.zshrc)
export DOCKER_BUILDKIT=1

# Verify BuildKit is active
docker buildx version
```

**Cache mount example** (in Dockerfiles):
```dockerfile
# Backend (Gradle)
RUN --mount=type=cache,target=/root/.gradle \
    ./gradlew build --no-daemon

# Frontend (npm)
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline
```

#### Gradle Caching

**Cache location**: `~/.gradle/caches`

**Enable caching** (in `gradle.properties`):
```properties
org.gradle.caching=true
org.gradle.parallel=true
org.gradle.configureondemand=true
```

**Estimated savings**:
- Clean build: ~3-5 minutes
- Cached build: ~30-60 seconds
- **~80% time reduction**

#### npm Caching

**Cache location**: `~/.npm`

**Optimize npm usage**:
```bash
# Use ci for reproducible installs
npm ci --prefer-offline

# Clear cache if issues occur
npm cache clean --force
```

**Estimated savings**:
- Fresh install: ~2-3 minutes
- Cached install: ~15-30 seconds
- **~85% time reduction**

#### ACT Container Reuse

**Enabled by default** in `.actrc`:

```bash
# Container reuse (faster subsequent runs)
act --reuse

# Clean rebuild when needed
act --rm
```

**Benefits**:
- Skip container creation: ~10-20 seconds saved
- Preserve cache state: Faster dependency downloads
- **Trade-off**: Stale state possible, periodic `--rm` recommended

### Performance Optimization Tips

#### 1. Pre-pull Docker Images

```bash
# Pull common images before testing
docker pull catthehacker/ubuntu:act-22.04
docker pull postgres:16
docker pull redis:7-alpine

# Or use setup script
./scripts/setup.sh  # Includes image pre-pull
```

#### 2. Use Fast Disk Storage

- **macOS**: Store project on APFS volume (not network drive)
- **Linux**: Use SSD with ext4/xfs filesystem
- **Windows WSL**: Store in WSL filesystem (`/home/`), not `/mnt/c/`

#### 3. Allocate Sufficient Swap

```bash
# Linux - Check swap
free -h

# Recommended: 4-8GB swap for 16GB RAM systems

# Windows WSL - Configure in .wslconfig
[wsl2]
swap=4GB
```

#### 4. Close Resource-Intensive Applications

Before running comprehensive tests:
- Close IDEs, browsers with many tabs
- Stop other Docker containers: `docker stop $(docker ps -q)`
- Disable background backup services temporarily

#### 5. Monitor Resource Usage

```bash
# Real-time Docker stats
docker stats

# Disk usage
docker system df

# Clean up unused resources
docker system prune -a --volumes  # Warning: removes all unused data
```

### Disk Space Management

#### Current Usage

```bash
# Check Docker disk usage
docker system df

# Detailed breakdown
docker system df -v
```

#### Cleanup Strategies

```bash
# Remove stopped containers (safe)
docker container prune -f

# Remove unused volumes (safe if no active workflows)
docker volume prune -f

# Remove unused images (aggressive, will re-download)
docker image prune -a -f

# Complete cleanup (use with caution)
./scripts/cleanup.sh --force --remove-network
```

#### Prevent Disk Exhaustion

- **Minimum free space**: 20GB for operations
- **Recommended**: 60GB+ for comfortable development
- **Set limit in Docker Desktop**: Disk Image Size limit prevents runaway growth

### Platform-Specific Optimizations

See [Cross-Platform Considerations](#cross-platform-considerations) for:
- macOS: VirtioFS enablement, ARM64 vs AMD64 performance
- Linux: Native Docker advantages, cgroup optimization
- Windows WSL: Memory allocation, filesystem performance

## 🌐 Cross-Platform Considerations

This infrastructure is designed to work across macOS, Linux, and Windows WSL with platform-specific optimizations.

### macOS Specifics

#### Docker Desktop Virtual Machine

Docker Desktop for macOS runs containers in a lightweight VM (using HyperKit or QEMU):

**Implications**:
- File system operations have overhead compared to native Linux
- Resource limits enforced by VM, not host directly
- Networking requires special consideration for host access

**Optimization**:
```bash
# Enable VirtioFS for better file sync performance (macOS 13+)
# Docker Desktop → Settings → General → "Enable VirtioFS"

# Verify VirtioFS is enabled
docker info | grep "ostype"
```

#### M1/M2 Apple Silicon (ARM64) Architecture

**Default behavior**: Docker Desktop runs ARM64 containers natively

**Platform selection**:
```bash
# Use ARM64 images (best performance, no emulation)
act --container-architecture linux/arm64

# Force AMD64 with QEMU emulation (slower, for compatibility)
act --container-architecture linux/amd64

# Check current platform
docker info | grep "Architecture"
```

**Performance comparison**:
- ARM64 native: ~2x faster than AMD64 emulation
- Use ARM64 when available
- Some CI/CD workflows require AMD64 for production parity

#### Host Access from Containers

**Use special DNS name**:
```bash
# Access host services from container
host.docker.internal  # Resolves to host IP

# Example: Connect to host database
DATABASE_URL=postgres://user:pass@host.docker.internal:5432/db
```

#### File Sync Performance

**Best practices**:
- Store project on local APFS volume (not network drives)
- Use named Docker volumes for frequently accessed data
- Avoid `/Users/Shared/` or network-mounted paths
- Enable VirtioFS for ~40% faster bind mount performance

**Cache locations** (optimize these paths):
```bash
~/.gradle/caches  # Gradle cache
~/.npm            # npm cache
~/.m2             # Maven cache (if used)
```

#### Resource Allocation

```bash
# Recommended settings:
# Docker Desktop → Settings → Resources
Memory: 16GB (minimum 8GB)
CPUs: 8 (minimum 4)
Disk: 60GB+
Swap: 2GB

# Check allocation
docker info --format '{{.MemTotal}} {{.NCPU}}'
```

### Linux Specifics

#### Native Docker Performance Advantages

Linux runs Docker containers natively without VM overhead:

**Benefits**:
- **Best performance**: No virtualization layer
- **Direct resource access**: Full CPU, memory, disk performance
- **Optimal I/O**: Native filesystem operations
- **Lower latency**: Direct kernel access

**Setup for best performance**:
```bash
# Use Docker Engine (not Docker Desktop)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group (no sudo required)
sudo usermod -aG docker $USER
newgrp docker

# Verify
docker run hello-world
```

#### cgroup Configuration

**cgroup v2** (recommended for resource management):
```bash
# Check cgroup version
cat /proc/filesystems | grep cgroup

# Enable cgroup v2 (if needed)
# Add to kernel parameters: systemd.unified_cgroup_hierarchy=1
sudo grubby --update-kernel=ALL --args="systemd.unified_cgroup_hierarchy=1"
sudo reboot
```

**Resource limits** (optional, enforced via cgroups):
```bash
# Edit /etc/docker/daemon.json
{
  "default-ulimits": {
    "memlock": {"Hard": -1, "Name": "memlock", "Soft": -1}
  },
  "storage-driver": "overlay2"
}

sudo systemctl restart docker
```

#### Host Access from Containers

**Gateway IP method**:
```bash
# Get Docker bridge gateway IP
docker network inspect bridge | grep Gateway
# Typically: 172.17.0.1

# Use in container to access host
DATABASE_URL=postgres://user:pass@172.17.0.1:5432/db
```

**host.docker.internal method** (add to /etc/hosts):
```bash
# Add entry for compatibility with macOS/Windows scripts
echo "172.17.0.1 host.docker.internal" | sudo tee -a /etc/hosts
```

#### User Namespace Remapping (Security)

**Enable for production**:
```bash
# Edit /etc/docker/daemon.json
{
  "userns-remap": "default"
}

# Restart Docker
sudo systemctl restart docker

# Note: This changes UID/GID mappings, may affect volume permissions
```

#### Performance Monitoring

```bash
# Real-time resource usage
docker stats

# System resources
htop  # or top
free -h
df -h

# cgroup resource usage
cat /sys/fs/cgroup/docker/*/memory.usage_in_bytes
```

### Windows WSL Specifics

#### WSL2 Integration Requirements

**Docker Desktop WSL2 backend** is required:

**Setup**:
```powershell
# Install WSL2
wsl --install -d Ubuntu-22.04
wsl --set-default-version 2

# Verify WSL2
wsl --list --verbose  # Should show VERSION 2
```

**Enable Docker integration**:
1. Docker Desktop → Settings → Resources → WSL Integration
2. Enable integration for your Ubuntu distribution
3. Restart WSL terminal

#### File Path Considerations

**Critical performance difference**:

| Location | Performance | Use Case |
|----------|-------------|----------|
| `/home/<user>/` | Fast (native WSL filesystem) | **Recommended for projects** |
| `/mnt/c/Users/<user>/` | Slow (9p network mount) | Only for Windows interop |

**Migration**:
```bash
# Move project to WSL filesystem
cd /home/$USER
git clone https://github.com/your-org/nosilha.git

# Avoid: /mnt/c/Users/$USER/projects/ (slow)
```

#### Memory Allocation to WSL2

**Configure .wslconfig** (C:\Users\<user>\.wslconfig):
```ini
[wsl2]
memory=16GB      # Limit WSL2 memory (recommended: 50-75% of host RAM)
processors=8     # Number of CPU cores
swap=4GB         # Swap space
localhostForwarding=true
```

**Apply changes**:
```powershell
# Restart WSL
wsl --shutdown
# Open new WSL terminal
```

**Verify allocation**:
```bash
# Inside WSL
free -h  # Check memory
nproc    # Check CPUs
```

#### Filesystem Performance

**Best practices**:
- Store Docker volumes in WSL filesystem
- Use `/home/` paths, not `/mnt/c/`
- Enable metadata support in `/etc/wsl.conf`:

```bash
# /etc/wsl.conf
[automount]
options = "metadata,umask=22,fmask=11"
```

#### Port Forwarding

Ports are automatically forwarded from WSL to Windows:
```bash
# Service on WSL port 8080 accessible from Windows
# http://localhost:8080
```

**Firewall considerations**:
- Windows Firewall may block ports
- Allow Docker Desktop through firewall

#### Docker Desktop Integration

**Access Docker from WSL**:
```bash
# Verify Docker is available
docker --version
docker-compose --version

# Docker context should be "desktop-linux"
docker context show
```

### Platform Comparison Matrix

| Feature | macOS | Linux | Windows WSL |
|---------|-------|-------|-------------|
| **Performance** | Good (VM overhead) | Excellent (native) | Good (VM overhead) |
| **File I/O** | Moderate (VirtioFS) | Excellent | Slow (/mnt/c), Good (/home) |
| **CPU Efficiency** | Good (ARM64), Fair (AMD64) | Excellent | Good |
| **Setup Complexity** | Easy (Docker Desktop) | Moderate (manual) | Easy (Docker Desktop) |
| **Resource Control** | GUI (Docker Desktop) | systemd/cgroups | .wslconfig file |
| **Host Access** | host.docker.internal | 172.17.0.1 or hosts | host.docker.internal |

### Tested Platforms

This infrastructure has been tested and verified on:

- ✅ macOS 13+ (Ventura, Sonoma) - Intel x86_64 and Apple Silicon ARM64
- ✅ Ubuntu 22.04 LTS - x86_64 with Docker Engine
- ✅ Debian 12 - x86_64 with Docker Engine
- ✅ Windows 11 with WSL2 (Ubuntu 22.04) - Docker Desktop

**Compatibility notes**:
- macOS 12 and earlier: VirtioFS not available, use gRPC FUSE
- Windows 10: Requires WSL2 backend enabled
- Other Linux distributions: Should work with Docker Engine 20.10+

### Platform-Specific Troubleshooting

#### macOS: Slow Performance

1. Enable VirtioFS
2. Increase Docker resource allocation
3. Use ARM64 containers on Apple Silicon
4. Avoid network drives

#### Linux: Permission Issues

1. Add user to docker group
2. Check SELinux/AppArmor policies
3. Verify volume mount permissions

#### Windows WSL: Slow or Connection Issues

1. Move project to `/home/` (not `/mnt/c/`)
2. Increase WSL2 memory in `.wslconfig`
3. Verify Docker Desktop integration enabled
4. Check Windows Firewall settings

## 🧹 Cleanup

### Basic Cleanup
```bash
# Stop services and remove containers
./scripts/clean.sh
```

### Full Cleanup
```bash
# Remove everything including images and cache
./scripts/clean.sh --all --force
```

### Manual Cleanup
```bash
# Remove specific containers
docker rm -f $(docker ps -aq --filter "label=act")

# Remove test volumes
docker volume rm $(docker volume ls -q --filter "name=act_")

# Remove network
docker network rm act-testing
```

## 📊 Workflow Coverage

This testing setup supports all current Nos Ilha workflows:

- ✅ **Backend CI/CD** (`backend-ci.yml`)
- ✅ **Frontend CI/CD** (`frontend-ci.yml`)
- ✅ **Integration Tests** (`integration-ci.yml`)
- ✅ **Infrastructure** (`infrastructure-ci.yml`)
- ✅ **PR Validation** (`pr-validation.yml`)

## 🔄 Integration with Development Workflow

### Pre-commit Testing
```bash
# Test changes before committing
./scripts/test-workflows.sh backend push

# If tests pass, commit and push
git add .
git commit -m "feat: your changes"
git push
```

### Feature Development
```bash
# 1. Make changes to workflow
vim .github/workflows/backend-ci.yml

# 2. Test locally
./scripts/test-backend.sh

# 3. Iterate until working
# 4. Commit and push
```

### Debugging Failed CI
```bash
# 1. Pull latest changes
git pull

# 2. Test the same workflow locally
./scripts/test-workflows.sh backend push --verbose

# 3. Fix issues and test again
# 4. Push fixes
```

## 🎯 Best Practices

1. **Always test locally before pushing**
2. **Use specific job testing for faster feedback**
3. **Clean up containers regularly to save disk space**
4. **Keep secrets.env secure and never commit it**
5. **Update event payloads to match your actual GitHub context**
6. **Use dry-run for syntax validation**
7. **Start with backend/frontend tests before integration tests**

## 📚 Additional Resources

- [Act Documentation](https://nektosact.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nos Ilha CI/CD Pipeline Documentation](../../docs/CI_CD_PIPELINE.md)

## 🆘 Getting Help

1. **Check this README** for common solutions
2. **Run setup script** to verify configuration
3. **Check Docker logs** for service issues
4. **Use verbose mode** for detailed output
5. **Clean and restart** if things get stuck

---

**Happy Testing! 🚀**

This infrastructure enables fast, reliable local testing of your GitHub Actions workflows, saving time and reducing the need for trial-and-error commits.