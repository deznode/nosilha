# Meta-AI PRD Definition Document

This document defines the structure and purpose of the **Meta-PRD** and the phased PRDs used to guide AI-driven software development. It serves as the governing system prompt for building applications from transcripts. The Meta-PRD is always provided alongside the current phase PRD to ensure clarity, scope discipline, and continuity across multiple build steps.

------

## 1. Purpose of the Meta-PRD

The Meta-PRD is the **architect and controller** of the project. It defines the chain of authority for all phased PRDs. Its role is to:

- Provide the overall project vision and goals.
- Define the phases of development (PRD1, PRD2, PRD3, etc.).
- Establish global rules for naming, placeholder management, and replacement.
- Prevent common AI pitfalls:
  - **Prior Art Problem**: AI preserves placeholder implementations instead of replacing them.
  - **Orphaned Problem**: AI fails to recognize earlier placeholders and creates duplicate code.
- Ensure **fidelity to the original transcript**: preserve nuance, ideas, and exploratory thinking in the PRDs, not just summarized requirements.

The Meta-PRD is always sent with each phase PRD. It ensures that the AI respects scope, replaces placeholders correctly, and understands what future PRDs will cover.

------

## 2. Chain of Authority

1. **Meta-PRD** is the top-level authority. Its rules override ambiguities in phase PRDs.
2. **Phase PRDs** (PRD1, PRD2, PRD3…) inherit from the Meta-PRD. Each describes a scoped build step.
3. The AI must:
   - Implement only the features defined in the current phase.
   - Respect out-of-scope prohibitions.
   - Replace placeholders according to the Replacement Rule.
   - Preserve contextual details from the transcript as **notes or exploratory sections** even if they are not yet implemented.

------

## 3. Rules Defined in the Meta-PRD

- **Naming Rule**: Placeholders and components must use consistent, stable names across PRDs (e.g., `VideoListComponent`, `captureDelta()`).
- **Replacement Rule**: Later PRDs must completely replace placeholder code. No duplication or partial preservation is allowed.
- **Deprecation Comments**: All placeholders include comments marking them for replacement in future phases.
- **Transcript Fidelity Rule**: PRDs must capture nuance and exploratory ideas from the transcript in dedicated sections, not discard them. Summarization is allowed only when clearly marked.

------

## 4. Structure of Each Phase PRD

Each phase PRD is a self-contained document. It must include:

### a. Purpose

- Defines the goals of the phase.
- States what is explicitly excluded from scope.

### b. In-Scope Features

- Concrete features to be implemented in this phase.

### c. Out-of-Scope Features

- Explicit prohibitions to prevent overreach.

### d. Placeholders

- Named stubs or components that must exist in this phase.
- Must use stable names consistent with Meta-PRD rules.
- Must include deprecation comments.

### e. User Flow

- Narrative description of what the user experiences in this phase.

### f. Deliverables

- Clear expectations of what must exist when the phase is complete.

### g. Handoff Contract

- Instructions for the next phase:
  - Which placeholders will be replaced.
  - Which dummy code should be deleted.
  - Explicit reference to the Meta-PRD Replacement Rule.

### h. Contextual Notes (Transcript Fidelity)

- A dedicated section for exploratory ideas, nuances, and unresolved design notes carried over from the transcript.
- These notes may include:
  - Possible UI patterns or interactions not yet finalized.
  - Edge cases or open questions.
  - Conceptual intentions (e.g., *“This is a celebration app, so deltas should feel playful.”*).
- These must not be implemented unless explicitly moved into In-Scope Features in a future PRD.

------

## 5. Usage Pattern

When building an application:

1. A **transcript** describing the application is provided.
2. The **Meta-PRD** is sent along with the current phase PRD.
   - Example: Transcript + Meta-PRD + PRD1.
3. The AI builds according to the scoped PRD, guided by the Meta-PRD.
4. Future phases repeat the process (Transcript + Meta-PRD + PRD2, etc.).

------

## 6. Summary

The Meta-PRD defines the **governing rules and index of phases**. Each phase PRD defines a **scoped build step with placeholders, contracts for handoff, and transcript fidelity notes**. Together, they:

- Prevent the Prior Art and Orphaned problems.
- Preserve nuance from transcripts across all phases.
- Enable iterative, controlled development with AI agents.
- Provide a repeatable structure for building complex applications from transcripts.