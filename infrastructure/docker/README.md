# Infrastructure Setup for Nosilha Backend

This directory contains the infrastructure configuration files for the Nosilha project's local development environment.

## Local Development Environment

The local development setup uses Docker Compose to run PostgreSQL, matching the production database environment.

- **PostgreSQL 16**: Primary database for all structured data including media metadata

### Prerequisites

- Docker Desktop installed and running on your Mac
- Java 21 installed
- The backend Spring Boot application configured with Flyway migrations

### Project Structure

```
infrastructure/
├── docker/
│   ├── docker-compose.yml    # Container configuration
│   └── data/                 # Database persistent storage (auto-created)
└── terraform/
    ├── main.tf              # Core GCP infrastructure
    ├── cloudrun.tf          # Cloud Run deployment configuration
    └── variables.tf         # Terraform variables
```

## Services Overview

### Default Services (Always Running)
- **PostgreSQL 16** - Port 5432 - Primary database

### Profile-Based Services (Optional)
- **Backend** (`backend`) - Port 8080 - Spring Boot + Kotlin API
- **Frontend** (`frontend`) - Port 3000 - Next.js 16 with pnpm

## Getting Started

### 1. Start Default Services

From the project root directory (`nosilha`), run:

```bash
cd infrastructure/docker && docker-compose up -d
```

**What this command does:**

- Downloads required Docker images (PostgreSQL)
- Starts PostgreSQL database on `localhost:5432`
- Creates persistent storage in `infrastructure/docker/data/`

### 1b. (Optional) Start with Frontend

To also run the frontend in Docker:

```bash
cd infrastructure/docker && docker-compose --profile frontend up -d
```

**Additional setup required:**
1. Copy `.env.example` to `.env`
2. Fill in required environment variables:
   - `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Frontend Performance:**
- **First build**: ~35 seconds (using pnpm)
- **Rebuild with cache**: ~1-2 seconds (BuildKit cache)
- Access at: http://localhost:3000

### 1c. (Optional) Start with Backend

To run the backend in Docker instead of using gradlew:

**One-time setup** (build the backend image):
```bash
cd backend
./gradlew bootBuildImage --imageName=nosilha-backend:local
```

Then start with Docker Compose:
```bash
cd infrastructure/docker && docker-compose --profile backend up -d
```

**Backend endpoints:**
- API: http://localhost:8080/api/v1/directory/
- Swagger UI: http://localhost:8080/swagger-ui.html
- Health check: http://localhost:8080/actuator/health

**Note**: For active backend development, using `./gradlew bootRun` is faster than rebuilding the Docker image. The Docker backend profile is useful for full-stack testing or when you need the entire system running in containers.

### 1d. (Optional) Start Full Stack

To run both frontend and backend in Docker:
```bash
cd infrastructure/docker && docker-compose --profile frontend --profile backend up -d
```

This starts all services: database, backend API, and frontend app. Services communicate via Docker network using service names.

### 2. Run the Spring Boot Application (Traditional Method)

#### Option A: Using IntelliJ IDEA

1. Open the `NosIlhaCoreApplication.kt` file in your IDE
2. Click the green play button next to the main method
3. Edit the run configuration:
   - Go to **Run** → **Edit Configurations**
   - In **Active profiles** field, enter: `local`
   - Or add to **Program arguments**: `--spring.profiles.active=local`
4. Run the application

#### Option B: Using VS Code

1. Open the integrated terminal in VS Code
2. Navigate to the backend directory and run:

```bash
cd backend
./gradlew bootRun --args='--spring.profiles.active=local'
```

#### Option C: Command Line (from project root)

```bash
# Navigate to backend and run with Gradle
cd backend
./gradlew bootRun --args='--spring.profiles.active=local'

