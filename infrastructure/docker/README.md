# Infrastructure Setup

## Quick Start

**Start services:**
```bash
cd infrastructure/docker && docker-compose up -d
cd apps/api && ./gradlew bootRun --args='--spring.profiles.active=local'
```

**Stop services:**
```bash
cd infrastructure/docker && docker-compose down
```

**Verify:** API at http://localhost:8080/api/v1/directory/

## Service Reference

| Service | URL | Credentials |
|---------|-----|-------------|
| PostgreSQL | localhost:5432 | nosilha / nosilha / nosilha_db |
| API | localhost:8080/api/v1/ | - |
| Swagger | localhost:8080/swagger-ui.html | - |
| Health | localhost:8080/actuator/health | - |

## First-Time Setup

### Prerequisites

- Docker Desktop installed and running
- Java 25 installed
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

## Running Spring Boot

### Recommended: Gradle (fastest iteration)

```bash
cd apps/api
./gradlew bootRun --args='--spring.profiles.active=local'
```

### Alternative: IntelliJ IDEA

1. Open `NosIlhaCoreApplication.kt`
2. Click the green play button
3. Edit run configuration → **Active profiles**: `local`

### Alternative: Environment Variable

```bash
cd apps/api
export SPRING_PROFILES_ACTIVE=local
./gradlew bootRun
```

### Alternative: JAR Build

```bash
cd apps/api
./gradlew build
java -Dspring.profiles.active=local -jar build/libs/*-SNAPSHOT.jar
```

## Docker Profiles (Optional)

For full-stack containerized testing, optional profiles are available.

### Backend Profile

**One-time setup:**
```bash
cd apps/api && ./gradlew bootBuildImage --imageName=nosilha-backend:local
```

**Start:**
```bash
cd infrastructure/docker && docker-compose --profile backend up -d
```

### Frontend Profile

**Setup:**
1. Copy `.env.example` to `.env`
2. Fill in: `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Start:**
```bash
cd infrastructure/docker && docker-compose --profile frontend up -d
```

### Full Stack

```bash
cd infrastructure/docker && docker-compose --profile frontend --profile backend up -d
```

## Database Management

### Connection Details

- **Host:** localhost
- **Port:** 5432
- **Database:** nosilha_db
- **Username:** nosilha
- **Password:** nosilha

### Data Persistence

Database data is stored in `infrastructure/docker/data/` and persists between container restarts. To completely reset, stop containers and delete the `data` folder.

## Command Reference

| Action | Command |
|--------|---------|
| Start DB | `docker-compose up -d` |
| Stop all | `docker-compose down` |
| View DB logs | `docker-compose logs -f db` |
| Reset DB (destructive) | `docker-compose down -v` |
| Connect psql | `docker-compose exec db psql -U nosilha -d nosilha_db` |
| Rebuild backend image | `cd apps/api && ./gradlew bootBuildImage --imageName=nosilha-backend:local` |

## Troubleshooting

### Database Won't Start

- Check if port 5432 is in use: `lsof -i :5432`
- Ensure Docker Desktop is running
- Check logs: `docker-compose logs db`

### Connection Refused

- Verify container is running: `docker ps`
- Check container health: `docker-compose ps`

### Spring Boot Can't Connect

- Ensure you're using the `local` profile
- Verify the database container is running
- Check connection details in `application-local.properties`

### Flyway Migration Failures

- Check SQL syntax in migration files
- Ensure database is empty for first migration
- Review Flyway logs in application output

### Backend Docker Issues

- Port 8080 in use: `lsof -i :8080`
- Image doesn't exist: Rebuild with `./gradlew bootBuildImage --imageName=nosilha-backend:local`
- Can't connect to DB: Use service name `db:5432` (not localhost) in Docker network

### Performance Tips

- Keep database running between sessions to avoid startup time
- Use `./gradlew bootRun` for active backend development (faster than Docker)
- Use `docker-compose down -v` to completely reset if encountering persistent issues

## Production Notes

This local setup mirrors production:

- Same PostgreSQL version as Supabase
- Same database schema via Flyway migrations
- Same Spring Boot configuration patterns

Only connection strings and credentials differ.
