# Agent Coordination Protocols

## Overview
This document defines how the 8 Nos Ilha Claude sub-agents coordinate and hand off tasks to ensure seamless development workflows while maintaining their specialized expertise.

## Agent Interaction Matrix

### Primary Collaboration Patterns

| Task Type | Primary Agent | Supporting Agents | Coordination Notes |
|-----------|---------------|-------------------|-------------------|
| **New API Endpoint** | Backend | Integration, Data | Backend creates endpoint → Integration defines types → Data handles schema |
| **Map Feature** | Mapbox | Frontend, Motion | Mapbox handles map logic → Frontend integrates → Motion adds animations |
| **UI Component** | Frontend | Motion, Integration | Frontend creates component → Motion adds interactions → Integration ensures type safety |
| **Database Migration** | Data | Backend, DevOps | Data designs schema → Backend updates entities → DevOps handles deployment |
| **Gallery Feature** | Media | Frontend, Motion, Mapbox | Media handles upload → Frontend creates UI → Motion adds animations → Mapbox shows locations |
| **CI/CD Pipeline** | DevOps | Backend, Frontend | DevOps configures pipeline → Backend/Frontend agents handle service-specific workflows |

## Handoff Protocols

### 1. Tourism Feature Development Flow

#### Example: Adding New Location Type (e.g., "Viewpoint")

**Phase 1: Planning & Design**
```
User Request → Primary Agent Assessment → Coordination Plan
```

**Phase 2: Implementation Handoff**
```
1. Data Agent (Primary)
   - Designs database schema for new location type
   - Creates Flyway migration
   - Defines entity relationships
   ↓ Handoff to Backend Agent

2. Backend Agent 
   - Updates DirectoryEntry hierarchy
   - Implements repository, service, controller
   - Creates DTOs and mappers
   ↓ Handoff to Integration Agent

3. Integration Agent
   - Defines TypeScript interfaces
   - Updates API client
   - Ensures type safety across stack
   ↓ Handoff to Frontend Agent

4. Frontend Agent
   - Creates UI components
   - Implements CRUD operations
   - Adds routing and navigation
   ↓ Handoff to Mapbox Agent (Parallel)

5. Mapbox Agent
   - Adds new marker category
   - Updates map styling
   - Implements filtering
   ↓ Handoff to Motion Agent (Parallel)

6. Motion Agent
   - Adds location reveal animations
   - Creates interaction feedback
   - Implements mobile gestures
   ↓ Handoff to DevOps Agent

7. DevOps Agent
   - Updates CI/CD workflows
   - Handles deployment
   - Monitors rollout
```

### 2. Cross-Domain Handoff Patterns

#### API Development Handoff
```
Backend Agent:
- Creates endpoint structure
- Implements business logic
- Defines error responses
- Provides API documentation

↓ Handoff Package:
- OpenAPI specification
- Request/response examples
- Error code definitions
- Authentication requirements

Integration Agent:
- Creates TypeScript interfaces
- Updates API client
- Implements error handling
- Adds validation schemas
```

#### UI Component Handoff
```
Frontend Agent:
- Creates base component structure
- Implements core functionality
- Adds responsive design
- Handles data integration

↓ Handoff Package:
- Component interface definitions
- State management patterns
- Event handler signatures
- Styling class structure

Motion Agent:
- Adds animations and micro-interactions
- Implements gesture handling
- Optimizes for performance
- Adds accessibility features
```

#### Map Integration Handoff
```
Mapbox Agent:
- Implements map functionality
- Creates marker systems
- Handles geospatial data
- Optimizes performance

↓ Handoff Package:
- Map component interfaces
- Event callback definitions
- Geospatial data requirements
- Performance considerations

Frontend Agent:
- Integrates map with UI
- Handles responsive layout
- Manages component state
- Coordinates with other features
```

## Communication Protocols

### 1. Task Handoff Format

When handing off between agents, use this structured format:

```markdown
## Handoff: [Task Name]
**From:** [Current Agent] → **To:** [Next Agent]
**Status:** [Completed/In Progress/Blocked]

### Completed Work
- [List of completed items]
- [Files created/modified]
- [Key decisions made]

### Handoff Package
- **Files:** [List of relevant files]
- **Interfaces:** [API contracts, TypeScript interfaces]
- **Dependencies:** [Required by next agent]
- **Constraints:** [Limitations or requirements]

### Next Steps for [Next Agent]
1. [Specific action item]
2. [Another action item]
3. [Final deliverable]

### Testing Requirements
- [What needs to be tested]
- [Integration points to verify]

### Questions/Issues
- [Any blockers or decisions needed]
```

### 2. Agent Specialization Boundaries

#### What Each Agent Should/Shouldn't Handle

**Backend Agent**
- ✅ **Should:** API endpoints, business logic, database entities, authentication
- ❌ **Shouldn't:** Frontend components, map configurations, animations, CI/CD setup

