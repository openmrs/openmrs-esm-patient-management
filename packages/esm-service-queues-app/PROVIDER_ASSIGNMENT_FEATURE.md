# Provider Assignment Feature

## Overview
Added the ability to assign a patient to a specific provider when adding them to a queue or when editing an existing queue entry.

## Implementation Details

### 1. Created useProviders Hook
- **File**: `src/hooks/useProviders.ts`
- **Purpose**: Fetches the list of available providers from the OpenMRS API
- **Returns**: List of providers with their UUID and display information

### 2. Updated Queue Entry Creation
- **File**: `src/create-queue-entry/queue-fields/queue-fields.component.tsx`
- **Changes**:
  - Added provider field to the form schema (optional field)
  - Added provider dropdown selector that appears after queue location and service are selected
  - Integrated with useProviders hook to load available providers
  - Provider selection is optional - users can leave it blank

### 3. Updated API Resource Layer
- **File**: `src/create-queue-entry/queue-fields/queue-fields.resource.ts`
- **Changes**:
  - Added optional `providerUuid` parameter to `postQueueEntry` function
  - When a provider is selected, it's sent to the backend as `providerWaitingFor`

### 4. Updated Queue Entry Editing
- **File**: `src/modals/queue-entry-actions-modal.component.tsx`
- **Changes**:
  - Added provider dropdown to the edit modal
  - Displays current provider if assigned, with "(Current)" indicator
  - Allows changing or removing provider assignment

- **File**: `src/modals/edit-queue-entry.modal.tsx`
- **Changes**:
  - Updated submit action to include provider in the update request

- **File**: `src/modals/queue-entry-actions.resource.ts`
- **Changes**:
  - Fixed typo: `loationWaitingFor` → `locationWaitingFor`
  - Updated `providerWaitingFor` type to accept `{ uuid: string }`

### 5. Updated Translations
- **File**: `translations/en.json`
- **Added**: `"selectProvider": "Select a provider (optional)"`

### 6. Updated Tests
- **File**: `src/create-queue-entry/queue-fields/queue-fields.test.tsx`
- **Changes**:
  - Added mock for useProviders hook
  - Updated test expectations to include provider parameter (undefined when not selected)

## Configuration

### Queue Table Column Configuration

The provider column is now available and included by default in the queue table. Administrators can configure the column order and visibility via the configuration system:

```json
{
  "queueTables": {
    "tableDefinitions": [
      {
        "columns": [
          "patient-name",
          "coming-from", 
          "priority",
          "provider",
          "status",
          "queue",
          "wait-time",
          "actions"
        ],
        "appliedTo": [
          { "queue": "", "status": "" }
        ]
      }
    ]
  }
}
```

To hide the provider column, simply remove `"provider"` from the columns array. To change its position, move it to a different location in the array.

## User Experience

### Creating a Queue Entry
1. User selects queue location
2. User selects queue service
3. **NEW**: User can optionally select a provider from dropdown
4. User selects priority
5. Queue entry is created with optional provider assignment

### Editing a Queue Entry
1. User opens edit modal for existing queue entry
2. **NEW**: Provider dropdown shows currently assigned provider (if any)
3. User can change provider, assign a new one, or remove assignment
4. Changes are saved when form is submitted

### Viewing Queue Table
1. Queue table now displays a **Provider** column
2. Shows the name of the assigned provider for each queue entry
3. Shows "--" if no provider is assigned
4. Column is searchable - users can filter by provider name
5. Column position can be configured by administrators

## Provider Access Control

### 8. Implemented Provider-Based Access Control
- **File**: `src/helpers/provider-access.ts` (new)
- **Purpose**: Controls which providers can work on which patients based on assignment

**Access Rules:**
1. ✅ Provider can work on patients assigned to them
2. ✅ Provider can work on patients NOT assigned to any provider
3. ❌ Provider CANNOT work on patients assigned to another provider

**Implementation Details:**
- `canProviderWorkOnQueueEntry()` utility function checks access rights
- Action buttons (Call, Transition) are hidden if provider doesn't have access
- Serve button is disabled in the Call modal if provider cannot work on patient
- Visual indicators show assignment status in provider column:
  - Green "You" tag for patients assigned to current provider
  - Blue "Assigned" tag for patients assigned to other providers
  - "--" for unassigned patients

**User Experience:**
- Providers only see action buttons for patients they can work on
- Clear warning message when attempting to serve a patient assigned to another provider
- Provider can still view all patients in queue but cannot perform actions on restricted ones

**Files Modified:**
- `src/queue-table/cells/queue-table-action-cell.component.tsx` - Added access checks to actions
- `src/queue-table/cells/queue-table-provider-cell.component.tsx` - Added visual indicators
- `src/modals/call-modal/call-queue-entry.modal.tsx` - Added warning and disabled serve button
- `translations/en.json` - Added access control messages

