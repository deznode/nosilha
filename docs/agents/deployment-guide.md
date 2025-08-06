# Agent Deployment & Configuration Guide

## Overview
This guide provides comprehensive instructions for deploying and configuring the 8 specialized Claude sub-agents for the Nos Ilha tourism platform development workflow.

## Prerequisites

### Technical Requirements
- **Claude Code CLI** or **Claude API access**
- **Git repository access** to Nos Ilha codebase
- **Development environment** with Node.js, Java 21, Docker
- **GitHub Actions** (for CI/CD integration)
- **Google Cloud Project** (for production deployment testing)

### Access Requirements
- **Project repository permissions** (read/write access to `/docs/agents/`)
- **Environment variable configuration** access
- **CI/CD pipeline configuration** permissions
- **Testing environment** setup capabilities

## Agent Configuration

### 1. Agent System Files Structure
```
docs/agents/
├── README.md                           # Agent overview and usage
├── coordination-protocols.md           # Inter-agent coordination rules
├── testing-procedures.md               # Validation and testing framework
├── deployment-guide.md                 # This deployment guide
├── backend-agent/
│   ├── knowledge-base.md              # Backend domain expertise
│   ├── system-prompt.md               # Specialized prompt for backend
│   ├── patterns/                      # Code patterns and examples
│   └── troubleshooting.md             # Domain-specific issue resolution
├── frontend-agent/
│   ├── knowledge-base.md              # Frontend domain expertise
│   ├── system-prompt.md               # Specialized prompt for frontend
│   └── [similar structure for each agent]
├── mapbox-agent/
├── motion-agent/
├── devops-agent/
├── media-agent/
├── data-agent/
└── integration-agent/
```

### 2. Environment Configuration

#### Core Environment Variables
```bash
# Agent Configuration
CLAUDE_AGENTS_ENABLED=true
CLAUDE_AGENTS_CONFIG_PATH=/docs/agents/
CLAUDE_PROJECT_ROOT=/Users/jcosta/Projects/nosilha
CLAUDE_API_KEY=your_claude_api_key_here

# Development Environment  
NODE_ENV=development
SPRING_PROFILES_ACTIVE=local
DATABASE_URL=jdbc:postgresql://localhost:5432/nosilha_db
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token

# Agent-Specific Settings
BACKEND_AGENT_CONTEXT_SIZE=32000
MAPBOX_AGENT_CONTEXT_SIZE=24000
MOTION_AGENT_CONTEXT_SIZE=20000
DEFAULT_AGENT_TIMEOUT=120000
```

#### Claude Code Configuration
```json
// .claude/config.json
{
  "agents": {
    "enabled": true,
    "configPath": "docs/agents/",
    "defaultTimeout": 120000,
    "specializedAgents": [
      {
        "id": "nosilha-backend-agent",
        "name": "Backend Agent",
        "domain": "backend",
        "systemPromptPath": "backend-agent/system-prompt.md",
        "knowledgeBasePath": "backend-agent/knowledge-base.md",
        "contextSize": 32000,
        "filePatterns": [
          "backend/src/main/kotlin/**/*.kt",
          "backend/src/main/resources/**/*.yml",
          "backend/src/main/resources/db/migration/*.sql",
          "backend/build.gradle.kts"
        ]
      },
      {
        "id": "nosilha-mapbox-agent", 
        "name": "Mapbox Agent",
        "domain": "mapping",
        "systemPromptPath": "mapbox-agent/system-prompt.md",
        "knowledgeBasePath": "mapbox-agent/knowledge-base.md",
        "contextSize": 24000,
        "filePatterns": [
          "frontend/src/components/ui/interactive-map.tsx",
          "frontend/src/components/ui/map-*.tsx",
          "frontend/src/hooks/use*Map*.ts",
          "frontend/src/types/mapbox.ts"
        ]
      },
      {
        "id": "nosilha-motion-agent",
        "name": "Motion Agent", 
        "domain": "animation",
        "systemPromptPath": "motion-agent/system-prompt.md",
        "knowledgeBasePath": "motion-agent/knowledge-base.md",
        "contextSize": 20000,
        "filePatterns": [
          "frontend/src/components/**/*animation*.tsx",
          "frontend/src/components/ui/*hero*.tsx",
          "frontend/src/components/ui/*gallery*.tsx",
          "frontend/src/utils/animations.ts"
        ]
      }
      // Additional agents...
    ]
  }
}
```

## Deployment Procedures

### 1. Initial Agent Setup

