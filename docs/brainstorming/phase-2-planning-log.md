# Phase 2: Planning - Decision & Meeting Log

**Project:** GHC-AI Patient Mobile App  
**Maintained By:** TrangN  
**Purpose:** Track key decisions and rationale throughout the planning phase

---

## Meeting #1: Project Discovery

**Date:** April 20, 2026  
**Phase:** Phase 2 - Planning (PRD Creation)  
**Topic:** Project Discovery & Classification  
**Participants:** TrangN, Kiro (AI Assistant)

### Context

Following completion of Phase 1 (Reverse Engineering), we have comprehensive documentation of the existing OpenMRS system including:
- Patient, Visit, and Appointment entity analyses
- Integrated workflow map showing the complete patient journey
- System glossary with terminology
- Architecture survey

### Key Decisions

| Decision | Rationale | Impact |
|----------|-----------|--------|
| **Target Users: Patients Only** | Self-service focus for MVP. Healthcare workers will continue using the web system. | Simplifies UX design and reduces scope. Clear separation of concerns. |
| **Platform: Android Only** | Speed to demo. Most patients in target market use Android devices. | Faster development cycle. Can expand to iOS post-MVP. |
| **Authentication: Existing Accounts** | Patients use accounts created by staff in OpenMRS Web. No new registration flow. | Eliminates complex registration logic. Leverages existing patient records. Reduces MVP scope significantly. |
| **Connectivity: Online-Only** | Assume patients have connectivity at facility. | Removes offline sync complexity. Can add offline capability post-MVP if needed. |
| **Success Metrics** | 1. Reduced average wait time<br/>2. 100% Data Integrity with legacy system | Clear, measurable goals. Data integrity is non-negotiable in healthcare. |

### Project Classification

**Project Type:** Mobile Application (Android Native/React Native)  
**Domain:** Healthcare / Clinical Management  
**Complexity:** High
- Regulated healthcare domain
- Legacy system integration (OpenMRS REST API)
- Real-time data synchronization
- Patient safety and data integrity requirements

**Project Context:** Brownfield
- Integrating with existing OpenMRS backend
- Must maintain compatibility with web system workflows
- Leveraging existing patient records and identifiers

### MVP Feature Scope (Confirmed)

1. **Identity Linking & Login**
   - Match app accounts with existing OpenMRS Patient records
   - Use Patient Identifiers for authentication
   - No new registration flow

2. **Appointment Dashboard**
   - Display real-time 'Scheduled' appointments
   - Show appointment details (time, provider, service)

3. **Smart Check-in (Hero Feature)**
   - One-tap action orchestrating:
     - Create Visit (if no active visit)
     - Update Appointment Status to 'CheckedIn'
     - Join Queue and get queue number
   - Implements logic from Integrated Workflow Map

4. **Live Queue Tracking**
   - Show assigned queue number
   - Display current queue status (Waiting, In Service)
   - Real-time updates

### Technical Constraints Identified

From reverse engineering analysis:
- **No direct Appointment-Visit foreign key** - Must implement implicit correlation algorithm
- **Unique identifier validation** - Must respect uniqueness behavior (UNIQUE, LOCATION, NON_UNIQUE)
- **State synchronization** - Must maintain consistency across Appointment, Visit, and Queue entities
- **API orchestration** - 8-11 API calls required for complete check-in flow

### Problem Statement

**Core Problem:** Patients experience long, uncertain wait times at healthcare facilities due to:
- Manual check-in processes
- Lack of visibility into queue status
- Inefficient patient flow management

**Solution Approach:** Leverage existing OpenMRS queue management system with a patient-facing mobile app that enables self-service check-in and real-time queue tracking.

### Next Steps

1. ✅ Project Discovery - COMPLETE
2. ✅ Product Vision Definition (Step 2b) - COMPLETE
3. 🔄 Executive Summary & Business Goals (Step 2c)
4. 📋 Feature Definition (Step 3)
5. 📋 User Stories & Acceptance Criteria (Step 4)
6. 📋 Technical Requirements (Step 5)

### Open Questions

- Which Patient Identifier type will be used for login? (MRN, National ID, Phone Number?)
- What happens if patient has multiple active appointments on same day?
- How to handle appointment cancellation from mobile app?
- What notifications/reminders are needed?

### References

- Reverse Engineering Documentation: `docs/reverse-engineering/`
- Integrated Workflow Map: `docs/reverse-engineering/01-domain-logic/integrated-workflow-map.md`
- PRD Document: `_bmad-output/planning-artifacts/prd.md`

---

## Meeting #2: Strategic Vision Definition

**Date:** April 20, 2026  
**Phase:** Phase 2 - Planning (PRD Creation)  
**Topic:** Product Vision & Value Proposition Discovery  
**Participants:** TrangN, Kiro (AI Assistant)

