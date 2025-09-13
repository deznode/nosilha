# Seed Data Verification Prompt for Nos Ilha Cultural Heritage Platform

## Purpose
This document provides a comprehensive prompt for verifying the authenticity, cultural accuracy, and evidence-based nature of seed data for the Nos Ilha cultural heritage platform. Use this prompt when analyzing future seed data versions (V6, V7, etc.) to ensure only authentic, verified entries are included.

## Quick Start: Copy-Paste Verification Prompt

```
I need to verify the authenticity and cultural accuracy of seed data for Brava Island, Cape Verde. Please analyze the provided seed data file and conduct a comprehensive verification using the following approach:

## STEP 1: GEOGRAPHIC COORDINATE VERIFICATION

**Task**: Verify all latitude/longitude coordinates are within Brava Island boundaries
**Brava Island Geographic Bounds**:
- Latitude: 14.800°N to 14.880°N
- Longitude: -24.720°W to -24.640°W

**Check for**:
- Any coordinates outside these bounds (especially -24.3xxx which places entries in mainland Africa)
- Coordinates that place entries on other Cape Verde islands

## STEP 2: BUSINESS AUTHENTICITY RESEARCH

**Use Exa research to verify each business exists**:
- Search for specific business names + "Brava Island Cape Verde"
- Check booking sites for accommodations (Skyscanner, Booking.com, etc.)
- Verify against official sources like visitbrava.net
- Cross-reference with local business directories

**Evidence Standards**:
- ✅ KEEP: Businesses found on multiple verified sources
- ⚠️ VERIFY: Businesses found on one source only
- ❌ REMOVE: Businesses with no evidence found

## STEP 3: CULTURAL HERITAGE VERIFICATION

**Use cultural-heritage-verifier agent to check**:
- Historical accuracy of landmarks and cultural sites
- Authenticity of Cape Verdean cultural references
- Appropriate representation without colonial bias
- Community-focused descriptions vs. tourism exoticism

**Cultural Red Flags**:
- Colonial framing that doesn't acknowledge community resistance
- Tourism language prioritizing visitor experience over community benefit
- Generic cultural references that could apply to any location
- Inauthentic business names that don't reflect local naming patterns

## STEP 4: EVIDENCE-BASED VALIDATION

**For each entry, provide source verification**:
- Real businesses: Cite specific websites, booking platforms, or directories
- Cultural landmarks: Cite historical sources, Wikipedia, or cultural heritage sites
- Geographic features: Cite maps, travel guides, or geographic databases
- Churches/religious sites: Cite religious directories or cultural heritage sources

**Acceptance Criteria**:
- Every entry must have at least one verifiable source
- Generic or representative examples must be clearly labeled as such
- No fictional businesses or places should remain

## STEP 5: FINAL QUALITY ASSESSMENT

**Create summary report with**:
- Total entries analyzed
- Number of entries verified with sources
- Number of entries flagged for removal
- Geographic accuracy assessment
- Cultural authenticity assessment
- List of all sources used for verification

**Final Dataset Standards**:
- All coordinates within proper Brava Island boundaries
- Every business/landmark verified through research
- Cultural descriptions authentic and community-focused
- Sources documented for each entry
- Quality over quantity (prefer fewer authentic entries)

## RESEARCH RESOURCES TO USE

**Verified Sources for Brava Island**:
- visitbrava.net (official tourism site)
- Booking platforms: Skyscanner, Booking.com, Hotels.com
- Wikipedia articles on Brava Island locations
- Cape Verde tourism directories
- Cultural heritage databases
- Geographic databases and mapping services

**Exa Research Strategy**:
1. Use company research tool for specific business verification
2. Use web search for general location verification
3. Use deep researcher for complex cultural heritage questions
4. Cross-reference findings across multiple sources

## OUTPUT REQUIREMENTS

Provide a structured report with:

### VERIFIED ENTRIES (Keep)
- Business/landmark name
- Evidence source(s)
- Coordinate verification status
- Cultural authenticity assessment

### FLAGGED ENTRIES (Remove)
- Business/landmark name
- Reason for removal
- What evidence was searched for but not found

### COORDINATE CORRECTIONS NEEDED
- List of entries with coordinate errors
- Suggested corrected coordinates within Brava bounds

### CULTURAL CONTENT IMPROVEMENTS
- Entries needing description updates
- Specific bias or exoticism to remove
- Suggestions for community-focused reframing

This verification should result in a minimal, high-quality dataset containing only authentic, evidence-based entries that truly represent Brava Island's heritage and current reality.
```

