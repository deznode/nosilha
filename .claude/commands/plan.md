# Plan Status Command

Query the plan/* directory system for current task status and next action recommendations.

## Usage

- `/plan` - Show full plan status report
- `/plan status` - Current active/pending/completed overview  
- `/plan next` - Next recommended tasks only
- `/plan active` - Detailed view of active tasks
- `/plan deps` - Dependency analysis

## Implementation

When this command is used, analyze the plan directory structure and provide an intelligent status report:

### 1. Parse Plan Directory Structure

- Scan `plan/active/*.md` for current tasks
- Check `plan/pending/*.md` for waiting tasks  
- Review `plan/completed/*.md` for finished work

### 2. Extract Plan Metadata

For each plan file, extract:

- **Status**: Current status (Active/Pending/Completed)
- **Priority**: High/Medium/Low priority level
- **Time Estimate**: Expected hours/days to complete
- **Dependencies**: What must be completed first
- **Progress**: Current completion percentage if available

### 3. Analyze Dependencies

- Identify tasks with no dependencies (ready to start)
- Map dependency chains between tasks
- Flag blocked tasks and their blockers
- Calculate critical path for completion

### 4. Generate Recommendations

Based on analysis, recommend:

- **Highest priority** tasks ready to start immediately  
- **Dependency order** for optimal workflow
- **Time estimates** for completion
- **Potential blockers** to address

## Expected Output Format

```text
🚀 Nos Ilha Plan Status - 2025-08-07

📊 SUMMARY:
✅ Completed: 1    🟡 Active: 3    📋 Pending: 3

⚡ NEXT RECOMMENDED TASKS:
1. type-safety-improvements
   • Priority: HIGH | Time: 6-8h | Dependencies: None
   • Status: Ready to start immediately
   
2. content-review (fact-checking)  
   • Priority: HIGH | Time: Ongoing | Dependencies: None
   • Status: Critical for content accuracy

🔗 DEPENDENCY CHAIN:
type-safety → gallery-api-integration → gallery-backend-implementation

📋 ACTIVE TASKS:
• gallery-api-integration (blocked: waiting for type-safety)
• gallery-backend-implementation (blocked: waiting for api integration)  
• type-safety-improvements (ready: no dependencies)

📈 PROGRESS OVERVIEW:
• claude-sub-agents-implementation: ✅ COMPLETED (16 hours)
• MVP readiness: ✅ PRODUCTION READY (3-7 days setup)
• Overall completion: ~40% (critical foundation complete)
```

## Analysis Logic

### Priority Scoring

- **HIGH**: Critical for production or blocking other tasks
- **MEDIUM**: Important for features but not blocking  
- **LOW**: Nice-to-have or future enhancements

### Dependency Resolution

- Tasks with no dependencies get highest recommendation
- Map dependency chains to show optimal work order
- Identify critical path bottlenecks

### Status Tracking

- **COMPLETED**: Marked as done with completion date
- **ACTIVE**: Currently available to work on
- **PENDING**: Waiting for dependencies or future phase

### Time Estimation

- Extract time estimates from plan files
- Aggregate for total remaining work
- Provide realistic completion projections

This command serves as a project management dashboard, helping prioritize work and maintain momentum on the Nos Ilha cultural heritage platform development.