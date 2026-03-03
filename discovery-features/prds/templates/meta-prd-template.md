# Meta-PRD: [Project Name]

**Project:** [Project Name and Version]  
**Status:** [Active/Completed/Archived]  
**Created:** [Date]  
**Last Updated:** [Date]  
**Authority Level:** Meta-PRD (Governing Document)

---

## Project Vision

### Core Mission:
[2-3 sentence description of what this project accomplishes and why it matters]

### Target Users:
- **Primary:** [Main user group with specific needs]
- **Secondary:** [Additional user groups]
- **Stakeholders:** [Community, partners, or other interested parties]

### Success Metrics:
- **Technical:** [Measurable technical achievements]
- **User Experience:** [User satisfaction or engagement goals]
- **Business/Community:** [Impact on community or organizational goals]

---

## Development Phases

### Phase Overview:
| Phase | Name | Duration | Dependencies | Status |
|-------|------|----------|--------------|--------|
| PRD1 | [Foundation Phase] | [Timeline] | None | [Status] |
| PRD2 | [Core Features] | [Timeline] | PRD1 | [Status] |
| PRD3 | [Advanced Features] | [Timeline] | PRD2 | [Status] |
| PRD4 | [Polish & Launch] | [Timeline] | PRD3 | [Status] |

### Phase Descriptions:

#### PRD1: [Foundation Phase Name]
**Purpose:** [What this phase establishes]
**Key Deliverables:** [Primary outputs]
**Placeholders Created:** [Major stubs for future phases]

#### PRD2: [Core Features Phase Name]  
**Purpose:** [What this phase builds]
**Key Deliverables:** [Primary outputs]
**Placeholders Replaced:** [PRD1 stubs being implemented]
**Placeholders Created:** [New stubs for future phases]

#### PRD3: [Advanced Features Phase Name]
**Purpose:** [What this phase adds]
**Key Deliverables:** [Primary outputs]
**Placeholders Replaced:** [PRD2 stubs being implemented]

#### PRD4: [Polish & Launch Phase Name]
**Purpose:** [What this phase completes]
**Key Deliverables:** [Final outputs]
**Placeholders Replaced:** [Final stubs being implemented]

---

## Global Rules & Standards

### 1. Naming Rule
**Consistency Requirement:** All placeholders and components must use stable, predictable names across all phases.

**Naming Conventions:**
- **Components:** PascalCase with descriptive names (e.g., `VideoListComponent`, `UserProfileEditor`)
- **Functions:** camelCase with action verbs (e.g., `captureDelta()`, `validateUserInput()`)
- **Files:** kebab-case with clear purpose (e.g., `user-profile.tsx`, `api-client.ts`)
- **Placeholders:** Same naming as final implementation with `Placeholder` suffix initially

**Examples:**
```typescript
// ✅ CORRECT: Stable naming across phases
const VideoListComponent = () => { /* implementation */ };
const captureDelta = (data) => { /* implementation */ };

// ❌ INCORRECT: Inconsistent naming between phases  
const VideoList = () => { /* PRD1 */ };
const VideoListWidget = () => { /* PRD2 - name change breaks contract */ };
```

### 2. Replacement Rule
**Complete Replacement Required:** Later PRDs must completely replace placeholder code. No duplication or partial preservation is allowed.

**Implementation:**
- Locate exact placeholder by name and file location
- Replace entire implementation, not just parts
- Remove all placeholder comments and temporary code
- Update imports and references if needed

**Validation:**
```typescript
// ✅ CORRECT: Complete replacement
// Before (PRD1):
const VideoListComponent = () => {
  // PLACEHOLDER: Replace in PRD2 - Video list with search
  return <div>Coming soon</div>;
};

// After (PRD2): 
const VideoListComponent = () => {
  return <VideoList videos={videos} onSearch={handleSearch} />;
};

// ❌ INCORRECT: Partial preservation
const VideoListComponent = () => {
  // PLACEHOLDER: Replace in PRD2 - Video list with search
  return <VideoList videos={videos} onSearch={handleSearch} />;
};
```

### 3. Deprecation Comments
**Required Format:** All placeholders must include comments marking them for replacement.

**Template:**
```typescript
// TODO: Replace in PRD[X] - [Specific description of what replaces this]
// PLACEHOLDER: [Current behavior description]
```

**Examples:**
```typescript
// TODO: Replace in PRD2 - Implement video upload with progress tracking
// PLACEHOLDER: Currently shows static upload button, needs drag-drop and progress
const VideoUploader = () => <div>Upload Video</div>;

// TODO: Replace in PRD3 - Add real-time user status and presence indicators  
// PLACEHOLDER: Shows static user info, needs live status updates
const UserStatusIndicator = () => <div>User Online</div>;
```

### 4. Transcript Fidelity Rule
**Preserve Original Ideas:** PRDs must capture nuance and exploratory ideas from original requirements in dedicated sections.