### Core Problem Articulation

**Patient Side: Anxiety from Uncertainty**
- Patients trapped in "black box" process
- No visibility into whether arrival was recorded
- Unknown position in queue
- Transition from passive bystander to active participant needed

**Business Side: Operational Silos**
- Appointments and Visits are disconnected entities
- Impossible to measure actual facility throughput
- Cannot track patient punctuality
- No link between "scheduled intent" and "realized visit"

### The Transformation Vision

**From:** Passive bystander waiting in uncertainty  
**To:** Active participant with real-time visibility and control

### What Makes This Product Special

#### 1. Complexity Orchestration for Seamless Experience

**Business View:**
- Heals data fragmentation between booking phase and clinical phase
- Creates traceability between Appointment and Visit entities
- Enables analytics that were previously impossible

**User View:**
- Turns 15-minute administrative hurdle into 1-second digital confirmation
- Single tap orchestrates multiple backend operations seamlessly
- Empowers patients with frictionless care initiation

#### 2. The "Aha!" Moment: Instant Visibility

**User Experience:**
- Patient taps button → Instantly sees live queue status
- No more asking "When is my turn?"
- App provides truth and transparency
- Real-time updates as queue progresses

**Psychological Impact:**
- Reduces anxiety through visibility
- Restores sense of control
- Demonstrates respect for patient's time

#### 3. Post-Pandemic Self-Service Standard

**Market Context:**
- Patients no longer tolerate unnecessary physical queues
- Expectation of "Uber-like" transparency in healthcare
- Digital-first mindset is now the norm

**Business Imperative:**
- Increase patient volume (throughput) without hiring more administrative staff
- Meet patient expectations or lose them to competitors
- Operational efficiency through automation

### Success Vision

**For Patients:**
- Feel in control and respected
- Their time is valued
- Reduced anxiety and improved experience
- Active participation in care journey

**For Facility:**
- **100% Data Integrity** - Every appointment linked to its visit
- **First-Time Analytics** - Accurate punctuality and wait-time metrics
- **Operational Intelligence** - Understand actual vs. scheduled throughput
- **Scalability** - Increase patient volume without proportional staff increase
- **Quality Improvement** - Data-driven decisions on patient flow optimization

### Core Insight

The hero feature (Smart Check-in) isn't just about convenience - it's about:
1. **Bridging the gap** between intent (appointment) and reality (visit)
2. **Giving patients agency** through visibility and control
3. **Giving facilities intelligence** through data integrity and traceability

### Value Proposition

**For Patients:**
"Know exactly where you are in the queue, check in with one tap, and take control of your healthcare experience."

**For Facilities:**
"Connect your appointment system to your clinical workflow, measure what matters, and serve more patients without adding staff."

### Business Constraints Identified

1. **100% Traceability Requirement**
   - System must ensure complete traceability between Appointment and resulting Visit
   - Cannot disrupt legacy core logic
   - Must maintain data integrity with existing OpenMRS workflows

2. **Implicit Relationship Management**
   - No direct foreign key between Appointment and Visit in legacy system
   - Mobile app must implement correlation algorithm
   - Must handle edge cases (multiple appointments, walk-ins, etc.)

3. **State Synchronization**
   - Must maintain consistency across Appointment, Visit, and Queue entities
   - Status changes must cascade correctly
   - Must prevent orphaned records or inconsistent states

4. **Legacy System Compatibility**
   - Cannot modify OpenMRS core schema
   - Must work with existing REST API
   - Must respect existing business rules and validations

### Strategic Decisions

| Decision | Rationale | Impact |
|----------|-----------|--------|
| **Focus on Data Integrity** | Healthcare requires 100% accuracy. Analytics depend on clean data. | Non-negotiable constraint. All features must maintain integrity. |
| **Hero Feature: Smart Check-in** | Highest impact on both patient experience and operational intelligence. | Prioritize this for MVP. Other features support this core value. |
| **Transparency as Core Value** | Post-pandemic expectation. Differentiator in market. | All features should increase visibility and reduce uncertainty. |
| **Operational Intelligence** | Facilities need data to improve. First-time capability. | Position as analytics enabler, not just patient convenience app. |

### Next Steps

1. ✅ Project Discovery - COMPLETE
2. ✅ Strategic Vision Definition - COMPLETE
3. 🔄 Draft Executive Summary & Business Goals
4. 📋 Define Features & User Journeys
5. 📋 Document Business Rules & Constraints
6. 📋 Create User Stories & Acceptance Criteria

---

## Meeting #3: Scope Refinement - MVP Focus

**Date:** April 20, 2026  
**Phase:** Phase 2 - Planning (PRD Creation)  
**Topic:** Scope Refinement - Removing Live Queue Tracking from MVP  
**Participants:** TrangN, Kiro (AI Assistant)

