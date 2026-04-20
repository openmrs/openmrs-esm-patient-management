---
stepsCompleted: [1, 2]
inputDocuments: [
  "_bmad-output/planning-artifacts/prd.md",
  "docs/reverse-engineering/01-domain-logic/integrated-workflow-map.md",
  "docs/brainstorming/phase-2-planning-log.md"
]
---

# UX Design Specification - GHC-AI Patient Mobile App

**Author:** TrangN
**Date:** 2026-04-20

---

## Executive Summary

### Project Vision

The GHC-AI Patient Mobile App transforms the healthcare waiting experience by eliminating the "black box" anxiety patients face after booking appointments. Currently, patients are uncertain whether their arrival was recorded and unable to see their queue position, forcing them to repeatedly ask staff "When is my turn?" This Android mobile application solves this problem through a self-service patient portal that provides instant check-in confirmation and establishes 100% traceability between appointments and visits for the first time in the OpenMRS ecosystem.

The core UX insight is that patients need to transition from passive bystanders to active participants in their care journey. The hero feature—Smart Check-in—achieves this by orchestrating complex backend operations (8-11 API calls) in under 3 seconds through a single tap, transforming a 15-minute administrative hurdle into a 1-second digital confirmation.

### Target Users

**Primary User:** Patients with scheduled appointments at healthcare facilities using OpenMRS

**User Characteristics:**
- Using Android devices (MVP platform)
- Arriving at healthcare facility for scheduled appointments
- Need to check in without waiting in manual reception line
- Seeking visibility and control over their healthcare experience
- May be first-time app users (zero learning curve required)
- Using app in real-world context: standing in lobby, potentially one-handed, glancing quickly

**User Goals:**
- Check in for appointment quickly and confidently
- Know their arrival was correctly recorded (eliminate "black box" anxiety)
- Understand what to do next (where to wait, when they'll be called)
- Spend less time on administrative tasks, more time on care

**Out of Scope:** Healthcare workers (continue using OpenMRS web system)

### Key Design Challenges

**1. Speed vs. Feedback Balance**
- **Challenge:** Orchestrate 8-11 API calls in < 3 seconds while keeping user informed
- **UX Requirement:** Show progress without making it feel slow, provide confidence without overwhelming
- **Success Metric:** 90% of patients feel confident their arrival was correctly recorded

**2. Error Recovery & Resilience**
- **Challenge:** Handle check-in failures gracefully in high-stakes healthcare context
- **UX Requirement:** Clear error messages, easy retry mechanism, prevent partial check-ins
- **Success Metric:** > 99% check-in success rate, graceful failure with rollback

**3. First-Time User Experience**
- **Challenge:** Patients may never have used the app before arriving at facility
- **UX Requirement:** Zero learning curve, intuitive enough for one-time use, no onboarding required
- **Success Metric:** > 70% self-service adoption without staff intervention

**4. Anxiety Reduction Through Visibility**
- **Challenge:** Replace "black box" uncertainty with transparency and control
- **UX Requirement:** Clear confirmation, visible queue number, reassuring messaging
- **Success Metric:** Patients feel informed and in control, not confused or uncertain

### Design Opportunities

**1. "One-Tap Magic" Moment**
- **Opportunity:** Make complexity orchestration feel effortless and delightful
- **UX Approach:** Single prominent button, smooth animation, instant feedback, clear success state
- **Competitive Advantage:** Simpler and faster than any manual check-in process

**2. Trust Through Transparency**
- **Opportunity:** Show what's happening without overwhelming users with technical details
- **UX Approach:** Subtle progress indicators during orchestration, clear success confirmation with queue number
- **Competitive Advantage:** Patients feel informed and in control, building trust in digital healthcare

**3. Mobile-First Simplicity**
- **Opportunity:** Design for thumb-friendly, glanceable, minimal-tap interaction in real-world context
- **UX Approach:** Large touch targets, minimal text, clear visual hierarchy, single-screen flow where possible
- **Competitive Advantage:** Optimized for standing in lobby, one-handed use, quick glances

**4. Material Design 3 Familiarity**
- **Opportunity:** Leverage Android users' existing mental models and interaction patterns
- **UX Approach:** Material Design 3 components, familiar navigation patterns, system integration
- **Competitive Advantage:** Feels native and familiar, reducing cognitive load

---

