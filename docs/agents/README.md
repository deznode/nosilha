# Claude Sub-Agents Documentation

This directory contains specialized documentation and knowledge bases for the 10 Claude sub-agents designed for the Nos Ilha cultural heritage platform.

## Agent Overview

| Agent | Purpose | Primary Domain |
|-------|---------|----------------|
| [Backend Agent](./backend-agent/) | Spring Boot API development | Kotlin, JPA, PostgreSQL |
| [Frontend Agent](./frontend-agent/) | Next.js React development | TypeScript, App Router, UI |
| [Mapbox Agent](./mapbox-agent/) | Interactive mapping | Mapbox GL JS, GIS, React |
| [Motion Agent](./motion-agent/) | Animations & interactions | Framer Motion, micro-interactions |
| [DevOps Agent](./devops-agent/) | CI/CD & deployment | GitHub Actions, Terraform, GCP |
| [Media Agent](./media-agent/) | AI & media processing | Cloud Vision, GCS, image processing |
| [Data Agent](./data-agent/) | Multi-database architecture | PostgreSQL, Firestore, polyglot persistence |
| [Content Agent](./content-agent/) | Cultural content creation | Heritage storytelling, multilingual copy |
| [Fact Checker Agent](./factchecker-agent/) | Cultural accuracy verification | Historical validation, community consultation |
| [Integration Agent](./integration-agent/) | Type safety & integration | API contracts, E2E testing |

## Usage Guidelines

### Agent Selection
Choose agents based on the primary domain of your task:
- **API development** → Backend Agent
- **UI/UX work** → Frontend Agent + Motion Agent
- **Map features** → Mapbox Agent
- **Database changes** → Data Agent (PostgreSQL + Firestore)
- **Cultural content** → Content Agent + Fact Checker Agent
- **Historical accuracy** → Fact Checker Agent
- **Deployment issues** → DevOps Agent

### Multi-Agent Coordination
For complex features requiring multiple domains:
1. **Primary Agent**: Handles the main implementation
2. **Supporting Agents**: Provide specialized expertise
3. **Content + Fact Checker**: For culturally-sensitive content
4. **Integration Agent**: Ensures type safety and cultural quality

### Knowledge Base Structure
Each agent directory contains:
- `knowledge-base.md` - Core domain knowledge
- `system-prompt.md` - Specialized prompt instructions
- `patterns/` - Common code patterns and examples
- `troubleshooting.md` - Domain-specific issue resolution
- `coordination.md` - Inter-agent collaboration guidelines

## Getting Started

1. Review the [agent specifications](../../plan/active/claude-sub-agents-implementation.md)
2. Choose the appropriate agent for your task
3. Reference the agent's knowledge base and patterns
4. Follow the system prompt guidelines for optimal results

## Agent Development

To add or modify agents:
1. Update specifications in the implementation plan
2. Create/modify agent knowledge bases
3. Test agent effectiveness with sample tasks
4. Update coordination patterns as needed