# Alternative: Build and run the JAR
./gradlew build
java -Dspring.profiles.active=local -jar build/libs/*-SNAPSHOT.jar
```

#### Option D: Using Environment Variable

```bash
cd backend
export SPRING_PROFILES_ACTIVE=local
./gradlew bootRun
```

### 3. Verify the Setup

When everything is working correctly, you should see:

1. **Database startup logs** (check with `docker-compose logs db`):
   ```
   database system is ready to accept connections
   ```

2. **Spring Boot application logs** showing:
   ```
   The following 1 profile is active: "local"
   Started NosIlhaCoreApplication in X.XXX seconds
   Flyway successfully applied migrations
   ```

3. **API available at:** `http://localhost:8080/api/v1/directory/`

## Database Management

### Connecting to PostgreSQL

Connect using any database client with these credentials:
- **Host:** `localhost`
- **Port:** `5432`
- **Database:** `nosilha_db`
- **Username:** `nosilha`
- **Password:** `nosilha`

### Useful Docker Commands

```bash
# Start default services (database only)
cd infrastructure/docker && docker-compose up -d

# Start with specific profiles
cd infrastructure/docker && docker-compose --profile backend up -d
cd infrastructure/docker && docker-compose --profile frontend up -d
cd infrastructure/docker && docker-compose --profile frontend --profile backend up -d

# Stop all services (keeps data)
cd infrastructure/docker && docker-compose down

# View logs for specific services
cd infrastructure/docker && docker-compose logs -f db
cd infrastructure/docker && docker-compose logs -f backend
cd infrastructure/docker && docker-compose logs -f frontend

# Restart specific services
cd infrastructure/docker && docker-compose restart db
cd infrastructure/docker && docker-compose restart backend
cd infrastructure/docker && docker-compose restart frontend

# Rebuild backend image after code changes
cd backend && ./gradlew bootBuildImage --imageName=nosilha-backend:local

# Stop and remove all services with data (⚠️ destructive!)
cd infrastructure/docker && docker-compose down -v
```

### Data Persistence

- Database data is stored in `infrastructure/docker/data/`
- Data persists between container restarts
- To completely reset the database, stop the container and delete the `data` folder

## Media Storage

- **Development**: Media files are stored on the local filesystem in the `./uploads` directory
- **Production**: Cloud storage integration (deferred)

The backend automatically creates the uploads directory on startup. Uploaded files are served via the `/api/v1/media/files/{fileName}` endpoint.

## Development Workflow

Here's the recommended daily development workflow:

```bash
# 1. Start your development session
cd nosilha

# 2. Start the database
cd infrastructure/docker && docker-compose up -d

# 3. Start your Spring Boot app (choose one method from above)
cd ../backend
./gradlew bootRun --args='--spring.profiles.active=local'

# 4. Your API endpoints will be available at:
# - GET http://localhost:8080/api/v1/directory/entries
# - GET http://localhost:8080/api/v1/directory/entries?category=Restaurant
# - GET http://localhost:8080/api/v1/directory/{id}
# - GET http://localhost:8080/api/v1/directory/slug/{slug}

# 5. End your session
# Stop the app with Ctrl+C, then optionally stop the database:
cd infrastructure/docker && docker-compose down
```

## Troubleshooting

### Database Issues

**If the database won't start:**

- Check if port 5432 is already in use: `lsof -i :5432`
- Ensure Docker Desktop is running
- Check Docker logs: `docker-compose logs db`

**If you get connection refused errors:**

- Verify the container is running: `docker ps`
- Check if the container is healthy: `docker-compose ps`

### Spring Boot Issues

**If the app can't connect to the database:**

- Ensure you're using the `local` profile
- Check that the database container is running
- Verify the connection details in `application-local.properties`

**If Flyway migrations fail:**

- Check the SQL syntax in migration files
- Ensure the database is empty for the first migration
- Check Flyway logs in the application output

### Backend Docker Issues

**If backend image doesn't exist:**

```bash
cd backend
./gradlew bootBuildImage --imageName=nosilha-backend:local
```

**If backend won't start:**

- Check if port 8080 is already in use: `lsof -i :8080`
- Verify the database is running: `docker-compose ps db`
- Check backend logs: `docker-compose logs backend`
- Verify environment variables in `.env` file

**If backend can't connect to services:**

- Ensure services are on the same Docker network
- Use service names (not localhost): `db:5432`
- Check health status: `docker-compose ps`

**If you need to rebuild after code changes:**

```bash
cd backend
./gradlew bootBuildImage --imageName=nosilha-backend:local
cd ../infrastructure/docker
docker-compose restart backend
```

### Performance Tips

- Keep the database container running between development sessions to avoid startup time
- For active backend development, use `./gradlew bootRun` instead of Docker (faster iteration)
- Frontend Docker builds use BuildKit cache for ~99% cache hit rate on rebuilds
- The `data` directory will grow over time; periodically clean it up if needed
- Use `docker-compose down -v` to completely reset if you encounter persistent issues

## Production Notes

This local setup mirrors the production environment structure:

- Same PostgreSQL version as used in Supabase
- Same database schema via Flyway migrations
- Same Spring Boot configuration patterns

The only differences are connection strings and credentials, making deployment straightforward.
