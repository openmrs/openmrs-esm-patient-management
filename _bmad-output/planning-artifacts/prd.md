---
stepsCompleted: ["step-01-init", "step-02-discovery", "step-02b-vision", "step-02c-executive-summary", "step-03-success"]
inputDocuments: [
  "README.md",
  "docs/reverse-engineering/README.md",
  "docs/reverse-engineering/00-system-overview/system-architecture-survey.md",
  "docs/reverse-engineering/01-domain-logic/patient-entity-analysis.md",
  "docs/reverse-engineering/01-domain-logic/visit-entity-analysis.md",
  "docs/reverse-engineering/01-domain-logic/appointment-entity-analysis.md",
  "docs/reverse-engineering/01-domain-logic/integrated-workflow-map.md",
  "docs/reverse-engineering/01-domain-logic/system-glossary.md"
]
documentCounts:
  briefCount: 0
  researchCount: 0
  brainstormingCount: 0
  projectDocsCount: 8
classification:
  projectType: "Mobile Application (Android)"
  domain: "Healthcare / Clinical Management"
  complexity: "High"
  projectContext: "Brownfield"
  targetUsers: "Patients (Self-service)"
  platform: "Android Only (MVP)"
  authentication: "Existing OpenMRS accounts"
  connectivity: "Online-only"
workflowType: 'prd'
---

# Product Requirements Document - GHC-AI

**Author:** TrangN
**Date:** 2026-04-20

## Executive Summary

The GHC-AI Patient Mobile App transforms the healthcare waiting experience by bridging the operational gap between appointment scheduling and clinical service delivery. Currently, patients exist in a "black box" after booking appointments—uncertain whether their arrival was recorded, unable to see their queue position, and forced to repeatedly ask staff "When is my turn?" This anxiety-inducing uncertainty, combined with the facility's inability to link scheduled appointments to realized visits, creates a dual problem: poor patient experience and zero operational intelligence.

This Android mobile application solves both problems simultaneously through a self-service patient portal that provides real-time queue visibility while establishing 100% traceability between appointments and visits for the first time in the OpenMRS ecosystem. The MVP focuses on two core capabilities: Identity Linking & Login (matching app accounts to existing OpenMRS patient records) and Smart Check-in (one-tap orchestration of Visit creation, Appointment status update, and Queue entry with success confirmation).

**Target Users:** Patients only (self-service focus). Healthcare workers continue using the existing OpenMRS web system.

**Success Metrics:** Reduced average wait time and 100% data integrity between appointment and visit entities.

### What Makes This Special

**Complexity Orchestration for Seamless Experience**

The Smart Check-in feature is the product's hero capability because it transforms a 15-minute administrative hurdle into a 1-second digital confirmation. From the patient's perspective, it's a single tap. From the system's perspective, it orchestrates multiple backend operations: checking for active visits, creating new visits when needed, updating appointment status to "CheckedIn," generating queue numbers, and creating queue entries—all while maintaining perfect data integrity with the legacy OpenMRS system.

**Bridging Intent and Reality**

The core insight is that appointments represent *intent* while visits represent *reality*. The OpenMRS system has no direct foreign key linking these entities, creating an operational blind spot. This app heals that fragmentation by implementing implicit correlation algorithms that link appointments to visits through patient UUID and time-based matching, enabling facilities to measure punctuality, throughput, and wait times for the first time.

## Project Classification

**Project Type:** Mobile Application (Android)  
**Domain:** Healthcare / Clinical Management  
**Complexity:** High  
**Project Context:** Brownfield (integrating with existing OpenMRS backend)

**Complexity Drivers:**
- Regulated healthcare domain requiring 100% data integrity
- Legacy system integration with implicit entity relationships
- Real-time data synchronization across Appointment, Visit, and Queue entities
- Patient safety and HIPAA compliance requirements
- No modification to OpenMRS core schema allowed

**Platform Decisions:**
- Android only for MVP (speed to demo, market penetration)
- Online-only connectivity (facility WiFi assumed)
- Existing OpenMRS accounts (no new registration flow)
- Self-service patient focus (healthcare workers use web system)

## MVP Core Features

### 1. Identity Linking & Login
Match mobile app accounts with existing OpenMRS Patient records using Patient Identifiers. Patients use credentials created by healthcare staff in the OpenMRS web system.

**Key Capability:** Secure authentication that links mobile app session to existing patient record without requiring new registration.

### 2. Simple Appointment View (Dashboard)
Display today's scheduled appointments with essential details before check-in.

**Information Displayed:**
- Doctor/Provider name
- Appointment time
- Department/Service
- Appointment status (Scheduled, CheckedIn, Completed)

**Purpose:** Patients need to see appointment details to confirm they're checking in for the correct appointment. This is the prerequisite for Smart Check-in.

### 3. Smart Check-in (Hero Feature)
One-tap action that orchestrates the complete check-in workflow:
- Check for active visit (reuse if exists, create new if not)
- Update Appointment status to "CheckedIn"
- Generate queue number and create queue entry
- Display success confirmation with instructions to wait for name to be called

**User Journey:**
1. Patient opens app and sees today's scheduled appointment (Simple Appointment View)
2. Patient reviews appointment details (Doctor, Time, Department)
3. Patient taps "Check In" button
4. App orchestrates backend operations (8-11 API calls in < 3 seconds)
5. App displays **Success Confirmation Screen** with:
   - ✓ Check-in successful message
   - Queue number assigned (e.g., "A-042")
   - Instructions: "Please wait in the waiting area. Your name will be called when it's your turn."
   - Estimated service time (if available)

## Success Criteria

### 1. The "Zero-Manual" Goal (User & Business Success)

**Objective:** Prove that Smart Check-in actually replaces the reception desk for the majority of patients.

