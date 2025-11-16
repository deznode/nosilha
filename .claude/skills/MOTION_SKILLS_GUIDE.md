# Motion & Animation Skills Guide

This guide explains the three complementary skills for implementing micro-interactions and motion systems in the Nos Ilha project.

---

## 🎯 Skill Overview

| Skill | Purpose | When to Use |
|-------|---------|-------------|
| **implementing-micro-interactions** | System Architecture | Setting up `lib/animation/` infrastructure |
| **architecting-motion-systems** | System Design & Auditing | Planning, reviewing, or refactoring motion architecture |
| **generating-micro-interactions** | Component Generation | Creating individual animated components quickly |

---

## 📚 Skill Definitions

### 1. `implementing-micro-interactions/` - Animation System Implementation

**Purpose:** Implements production-grade micro-interactions using a standardized `lib/animation` system.

**Use when:**
- Setting up a new animation system from scratch
- Adding `lib/animation/` directory with tokens, variants, factories
- Refactoring ad-hoc animations to use shared primitives
- Implementing consistent motion patterns across the app
- Following the 9-step implementation workflow

**Outputs:**
- Animation tokens (durations, easing, distances)
- Shared variants and factories
- Reusable animation components (AnimatedButton, HoverCard, etc.)
- MotionConfigProvider for reduced-motion support
- PageTransitionProvider for route transitions

**Example prompts:**
- "Set up a centralized animation system for our app"
- "Refactor our button animations to use shared tokens"
- "Implement the lib/animation system from the skill templates"

---

### 2. `architecting-motion-systems/` - Animation Architecture & Design

**Purpose:** Designs, audits, and refactors motion systems at a high architectural level.

**Use when:**
- Auditing existing motion usage in the codebase
- Planning a migration from ad-hoc animations to a system
- Defining motion standards and governance
- Creating motion guidelines for the team
- Reviewing motion-related pull requests
- Identifying anti-patterns and performance issues

**Outputs:**
- Architecture documentation
- Migration plans
- Motion guidelines and standards
- Review checklists
- Performance recommendations

**Example prompts:**
- "Audit our current motion usage and propose improvements"
- "Create a migration plan from ad-hoc to systematic animations"
- "Write motion guidelines for our team"
- "Review our motion architecture for performance issues"

---

### 3. `generating-micro-interactions/` - Component Generation

**Purpose:** Generates individual React components with micro-interactions from natural language prompts.

**Use when:**
- Creating new animated components quickly
- Converting static components to animated ones
- Generating components that use `lib/animation` (if it exists)
- Implementing specific micro-interaction patterns

**Outputs:**
- Single React component with animations
- TypeScript code with proper types
- Accessibility and reduced-motion support
- Tailwind styling with Framer Motion

**Example prompts:**
- "Create a button with hover and tap animations"
- "Give me an animated dropdown menu using Radix UI"
- "Add a subtle hover lift effect to this card"
- "Create a toast component with enter/exit animations"

---

## 🔄 Recommended Workflow

### Phase 1: Architecture (if starting fresh)
1. Use **`architecting-motion-systems`** to plan your motion system
   - Define standards, tokens, and patterns
   - Create migration plan if needed

### Phase 2: Infrastructure Setup
2. Use **`implementing-micro-interactions`** to build `lib/animation/`
   - Copy templates from skill assets
   - Set up tokens, variants, factories
   - Wire up MotionConfigProvider

### Phase 3: Component Development
3. Use **`generating-micro-interactions`** to generate components
   - Create animated UI components
   - Components automatically use lib/animation if available

### Phase 4: Maintenance & Evolution
4. Use **`architecting-motion-systems`** periodically to:
   - Audit motion usage
   - Enforce standards
   - Optimize performance

---

## 🤝 How Skills Work Together

```
architecting-motion-systems (Strategic Planning)
          ↓
          ↓ defines architecture
          ↓
implementing-micro-interactions (Infrastructure)
          ↓
          ↓ provides lib/animation system
          ↓
generating-micro-interactions (Tactical Execution)
          ↓
          ↓ generates components using lib/animation
          ↓
    Animated UI Components
```

---

## 📖 Documentation Reference

### Common to All Skills
- `/docs/MICRO_INTERACTION.md` - Foundational research and best practices
- `/docs/DESIGN_SYSTEM.md` - Nos Ilha design system and brand values

### Skill-Specific
- `implementing-micro-interactions/WORKFLOW.md` - 9-step implementation workflow
- `implementing-micro-interactions/EXAMPLES.md` - 15 detailed examples
- `architecting-motion-systems/WORKFLOW.md` - 7-step architecture workflow
- `architecting-motion-systems/EXAMPLES.md` - 7 architecture scenarios

---

## 🎨 Nos Ilha Brand Alignment

All motion implementations should align with Nos Ilha's brand values:
- **Authentic** - Motion feels natural, not showy
- **Lush** - Rich but subtle animations
- **Inviting** - Welcoming micro-interactions
- **Timeless** - Animations don't feel trendy or dated

Performance considerations:
- Optimize for mobile diaspora users
- Support reduced-motion preferences
- Use transform + opacity for GPU acceleration
- Lazy-load heavy animations

---

## 🚀 Quick Start Examples

### Example 1: New Project Setup
```
1. "Design a motion system architecture for this project"
   → architecting-motion-systems

2. "Set up lib/animation with the recommended tokens and variants"
   → implementing-micro-interactions

3. "Create an animated button component"
   → generating-micro-interactions
```

### Example 2: Refactoring Existing Code
```
1. "Audit our current motion usage"
   → architecting-motion-systems

2. "Refactor button animations to use shared tokens"
   → implementing-micro-interactions

3. "Generate new card components with the updated system"
   → generating-micro-interactions
```

---

## ✅ Success Criteria

Your motion system is properly implemented when:
- ✅ All animations use shared tokens from `lib/animation/`
- ✅ No hardcoded duration/easing values in components
- ✅ Reduced-motion support works across all components
- ✅ Motion follows brand guidelines (authentic, subtle, inviting)
- ✅ Performance is optimal (transform + opacity preferred)
- ✅ Team has clear documentation and standards

---

*Last updated: 2025-11-15*
