# System Glossary

**Document Purpose:** Single source of truth for OpenMRS terminology and concepts  
**Last Updated:** 2026-04-17  
**Maintained By:** Technical Documentation Team

---

## Overview

This glossary defines key terms, concepts, and entities used throughout the OpenMRS patient management system. Each term includes its definition, source entity in the legacy system, and business importance to help the mobile development team understand not just *what* each term means, but *why* it matters.

**How to Use This Glossary:**
- **Developers**: Reference when implementing features to ensure correct terminology
- **Business Analysts**: Use when writing requirements and user stories
- **QA Team**: Reference when writing test cases and scenarios
- **Product Managers**: Use when communicating with stakeholders

---

## Table of Contents

1. [Patient Domain](#patient-domain)
2. [Clinical Domain](#clinical-domain)
3. [Scheduling Domain](#scheduling-domain)
4. [Technical Domain](#technical-domain)
5. [Naming Conventions](#naming-conventions)

---

## Patient Domain

Terms related to patient identity, demographics, and registration.

| Term | Definition | Source Entity | Business Importance |
|------|------------|---------------|---------------------|
| **Patient** | A person receiving or registered to receive healthcare services. Contains demographic information, identifiers, and relationships. | `Patient` entity with nested `Person` object | Core entity - all clinical activities revolve around the patient. Unique identification is critical for patient safety. |
| **Patient Identifier** | A unique code or number used to identify a patient within the system (e.g., MRN, National ID, Facility ID). Each identifier has a type and uniqueness behavior. | `PatientIdentifier` within `Patient` entity | Essential for patient lookup and preventing duplicate records. Different identifier types serve different purposes (internal tracking vs. national registry). |
| **Identifier Type** | Defines the category and validation rules for a patient identifier (e.g., "Medical Record Number", "National ID"). Includes format validation and uniqueness constraints. | `PatientIdentifierType` configuration | Determines how identifiers are validated and whether duplicates are allowed. Critical for data quality and regulatory compliance. |
| **Uniqueness Behavior** | Defines whether an identifier must be unique. Three types: **UNIQUE** (globally unique), **LOCATION** (unique per facility), **NON_UNIQUE** (duplicates allowed). | `uniquenessBehavior` field in `PatientIdentifierType` | Prevents duplicate patient records and ensures data integrity. UNIQUE identifiers (like National ID) must never be duplicated; LOCATION identifiers (like facility MRN) can repeat across facilities. |
| **Preferred Identifier** | The primary identifier displayed for a patient when multiple identifiers exist. Only one identifier can be marked as preferred. | `preferred` boolean flag in `PatientIdentifier` | Determines which identifier appears in search results and patient headers. Important for user experience and quick patient recognition. |
| **Person Attributes** | Custom fields attached to a person record (e.g., phone number, email, occupation, next of kin). Configurable per implementation. | `attributes` array in `Person` object | Allows capturing implementation-specific data without modifying core schema. Essential for contact tracing and patient communication. |
| **Estimated Birthdate** | When exact birthdate is unknown, the system calculates an approximate date based on estimated age in years and months. The `birthdateEstimated` flag indicates this. | `birthdate` + `birthdateEstimated` boolean in `Person` | Common in resource-limited settings where patients don't know exact birthdate. Critical for age-based clinical decision support and pediatric care. |
| **Deceased Patient** | A patient marked as dead with optional death date, time, and cause. Once marked deceased, cannot be unmarked in standard UI. | `dead` boolean + `deathDate` + `causeOfDeath` in `Person` | Prevents scheduling appointments or visits for deceased patients. Important for mortality reporting and epidemiological data. |
| **Voided Patient** | A patient record marked as deleted but retained in database for audit trail. Voided records are hidden from normal queries. | `voided` boolean flag | Soft delete preserves data integrity and audit history. Cannot be truly deleted due to regulatory requirements. Different from "deceased" - voided means the record was created in error. |
| **Merged Patient** | When duplicate patient records are identified, they are merged into a single primary record. The duplicate record is voided and references the primary. | Backend merge functionality (not in registration app) | Resolves duplicate patient records while preserving historical data. Critical for data quality and preventing fragmented patient history. |

---

## Clinical Domain

Terms related to clinical encounters, visits, and healthcare delivery.

| Term | Definition | Source Entity | Business Importance |
|------|------------|---------------|---------------------|
| **Visit** | A time-bound container representing a patient's interaction with the healthcare facility. Has a start time and optional end time. Contains one or more encounters. | `Visit` entity | The "episode of care" - groups all clinical activities during a patient's time at the facility. Essential for billing, reporting, and understanding care continuity. |
| **Active Visit** | A visit where `stopDatetime` is `null`, indicating the patient is currently at the facility or the visit has not been formally closed. | `Visit` with `stopDatetime === null` | Determines whether a patient can check in for appointments, join queues, or have new encounters created. System typically prevents multiple active visits per patient. |
| **Expired Visit** | A visit that has been automatically closed by the system after exceeding the configured `visitExpireHours` without activity. | `Visit` closed by background job | Prevents indefinitely open visits that skew reporting. Important for understanding actual facility utilization vs. forgotten check-outs. |
| **Visit Type** | Categorizes the nature of the visit (e.g., "Outpatient Visit", "Emergency Visit", "Inpatient Admission"). Determines workflow and available encounter types. | `visitType` reference in `Visit` | Drives clinical workflows and reporting. Different visit types may have different billing rules, required documentation, or care protocols. |
| **Encounter** | A specific clinical interaction within a visit (e.g., "Vitals Check", "Doctor Consultation", "Lab Order"). Multiple encounters can occur during one visit. | `Encounter` entity | The atomic unit of clinical documentation. Each encounter captures specific clinical data (observations, orders, diagnoses) with timestamp and provider. |
| **Encounter Type** | Defines the category of clinical interaction (e.g., "Admission", "Vitals", "Consultation", "Discharge"). Determines what data can be captured. | `encounterType` reference in `Encounter` | Structures clinical documentation and enables workflow automation. Different encounter types have different required fields and trigger different business logic. |
| **Encounter Provider** | Links a healthcare provider to an encounter with a specific role (e.g., "Attending Physician", "Nurse", "Consultant"). Multiple providers can be involved in one encounter. | `encounterProviders` array in `Encounter` | Tracks accountability and enables provider-specific reporting. Critical for billing, quality metrics, and medicolegal documentation. |
| **Observation (Obs)** | A single piece of clinical data captured during an encounter (e.g., blood pressure reading, diagnosis, symptom). Uses concept dictionary for standardization. | `obs` array in `Encounter` | The fundamental unit of clinical data. Everything from vital signs to diagnoses to lab results is stored as observations. |
| **Queue Entry** | Represents a patient waiting in a service queue. Links to a visit and tracks queue status, priority, and wait time. | `QueueEntry` entity | Manages patient flow through the facility. Essential for reducing wait times and optimizing staff allocation. |
| **Queue Number** | A sequential number assigned to a patient when joining a queue, stored as a visit attribute. Used for calling patients and tracking position. | Visit attribute (UUID configured in system) | Provides clear communication to patients about their position. Reduces confusion and perceived wait time. |
| **Check-In** | The process of marking a patient as present at the facility. For appointments, changes status to "CheckedIn". May create a new visit or use existing active visit. | Status change + optional visit creation | The critical transition from "scheduled" to "receiving care". Triggers queue entry, visit creation, and workflow initiation. |
| **Check-Out** | The process of ending a patient's visit by setting `stopDatetime`. May be triggered by appointment completion, discharge, or manual action. | Setting `Visit.stopDatetime` | Formally closes the care episode. Important for accurate reporting, billing finalization, and bed/resource management. |

---

## Scheduling Domain

Terms related to appointments, scheduling, and time management.

| Term | Definition | Source Entity | Business Importance |
|------|------------|---------------|---------------------|
| **Appointment** | A scheduled time slot for a patient to receive a specific service from a provider at a location. Has a status that tracks its lifecycle. | `Appointment` entity | Enables planned care delivery and resource allocation. Reduces wait times and improves patient satisfaction. |
| **Appointment Status: Scheduled** | Initial status when appointment is booked. Patient has not yet arrived. | `AppointmentStatus.SCHEDULED` enum | Indicates future commitment. Used for capacity planning and reminder notifications. |
| **Appointment Status: CheckedIn** | Patient has arrived and checked in for the appointment. Visit may have been created. | `AppointmentStatus.CHECKEDIN` enum | Indicates patient is present and ready for service. Triggers queue entry and provider notification. |
| **Appointment Status: Completed** | Appointment finished successfully. Patient received the scheduled service. | `AppointmentStatus.COMPLETED` enum | Indicates successful service delivery. Used for attendance tracking and outcome reporting. |
| **Appointment Status: Cancelled** | Appointment was cancelled before patient arrived (by patient or provider). | `AppointmentStatus.CANCELLED` enum | Frees up capacity for other patients. Important for no-show vs. cancellation distinction in reporting. |
| **Appointment Status: Missed** | Patient did not show up for scheduled appointment (no-show). | `AppointmentStatus.MISSED` enum | Tracks patient adherence and identifies patients needing follow-up. Different from cancellation - patient intended to come but didn't. |
| **Appointment Kind** | Categorizes how the appointment was created: **Scheduled** (pre-booked), **WalkIn** (same-day without appointment), **Virtual** (telemedicine). | `appointmentKind` enum | Determines workflow and resource allocation. Walk-ins may have different priority or documentation requirements. |
| **Appointment Service** | Defines the type of clinic or care being provided (e.g., "HIV Clinic", "Diabetes Clinic", "General Outpatient"). Includes operating hours and capacity limits. | `AppointmentService` entity | Organizes scheduling by clinical specialty. Determines available time slots, providers, and service-specific workflows. |
| **Service Type** | A sub-category within an appointment service with its own duration (e.g., "Chemotherapy" within "Oncology Service"). Optional refinement of service. | `ServiceTypes` within `AppointmentService` | Allows more granular scheduling within a service. Different service types may have different durations or resource requirements. |
| **Appointment-Visit Link** | The implicit relationship between an appointment and visit, correlated by patient UUID and overlapping time periods. **Not stored as a foreign key**. | Implicit - no direct database link | Critical for understanding which visit corresponds to which appointment. Mobile apps must implement correlation logic. |
| **Conflict Detection** | API that checks for scheduling conflicts (patient double-booked, provider unavailable, service at capacity). **Advisory only - does not prevent booking**. | `POST /appointments/conflicts` endpoint | Warns users of potential issues but allows overrides. Important for preventing double-booking but flexible for urgent cases. |
| **Recurring Appointment** | A series of appointments created from a single pattern (e.g., "every Monday for 8 weeks"). Each appointment is a separate record. | `RecurringPattern` + individual `Appointment` records | Simplifies booking for ongoing care (e.g., chemotherapy, physical therapy). Each appointment can be modified independently. |
| **Provider Availability** | Time periods when a provider is available for appointments. **Not explicitly modeled** - inferred from existing appointments and service operating hours. | Inferred from `Appointment` records + `AppointmentService` hours | Determines available time slots for booking. Lack of explicit availability calendar is a limitation for complex scheduling. |

---

## Technical Domain

Terms related to system behavior, data management, and technical constraints.

| Term | Definition | Source Entity | Business Importance |
|------|------------|---------------|---------------------|
| **UUID** | Universally Unique Identifier - a 128-bit value used as primary key for all entities (e.g., `8673ee4f-e2ab-4077-ba55-4980f408773e`). | All entity primary keys | Enables distributed systems and offline sync without ID conflicts. Critical for mobile app architecture. |
| **Voided** | Soft delete flag - record is marked as deleted but retained in database. Voided records are excluded from normal queries but preserved for audit. | `voided` boolean on all entities | Maintains data integrity and audit trail. Regulatory requirement in healthcare - data cannot be truly deleted. |
| **Deleted vs. Voided** | **Deleted** = physically removed from database (rare/never in OpenMRS). **Voided** = logically deleted but physically retained. | System-wide pattern | Voiding is the standard deletion mechanism. True deletion only occurs in exceptional circumstances (e.g., test data cleanup). |
| **Resource Version** | API version number indicating the schema version of the returned data (e.g., `"1.9"`). Used for API compatibility. | `resourceVersion` field in API responses | Allows clients to handle schema changes gracefully. Important for mobile app backward compatibility. |
| **Custom Representation** | Query parameter that specifies which fields to include in API response (e.g., `v=custom:(uuid,name,age)`). Reduces payload size. | `v=` query parameter in REST API | Optimizes network usage and response time. Critical for mobile apps on slow connections. |
| **Offline Sync** | Ability to create/modify data while disconnected, then synchronize when connection is restored. Uses UUID for conflict resolution. | Client-side implementation + sync queue | Essential for mobile apps in areas with unreliable connectivity. Requires careful conflict resolution logic. |
| **Optimistic Locking** | Concurrency control where client assumes no conflicts and handles them if they occur during sync. Alternative to pessimistic locking. | Client-side implementation | Enables offline functionality. Conflicts are rare in practice but must be handled gracefully when they occur. |
| **Implicit Relationship** | A relationship between entities that is not stored as a foreign key but inferred from other fields (e.g., appointment-visit link via patient + time). | Pattern used for appointment-visit correlation | Provides flexibility but requires careful query logic. Mobile apps must implement correlation algorithms. |
| **Soft Constraint** | A validation rule that warns but does not prevent an action (e.g., appointment conflict detection, maxAppointmentsLimit). | Various advisory validations | Balances data quality with operational flexibility. Staff can override when clinically necessary. |
| **Hard Constraint** | A validation rule that strictly prevents an action (e.g., required fields, unique identifiers in UNIQUE mode). | Database constraints + API validation | Ensures critical data integrity rules are never violated. Cannot be overridden. |
| **Check Digit Algorithm** | Mathematical formula to validate identifier accuracy (e.g., Luhn algorithm for credit cards). **Not implemented in current system**. | Missing from identifier validation | Would prevent transcription errors in manual identifier entry. Current system only uses regex validation. |
| **Timezone Handling** | How the system stores and interprets date/time values across different timezones. Uses ISO 8601 format with timezone offset. | Date/time fields with timezone parameter | Critical for multi-site deployments and accurate reporting. Appointment status changes require explicit timezone. |
| **Visit Expiration** | Automatic closure of visits after configured hours of inactivity (default 12-24 hours). Prevents indefinitely open visits. | Background job + `visitExpireHours` config | Maintains data quality and accurate reporting. Prevents "forgotten" check-outs from skewing metrics. |

---

## Naming Conventions

### Purpose
Establish consistent naming patterns for the mobile app codebase to ensure clarity, maintainability, and alignment with the legacy OpenMRS system.

### General Principles

1. **Use Domain Language**: Prefer OpenMRS terminology over generic terms
   - ✅ `Visit`, `Encounter`, `Appointment`
   - ❌ `Session`, `Event`, `Booking`

2. **Be Explicit About Status**: Include status in names when dealing with filtered subsets
   - ✅ `ActiveVisit`, `ScheduledAppointment`, `CompletedEncounter`
   - ❌ `Visit` (when you mean active only), `Appointment` (when you mean scheduled only)

3. **Distinguish Between Entity and DTO**: Use suffixes to clarify data transfer objects
   - ✅ `PatientDTO`, `AppointmentPayload`, `VisitResponse`
   - ❌ `Patient2`, `AppointmentData`, `VisitObject`

4. **Avoid Abbreviations**: Write full words unless the abbreviation is universally understood
   - ✅ `PatientIdentifier`, `EncounterProvider`, `ObservationValue`
   - ❌ `PatId`, `EncProv`, `ObsVal`
   - ✅ Exceptions: `UUID`, `API`, `HTTP`, `ID` (when part of compound word like `PatientID`)

### Entity Naming

| OpenMRS Entity | Mobile Class Name | Collection Name | Notes |
|----------------|-------------------|-----------------|-------|
| Patient | `Patient` | `patients` | Core entity - use as-is |
| Person | `Person` | `persons` | Nested within Patient |
| Visit | `Visit` | `visits` | Use `ActiveVisit` for filtered subset |
| Encounter | `Encounter` | `encounters` | Use `EncounterType` for types |
| Appointment | `Appointment` | `appointments` | Use `AppointmentStatus` enum |
| Provider | `Provider` | `providers` | Healthcare provider |
| Location | `Location` | `locations` | Facility location |
| Observation | `Observation` | `observations` | Clinical data point |
| QueueEntry | `QueueEntry` | `queueEntries` | Patient in queue |

### Status and Type Enums

Use PascalCase for enum names and SCREAMING_SNAKE_CASE for values:

```typescript
// ✅ Good
enum AppointmentStatus {
  SCHEDULED = 'Scheduled',
  CHECKED_IN = 'CheckedIn',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
  MISSED = 'Missed',
}

// ❌ Bad
enum appointmentStatus {
  scheduled = 'scheduled',
  checkedIn = 'checked_in',
  completed = 'completed',
}
```

### Boolean Flags

Use `is`, `has`, or `can` prefixes for boolean properties:

```typescript
// ✅ Good
isActive: boolean
hasActiveVisit: boolean
canCheckIn: boolean
birthdateEstimated: boolean
voided: boolean

// ❌ Bad
active: boolean
activeVisit: boolean
checkIn: boolean
estimatedBirthdate: boolean
deleted: boolean
```

### Date/Time Fields

Use descriptive suffixes to clarify the nature of the timestamp:

```typescript
// ✅ Good
startDatetime: string
stopDatetime: string
encounterDatetime: string
dateAppointmentScheduled: string
createdAt: Date
updatedAt: Date

// ❌ Bad
start: string
stop: string
date: string
time: string
timestamp: Date
```

### API Response Types

Use descriptive suffixes for API-related types:

```typescript
// ✅ Good
interface AppointmentResponse {
  data: Appointment[];
}

interface PatientPayload {
  uuid: string;
  identifiers: PatientIdentifier[];
}

interface VisitSearchCriteria {
  patientUuid: string;
  includeInactive: boolean;
}

// ❌ Bad
interface AppointmentData { }
interface PatientRequest { }
interface VisitParams { }
```

### Service/Repository Classes

Use descriptive suffixes to clarify the layer:

```typescript
// ✅ Good
class AppointmentService { }
class PatientRepository { }
class VisitValidator { }
class EncounterMapper { }

// ❌ Bad
class AppointmentManager { }
class PatientData { }
class VisitHelper { }
class EncounterUtils { }
```

### Constants

Use SCREAMING_SNAKE_CASE for constants:

```typescript
// ✅ Good
const MAX_APPOINTMENTS_LIMIT = 30;
const VISIT_EXPIRE_HOURS = 24;
const DEFAULT_UNKNOWN_GIVEN_NAME = 'UNKNOWN';

// ❌ Bad
const maxAppointmentsLimit = 30;
const visitExpireHours = 24;
const defaultUnknownGivenName = 'UNKNOWN';
```

### File Naming

Use kebab-case for file names, matching the primary export:

```
✅ Good:
patient.model.ts          → exports Patient class
appointment.service.ts    → exports AppointmentService
visit.repository.ts       → exports VisitRepository
encounter-type.enum.ts    → exports EncounterType enum

❌ Bad:
Patient.ts
appointmentService.ts
visit_repository.ts
EncounterType.ts
```

### Avoid These Anti-Patterns

1. **Generic Names**: `data`, `info`, `item`, `object`, `thing`
2. **Redundant Prefixes**: `OpenMRSPatient`, `SystemVisit`, `AppEncounter`
3. **Inconsistent Pluralization**: Mix of `appointment` and `appointments` for collections
4. **Ambiguous Abbreviations**: `appt`, `enc`, `obs`, `pt`
5. **Hungarian Notation**: `strName`, `intAge`, `boolActive`
6. **Template Placeholders**: `TrangN`, `TODO`, `FIXME` in production code

### Example: Good vs. Bad Naming

```typescript
// ❌ Bad - Unclear, inconsistent, abbreviated
interface ApptData {
  id: string;
  pt: PatientInfo;
  stat: string;
  dt: number;
  prov: string;
}

class ApptMgr {
  getAppts(ptId: string): ApptData[] { }
  chkIn(apptId: string): void { }
}

// ✅ Good - Clear, consistent, explicit
interface Appointment {
  uuid: string;
  patient: Patient;
  status: AppointmentStatus;
  startDatetime: string;
  provider: Provider;
}

class AppointmentService {
  getAppointmentsByPatient(patientUuid: string): Appointment[] { }
  checkInAppointment(appointmentUuid: string): void { }
}
```

---

## Glossary Maintenance

**Ownership**: Technical Documentation Team  
**Review Frequency**: Quarterly or when new entities are added  
**Update Process**: 
1. Propose changes via pull request
2. Review with Business Analyst and Tech Lead
3. Update related entity analysis documents
4. Notify development team of changes

**Questions or Additions?** Contact the Technical Documentation Team or submit a pull request with proposed changes.

---

**Document Status**: ✅ Complete - Ready for Team Use  
**Last Updated**: 2026-04-17  
**Next Review**: 2026-07-17