### Context

During Executive Summary drafting, strategic decision made to refine MVP scope for higher quality demo and reduced technical complexity.

### Key Decision

**Remove Live Queue Tracking from MVP Core Features**

Move Live Queue Tracking to Future Roadmap / Phase 2.

### Rationale

| Factor | Reasoning |
|--------|-----------|
| **Technical Complexity** | Real-time data synchronization with legacy OpenMRS system adds significant complexity. WebSocket or polling implementation requires additional infrastructure. |
| **Demo Stability** | Focusing exclusively on Smart Check-in ensures 100% stability of the hero feature during demo. Reduces risk of real-time sync failures. |
| **Development Speed** | Eliminates need for real-time backend integration, allowing faster MVP delivery. |
| **Core Value Preservation** | Smart Check-in already delivers the primary value: bridging appointment and visit, eliminating manual check-in, generating queue number. |
| **User Experience** | Success confirmation screen with queue number and "wait to be called" instruction is sufficient for MVP. Matches current facility workflow. |

### Updated MVP Scope

**Core Features (MVP):**
1. ✅ Identity Linking & Login
2. ✅ Smart Check-in (Hero Feature)
   - Check for active visit
   - Create visit if needed
   - Update appointment status to "CheckedIn"
   - Generate queue number
   - Create queue entry
   - **Display Success Confirmation Screen** (new)

**Deferred to Phase 2:**
- ❌ Live Queue Tracking
- ❌ Real-time queue status updates
- ❌ Position in queue display
- ❌ Push notifications when called

### Updated User Journey

**Smart Check-in Flow:**
1. Patient opens app → sees today's appointments
2. Patient taps "Check In" button
3. App orchestrates backend (8-11 API calls)
4. App displays **Success Confirmation Screen**:
   - ✓ "Check-in successful!"
   - Queue number: "A-042"
   - Instructions: "Please wait in the waiting area. Your name will be called when it's your turn."
   - Estimated service time (optional)

**What Changed:**
- **Before:** Redirect to live queue tracking screen with real-time updates
- **After:** Static success confirmation with queue number and wait instructions

### Impact Assessment

**Positive Impacts:**
- ✅ Reduced technical risk
- ✅ Faster development timeline
- ✅ Higher demo stability
- ✅ Simpler testing requirements
- ✅ No real-time infrastructure needed

**Trade-offs:**
- ⚠️ Patients don't see real-time queue position
- ⚠️ No push notifications when called
- ⚠️ Less "Uber-like" transparency in MVP

**Mitigation:**
- Queue number still provides visibility (patients can see physical queue board)
- Success confirmation reduces anxiety about whether check-in worked
- Phase 2 roadmap clearly communicates future enhancement
- MVP still solves core problem: eliminating manual check-in line

### Technical Simplification

**Removed Requirements:**
- Real-time WebSocket or polling implementation
- Queue status change event handling
- Push notification infrastructure
- Background sync for queue updates
- Network resilience for real-time data

**Retained Requirements:**
- All Smart Check-in orchestration logic
- Appointment-Visit correlation algorithm
- State synchronization (Appointment, Visit, Queue)
- 100% data integrity with legacy system

### Success Metrics (Unchanged)

1. ✅ Reduced average wait time (Smart Check-in eliminates manual line)
2. ✅ 100% data integrity (Appointment-Visit traceability maintained)

### Next Steps

1. ✅ Update PRD with refined scope
2. ✅ Update meeting log with scope decision
3. ✅ Define Success Criteria
4. 🔄 Complete remaining PRD sections (if needed)
5. 📋 Move to UX Design phase
6. 📋 Create Architecture documentation

---

## Meeting #4: Success Criteria Definition

**Date:** April 20, 2026  
**Phase:** Phase 2 - Planning (PRD Creation)  
**Topic:** Success Criteria & Measurable Outcomes  
**Participants:** TrangN, Kiro (AI Assistant)

### Context

Following Executive Summary and scope refinement, defined comprehensive success criteria aligned with the "Hero Feature" strategy.

### Three Pillars of Success

#### 1. The "Zero-Manual" Goal (User & Business Success)

**Objective:** Prove Smart Check-in replaces the reception desk for majority of patients.

**Key Metrics:**
- **Self-Service Adoption:** > 70% of scheduled patients check in via app without staff help
- **Check-in Speed ("Aha!" Metric):** < 3 seconds from tap to Success Screen
- **Anxiety Reduction:** > 90% patients confident their arrival was recorded

**Rationale:**
- 70% adoption proves app is primary method, not niche alternative
- < 3 seconds proves "Complexity Orchestration" works efficiently (8-11 API calls)
- 90% confidence proves "black box" anxiety eliminated

#### 2. The "Unified Data" Goal (Operational Intelligence)

