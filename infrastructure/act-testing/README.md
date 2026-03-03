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

## 📋 Prerequisites

- **Docker**: Ensure Docker is installed and running
- **Act**: Will be installed automatically by setup script if missing
- **Secrets**: GitHub token, GCP credentials, etc. (see Configuration section)

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
    ├── docker-compose.act.yml  # Services for testing
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

The `docker-compose.act.yml` provides testing services:

- **PostgreSQL 15**: Database for backend tests
- **Firestore Emulator**: Metadata storage testing
- **GCS Emulator**: File storage testing
- **Redis**: Caching layer testing

### Service Management

```bash
# Start all services
docker-compose -f docker/docker-compose.act.yml up -d

# Stop services
docker-compose -f docker/docker-compose.act.yml down

# View service logs
docker-compose -f docker/docker-compose.act.yml logs

# Check service health
docker-compose -f docker/docker-compose.act.yml ps
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

### Common Issues

1. **"Act not found"**
   ```bash
   # Install act
   brew install act
   # Or run setup script
   ./scripts/setup.sh
   ```

2. **"Docker not running"**
   ```bash
   # Start Docker Desktop or Docker daemon
   sudo systemctl start docker  # Linux
   open -a Docker               # macOS
   ```

3. **"Secrets not found"**
   ```bash
   # Copy and edit secrets file
   cp config/secrets.env.example config/secrets.env
   vim config/secrets.env
   ```

4. **"Service connection failed"**
   ```bash
   # Check if services are running
   docker-compose -f docker/docker-compose.act.yml ps

   # Restart services
   docker-compose -f docker/docker-compose.act.yml restart
   ```

5. **"Network issues"**
   ```bash
   # Recreate network
   docker network rm act-testing
   docker network create act-testing
   ```

### Performance Issues

1. **Slow image downloads**
   ```bash
   # Pre-pull images
   docker pull catthehacker/ubuntu:act-22.04
   docker pull postgres:15
   ```

2. **Container startup delays**
   ```bash
   # Use container reuse (enabled by default in .actrc)
   act --reuse
   ```

3. **Large log output**
   ```bash
   # Reduce verbosity
   act push --quiet
   ```

### Debugging Workflows

1. **Enable verbose logging**
   ```bash
   ./scripts/test-workflows.sh backend push --verbose
   ```

2. **Dry run for syntax checking**
   ```bash
   ./scripts/test-workflows.sh backend push --dry-run
   ```

3. **Interactive debugging**
   ```bash
   # Use act with shell access
   act --shell
   ```

4. **Check specific step**
   ```bash
   # Run only specific job
   ./scripts/test-workflows.sh backend push --job "Run Tests"
   ```

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