# GCloud Cloud Run Troubleshooting Guide

A comprehensive guide for troubleshooting Cloud Run services using gcloud commands, based on real-world scenarios and Google Cloud best practices.

## Quick Diagnostics Commands

### Service Health Check
```bash
# Check service status and configuration
gcloud run services describe [SERVICE-NAME] --region=[REGION]

# Get service URL and traffic allocation
gcloud run services describe [SERVICE-NAME] --region=[REGION] --format="value(status.url,status.traffic[].percent)"

# Check service conditions (Ready, ConfigurationsReady, RoutesReady)
gcloud run services describe [SERVICE-NAME] --region=[REGION] --format="value(status.conditions[].message,status.conditions[].reason,status.conditions[].type)"
```

### Immediate Error Detection
```bash
# Get recent ERROR-level logs (last 1 hour)
gcloud logging read 'resource.type="cloud_run_revision" AND resource.labels.service_name="[SERVICE-NAME]" AND severity>="ERROR"' --limit=20 --freshness=1h

# Check for common startup issues
gcloud logging read 'resource.type="cloud_run_revision" AND resource.labels.service_name="[SERVICE-NAME]" AND (textPayload:"Exception" OR textPayload:"Error" OR textPayload:"Failed")' --limit=10 --freshness=30m
```

## Service Status & Configuration Analysis

### Detailed Service Information
```bash
# Full service configuration with environment variables and secrets
gcloud run services describe [SERVICE-NAME] --region=[REGION] --format="export"

# Check resource allocation and scaling settings
gcloud run services describe [SERVICE-NAME] --region=[REGION] --format="table(spec.template.spec.containers[].resources.limits.memory,spec.template.spec.containers[].resources.limits.cpu,spec.template.spec.template.metadata.annotations.'autoscaling.knative.dev/maxScale')"

# View current revision status
gcloud run revisions list --service=[SERVICE-NAME] --region=[REGION] --format="table(metadata.name,status.conditions[0].status,spec.containers[0].image)"
```

### Service Account and Permissions
```bash
# Check service account being used
gcloud run services describe [SERVICE-NAME] --region=[REGION] --format="value(spec.template.spec.serviceAccountName)"

# List IAM policies for the service account
gcloud iam service-accounts get-iam-policy [SERVICE-ACCOUNT-EMAIL]
```

## Logging & Error Analysis

### Advanced Log Filtering
```bash
# Filter by severity levels
gcloud logging read 'resource.type="cloud_run_revision" AND resource.labels.service_name="[SERVICE-NAME]" AND severity>="ERROR"' --limit=50

# Filter by time range (last 24 hours)
gcloud logging read 'resource.type="cloud_run_revision" AND resource.labels.service_name="[SERVICE-NAME]"' --limit=100 --freshness=24h

# Search for specific error patterns
gcloud logging read 'resource.type="cloud_run_revision" AND resource.labels.service_name="[SERVICE-NAME]" AND textPayload:"[ERROR-PATTERN]"' --limit=20

# Formatted output for better readability
gcloud logging read 'resource.type="cloud_run_revision" AND resource.labels.service_name="[SERVICE-NAME]" AND severity>="WARNING"' --limit=30 --format="table(timestamp,severity,textPayload)"
```

### Database Connection Issues
```bash
# PostgreSQL connection errors
gcloud logging read 'resource.type="cloud_run_revision" AND resource.labels.service_name="[SERVICE-NAME]" AND (textPayload:"connection" OR textPayload:"postgresql" OR textPayload:"database")' --limit=20

# Database table/relation errors (like "relation does not exist")
gcloud logging read 'resource.type="cloud_run_revision" AND resource.labels.service_name="[SERVICE-NAME]" AND textPayload:"relation"' --limit=15

# SQL exceptions and JDBC errors
gcloud logging read 'resource.type="cloud_run_revision" AND resource.labels.service_name="[SERVICE-NAME]" AND (textPayload:"SQLException" OR textPayload:"JDBC" OR textPayload:"PSQLException")' --limit=20
```

