# Infrastructure Setup

## Quick Start

Using [Taskfile](https://taskfile.dev/) from the project root:

```bash
task check     # verify prerequisites
task setup     # copy env templates, install web deps
task dev       # start API (auto-starts postgres) + web in parallel
task stop      # stop database container
```

Or manually:

```bash
cd apps/api && ./gradlew bootRun --args='--spring.profiles.active=local'
# Spring Boot auto-starts postgres via spring-boot-docker-compose
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
| Start DB | `task dev:db` or `docker compose up -d` |
| Stop all | `task stop` or `docker compose down` |
| View DB logs | `docker compose logs -f db` |
| Reset DB (destructive) | `docker compose down -v` |
| Connect psql | `docker compose exec db psql -U nosilha -d nosilha_db` |

## Troubleshooting

### Database Won't Start

- Check if port 5432 is in use: `lsof -i :5432`
- Ensure Docker Desktop is running
- Check logs: `docker compose logs db`

### Connection Refused

- Verify container is running: `docker ps`
- Check container health: `docker compose ps`

### Spring Boot Can't Connect

- Ensure you're using the `local` profile
- Verify the database container is running (`docker ps`)
- Check `application-local.yml` has the `spring.docker.compose` section

### Flyway Migration Failures

- Check SQL syntax in migration files
- Ensure database is empty for first migration
- Review Flyway logs in application output

### Performance Tips

- `lifecycle-management: start-only` keeps postgres running after app stops
- Use `docker compose down -v` to completely reset if encountering persistent issues

## Production Notes

This local setup mirrors production:

- Same PostgreSQL version as Supabase
- Same database schema via Flyway migrations
- Same Spring Boot configuration patterns

Only connection strings and credentials differ.