## Detailed Verification Methodology

### Phase 1: Initial Assessment
1. **File Structure Review**: Examine the seed data file structure and count total entries
2. **Quick Scan**: Identify obviously fictional names or suspicious coordinate patterns
3. **Categorization**: Group entries by type (restaurants, hotels, landmarks, beaches, etc.)

### Phase 2: Geographic Validation
- **Coordinate Range Check**: Verify all coordinates fall within Brava Island boundaries
- **Visual Verification**: Use mapping tools to confirm logical placement of entries
- **Island Familiarity**: Flag coordinates that seem to reference other Cape Verde islands

### Phase 3: Research-Based Authentication
- **Systematic Search**: Research each business/landmark individually
- **Source Documentation**: Record specific sources for each verified entry
- **Cross-Referencing**: Confirm findings across multiple independent sources
- **Local Knowledge Integration**: Incorporate community knowledge when available

### Phase 4: Cultural Content Analysis
- **Bias Detection**: Identify colonial perspectives or tourism exoticism
- **Community Voice**: Ensure descriptions prioritize community benefit and authentic representation
- **Cultural Accuracy**: Verify cultural references and historical claims
- **Respectful Representation**: Ensure dignified treatment of diaspora and emigration themes

## Common Issues Found in Previous Versions

### Geographic Errors
- **Problem**: Coordinates using -24.3xxx longitude placing entries in mainland Africa
- **Solution**: Correct to proper Brava range (-24.720°W to -24.640°W)

### Fictional Businesses
- **Problem**: Generic business names with no verification possible
- **Examples**: "Tasca do Pescador", "Casa Colonial Brava", "Restaurante Morabeza"
- **Solution**: Remove entirely or replace with verified authentic businesses

### Cultural Bias
- **Problem**: Colonial education framing without acknowledging community resistance
- **Problem**: Tourism language prioritizing visitor experience over community perspective
- **Solution**: Reframe from community empowerment and cultural preservation viewpoint

### Test Data Remnants
- **Problem**: Obviously generic entries like "Nha Kasa Restaurante"
- **Solution**: Replace with verified authentic establishments or remove

## Quality Standards for Final Dataset

### Minimum Requirements
- All coordinates verified within Brava Island geographic boundaries
- Every business entry backed by research evidence
- All cultural content reviewed for authenticity and respect
- Sources documented for verification audit trail

### Preferred Characteristics
- Community-focused descriptions emphasizing local benefit
- Authentic Cape Verdean cultural references
- Balance between different types of establishments
- Realistic scale appropriate for Brava Island population (~5,000 residents)

## Success Metrics

### Quantitative Measures
- 100% of coordinates within proper geographic bounds
- 100% of entries have verifiable sources
- 0% fictional or unverified businesses remain

### Qualitative Measures
- Cultural content demonstrates authentic community voice
- Descriptions avoid colonial bias and tourism exoticism
- References to Cape Verdean culture are accurate and respectful
- Content serves community empowerment over visitor convenience

## Usage Instructions

1. **Copy the verification prompt** from the "Quick Start" section above
2. **Provide the seed data file** to be analyzed
3. **Request systematic verification** following all steps
4. **Review the output report** for completeness
5. **Implement recommended changes** based on findings
6. **Document sources** for future reference and audit purposes

This systematic approach ensures that seed data maintains the highest standards of authenticity, cultural respect, and evidence-based accuracy for the Nos Ilha cultural heritage platform.