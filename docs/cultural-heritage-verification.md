# Cultural Heritage Verification Guide

This document establishes comprehensive protocols for ensuring authentic, accurate, and respectful representation of Cape Verdean cultural heritage content on the Nos Ilha platform, prioritizing community authority and avoiding colonial bias.

## Purpose

Maintain platform credibility by validating all cultural heritage content through community consultation, academic cross-reference, and systematic verification processes that center Cape Verdean and Bravense perspectives.

## Community Consultation Requirements

### Primary Validation Contacts

1. **Casa Museu Eugénio Tavares** (Nova Sintra)
   - Museum staff and cultural authorities
   - Morna Study Center experts
   - Family descendants and historians

2. **Brava Cultural Association**
   - Community elders and tradition keepers
   - Local historians and storytellers
   - Contemporary cultural practitioners

3. **Nova Sintra Municipal Authorities**
   - Town historians and cultural officials
   - Community memory keepers
   - Educational institution contacts

### Validation Process

1. **Elder Testimonies**: Interview community members with family connections to historical figures
2. **Cultural Practitioner Input**: Engage with active morna musicians and tradition keepers
3. **Academic Cross-Reference**: Verify community knowledge with scholarly sources
4. **Ongoing Consultation**: Establish quarterly review process with community representatives

## Content Standards

### Historical Accuracy Requirements

- All dates and biographical details verified through multiple sources
- Community memory prioritized over external academic sources
- Distinguish between verified facts and commonly repeated claims
- Include appropriate disclaimers for uncertain information

### Cultural Sensitivity Guidelines

- Center Cape Verdean and Bravense perspectives
- Avoid colonial language and exotic tourism framing
- Emphasize community agency and cultural continuity
- Frame economic emigration as survival strategy, not adventure
- Respect sacred knowledge with appropriate access controls

### Bias Detection Framework

**Colonial Perspective Indicators**:
- Portuguese administrative language without local context
- Cultural hierarchy assumptions (European superiority)
- Passive voice obscuring colonial agency
- Economic extraction framed as development

**Tourism Exoticism Signs**:
- Romantic adventure narratives
- Primitive or exotic portrayals
- Generic cultural references applicable anywhere
- Visitor experience prioritized over community benefit

**Community Authority Validation**:
- Local knowledge prioritized over external sources
- Multiple community voices represented
- Contemporary cultural practitioners consulted
- Historical continuity demonstrated

## Verification Findings Summary

### UNESCO Status ✅ CORRECTED
- **Previous**: "UNESCO World Heritage Site"
- **Corrected**: "UNESCO Tentative List"
- **Status**: Nova Sintra submitted to Tentative List (March 15, 2016) but not inscribed

### Population Data ✅ UPDATED
- **Previous**: "~1,200 residents"
- **Updated**: "approximately 1,536 residents (2010 census)"
- **Status**: Includes source citation and approximation disclaimer

### Eugénio Tavares ✅ VERIFIED
- **Birth**: October 18, 1867 (verified)
- **Death**: June 1, 1930 (verified)
- **Major Work**: "Hora di Bai" (verified)
- **Cultural Role**: Morna documentation and composition (verified)
- **Accuracy Level**: 85-90% confidence in key facts

### Whaling Heritage ✅ CONTEXTUALIZED
- **Historical Presence**: Verified (1750s-1920s in Cape Verde waters)
- **Brava Role**: Recruitment center, not whaling base
- **Cultural Impact**: Indirect influence through emigration patterns
- **Accuracy Level**: 85% verified with proper historical context

## Seed Data Verification Protocol

This section provides comprehensive procedures for verifying the authenticity and cultural accuracy of seed data for the Nos Ilha platform.

### Verification Process Overview

The verification process ensures that only authentic, evidence-based entries representing genuine Brava Island heritage and businesses are included in the platform database.

### Step 1: Geographic Coordinate Verification

**Task**: Verify all latitude/longitude coordinates are within Brava Island boundaries

**Brava Island Geographic Bounds**:
- Latitude: 14.800°N to 14.880°N
- Longitude: -24.720°W to -24.640°W

**Coordinate Verification Resources**:
- **Primary**: Use `research/map.osm` file for accurate coordinate lookup of authentic locations
- **Secondary**: Cross-reference with mapping services (OpenStreetMap, Google Maps)

**Check for**:
- Any coordinates outside these bounds (especially -24.3xxx which places entries in mainland Africa)
- Coordinates that place entries on other Cape Verde islands
- Compare coordinates against authentic locations in research/map.osm for accuracy

### Step 2: Entity Authenticity Research

**Research Approach**:
- Search for specific names + "Brava Island Cape Verde"
- **CRITICAL**: Always specify "Brava Island Cape Verde" to avoid confusion with other locations named "Brava"
- For businesses: Check booking sites (Skyscanner, Booking.com, etc.)
- For towns/villages: Use Wikipedia, geographic databases, and mapping services
- Verify against official sources like visitbrava.net
- Cross-reference with local directories and cultural heritage sites

**Evidence Standards**:
- ✅ KEEP: Entries found on multiple verified sources
- ⚠️ VERIFY: Entries found on one source only
- ❌ REMOVE: Entries with no evidence found

### Step 3: Cultural Heritage Verification

**Verification Checklist**:
- Historical accuracy of landmarks and cultural sites
- Authenticity of Cape Verdean cultural references
- Appropriate representation without colonial bias
- Community-focused descriptions vs. tourism exoticism

**Cultural Red Flags**:
- Colonial framing that doesn't acknowledge community resistance
- Tourism language prioritizing visitor experience over community benefit
- Generic cultural references that could apply to any location
- Inauthentic business names that don't reflect local naming patterns