**Metrics:**

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **Self-Service Adoption** | > 70% of patients with scheduled appointments successfully complete check-in via app without staff intervention | Track: (App check-ins / Total scheduled appointments) per day |
| **Check-in Speed (The "Aha!" Metric)** | < 3 seconds from tap to Success Screen | Measure: Client-side timer from button tap to confirmation display |
| **Anxiety Reduction** | > 90% of patients answer "Yes" to: "Did you feel confident that your arrival was correctly recorded?" | Post-visit survey (single question) |

**Why This Matters:**
- **70% adoption** proves the app is the primary check-in method, not a niche alternative
- **< 3 seconds** proves our "Complexity Orchestration" works efficiently despite 8-11 API calls
- **90% confidence** proves we've eliminated the "black box" anxiety

### 2. The "Unified Data" Goal (Operational Intelligence)

**Objective:** Heal the legacy system's fragmentation by establishing 100% traceability between appointments and visits.

**Metrics:**

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **Traceability Integrity** | 100% of visits created via app must have valid appointment_id linked | Database audit: Count visits with appointment attribute / Total app-created visits |
| **Zero Orphaned Visits** | 0 visits created without corresponding appointment or queue entry | Daily automated check for orphaned records |
| **New Insight: Punctuality Report** | 100% of app users have punctuality data (delta between Appointment Time and Actual Check-in Time) | Generate report: `check_in_time - appointment_start_time` for all app check-ins |

**Why This Matters:**
- **100% traceability** enables the facility to measure what was previously impossible
- **Punctuality Report** is a first-time capability that provides operational intelligence
- **Zero orphans** ensures data integrity for analytics and reporting

**Example Punctuality Insights:**
- Average early arrival: 15 minutes before appointment
- % of patients arriving on time: 65%
- % of patients arriving late: 20%
- Average late arrival: 8 minutes after appointment

### 3. Technical Reliability (The "Don't Break the Core" Rule)

**Objective:** Ensure brownfield integration stability - the app must enhance, not disrupt, the existing OpenMRS system.

**Metrics:**

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **State Synchronization** | 100% consistency: If app shows "CheckedIn," OpenMRS web must reflect "CheckedIn" within < 2 seconds | Automated test: Check app state vs. database state with timestamp delta |
| **Zero Disruption** | No performance degradation or data locks on OpenMRS web system during app check-in orchestration | Monitor: Web system response times and database lock wait times during peak app usage |
| **Check-in Success Rate** | > 99% of check-in attempts succeed without error | Track: (Successful check-ins / Total check-in attempts) |
| **API Orchestration Reliability** | All 8-11 API calls complete successfully or fail gracefully with rollback | Monitor: API call success rate, implement transaction rollback on failure |

**Why This Matters:**
- **< 2 second sync** ensures healthcare workers see real-time patient status
- **Zero disruption** proves the app doesn't impact existing workflows
- **> 99% success rate** ensures reliability for patient-facing operations
- **Graceful failure** prevents partial check-ins that corrupt data integrity

### Measurable Outcomes Summary

**3-Month Success (Pilot Phase):**
- ✅ 70% of scheduled patients use app for check-in
- ✅ Average check-in time < 3 seconds
- ✅ 100% data traceability established
- ✅ First punctuality report generated
- ✅ Zero disruption to web system operations

**6-Month Success (Expansion):**
- ✅ 85% self-service adoption
- ✅ 95% patient confidence in check-in accuracy
- ✅ Punctuality insights driving operational improvements
- ✅ Staff time freed up for higher-value patient interactions

**12-Month Success (Full Adoption):**
- ✅ 90% self-service adoption
- ✅ Manual check-in desk eliminated or repurposed
- ✅ Facility using punctuality data for scheduling optimization
- ✅ Phase 2 features (Live Queue Tracking) deployed

## Product Scope

### MVP - Minimum Viable Product

**Core Features (Must Have):**
1. ✅ Identity Linking & Login - Authenticate with existing OpenMRS accounts
2. ✅ Simple Appointment View - Display today's appointments with essential details
3. ✅ Smart Check-in - One-tap orchestration of visit creation, status update, and queue entry

**Success Criteria:**
- Prove the concept: Smart Check-in replaces manual reception desk
- Establish data integrity: 100% appointment-visit traceability
- Demonstrate speed: < 3 second check-in processing

**What's NOT in MVP:**
- ❌ Live queue tracking (deferred to Phase 2)
- ❌ Appointment scheduling/booking
- ❌ Appointment reminders/notifications
- ❌ Visit history
- ❌ Appointment cancellation/rescheduling
- ❌ Multi-day appointment view (only "today")

### Growth Features (Post-MVP / Phase 2)

**Priority 1: Live Queue Tracking**
- Real-time queue status display
- Position in queue updates
- Push notifications when patient is called
- Estimated wait time calculation

**Priority 2: Appointment Management**
- View upcoming appointments (multi-day calendar)
- Appointment reminders (push notifications, SMS)
- Request appointment cancellation
- View appointment history

**Priority 3: Enhanced Patient Experience**
- Visit history and medical records summary
- Pre-visit forms and questionnaires
- Post-visit instructions and prescriptions
- Telemedicine appointment support

### Vision (Future / Phase 3+)

**Full Patient Portal:**
- Complete medical record access
- Lab results and imaging reports
- Medication refill requests
- Secure messaging with providers
- Health tracking and wellness features
- Family member account linking
- Multi-facility support

**Advanced Analytics:**
- Predictive wait time modeling
- Personalized appointment recommendations
- Patient flow optimization
- Resource allocation insights

**Integration Expansion:**
- Payment and billing integration
- Insurance verification
- Pharmacy integration for prescription pickup
- Transportation/ride-sharing integration