### Application-Specific Errors
```bash
# Spring Boot application errors
gcloud logging read 'resource.type="cloud_run_revision" AND resource.labels.service_name="[SERVICE-NAME]" AND (textPayload:"org.springframework" OR textPayload:"APPLICATION FAILED TO START")' --limit=20

# JVM and memory issues
gcloud logging read 'resource.type="cloud_run_revision" AND resource.labels.service_name="[SERVICE-NAME]" AND (textPayload:"OutOfMemoryError" OR textPayload:"GC overhead" OR textPayload:"java.lang.OutOfMemoryError")' --limit=15

# Authentication and security errors
gcloud logging read 'resource.type="cloud_run_revision" AND resource.labels.service_name="[SERVICE-NAME]" AND (textPayload:"Unauthorized" OR textPayload:"403" OR textPayload:"401" OR textPayload:"JWT")' --limit=20
```

## Real-time Monitoring

### Live Log Streaming
```bash
# Tail logs in real-time (Beta feature)
gcloud beta run services logs tail [SERVICE-NAME] --region=[REGION]

# Tail only ERROR severity and above
gcloud beta run services logs tail [SERVICE-NAME] --region=[REGION] --log-filter="severity>=ERROR"

# Tail with custom filter
gcloud beta run services logs tail [SERVICE-NAME] --region=[REGION] --log-filter="textPayload:database OR textPayload:connection"
```

### Monitoring Service Health
```bash
# Watch service status changes
watch -n 10 'gcloud run services describe [SERVICE-NAME] --region=[REGION] --format="value(status.conditions[].type,status.conditions[].status)"'

# Monitor revision deployments
gcloud run revisions list --service=[SERVICE-NAME] --region=[REGION] --sort-by="~metadata.creationTimestamp" --limit=5
```

## Performance & Resource Analysis

### Resource Usage
```bash
# Check container resource limits and requests
gcloud run services describe [SERVICE-NAME] --region=[REGION] --format="value(spec.template.spec.containers[].resources.limits.memory,spec.template.spec.containers[].resources.limits.cpu)"

# View concurrency and timeout settings
gcloud run services describe [SERVICE-NAME] --region=[REGION] --format="value(spec.template.spec.containerConcurrency,spec.template.spec.timeoutSeconds)"

# Check scaling configuration
gcloud run services describe [SERVICE-NAME] --region=[REGION] --format="value(spec.template.metadata.annotations.'autoscaling.knative.dev/maxScale',spec.template.metadata.annotations.'autoscaling.knative.dev/minScale')"
```

### Performance Metrics
```bash
# Request logs with response times and status codes
gcloud logging read 'resource.type="cloud_run_revision" AND resource.labels.service_name="[SERVICE-NAME]" AND logName="projects/[PROJECT-ID]/logs/run.googleapis.com%2Frequests"' --limit=20 --format="table(timestamp,httpRequest.status,httpRequest.latency)"

# Cold start indicators
gcloud logging read 'resource.type="cloud_run_revision" AND resource.labels.service_name="[SERVICE-NAME]" AND textPayload:"started"' --limit=10 --freshness=1h
```

## Common Error Patterns & Solutions

### Database Migration Issues
**Error Pattern**: `ERROR: relation "table_name" does not exist`
```bash
# Find migration-related errors
gcloud logging read 'resource.type="cloud_run_revision" AND resource.labels.service_name="[SERVICE-NAME]" AND (textPayload:"relation" AND textPayload:"does not exist")' --limit=10

# Check Flyway migration logs
gcloud logging read 'resource.type="cloud_run_revision" AND resource.labels.service_name="[SERVICE-NAME]" AND textPayload:"flyway"' --limit=15
```

### Service Startup Failures
**Error Pattern**: Service starts but immediately fails
```bash
# Check initialization errors
gcloud logging read 'resource.type="cloud_run_revision" AND resource.labels.service_name="[SERVICE-NAME]" AND (textPayload:"Failed to start" OR textPayload:"Application startup failed")' --limit=10

# Port and health check issues
gcloud logging read 'resource.type="cloud_run_revision" AND resource.labels.service_name="[SERVICE-NAME]" AND (textPayload:"port" OR textPayload:"health")' --limit=10
```

### Authentication & Authorization Issues
**Error Pattern**: 403, 401, or JWT errors
```bash
# Find auth-related errors
gcloud logging read 'resource.type="cloud_run_revision" AND resource.labels.service_name="[SERVICE-NAME]" AND (httpRequest.status="403" OR httpRequest.status="401")' --limit=20

# Service account and permissions
gcloud logging read 'resource.type="cloud_run_revision" AND resource.labels.service_name="[SERVICE-NAME]" AND (textPayload:"permission denied" OR textPayload:"insufficient permissions")' --limit=15
```

## Troubleshooting Workflows

