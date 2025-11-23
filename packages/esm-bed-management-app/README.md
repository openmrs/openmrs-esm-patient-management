# Bed Management App

A frontend module for configuring and managing beds in a facility. This app provides the setup interface for bed types, bed tags, and bed creation within wards. It does **not** handle patient assignments—that functionality is provided by the [Ward App](../esm-ward-app).

## Purpose

This app is used for **initial setup and configuration** of the bed management system. Use it to:

- Create and manage bed types (e.g., "Standard Maternity Bed", "ICU Bed")
- Create and manage bed tags (e.g., "Oxygen", "Isolation", "Wheelchair Accessible")
- Create beds and assign them to locations with row/column positions
- View bed summaries by location

## Prerequisites

- [openmrs-module-bedmanagement](https://github.com/openmrs/openmrs-module-bedmanagement) must be installed on the OpenMRS server
- At least one Location must be tagged with "Admission Location" (or the configured tag name)

## Setup Workflow

1. **Configure Admission Location**: Ensure your ward location has the "Admission Location" tag
2. **Create Bed Types**: Define bed types (e.g., `maternity-standard`, `maternity-labor-delivery`)
3. **Create Bed Tags** (optional): Define tags for categorizing beds
4. **Create Beds**: Add beds with bed numbers, types, and layout positions (row/column)
5. **Use Ward App**: Assign patients to beds using the [Ward App](../esm-ward-app)

## Configuration

The app can be configured via the frontend configuration:

```typescript
{
  admissionLocationTagName: "Admission Location" // Default: "Admission Location"
}
```

This determines which location tag identifies wards that support bed management.

## Key Features

- **Bed Types Management**: Create, edit, and delete bed types with name, display name, and description
- **Bed Tags Management**: Create, edit, and delete tags for categorizing beds
- **Bed Administration**: Create and edit beds with:
  - Bed number (max 10 characters)
  - Bed type assignment
  - Row and column positions for layout visualization
  - Location assignment
  - Optional tag assignments
- **Bed Summary**: View beds grouped by location with occupancy statistics

## What This App Does NOT Do

- ❌ Assign patients to beds (use [Ward App](../esm-ward-app))
- ❌ Perform bed swaps or transfers (use [Ward App](../esm-ward-app))
- ❌ Manage patient admissions (use [Ward App](../esm-ward-app))
- ❌ Display bed layouts with patients (use [Ward App](../esm-ward-app))

## Related Modules

- **[Ward App](../esm-ward-app)**: Provides patient management, bed assignments, transfers, and bed layout visualization
- **[Backend Bed Management Module](https://github.com/openmrs/openmrs-module-bedmanagement)**: Provides REST APIs and business logic

## Example: Setting Up a Maternity Ward

1. Create bed types:
   - `maternity-standard` (Display: "MAT-STD")
   - `maternity-labor-delivery` (Display: "LAB-DEL")
   - `maternity-postpartum` (Display: "POSTPART")

2. Create bed tags (optional):
   - `Oxygen`
   - `Isolation`
   - `Wheelchair Accessible`

3. Create beds:
   - Bed M-101: Type `maternity-standard`, Row 1, Column 1
   - Bed M-102: Type `maternity-standard`, Row 1, Column 2
   - Continue for all beds...

4. Use Ward App to assign patients to these beds during daily operations.