**Requirements:**
- Include "Contextual Notes" section in each PRD
- Preserve exact quotes or paraphrases from original requirements
- Note unresolved design decisions for future consideration
- Maintain conceptual intentions even when not yet implemented

**Prohibited:**
- Discarding exploratory ideas without documentation
- Oversimplifying requirements into basic feature lists
- Losing nuance or user experience intentions

---

## Architecture Standards

### Technology Stack:
- **Frontend:** [Specific versions and frameworks]
- **Backend:** [Specific versions and frameworks]  
- **Database:** [Database choices and versions]
- **Infrastructure:** [Deployment and hosting choices]
- **Third-party Services:** [External integrations]

### Code Organization:
```
project/
├── [frontend-structure]/
├── [backend-structure]/
├── [shared-structure]/
└── [infrastructure-structure]/
```

### Quality Standards:
- **Testing:** [Coverage requirements and testing strategy]
- **Documentation:** [Required documentation for each phase]
- **Performance:** [Speed and efficiency targets]
- **Accessibility:** [User access requirements]
- **Security:** [Security implementation requirements]

---

## Scope Boundaries

### Global In-Scope (All Phases):
- [Feature category 1 that's always allowed]
- [Feature category 2 that's always allowed]
- [Feature category 3 that's always allowed]

### Global Out-of-Scope (All Phases):
- [Feature category 1 that's never allowed in this project]
- [Feature category 2 that's deferred to future projects]
- [Feature category 3 that's explicitly excluded]

### Phase-Specific Boundaries:
Each individual PRD will define its own in-scope/out-of-scope features within these global boundaries.

---

## Anti-Pattern Prevention

### Prior Art Problem Prevention:
- **Issue:** AI preserves placeholder implementations instead of replacing them
- **Prevention:** Strict enforcement of Replacement Rule with validation
- **Detection:** Search for old placeholder comments after each phase

### Orphaned Problem Prevention:
- **Issue:** AI fails to recognize earlier placeholders and creates duplicates
- **Prevention:** Consistent naming and placeholder registry maintenance
- **Detection:** Cross-reference all component names across phases

### Scope Creep Prevention:
- **Issue:** Features get added without proper phase planning
- **Prevention:** Explicit out-of-scope sections in each PRD
- **Detection:** Regular compliance checks against phase boundaries

---

## Change Management

### Meta-PRD Updates:
- **When:** Only when fundamental project scope or architecture changes
- **Process:** [Approval process for Meta-PRD changes]
- **Impact:** All active and future PRDs must comply with updates

### Phase PRD Updates:
- **When:** During active development of that phase only
- **Process:** Changes must not violate Meta-PRD rules
- **Impact:** Update handoff contracts if placeholder names change

### Emergency Changes:
- **Scope:** Critical bugs or security issues only
- **Process:** [Emergency change approval process]
- **Documentation:** Must update relevant PRDs within 48 hours

---

## Quality Assurance

### Phase Completion Checklist:
- [ ] All in-scope features implemented
- [ ] All placeholders from previous phase replaced
- [ ] No out-of-scope features accidentally implemented
- [ ] Naming consistency maintained per Meta-PRD
- [ ] Handoff contract prepared for next phase
- [ ] Quality gates passed (testing, performance, etc.)

### Meta-PRD Compliance Validation:
- [ ] Replacement Rule followed correctly
- [ ] Naming Rule maintained across all phases
- [ ] Deprecation Comments properly formatted
- [ ] Transcript Fidelity preserved in contextual notes
- [ ] Scope boundaries respected

---

## Project Context

### [Project-Specific Context]
*[For Nos Ilha Cultural Heritage Platform:]*

**Cultural Heritage Requirements:**
- All content must be culturally accurate and community-validated
- Diaspora accessibility is a priority across all phases  
- Community contribution features required in later phases
- Multilingual support planned for PRD3+

**Technical Constraints:**
- Open-source community project with volunteer contributors
- Budget-conscious cloud infrastructure choices
- Mobile-first approach for global Cape Verdean diaspora
- Integration with existing Spring Boot + Next.js architecture

**Community Stakeholders:**
- Brava Island local community
- Cape Verdean diaspora worldwide  
- Cultural preservation organizations
- Tourism development partners

---

## Success Validation

### Project Completion Criteria:
- [ ] All PRD phases completed successfully
- [ ] No remaining placeholders in production code
- [ ] User acceptance validation completed
- [ ] Performance and quality targets met
- [ ] Community/stakeholder approval received

### Long-term Maintenance:
- **Update Cycle:** [How often to review and update]
- **Responsibility:** [Who maintains the Meta-PRD]
- **Archive Process:** [When and how to archive completed Meta-PRDs]

---

*This Meta-PRD serves as the governing authority for all phase PRDs. It must be referenced and included with every phase development cycle to ensure consistency, quality, and scope discipline.*