#### Step 1: Repository Preparation
```bash
# Clone the repository
git clone https://github.com/your-org/nosilha.git
cd nosilha

# Ensure agent documentation is in place
ls -la docs/agents/

# Verify all agent directories exist
for agent in backend-agent frontend-agent mapbox-agent motion-agent devops-agent media-agent data-agent integration-agent; do
    if [ ! -d "docs/agents/$agent" ]; then
        echo "Missing agent directory: $agent"
    fi
done
```

#### Step 2: Claude Code Configuration
```bash
# Initialize Claude Code if not already done
claude init

# Configure agents
claude config set agents.enabled true
claude config set agents.configPath "docs/agents/"

# Test agent access
claude agents list
claude agents test nosilha-backend-agent
```

#### Step 3: Development Environment Setup
```bash
# Backend setup
cd backend
./gradlew build
./gradlew bootRun --args='--spring.profiles.active=local'

# Frontend setup (separate terminal)
cd frontend  
npm install
npm run dev

# Infrastructure setup (separate terminal)
cd infrastructure/docker
docker-compose up -d
```

### 2. Agent Activation Workflow

#### Manual Agent Selection
```bash
# Activate specific agent for task
claude use agent nosilha-backend-agent

# Work on backend task
claude "Create a new API endpoint for beach amenities with CRUD operations"

# Switch to frontend agent
claude use agent nosilha-frontend-agent

# Continue with frontend work
claude "Create a React component to display beach amenities list"
```

#### Automated Agent Routing
```bash
# Let Claude automatically select appropriate agent based on context
claude analyze-task "Add a new interactive map feature showing beach locations"
# → Routes to Mapbox Agent

claude analyze-task "Optimize database query performance for directory entries" 
# → Routes to Backend Agent + Data Agent coordination

claude analyze-task "Add smooth animations to the image gallery"
# → Routes to Motion Agent
```

### 3. CI/CD Integration

#### GitHub Actions Workflow Integration
```yaml
# .github/workflows/agent-validation.yml
name: Claude Agent Validation

on:
  pull_request:
    paths:
      - 'docs/agents/**'
      - 'backend/**'
      - 'frontend/**'

jobs:
  validate-agents:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Claude Code
        run: |
          npm install -g @anthropic/claude-code
          claude config set agents.enabled true
          
      - name: Test Agent Configurations
        run: |
          claude agents validate
          claude agents test --all
          
      - name: Run Agent Competency Tests
        run: |
          npm run test:agents:basic
          npm run test:agents:integration
```

#### Pre-commit Hook Integration
```bash
# .git/hooks/pre-commit
#!/bin/bash
# Validate agent configurations before commit

echo "Validating Claude agent configurations..."

# Check if agent documentation is updated
if git diff --cached --name-only | grep -q "docs/agents/"; then
    echo "Agent documentation changes detected, running validation..."
    claude agents validate
    if [ $? -ne 0 ]; then
        echo "Agent validation failed. Please fix issues before committing."
        exit 1
    fi
fi

# Run basic agent tests for code changes
if git diff --cached --name-only | grep -qE "\.(kt|tsx?|sql)$"; then
    echo "Code changes detected, running agent competency tests..."
    npm run test:agents:quick
    if [ $? -ne 0 ]; then
        echo "Agent tests failed. Please review changes."
        exit 1
    fi
fi

echo "Agent validation completed successfully."
```

## Production Deployment

### 1. Agent Configuration for Production

#### Production Environment Variables
```bash
# Production-specific agent settings
CLAUDE_AGENTS_ENABLED=true
CLAUDE_AGENTS_MODE=production
CLAUDE_AGENTS_LOGGING=detailed
CLAUDE_AGENTS_PERFORMANCE_MONITORING=true

# Enhanced security settings
CLAUDE_AGENTS_REQUIRE_AUTHENTICATION=true
CLAUDE_AGENTS_AUDIT_LOGGING=true
CLAUDE_AGENTS_RATE_LIMITING=true
```

#### Cloud Deployment Configuration
```yaml
# k8s/claude-agents-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: claude-agents-config
data:
  agents.enabled: "true"
  agents.configPath: "/app/docs/agents/"
  agents.mode: "production"
  agents.monitoring: "true"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: claude-agents-service
spec:
  replicas: 2
  template:
    spec:
      containers:
      - name: claude-agents
        image: claude-code:latest
        env:
        - name: CLAUDE_AGENTS_CONFIG
          valueFrom:
            configMapKeyRef:
              name: claude-agents-config
              key: agents.enabled
        volumeMounts:
        - name: agent-docs
          mountPath: /app/docs/agents/
          readOnly: true
      volumes:
      - name: agent-docs
        configMap:
          name: agent-documentation
```

### 2. Monitoring & Observability