### Step 4: Evidence-Based Validation

**For each entry, provide source verification**:
- Real businesses: Cite specific websites, booking platforms, or directories
- Cultural landmarks: Cite historical sources, Wikipedia, or cultural heritage sites
- Geographic features: Cite maps, travel guides, or geographic databases
- Churches/religious sites: Cite religious directories or cultural heritage sources

**Acceptance Criteria**:
- Every entry must have at least one verifiable source
- Generic or representative examples must be clearly labeled as such
- No fictional businesses or places should remain

### Step 5: Final Quality Assessment

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

## Research Resources

### Verified Sources for Brava Island

- **research/map.osm** - OpenStreetMap dataset containing authentic Brava Island geographic data with precise coordinates and verified location names (use for coordinate verification and location name authenticity)
- visitbrava.net (official tourism site)
- brava.news (local news website with current business and community information)
- Wikipedia articles on Brava Island locations (**CRITICAL**: Search for "Brava Island Cape Verde" specifically to avoid confusion with other "Brava" locations worldwide)
- Booking platforms: Skyscanner, Booking.com, Hotels.com (for accommodations)
- Cape Verde tourism directories and government websites
- Cultural heritage databases and academic sources
- Geographic databases and mapping services (OpenStreetMap, Google Maps)
- Portuguese colonial archives (for historical sites)

### Exa Research Strategy

1. **ALWAYS** include "Brava Island Cape Verde" in all searches to ensure correct geographic focus
2. Use company research tool for specific business verification
3. Use web search for towns, villages, and geographic location verification
4. Use local news sources (like brava.news) to verify current business operations and recent community developments
5. Use deep researcher for complex cultural heritage questions
6. Cross-reference findings across multiple sources
7. **Verify location specificity**: Ensure results reference the correct Brava Island in Cape Verde, not other locations with similar names

## Common Issues in Previous Versions

### Geographic Errors

**Problem**: Coordinates using -24.3xxx longitude placing entries in mainland Africa
**Solution**: Correct to proper Brava range (-24.720°W to -24.640°W)

### Fictional Businesses

**Problem**: Generic business names with no verification possible
**Examples**: "Tasca do Pescador", "Casa Colonial Brava", "Restaurante Morabeza"
**Solution**: Remove entirely or replace with verified authentic businesses

### Cultural Bias

**Problem**: Colonial education framing without acknowledging community resistance
**Problem**: Tourism language prioritizing visitor experience over community perspective
**Solution**: Reframe from community empowerment and cultural preservation viewpoint

### Test Data Remnants

**Problem**: Obviously generic entries like "Nha Kasa Restaurante"
**Solution**: Replace with verified authentic establishments or remove

## Ongoing Monitoring Requirements

### Annual Review Process

1. **Community Validation**: Annual consultation with cultural authorities
2. **Content Accuracy Check**: Review all heritage claims with updated research
3. **Bias Assessment**: Evaluate content for colonial or exotic framing
4. **Community Benefit**: Ensure heritage content serves community interests

### Update Protocols

1. **Source Documentation**: Maintain citations for all cultural claims
2. **Community Input Integration**: Regular incorporation of local knowledge updates
3. **Academic Cross-Reference**: Annual verification with scholarly sources
4. **Sensitivity Review**: Ongoing assessment of cultural representation quality

### Red Flags for Immediate Review

- Contradictory community feedback on historical claims
- Discovery of inaccurate information in cultural content
- Community concerns about representation or cultural appropriation
- External challenges to historical accuracy claims

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

## Verification Output Requirements

When conducting verification, provide a structured report with:

### VERIFIED ENTRIES (Keep)
- Entry name (business/landmark/town/village)
- Evidence source(s)
- Coordinate verification status
- Cultural authenticity assessment
- **Geographic specificity confirmation**: Verified as Brava Island, Cape Verde location

### FLAGGED ENTRIES (Remove)
- Entry name (business/landmark/town/village)
- Reason for removal
- What evidence was searched for but not found
- **Location confusion check**: Any confusion with other "Brava" locations worldwide

### COORDINATE CORRECTIONS NEEDED
- List of entries with coordinate errors
- Suggested corrected coordinates within Brava bounds

### CULTURAL CONTENT IMPROVEMENTS
- Entries needing description updates
- Specific bias or exoticism to remove
- Suggestions for community-focused reframing

## Implementation Notes

- This protocol was developed following comprehensive cultural heritage verification research conducted in August 2025
- All changes implemented to maintain platform credibility while respecting community authority
- Focus on authentic representation that serves Cape Verdean diaspora and local community interests
- Regular updates required as community knowledge and scholarship evolve
- Quality over quantity: prefer fewer authentic entries that truly represent Brava Island's heritage

## Usage Instructions

1. **For General Content Verification**: Use Community Consultation Requirements and Content Standards sections
2. **For Seed Data Verification**: Follow the five-step Seed Data Verification Protocol
3. **For Research**: Utilize the Research Resources section with appropriate search strategies
4. **For Ongoing Maintenance**: Apply Ongoing Monitoring Requirements and Update Protocols
5. **For Quality Control**: Measure against Success Metrics and Quality Standards

This systematic approach ensures that all platform content maintains the highest standards of authenticity, cultural respect, and evidence-based accuracy for the Nos Ilha cultural heritage platform.

## Related Documentation

- [API Coding Standards](api-coding-standards.md) - Backend validation patterns
- [Security Policy](../SECURITY.md) - Data protection and privacy
- [Architecture](architecture.md) - Platform technical overview