**Objective:** Heal legacy system fragmentation with 100% appointment-visit traceability.

**Key Metrics:**
- **Traceability Integrity:** 100% of app-created visits have valid appointment_id linked
- **Zero Orphaned Visits:** 0 visits without corresponding appointment or queue entry
- **New Insight - Punctuality Report:** 100% of app users have punctuality data (delta between appointment time and actual check-in time)

**Rationale:**
- First-time capability to measure what was previously impossible
- Enables operational intelligence for scheduling optimization
- Provides data for facility performance improvement

**Example Punctuality Insights:**
- Average early arrival: 15 minutes before appointment
- % arriving on time: 65%
- % arriving late: 20%
- Average late arrival: 8 minutes

#### 3. Technical Reliability (The "Don't Break the Core" Rule)

**Objective:** Ensure brownfield integration stability - enhance, don't disrupt.

**Key Metrics:**
- **State Synchronization:** 100% consistency, app "CheckedIn" = OpenMRS "CheckedIn" within < 2 seconds
- **Zero Disruption:** No performance degradation or data locks on OpenMRS web during app operations
- **Check-in Success Rate:** > 99% of check-in attempts succeed
- **API Orchestration Reliability:** All 8-11 API calls complete successfully or fail gracefully with rollback

**Rationale:**
- Healthcare workers must see real-time patient status
- Existing workflows cannot be impacted
- Patient-facing operations require high reliability
- Graceful failure prevents data corruption

### MVP Scope Update

**Added Feature: Simple Appointment View**

**Decision:** Patients need to see appointment details before check-in.

**Information Displayed:**
- Doctor/Provider name
- Appointment time
- Department/Service
- Appointment status

**Rationale:** Patients must confirm they're checking in for the correct appointment. This is the prerequisite for Smart Check-in, not a separate "dashboard" feature.

**Updated MVP Core Features:**
1. ✅ Identity Linking & Login
2. ✅ Simple Appointment View (Dashboard prerequisite)
3. ✅ Smart Check-in (Hero Feature)

### Timeline Milestones

**3-Month Success (Pilot Phase):**
- 70% self-service adoption
- < 3 second check-in time
- 100% data traceability
- First punctuality report generated
- Zero web system disruption

**6-Month Success (Expansion):**
- 85% self-service adoption
- 95% patient confidence
- Punctuality insights driving improvements
- Staff time freed for higher-value work

**12-Month Success (Full Adoption):**
- 90% self-service adoption
- Manual check-in desk eliminated/repurposed
- Facility using data for scheduling optimization
- Phase 2 features deployed (Live Queue Tracking)

### Growth Features Roadmap

**Phase 2 Priority Order:**
1. **Live Queue Tracking** (highest priority)
   - Real-time queue status
   - Position updates
   - Push notifications
   - Estimated wait time

2. **Appointment Management**
   - Multi-day calendar view
   - Reminders (push, SMS)
   - Cancellation requests
   - Appointment history

3. **Enhanced Patient Experience**
   - Visit history
   - Pre-visit forms
   - Post-visit instructions
   - Telemedicine support

### Vision (Phase 3+)

**Full Patient Portal:**
- Complete medical record access
- Lab results and imaging
- Medication refills
- Secure provider messaging
- Health tracking
- Family account linking
- Multi-facility support

**Advanced Analytics:**
- Predictive wait time modeling
- Personalized recommendations
- Patient flow optimization
- Resource allocation insights

### Key Decisions

| Decision | Rationale | Impact |
|----------|-----------|--------|
| **3-Second Check-in Target** | Proves efficiency of complexity orchestration. Faster than manual process. | Sets performance benchmark for development. |
| **70% Adoption Target** | Proves app is primary method, not alternative. Realistic for MVP pilot. | Defines success threshold for scaling. |
| **100% Traceability** | Non-negotiable for healthcare data integrity. Enables new analytics. | Core technical requirement. |
| **< 2 Second Sync** | Healthcare workers need real-time visibility. | Defines integration performance requirement. |
| **Simple Appointment View Added** | Patients need context before check-in. Prerequisite for hero feature. | Adds minimal scope, high usability value. |

### Success Measurement Plan

**Data Collection:**
- App analytics: Check-in completion time, success rate, error rate
- Database audits: Traceability integrity, orphaned records
- Post-visit surveys: Patient confidence question
- Web system monitoring: Performance impact, lock wait times
- Punctuality reports: Automated daily generation

**Reporting Cadence:**
- Daily: Check-in volume, success rate, errors
- Weekly: Adoption rate, punctuality trends
- Monthly: Patient satisfaction, operational impact
- Quarterly: ROI analysis, roadmap review

---

**Status:** ✅ Success Criteria Complete  
**Next Meeting:** PRD Review & Finalization  
**Last Updated:** 2026-04-20

