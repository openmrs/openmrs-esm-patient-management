# Appointment Entity Analysis

**Updated Date:** 2026-04-17  
**Analyzed By:** Technical Documentation Specialist (Paige)

---

## Table of Contents

1. [Overview](#overview)
2. [Related Files](#related-files)
3. [Data Schema](#data-schema)
4. [Business Rules](#business-rules)
5. [Legacy Constraints](#legacy-constraints)
6. [Diagrams](#diagrams)
7. [Key Insights](#key-insights)
8. [Questions & Todos](#questions--todos)

---

## Overview

This document provides a comprehensive analysis of the Appointment entity in the OpenMRS patient management system. The analysis focuses on appointment scheduling, status transitions, the critical link between appointments and visits when patients arrive, and constraints around time slots and provider availability.

### Purpose
- Document the complete Appointment data schema
- Identify all appointment status transitions and rules
- Understand the appointment-to-visit transformation workflow
- Map scheduling constraints and availability management
- Provide technical specifications for mobile appointment booking

### Scope
This analysis covers:
- Appointment core attributes (patient, provider, service, time, status)
- Appointment status lifecycle (Scheduled → CheckedIn → Completed/Cancelled/Missed)
- The arrival workflow: how appointments link to visits
- Service types, providers, and location relationships
- Scheduling constraints and conflict detection
- Recurring appointment patterns

---

## Related Files

### OpenMRS Source Files Analyzed

**Type Definitions:**
- \`packages/esm-appointments-app/src/types/index.ts\` - Core Appointment, AppointmentService, and status types
- \`packages/esm-service-queues-app/src/types/index.ts\` - Queue-integrated appointment types

**Business Logic:**
- \`packages/esm-appointments-app/src/patient-appointments/patient-appointments.resource.ts\` - Appointment fetching and status changes
- \`packages/esm-appointments-app/src/form/appointments-form.resource.ts\` - Appointment creation and conflict checking
- \`packages/esm-appointments-app/src/appointments/common-components/checkin-button.component.tsx\` - Check-in workflow
- \`packages/esm-appointments-app/src/appointments/common-components/batch-change-appointment-statuses.modal.tsx\` - Batch status changes and visit integration

**Status Transition Logic:**
- \`packages/esm-appointments-app/src/helpers/functions.ts\` - Status transition validation (\`canTransition\`)
- \`packages/esm-appointments-app/src/helpers/functions.test.ts\` - Status transition test cases

**Configuration:**
- \`packages/esm-appointments-app/src/config-schema.ts\` - Appointment configuration including check-in button settings

**Mock Data:**
- \`__mocks__/appointments.mock.ts\` - Appointment mock data with services and providers
- \`__mocks__/patient-appointments.mock.ts\` - Patient-specific appointment data

---

## Data Schema

### 1. Appointment Entity Structure

The Appointment entity represents a scheduled interaction between a patient and healthcare provider.

\`\`\`typescript
interface Appointment {
  uuid: string;
  appointmentNumber: string;
  appointmentKind: AppointmentKind; // 'Scheduled' | 'WalkIn' | 'Virtual'
  status: AppointmentStatus; // 'Scheduled' | 'CheckedIn' | 'Completed' | 'Cancelled' | 'Missed'
  patient: {
    uuid: string;
    name: string;
    identifier: string;
    age?: number;
    gender?: string;
  };
  service: AppointmentService;
  serviceTypes?: Array<ServiceTypes> | null;
  provider: OpenmrsResource;
  providers: Array<OpenmrsResource>;
  location: AppointmentLocation;
  startDateTime: string; // ISO 8601 or timestamp
  endDateTime: string | number;
  dateAppointmentScheduled: string;
  comments: string;
  additionalInfo?: string | null;
  recurring: boolean;
  voided: boolean;
  extensions: {};
  teleconsultationLink: string | null;
}
\`\`\`

**Core Attributes:**

- **uuid**: Unique identifier for the appointment
- **appointmentNumber**: Human-readable appointment number
- **appointmentKind**: Type of appointment (Scheduled, WalkIn, Virtual)
- **status**: Current appointment status (see Status Transitions section)
- **patient**: Simplified patient object (not full OpenMRS Patient)
- **service**: The appointment service (clinic type)
- **serviceTypes**: Optional sub-types within the service
- **provider**: Primary provider (legacy single provider)
- **providers**: Array of providers involved
- **location**: Where the appointment takes place
- **startDateTime**: When appointment begins
- **endDateTime**: When appointment ends
- **dateAppointmentScheduled**: When the appointment was booked
- **comments**: Notes about the appointment
- **recurring**: Whether this is part of a recurring series
- **voided**: Soft delete flag
- **teleconsultationLink**: Link for virtual appointments

### 2. Appointment Status Enum

\`\`\`typescript
enum AppointmentStatus {
  SCHEDULED = 'Scheduled',
  CHECKEDIN = 'CheckedIn',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
  MISSED = 'Missed',
}
\`\`\`

**Status Definitions:**

- **Scheduled**: Appointment is booked and confirmed
- **CheckedIn**: Patient has arrived and checked in
- **Completed**: Appointment finished successfully
- **Cancelled**: Appointment was cancelled (by patient or provider)
- **Missed**: Patient did not show up (no-show)

**Note**: The API supports two additional statuses not currently used in the UI:
- **Requested**: Appointment requested but not confirmed
- **WaitList**: Patient on waiting list for appointment

### 3. Appointment Kind Enum

\`\`\`typescript
enum AppointmentKind {
  SCHEDULED = 'Scheduled',  // Pre-booked appointment
  WALKIN = 'WalkIn',        // Walk-in without appointment
  VIRTUAL = 'Virtual',      // Telemedicine appointment
}
\`\`\`

### 4. Appointment Service Structure

Services define the type of clinic or care being provided.

\`\`\`typescript
interface AppointmentService {
  uuid: string;
  appointmentServiceId: number;
  name: string;
  description: string;
  location?: OpenmrsResource;
  specialityUuid?: OpenmrsResource | {};
  
  // Time constraints
  startTime: string; // Format: "HH:mm:ss"
  endTime: string;   // Format: "HH:mm:ss"
  durationMins?: number;
  
  // Capacity constraints
  maxAppointmentsLimit: number | null;
  
  // Configuration
  initialAppointmentStatus: string;
  color?: string;
  creatorName: string;
  
  // Service sub-types
  serviceTypes?: Array<ServiceTypes>;
  
  // Weekly availability (optional)
  weeklyAvailability?: Array<{
    dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
    startTime: string;
    endTime: string;
    maxAppointmentsLimit: number | null;
    uuid: string;
  }>;
}
\`\`\`

**Service Attributes:**

- **maxAppointmentsLimit**: Maximum concurrent appointments (null = unlimited)
- **startTime/endTime**: Operating hours for the service
- **durationMins**: Default appointment duration
- **weeklyAvailability**: Day-specific operating hours and capacity
- **serviceTypes**: Sub-categories within the service (e.g., "Chemotherapy" within "Oncology")

### 5. Service Types

\`\`\`typescript
interface ServiceTypes {
  uuid: string;
  name: string;
  duration: number; // Duration in minutes
}
\`\`\`

Service types allow for specialized appointment types within a service, each with their own duration.

### 6. Appointment Location

\`\`\`typescript
interface AppointmentLocation {
  uuid: string;
  name: string;
}
\`\`\`

### 7. Provider Structure

\`\`\`typescript
interface Provider {
  uuid: string;
  display: string;
  person: OpenmrsResource;
  name?: string;
  comments?: string;
  response?: string; // 'ACCEPTED' | 'DECLINED' | 'PENDING'
}
\`\`\`

**Provider Response**: When multiple providers are assigned, each can accept/decline the appointment.

### 8. Appointment Payload (for creation)

\`\`\`typescript
interface AppointmentPayload {
  patientUuid: string;
  serviceUuid: string;
  dateAppointmentScheduled: string;
  startDateTime: string;
  endDateTime: string;
  appointmentKind: string;
  providers?: Array<OpenmrsResource>;
  locationUuid: string;
  comments: string;
  status?: string;
  appointmentNumber?: string;
  uuid?: string; // For updates
  providerUuid?: string | OpenmrsResource;
}
\`\`\`

### 9. Recurring Appointments

\`\`\`typescript
interface RecurringPattern {
  type: 'DAY' | 'WEEK';
  period: number; // Repeat every N days/weeks
  endDate: string;
  daysOfWeek?: Array<string>; // For weekly: ['MONDAY', 'WEDNESDAY', 'FRIDAY']
}

interface RecurringAppointmentsPayload {
  appointmentRequest: AppointmentPayload;
  recurringPattern: RecurringPattern;
}
\`\`\`

**Recurring Appointment Support:**
- Daily recurrence: Repeat every N days
- Weekly recurrence: Repeat every N weeks on specific days
- End date required for all recurring patterns

---

## Business Rules

### 1. Appointment Status Transitions

The system enforces specific rules for status transitions using a sequence-based approach:

\`\`\`typescript
const sequences = {
  [AppointmentStatus.SCHEDULED]: 1,
  [AppointmentStatus.CHECKEDIN]: 3,
  [AppointmentStatus.COMPLETED]: 4,
  [AppointmentStatus.CANCELLED]: 4,
  [AppointmentStatus.MISSED]: 4,
};

// Transition allowed if:
// 1. Moving forward (fromSequence < toSequence)
// 2. OR moving back to Scheduled (reset)
canTransition = sequences[fromStatus] < sequences[toStatus] || toStatus === 'Scheduled';
\`\`\`

**Allowed Transitions:**

**Forward Transitions** (Always Allowed):
- Scheduled → CheckedIn
- Scheduled → Completed
- Scheduled → Cancelled
- Scheduled → Missed
- CheckedIn → Completed
- CheckedIn → Cancelled
- CheckedIn → Missed

**Backward to Scheduled** (Reset - Always Allowed):
- CheckedIn → Scheduled
- Completed → Scheduled
- Cancelled → Scheduled
- Missed → Scheduled

**Blocked Transitions:**
- Terminal to Terminal (Completed ↔ Cancelled ↔ Missed)
- Backward to CheckedIn from any terminal status
- Same status (except Scheduled → Scheduled which is allowed)

**Status Change API:**

\`\`\`typescript
POST /appointments/{appointmentUuid}/status-change
Body: {
  toStatus: string,
  onDate: string, // ISO 8601 with timezone
  timeZone: string
}
\`\`\`

### 2. The Arrival Link: Appointment to Visit Transformation

**This is the critical workflow for mobile apps!**

When a patient arrives for their appointment, the system must link the appointment to a visit. The behavior depends on whether the patient already has an active visit.

**Scenario 1: Patient Has NO Active Visit**

\`\`\`typescript
// User clicks "Check In" button
// System launches start visit workspace
launchWorkspace2('appointments-start-visit-workspace', {
  patientUuid,
  showPatientHeader: true,
  openedFrom: 'appointments-check-in',
  onVisitStarted: mutateVisits,
});

// Workflow:
// 1. User selects visit type and location
// 2. System creates new visit (POST /visit)
// 3. System updates appointment status to 'CheckedIn'
// 4. Visit and appointment are now linked (implicitly through patient and time)
\`\`\`

**Scenario 2: Patient HAS Active Visit**

\`\`\`typescript
// User clicks "Check In" button
// System only updates appointment status, does NOT create new visit
changeAppointmentStatus('CheckedIn', appointment.uuid)
  .then(() => {
    showSnackbar({
      title: 'Checked in',
      subtitle: 'Appointment checked in using existing active visit',
      kind: 'success',
    });
  });

// Workflow:
// 1. System detects active visit exists
// 2. System updates appointment status to 'CheckedIn'
// 3. Appointment uses existing active visit
// 4. NO new visit created
\`\`\`

**Scenario 3: Custom Check-In URL (Configuration Override)**

\`\`\`typescript
// If checkInButton.customUrl is configured
navigate({
  to: checkInButton.customUrl,
  templateParams: { 
    patientUuid: appointment.patient.uuid, 
    appointmentUuid: appointment.uuid 
  },
});

// Workflow:
// 1. System navigates to custom URL
// 2. Custom implementation handles check-in
// 3. Could be external system, custom form, etc.
\`\`\`

**Key Insight**: The appointment-to-visit link is **NOT stored directly** in the database. Instead:
- Appointments and visits are linked **implicitly** through:
  - Same patient UUID
  - Overlapping time periods
  - Check-in status change timestamp
- The system queries for active visits by patient UUID
- Mobile apps must check for active visits before creating new ones

### 3. Appointment Creation and Conflict Detection

**Creating an Appointment:**

\`\`\`typescript
POST /appointment
Body: AppointmentPayload

// Required fields:
// - patientUuid
// - serviceUuid
// - startDateTime
// - endDateTime
// - appointmentKind
// - locationUuid
\`\`\`

**Conflict Detection:**

\`\`\`typescript
POST /appointments/conflicts
Body: {
  patientUuid: string,
  serviceUuid: string,
  startDateTime: string,
  endDateTime: string,
  providers: Array,
  locationUuid: string,
  appointmentKind: string,
  uuid?: string // For updates
}

// Returns: Array of conflicting appointments
\`\`\`

**Conflict Types:**
1. **Patient Conflict**: Patient already has appointment at same time
2. **Provider Conflict**: Provider already booked at same time
3. **Service Capacity**: Service maxAppointmentsLimit reached
4. **Location Conflict**: Location unavailable

**Note**: The system **detects** conflicts but does **NOT automatically prevent** double-booking. The UI shows warnings but allows overrides.

### 4. Scheduling Constraints

**Time Slot Management:**

The system uses a **soft constraint** model:

- **maxAppointmentsLimit**: Suggested maximum, not enforced
- **weeklyAvailability**: Defines operating hours per day
- **durationMins**: Default duration, can be overridden

**Provider Availability:**

- No explicit provider availability calendar in the codebase
- Availability inferred from existing appointments
- Conflict detection checks provider's existing appointments
- No "blocked time" or "unavailable" periods found

**Double-Booking:**

⚠️ **The system does NOT prevent double-booking!**

- Conflict detection API exists but is advisory only
- UI may show warnings but allows booking anyway
- No database constraints prevent overlapping appointments
- Mobile apps must implement their own prevention logic

### 5. Appointment Completion and Visit Closure

When marking an appointment as "Completed":

\`\`\`typescript
// If patient has active visit, system offers to close it
changeAppointmentStatus('Completed', appointment.uuid)
  .then(() => {
    return getActiveVisitsForPatient(appointment.patient.uuid);
  })
  .then((response) => {
    const activeVisit = response.data.results?.[0];
    if (activeVisit) {
      // Prompt user: "Close the active visit?"
      // If yes: POST /visit/{uuid} with stopDatetime
    }
  });
\`\`\`

**Workflow:**
1. Appointment status → Completed
2. System checks for active visit
3. If found, prompts to close visit
4. User can choose to close visit or leave it open
5. **Not automatic** - requires user confirmation

---

## Legacy Constraints

### 1. No Direct Appointment-Visit Link

**Current Implementation:**
- No foreign key or direct reference between Appointment and Visit tables
- Link is **implicit** through patient UUID and timestamps
- Querying requires joining on patient and time overlap

**Implications:**
- Cannot directly query "all appointments for this visit"
- Cannot directly query "which visit was this appointment for"
- Reporting requires complex joins
- Mobile apps must maintain their own association logic

**Workaround:**
- Check for active visit by patient UUID before check-in
- Store appointment UUID in visit attributes (custom implementation)
- Use timestamps to correlate appointments with visits

### 2. Weak Scheduling Constraints

**Current Implementation:**
- \`maxAppointmentsLimit\` is advisory, not enforced
- No database-level uniqueness constraints
- Conflict detection is client-side only

**Implications:**
- Double-booking is possible
- Overbooking services is possible
- Race conditions in concurrent booking scenarios
- Mobile apps must implement optimistic locking

### 3. Provider Availability Model

**Current Implementation:**
- No explicit provider availability/unavailability calendar
- No "blocked time" or "time off" concept
- Availability inferred from existing appointments only

**Implications:**
- Cannot mark provider as "unavailable" for a time period
- Cannot block time for meetings, breaks, etc.
- Provider scheduling requires external calendar system
- Mobile apps cannot show "available slots" reliably

### 4. Service Operating Hours

**Current Implementation:**
- \`startTime\` and \`endTime\` on service level
- Optional \`weeklyAvailability\` for day-specific hours
- No holiday calendar or special closures

**Implications:**
- Cannot handle holidays or special closures
- Cannot handle variable hours (e.g., "closed second Tuesday of month")
- Mobile apps must implement their own business hours logic

### 5. Appointment Search Limitations

**Current Implementation:**
- Appointment search uses POST (not GET)
- Search by patient UUID and start date only
- No search by provider, service, or location directly

**API:**
\`\`\`typescript
POST /appointments/search
Body: {
  patientUuid: string,
  startDate: string
}
\`\`\`

**Implications:**
- Cannot efficiently query "all appointments for provider X"
- Cannot query "all appointments at location Y"
- Cannot query "all appointments for service Z"
- Reporting requires full table scans

### 6. Recurring Appointment Limitations

**Current Implementation:**
- Recurring appointments create individual appointment records
- No "series" concept linking recurring appointments
- Cannot update "all future appointments in series"

**Implications:**
- Cancelling one appointment doesn't affect others
- Updating recurring pattern requires deleting and recreating
- No way to identify which appointments are part of same series
- Mobile apps must track series separately

---

## Diagrams

### Appointment Status State Diagram

\`\`\`mermaid
stateDiagram-v2
    [*] --> Scheduled: Book Appointment
    
    Scheduled --> CheckedIn: Patient Arrives<br/>(Check-In)
    Scheduled --> Completed: Mark Complete<br/>(Skip Check-In)
    Scheduled --> Cancelled: Cancel Appointment
    Scheduled --> Missed: Patient No-Show
    
    CheckedIn --> Completed: Finish Appointment
    CheckedIn --> Cancelled: Cancel After Check-In
    CheckedIn --> Missed: Mark as Missed
    
    Completed --> Scheduled: Reset/Reschedule
    Cancelled --> Scheduled: Reinstate
    Missed --> Scheduled: Reschedule
    
    Completed --> [*]
    Cancelled --> [*]
    Missed --> [*]
    
    note right of Scheduled
        Sequence: 1
        Can transition to any status
    end note
    
    note right of CheckedIn
        Sequence: 3
        Patient has arrived
        Visit may be created
    end note
    
    note right of Completed
        Sequence: 4 (Terminal)
        Can only reset to Scheduled
        Cannot go to Cancelled/Missed
    end note
    
    note right of Cancelled
        Sequence: 4 (Terminal)
        Can only reset to Scheduled
        Cannot go to Completed/Missed
    end note
    
    note right of Missed
        Sequence: 4 (Terminal)
        Can only reset to Scheduled
        Cannot go to Completed/Cancelled
    end note
\`\`\`

### Appointment and Related Entities Class Diagram

\`\`\`mermaid
classDiagram
    class Appointment {
        +String uuid
        +String appointmentNumber
        +AppointmentKind appointmentKind
        +AppointmentStatus status
        +Patient patient
        +AppointmentService service
        +Array~ServiceTypes~ serviceTypes
        +Provider provider
        +Array~Provider~ providers
        +AppointmentLocation location
        +String startDateTime
        +String endDateTime
        +String comments
        +Boolean recurring
        +Boolean voided
    }
    
    class AppointmentService {
        +String uuid
        +String name
        +String description
        +String startTime
        +String endTime
        +Number durationMins
        +Number maxAppointmentsLimit
        +Array~ServiceTypes~ serviceTypes
        +Array~WeeklyAvailability~ weeklyAvailability
    }
    
    class ServiceTypes {
        +String uuid
        +String name
        +Number duration
    }
    
    class WeeklyAvailability {
        +String dayOfWeek
        +String startTime
        +String endTime
        +Number maxAppointmentsLimit
    }
    
    class Provider {
        +String uuid
        +String display
        +OpenmrsResource person
        +String response
    }
    
    class AppointmentLocation {
        +String uuid
        +String name
    }
    
    class Patient {
        +String uuid
        +String name
        +String identifier
        +String gender
        +Number age
    }
    
    class Visit {
        +String uuid
        +Patient patient
        +String startDatetime
        +String stopDatetime
        +Location location
    }
    
    Appointment "1" --> "1" Patient
    Appointment "1" --> "1" AppointmentService
    Appointment "1" --> "0..*" ServiceTypes
    Appointment "1" --> "1..*" Provider
    Appointment "1" --> "1" AppointmentLocation
    Appointment "0..*" -.-> "0..1" Visit: implicit link via<br/>patient + time
    
    AppointmentService "1" --> "0..*" ServiceTypes
    AppointmentService "1" --> "0..*" WeeklyAvailability
\`\`\`


### Booking to Visit Workflow Sequence Diagram

\`\`\`mermaid
sequenceDiagram
    participant Patient
    participant MobileApp
    participant AppointmentAPI
    participant VisitAPI
    participant Database
    
    Note over Patient,Database: Phase 1: Booking Appointment
    
    Patient->>MobileApp: Request Appointment
    MobileApp->>AppointmentAPI: POST /appointments/conflicts
    Note over AppointmentAPI: Check for conflicts<br/>(advisory only)
    AppointmentAPI-->>MobileApp: Conflict warnings (if any)
    
    MobileApp->>Patient: Show available slots<br/>(with warnings)
    Patient->>MobileApp: Confirm booking
    
    MobileApp->>AppointmentAPI: POST /appointment
    AppointmentAPI->>Database: INSERT appointment<br/>status='Scheduled'
    Database-->>AppointmentAPI: Appointment created
    AppointmentAPI-->>MobileApp: Appointment UUID
    MobileApp-->>Patient: Booking confirmed
    
    Note over Patient,Database: Phase 2: Patient Arrives (Check-In)
    
    Patient->>MobileApp: Arrives at facility
    MobileApp->>VisitAPI: GET /visit?patient={uuid}&includeInactive=false
    VisitAPI-->>MobileApp: Active visits (if any)
    
    alt No Active Visit
        MobileApp->>Patient: Prompt for visit details<br/>(visit type, location)
        Patient->>MobileApp: Confirm visit details
        
        MobileApp->>VisitAPI: POST /visit
        Note over VisitAPI: Create new visit<br/>startDatetime=now()<br/>stopDatetime=null
        VisitAPI->>Database: INSERT visit
        Database-->>VisitAPI: Visit UUID
        VisitAPI-->>MobileApp: Visit created
        
        MobileApp->>AppointmentAPI: POST /appointments/{uuid}/status-change
        Note over AppointmentAPI: Update status to 'CheckedIn'
        AppointmentAPI->>Database: UPDATE appointment<br/>status='CheckedIn'
        Database-->>AppointmentAPI: Updated
        AppointmentAPI-->>MobileApp: Status updated
        
        MobileApp-->>Patient: Checked in successfully<br/>Visit started
        
    else Active Visit Exists
        MobileApp->>AppointmentAPI: POST /appointments/{uuid}/status-change
        Note over AppointmentAPI: Update status to 'CheckedIn'<br/>Use existing visit
        AppointmentAPI->>Database: UPDATE appointment<br/>status='CheckedIn'
        Database-->>AppointmentAPI: Updated
        AppointmentAPI-->>MobileApp: Status updated
        
        MobileApp-->>Patient: Checked in successfully<br/>Using existing visit
    end
    
    Note over Patient,Database: Phase 3: Appointment Complete
    
    Patient->>MobileApp: Appointment finished
    MobileApp->>AppointmentAPI: POST /appointments/{uuid}/status-change<br/>toStatus='Completed'
    AppointmentAPI->>Database: UPDATE appointment<br/>status='Completed'
    Database-->>AppointmentAPI: Updated
    
    MobileApp->>VisitAPI: GET /visit?patient={uuid}&includeInactive=false
    VisitAPI-->>MobileApp: Active visit
    
    MobileApp->>Patient: Close visit?
    
    alt User Chooses to Close Visit
        Patient->>MobileApp: Yes, close visit
        MobileApp->>VisitAPI: POST /visit/{uuid}<br/>stopDatetime=now()
        VisitAPI->>Database: UPDATE visit<br/>stopDatetime=now()
        Database-->>VisitAPI: Updated
        VisitAPI-->>MobileApp: Visit closed
        MobileApp-->>Patient: Appointment complete<br/>Visit closed
    else User Keeps Visit Open
        Patient->>MobileApp: No, keep visit open
        MobileApp-->>Patient: Appointment complete<br/>Visit remains active
    end
\`\`\`

---

## Key Insights

### 💡 Business Insights

- **Implicit Appointment-Visit Link**: The system does not store a direct foreign key between appointments and visits. This design allows flexibility (one visit can span multiple appointments) but requires careful correlation logic in mobile apps.

- **Flexible Status Model**: The sequence-based status transition model allows resetting appointments back to "Scheduled" from any terminal state, supporting real-world scenarios where appointments need to be rescheduled after cancellation or no-show.

- **Soft Scheduling Constraints**: The system provides conflict detection but does not enforce hard limits. This "advisory" model gives staff flexibility to override system suggestions but requires careful UI design to prevent accidental double-booking.

- **Check-In Determines Visit Creation**: The critical decision point is check-in: if an active visit exists, use it; otherwise, create a new one. This prevents duplicate visits but requires mobile apps to always check for active visits first.

- **Provider Array Support**: The system supports multiple providers per appointment (e.g., doctor + nurse + specialist), with each provider able to accept/decline. This is more sophisticated than many appointment systems.

- **Recurring Appointment Pattern**: Recurring appointments are created as individual records, not as a linked series. This simplifies querying but makes bulk updates challenging.

### ⚠️ Risks & Warnings

- **No Appointment-Visit Foreign Key**: The lack of a direct database link between appointments and visits creates several risks:
  - Cannot reliably query "which visit was this appointment for"
  - Reporting requires complex time-based joins
  - Race conditions if visit is closed while appointment is being checked in
  - **Mitigation**: Mobile apps should store appointment UUID in visit attributes; implement robust correlation logic

- **Double-Booking is Possible**: The conflict detection API is advisory only:
  - No database constraints prevent overlapping appointments
  - Concurrent bookings can create conflicts
  - \`maxAppointmentsLimit\` is not enforced
  - **Mitigation**: Implement optimistic locking; show clear warnings; consider implementing hard limits in mobile app

- **No Provider Availability Calendar**: The system cannot represent provider unavailability:
  - Cannot block time for meetings, breaks, lunch
  - Cannot mark provider as "on vacation"
  - Cannot handle provider schedule changes
  - **Mitigation**: Integrate with external calendar system; implement custom availability tracking

- **Search API Limitations**: The appointment search API only supports patient + date:
  - Cannot efficiently query by provider
  - Cannot query by service or location
  - Requires POST instead of GET (not RESTful)
  - **Mitigation**: Implement client-side filtering; consider custom search endpoints

- **Recurring Appointment Management**: Individual records for recurring appointments create challenges:
  - Cannot update "all future appointments in series"
  - Cannot identify which appointments are related
  - Cancelling one doesn't affect others
  - **Mitigation**: Track series ID in comments or custom attribute; implement series management in mobile app

- **Time Zone Handling**: Appointment times are stored as strings or timestamps:
  - Unclear if timezone is preserved
  - Status change API requires explicit timezone parameter
  - Risk of timezone conversion errors
  - **Mitigation**: Always use ISO 8601 with timezone; test across timezones thoroughly

- **No Holiday/Closure Calendar**: Service operating hours are static:
  - Cannot represent holidays or special closures
  - Cannot handle variable schedules
  - **Mitigation**: Implement custom closure calendar; check before showing available slots

### 💡 Mobile Optimization Opportunities

1. **Smart Check-In Flow**:
   - Auto-detect active visit before showing check-in options
   - Pre-populate visit type from appointment service
   - One-tap check-in for patients with active visits
   - Show estimated wait time based on queue

2. **Conflict Prevention**:
   - Real-time availability checking as user selects time
   - Visual calendar showing booked vs. available slots
   - Prevent selection of conflicting times (hard constraint in mobile)
   - Show provider availability clearly

3. **Offline Booking**:
   - Queue appointment requests for sync
   - Optimistic UI updates
   - Conflict resolution on sync
   - Local validation before sync

4. **Appointment Reminders**:
   - Push notifications before appointment
   - SMS reminders (if phone number available)
   - In-app reminder list
   - "Check-in now" quick action

5. **Visit Correlation**:
   - Store appointment UUID in visit attributes
   - Show related appointments in visit summary
   - Link encounter notes back to appointment
   - Generate appointment-specific reports

6. **Provider Selection**:
   - Show provider photos and bios
   - Display provider ratings/reviews
   - Filter by provider availability
   - Show provider specialties

7. **Recurring Appointment UX**:
   - Visual series indicator
   - "Edit all future" option
   - Series cancellation with confirmation
   - Show next appointment in series

---

## Questions & Todos

### Open Questions

1. **Q: How are appointment and visit linked in reporting?**
   - Need to understand the join logic used in reports
   - Check if there's a standard correlation method
   - Understand performance implications

2. **Q: What happens to appointments when a patient is merged?**
   - Are appointments transferred to primary patient?
   - How are conflicts resolved?
   - Need to test merge scenarios

3. **Q: Can appointments span multiple days?**
   - Current schema suggests single-day only
   - What about overnight observations?
   - How are multi-day appointments handled?

4. **Q: How are teleconsultation links generated?**
   - Is there integration with video platforms?
   - Who generates the link?
   - How is link security handled?

5. **Q: What is the appointmentNumber generation logic?**
   - Is it auto-generated or manual?
   - Is it unique globally or per service?
   - Can it be customized?

### Todo Items

- [ ] Document specific appointment service configurations for target deployment
- [ ] Create API examples for common appointment operations
- [ ] Map appointment workflow to mobile app screens
- [ ] Document conflict resolution strategies for offline booking
- [ ] Create test scenarios for edge cases (concurrent booking, timezone issues)
- [ ] Document provider availability integration points
- [ ] Create performance benchmarks for appointment queries
- [ ] Document security/permissions model for appointment operations
- [ ] Map recurring appointment patterns used in production
- [ ] Create troubleshooting guide for common appointment issues

### Next Analysis Steps

1. **Queue Management Analysis**: Deep dive into queue entry lifecycle and service workflows
2. **Observation Entity Analysis**: Understanding clinical data capture during visits
3. **Order Entity Analysis**: Medication orders, lab orders, and order workflows
4. **Provider Entity Analysis**: Provider attributes, roles, and scheduling
5. **Location Hierarchy Analysis**: Understanding location relationships and constraints

---

**Document Status**: ✅ Complete - Ready for Review  
**Last Updated**: 2026-04-17  
**Next Review**: When implementing mobile appointment booking workflows