### Workflow 1: Service Won't Start
1. **Check service status**:
   ```bash
   gcloud run services describe [SERVICE-NAME] --region=[REGION]
   ```

2. **Look for startup errors**:
   ```bash
   gcloud logging read 'resource.type="cloud_run_revision" AND resource.labels.service_name="[SERVICE-NAME]" AND severity>="ERROR"' --limit=20 --freshness=1h
   ```

3. **Check resource constraints**:
   ```bash
   gcloud logging read 'resource.type="cloud_run_revision" AND resource.labels.service_name="[SERVICE-NAME]" AND (textPayload:"memory" OR textPayload:"timeout")' --limit=10
   ```

### Workflow 2: Database Connection Issues
1. **Identify database errors**:
   ```bash
   gcloud logging read 'resource.type="cloud_run_revision" AND resource.labels.service_name="[SERVICE-NAME]" AND (textPayload:"connection" OR textPayload:"database" OR textPayload:"postgresql")' --limit=20
   ```

2. **Check for missing tables**:
   ```bash
   gcloud logging read 'resource.type="cloud_run_revision" AND resource.labels.service_name="[SERVICE-NAME]" AND textPayload:"does not exist"' --limit=10
   ```

3. **Verify connection string and secrets**:
   ```bash
   gcloud run services describe [SERVICE-NAME] --region=[REGION] --format="value(spec.template.spec.containers[].env[].name,spec.template.spec.containers[].env[].valueFrom.secretKeyRef.name)"
   ```

### Workflow 3: Performance Issues
1. **Check request logs**:
   ```bash
   gcloud logging read 'resource.type="cloud_run_revision" AND resource.labels.service_name="[SERVICE-NAME]" AND logName="projects/[PROJECT-ID]/logs/run.googleapis.com%2Frequests"' --limit=20 --format="table(timestamp,httpRequest.status,httpRequest.latency,httpRequest.requestUrl)"
   ```

2. **Look for timeout issues**:
   ```bash
   gcloud logging read 'resource.type="cloud_run_revision" AND resource.labels.service_name="[SERVICE-NAME]" AND (textPayload:"timeout" OR httpRequest.status="504")' --limit=15
   ```

3. **Check scaling behavior**:
   ```bash
   gcloud logging read 'resource.type="cloud_run_revision" AND resource.labels.service_name="[SERVICE-NAME]" AND textPayload:"scaling"' --limit=10
   ```

## Useful Command Aliases

Create aliases for frequently used commands:

```bash
# Add to your ~/.bashrc or ~/.zshrc
alias crlogserr='gcloud logging read "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"$1\" AND severity>=\"ERROR\"" --limit=20 --freshness=1h'
alias crdesc='gcloud run services describe "$1" --region="$2"'
alias crlogs='gcloud logging read "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"$1\"" --limit=30 --freshness=1h'
alias crtail='gcloud beta run services logs tail "$1" --region="$2"'
```

Usage:
```bash
crlogserr your-service-name
crdesc your-service-name us-east1
crlogs your-service-name
crtail your-service-name us-east1
```

## Tips and Best Practices

### Log Analysis Tips
- Use `--format="table(...)"` for better readability in terminal
- Combine multiple filters with `AND` and `OR` operators
- Use `--freshness` to limit time scope and improve performance
- Use `--limit` to control output size for large log volumes

### Monitoring Best Practices
- Set up log-based alerts for critical errors
- Use structured logging in your application for better filtering
- Monitor both request logs and container logs
- Consider using Cloud Logging Logs Explorer for complex analysis

### Common Pitfalls
- Cloud Run service names are case-sensitive in filters
- Use proper escaping for special characters in log filters
- Remember that logs have a retention period (30 days by default)
- Beta commands (`gcloud beta run services logs tail`) may change

## Additional Resources

- [Cloud Logging Query Language Documentation](https://cloud.google.com/logging/docs/view/logging-query-language)
- [Cloud Run Troubleshooting Guide](https://cloud.google.com/run/docs/troubleshooting)
- [Advanced Filters Documentation](https://cloud.google.com/logging/docs/view/advanced-filters)
- [Cloud Run Logging Documentation](https://cloud.google.com/run/docs/logging)

---

**Note**: Replace placeholders like `[SERVICE-NAME]`, `[REGION]`, and `[PROJECT-ID]` with your actual values. For the Nos Ilha project:
- SERVICE-NAME: `nosilha-backend-api`
- REGION: `us-east1`
- PROJECT-ID: `nosilha`