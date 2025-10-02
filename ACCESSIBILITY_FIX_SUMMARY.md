# Accessibility Fix for OpenmrsDatePicker Components

## Issue: O3-5045
**Problem**: A form control does not have a corresponding label

### Description
OpenmrsDatePicker components were missing proper accessible labels, using empty `labelText=""` strings instead of meaningful labels. This creates accessibility barriers for screen readers and other assistive technologies.

### Pages Affected
1. **Appointments Page** - Date picker in appointments header
2. **Patient Edit/Registration Pages** - Date pickers in various forms
3. **Service Queues** - Date filters and entry forms

### Changes Made

#### 1. Fixed OpenmrsDatePicker Components with Empty Labels

**Files Modified:**

1. **`packages/esm-appointments-app/src/header/appointments-header.component.tsx`**
   - Changed `labelText=""` to `labelText={t('selectDate', 'Select date')}`
   - Provides accessible label for appointment date filter

2. **`packages/esm-appointments-app/src/patient-appointments/patient-upcoming-appointments-card.component.tsx`**
   - Changed `labelText=""` to `labelText={t('selectDate', 'Select date')}`
   - Provides accessible label for patient appointment date filter

3. **`packages/esm-service-queues-app/src/modals/queue-entry-actions-modal.component.tsx`**
   - Changed `labelText=""` to `labelText={t('selectDate', 'Select date')}`
   - Provides accessible label for queue entry action date picker

4. **`packages/esm-service-queues-app/src/queue-patient-linelists/queue-linelist-filter.workspace.tsx`**
   - Changed `labelText=""` to `labelText={t('selectDate', 'Select date')}`
   - Provides accessible label for queue filter date picker

#### 2. Added Translation Keys

**Files Modified:**

1. **`packages/esm-appointments-app/translations/en.json`**
   - Added `"selectDate": "Select date"` entry
   - Alphabetically placed between existing translations

2. **`packages/esm-service-queues-app/translations/en.json`**
   - Added `"selectDate": "Select date"` entry
   - Alphabetically placed between existing translations

### Verification

✅ **TypeScript Compilation**: All changes compile successfully without errors
✅ **Syntax Check**: All modified files have correct syntax
✅ **Translation Integration**: Translation keys properly integrated with existing i18n infrastructure

### Accessibility Impact

#### Before Fix:
- Screen readers could not identify the purpose of date picker inputs
- Missing programmatic label association
- Failed accessibility compliance

#### After Fix:
- Screen readers can announce "Select date" for each date picker
- Proper programmatic label association via `labelText` prop
- Improved accessibility compliance
- Better user experience for assistive technology users

### Notes

- All existing OpenmrsDatePicker components with proper labels were left unchanged
- Only components with empty `labelText=""` were modified
- Translation infrastructure ensures internationalization support
- Changes maintain existing functionality while improving accessibility

### Testing Recommendations

1. **Screen Reader Testing**: Verify that screen readers properly announce "Select date" for all modified date pickers
2. **Visual Testing**: Ensure labels are displayed correctly in the UI
3. **Keyboard Navigation**: Test that date pickers remain keyboard accessible
4. **Cross-browser Testing**: Verify accessibility improvements work across different browsers
5. **Translation Testing**: Confirm that different language translations work properly

### Compliance

This fix addresses:
- WCAG 2.1 Level A: Guideline 1.3.1 (Info and Relationships)
- WCAG 2.1 Level A: Guideline 4.1.2 (Name, Role, Value)
- Section 508 compliance for form controls