**Frontend Agent**  
- ✅ **Should:** React components, routing, state management, responsive design
- ❌ **Shouldn't:** Backend logic, database queries, map internals, animation details

**Mapbox Agent**
- ✅ **Should:** Map functionality, geospatial features, marker systems, map performance
- ❌ **Shouldn't:** Backend APIs, non-map UI components, database design

**Motion Agent**
- ✅ **Should:** Animations, micro-interactions, gesture handling, performance optimization
- ❌ **Shouldn't:** Static layouts, backend logic, map functionality

**DevOps Agent**
- ✅ **Should:** CI/CD, deployment, infrastructure, monitoring
- ❌ **Shouldn't:** Application logic, UI design, business requirements

**Media Agent**
- ✅ **Should:** File uploads, image processing, AI integration, storage
- ❌ **Shouldn't:** UI components, backend business logic, map features

**Data Agent**
- ✅ **Should:** Database schema, migrations, query optimization, data modeling
- ❌ **Shouldn't:** API endpoints, frontend logic, CI/CD configuration

**Integration Agent**
- ✅ **Should:** Type safety, API contracts, testing, cross-stack integration
- ❌ **Shouldn't:** Specific implementation details, specialized domain logic

### 3. Escalation Procedures

#### When Agents Need Help Outside Their Domain

**Scenario 1: Backend Agent needs map functionality**
```
Backend Agent → Request map data requirements → Mapbox Agent
Mapbox Agent → Provides GeoJSON structure → Backend Agent
Backend Agent → Implements API endpoint → Integration Agent for type safety
```

**Scenario 2: Frontend Agent needs animation guidance**
```
Frontend Agent → Describes desired interaction → Motion Agent  
Motion Agent → Provides animation patterns → Frontend Agent
Frontend Agent → Implements with motion guidance → Integration for testing
```

**Scenario 3: Complex cross-domain feature**
```
User Request → Integration Agent (coordinator)
Integration Agent → Breaks down into domain-specific tasks
Integration Agent → Assigns primary agents → Manages handoffs
Integration Agent → Ensures final integration → Validates complete feature
```

## Quality Assurance Protocols

### 1. Cross-Agent Review Process

**Before Handoff:**
- [ ] All deliverables completed per agent specifications
- [ ] Code follows domain-specific patterns and conventions  
- [ ] Documentation updated (knowledge bases, interfaces)
- [ ] Tests written for new functionality
- [ ] Performance requirements met
- [ ] Accessibility standards followed

**During Handoff:**
- [ ] Receiving agent acknowledges understanding
- [ ] Questions/clarifications addressed
- [ ] Dependencies and constraints confirmed
- [ ] Timeline and expectations aligned

**After Handoff:**
- [ ] Previous agent available for consultation
- [ ] Integration points tested
- [ ] Cross-domain functionality verified
- [ ] Documentation updated with final implementation

### 2. Conflict Resolution

**Technical Disagreements:**
1. **Document the conflict** - what are the different approaches?
2. **Identify constraints** - performance, accessibility, maintainability
3. **Consult Integration Agent** - for architecture alignment
4. **Make decision** - document rationale and trade-offs
5. **Update patterns** - modify future approaches if needed

**Scope Boundary Issues:**
1. **Clarify the specific task** - break down into smaller components
2. **Reference agent specifications** - check primary vs supporting roles
3. **Assign primary responsibility** - one agent leads, others support
4. **Document the decision** - update coordination protocols if needed

## Success Metrics

### Coordination Effectiveness
- **Handoff completion rate** - % of successful handoffs without rework
- **Cross-domain integration success** - features work seamlessly across agents
- **Communication clarity** - minimal back-and-forth for clarification
- **Timeline adherence** - handoffs completed within estimated timeframes

### Code Quality
- **Pattern consistency** - agents follow established conventions
- **Integration stability** - cross-agent features don't break existing functionality  
- **Test coverage** - adequate testing for agent interfaces
- **Performance maintenance** - no degradation from agent coordination

### Developer Experience
- **Agent specialization effectiveness** - clear expertise boundaries
- **Task routing accuracy** - requests go to appropriate primary agents
- **Documentation completeness** - handoff packages contain necessary information
- **Learning and improvement** - coordination patterns evolve and improve

## Documentation Updates

### When to Update Coordination Protocols
- **New agent added** - update interaction matrix and handoff flows
- **Agent scope changes** - modify specialization boundaries  
- **Process improvements identified** - streamline handoff procedures
- **Technology updates** - adapt to new tools or frameworks
- **Performance issues** - optimize coordination bottlenecks

### Maintenance Schedule
- **Weekly:** Review active handoffs and address blockers
- **Monthly:** Analyze coordination metrics and identify improvements
- **Quarterly:** Update agent specifications and protocols
- **Annually:** Comprehensive review of agent architecture and effectiveness

This coordination system ensures that the specialized Claude sub-agents work together effectively while maintaining their domain expertise and delivering high-quality results for the Nos Ilha tourism platform.