#### Agent Performance Metrics
```typescript
// monitoring/agent-metrics.ts
interface AgentMetrics {
  agentId: string
  requestCount: number
  averageResponseTime: number
  successRate: number
  errorRate: number
  handoffCount: number
  handoffSuccessRate: number
  lastActive: Date
}

// Metrics collection
const collectAgentMetrics = async (agentId: string): Promise<AgentMetrics> => {
  return {
    agentId,
    requestCount: await getRequestCount(agentId),
    averageResponseTime: await getAverageResponseTime(agentId),
    successRate: await getSuccessRate(agentId),
    errorRate: await getErrorRate(agentId),
    handoffCount: await getHandoffCount(agentId),
    handoffSuccessRate: await getHandoffSuccessRate(agentId),
    lastActive: new Date()
  }
}
```

#### Alert Configuration
```yaml
# monitoring/alerts.yml
alerts:
  - name: agent-high-error-rate
    condition: error_rate > 0.1
    severity: warning
    description: "Claude agent error rate above 10%"
    
  - name: agent-slow-response
    condition: avg_response_time > 60000
    severity: critical
    description: "Claude agent response time above 60 seconds"
    
  - name: agent-handoff-failure
    condition: handoff_success_rate < 0.9
    severity: warning
    description: "Agent handoff success rate below 90%"
```

## Maintenance Procedures

### 1. Regular Maintenance Tasks

#### Daily Tasks
```bash
# Check agent health
claude agents health-check

# Review performance metrics
claude agents metrics --period=24h

# Validate configurations
claude agents validate
```

#### Weekly Tasks
```bash
# Run comprehensive agent tests
npm run test:agents:comprehensive

# Update knowledge bases with new patterns
claude agents update-knowledge

# Review coordination effectiveness
claude agents analyze-handoffs --period=7d
```

#### Monthly Tasks  
```bash
# Performance optimization review
claude agents optimize

# Knowledge base updates
git pull origin main
claude agents refresh-knowledge

# Agent capability assessment
claude agents benchmark
```

### 2. Troubleshooting Common Issues

#### Agent Not Responding
```bash
# Check agent status
claude agents status nosilha-backend-agent

# Restart agent
claude agents restart nosilha-backend-agent

# Check system resources
claude system status

# Review logs
claude agents logs nosilha-backend-agent --tail=100
```

#### Poor Response Quality
```bash
# Check knowledge base freshness
claude agents knowledge-check

# Update system prompts
git pull origin main
claude agents reload-config

# Run competency tests
claude agents test nosilha-backend-agent --verbose

# Review recent changes
git log --oneline docs/agents/backend-agent/
```

#### Coordination Failures
```bash
# Analyze handoff patterns
claude agents analyze-handoffs --failed-only

# Check coordination protocols
claude agents validate-coordination

# Review agent boundaries
claude agents check-boundaries

# Update coordination rules
claude agents update-coordination
```

## Security Considerations

### 1. Access Control
- **Agent Authentication** - Verify user permissions before agent access
- **Role-Based Access** - Different agent capabilities for different user roles
- **Audit Logging** - Log all agent interactions and decisions
- **Secure Configuration** - Protect agent configuration files and credentials

### 2. Data Protection
- **Input Sanitization** - Validate all inputs to agents
- **Output Filtering** - Remove sensitive information from agent responses
- **Context Isolation** - Prevent cross-contamination between agent sessions
- **Secure Communication** - Encrypt agent-to-agent communication

### 3. Rate Limiting & Resource Management
- **Request Rate Limiting** - Prevent agent overuse
- **Resource Quotas** - Limit computational resources per agent
- **Concurrent Session Limits** - Prevent resource exhaustion
- **Emergency Shutdown** - Ability to disable agents if needed

## Success Metrics & KPIs

### Development Efficiency
- **Task Completion Time** - Average time to complete domain-specific tasks
- **Code Quality Score** - Adherence to project patterns and standards
- **First-Time Success Rate** - Tasks completed correctly without revision
- **Developer Satisfaction** - User feedback on agent effectiveness

### System Performance
- **Agent Response Time** - Average time for agent responses
- **Coordination Efficiency** - Success rate of multi-agent workflows
- **Error Rate** - Frequency of agent errors or failures
- **Resource Utilization** - Computational resource usage efficiency

### Business Impact
- **Development Velocity** - Features delivered per sprint with agent assistance
- **Bug Reduction** - Decreased defect rate in agent-generated code
- **Knowledge Transfer** - Improved onboarding and learning for new developers
- **Innovation Rate** - New capabilities enabled by specialized agents

This deployment guide ensures that the Nos Ilha Claude sub-agents are properly configured, monitored, and maintained to provide maximum value to the tourism platform development process.