## Technical Notes

- Provider field is **optional** - queue entries can still be created without a provider
- Provider data is fetched using SWR for efficient caching
- Provider dropdown shows loading state while data is being fetched
- **Access control is enforced at UI level** - providers cannot work on patients assigned to others
- Visual indicators clearly show assignment status
- TypeScript compilation passes without errors
- Backward compatible - existing code continues to work

## Queue Table Display

### 7. Added Provider Column to Queue Table
- **File**: `src/queue-table/cells/queue-table-provider-cell.component.tsx` (new)
- **Purpose**: Displays the provider assigned to a queue entry in the queue table
- **Features**:
  - Shows provider display name if assigned
  - Shows "--" if no provider is assigned
  - Column is searchable/filterable

- **File**: `src/config-schema.ts`
- **Changes**:
  - Added 'provider' to columnTypes
  - Added 'provider' to default queue table columns
  - Provider column appears between priority and status columns by default

- **File**: `src/queue-table/cells/columns.resource.ts`
- **Changes**:
  - Imported and registered provider column component
  - Added case for 'provider' column type in switch statement

## Files Modified

### New Files Created
1. `src/hooks/useProviders.ts` - Hook to fetch providers
2. `src/queue-table/cells/queue-table-provider-cell.component.tsx` - Provider column display
3. `src/helpers/provider-access.ts` - Access control utility

### Modified Files
4. `src/create-queue-entry/queue-fields/queue-fields.component.tsx` - Added provider selection
5. `src/create-queue-entry/queue-fields/queue-fields.resource.ts` - Added provider parameter to API
6. `src/create-queue-entry/queue-fields/queue-fields.test.tsx` - Updated tests
7. `src/modals/queue-entry-actions-modal.component.tsx` - Added provider to edit modal
8. `src/modals/edit-queue-entry.modal.tsx` - Updated to save provider
9. `src/modals/queue-entry-actions.resource.ts` - Fixed types
10. `src/modals/call-modal/call-queue-entry.modal.tsx` - Added access control warning
11. `src/queue-table/cells/queue-table-action-cell.component.tsx` - Added access control checks
12. `src/queue-table/cells/columns.resource.ts` - Registered provider column
13. `src/config-schema.ts` - Added provider column type
14. `translations/en.json` - Added new translations

## Testing

Run TypeScript compilation:
```bash
npx tsc --noEmit
```

Result: ✅ No errors

## API Contract

### Creating Queue Entry
```typescript
POST /openmrs/ws/rest/v1/visit-queue-entry
{
  visit: { uuid: string },
  queueEntry: {
    status: { uuid: string },
    priority: { uuid: string },
    queue: { uuid: string },
    patient: { uuid: string },
    providerWaitingFor: { uuid: string } // OPTIONAL - new field
    startedAt: Date,
    sortWeight: number
  }
}
```

### Updating Queue Entry
```typescript
POST /openmrs/ws/rest/v1/queue-entry/{queueEntryUuid}
{
  status?: Concept,
  priority?: Concept,
  priorityComment?: string,
  providerWaitingFor?: { uuid: string }, // OPTIONAL - can be updated
  startedAt?: string,
  endedAt?: string
}
```

## Summary

This feature adds comprehensive provider assignment and access control to the service queues system:

### Key Capabilities

1. **Provider Assignment**
   - Assign patients to specific providers when creating queue entries
   - Edit provider assignments at any time
   - Provider assignment is optional and flexible

2. **Visual Indicators**
   - Provider column in queue table shows who is assigned to each patient
   - Green "You" tag highlights patients assigned to current provider
   - Blue "Assigned" tag shows patients assigned to other providers
   - Easy to scan and identify assignments at a glance

3. **Access Control**
   - Providers can work on patients assigned to them
   - Providers can work on unassigned patients
   - Providers CANNOT work on patients assigned to other providers
   - Actions are automatically hidden/disabled based on access rights
   - Clear warning messages explain why access is restricted

4. **Configuration**
   - Provider column can be positioned anywhere in the table
   - Column can be hidden if not needed
   - Fully backward compatible with existing setups

### Benefits

- **Better Workload Distribution**: Clearly see which provider is handling which patient
- **Reduced Confusion**: Prevents multiple providers from serving the same patient
- **Improved Accountability**: Track which provider was assigned to each patient
- **Flexible Assignment**: Patients can be reassigned through the edit modal
- **Unassigned Flexibility**: Unassigned patients can be served by any provider
- **Transfer Workflow**: Patients can be reassigned to transfer them between providers
