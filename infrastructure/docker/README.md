# Infrastructure Setup for Nosilha Backend

This directory contains the infrastructure configuration files for the Nosilha project's local development environment.

## Local Development Environment

The local development setup uses Docker Compose to run multiple services that match the Google Cloud Platform production environment:

- **PostgreSQL 16**: Primary database for structured data
- **Firestore Emulator**: Flexible metadata storage for AI-processed content
- **Google Cloud Storage Emulator**: Media asset storage emulation

### Prerequisites

- Docker Desktop installed and running on your Mac
- Java 21 installed
- The backend Spring Boot application configured with Flyway migrations

### Project Structure

```
infrastructure/
├── docker/
│   ├── docker-compose.yml    # Multi-service container configuration
│   └── data/                # Database persistent storage (auto-created)
└── terraform/
    ├── main.tf              # Core GCP infrastructure
    ├── cloudrun.tf          # Cloud Run deployment configuration
    └── variables.tf         # Terraform variables
```

## Getting Started

### 1. Start the Database

From the project root directory (`nosilha`), run:

```bash
cd infrastructure/docker && docker-compose up -d
```

**What this command does:**

- Downloads required Docker images (PostgreSQL, Google Cloud SDK, fake-gcs-server)
- Starts all services in detached mode:
  - PostgreSQL database on `localhost:5432`
  - Firestore emulator on `localhost:8081`
  - Google Cloud Storage emulator on `localhost:8082`
- Creates persistent storage in `infrastructure/docker/data/`

### 2. Run the Spring Boot Application

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
   Flyway successfully applied 1 migration(s)
   ```

3. **API available at:** `http://localhost:8080/api/v1/directory/`

## Database Management

### Connecting to Services

#### PostgreSQL Database
Connect using any database client with these credentials:
- **Host:** `localhost`
- **Port:** `5432`
- **Database:** `nosilha_db`
- **Username:** `nosilha`
- **Password:** `nosilha`

#### Firestore Emulator
- **URL:** `http://localhost:8081`
- **Project ID:** Configure in your application as needed

#### Google Cloud Storage Emulator
- **URL:** `http://localhost:8082`
- **Access:** Configure your application to use this endpoint for local development

### Useful Docker Commands

```bash
# Start all services
cd infrastructure/docker && docker-compose up -d

# Stop all services (keeps data)
cd infrastructure/docker && docker-compose down

# View logs for specific services
cd infrastructure/docker && docker-compose logs -f db
cd infrastructure/docker && docker-compose logs -f firestore-emulator
cd infrastructure/docker && docker-compose logs -f gcs-emulator

# Restart specific services
cd infrastructure/docker && docker-compose restart db
cd infrastructure/docker && docker-compose restart firestore-emulator

# Stop and remove all services with data (⚠️ destructive!)
cd infrastructure/docker && docker-compose down -v
```

### Data Persistence

- Database data is stored in `infrastructure/docker/data/`
- Data persists between container restarts
- To completely reset the database, stop the container and delete the `data` folder

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

### Emulator Issues

**If Firestore emulator won't start:**

- Check if port 8081 is already in use: `lsof -i :8081`
- Ensure Google Cloud SDK image is available
- Check emulator logs: `docker-compose logs firestore-emulator`

**If GCS emulator won't start:**

- Check if port 8082 is already in use: `lsof -i :8082`
- Verify fake-gcs-server image is available
- Check emulator logs: `docker-compose logs gcs-emulator`

**If your application can't connect to emulators:**

- Verify emulator URLs in your application configuration
- For Firestore: Set `FIRESTORE_EMULATOR_HOST=localhost:8081`
- For GCS: Configure your client to use `http://localhost:8082`

### Performance Tips

- Keep the database container running between development sessions to avoid startup time
- The `data` directory will grow over time; periodically clean it up if needed
- Use `docker-compose down -v` to completely reset if you encounter persistent issues

## Production Notes

This local setup mirrors the production environment structure:

- Same PostgreSQL version as used in Supabase
- Same database schema via Flyway migrations
- Same Spring Boot configuration patterns

The only differences are connection strings and credentials, making deployment straightforward.
