/**
 * Public extension: patient-search-bar-slot
 *
 * Thin wrapper around the unified CompactPatientSearchComponent for use by
 * external distros that embed a patient search bar via patient-search-bar-slot.
 *
 * Preserved public prop contract:
 *   - selectPatientAction  — called with patientUuid instead of navigating
 *   - buttonProps          — forwarded to the Search button
 *   - initialSearchTerm    — pre-populated search query
 */
import React from 'react';
import CompactPatientSearchComponent from './compact-patient-search/compact-patient-search.component';

interface PatientSearchBarExtensionProps {
  initialSearchTerm?: string;
  /** Replace navigation with a custom action when a patient is selected. */
  selectPatientAction?: (patientUuid: string) => void;
  /** Props forwarded to the Search button. */
  buttonProps?: object;
}

const PatientSearchBarExtension: React.FC<PatientSearchBarExtensionProps> = ({
  initialSearchTerm = '',
  selectPatientAction,
  buttonProps,
}) => (
  <CompactPatientSearchComponent
    initialSearchTerm={initialSearchTerm}
    selectPatientAction={selectPatientAction}
    buttonProps={buttonProps}
    // isSearchPage, shouldNavigateToPatientSearchPage, and onPatientSelect
    // are intentionally omitted — they are icon-variant concerns only.
  />
);

export default PatientSearchBarExtension;
