import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfig, useDebounce } from '@openmrs/esm-framework';
import { type PatientSearchConfig } from '../config-schema';
import PatientSearchBar from '../patient-search-bar/patient-search-bar.component';
import AdvancedPatientSearchComponent from '../patient-search-page/advanced-patient-search.component';
import Overlay from '../ui-components/overlay.component';

export interface PatientSearchOverlayProps {
  onClose: () => void;
  query?: string;
  header?: string;
  handleSearchTermUpdated?: (query: string) => void;
  nonNavigationSelectPatientAction?: (patientUuid: string, patient: fhir.Patient) => void;
  patientClickSideEffect?: (patientUuid: string, patient: fhir.Patient) => void;
}

/**
 * PatientSearchOverlay is *only* used in tablet mode, in:
 * - openmrs/spa/search (in desktop mode, PatientSearchPageComponent renders
 *   its own search component in the main page instead of in an overlay)
 * - in the top nav, when the user clicks on the magnifying glass icon
 *   (in desktop mode, the inline CompactPatientSearchComponent is used instead)
 *
 * Although similar looking, this overlay behaves somewhat differently from a regular
 * workspace, and has its own overlay logic.
 *
 * This overlay provides a container for the patient search functionality
 * (search bar and results).
 */
const PatientSearchOverlay: React.FC<PatientSearchOverlayProps> = ({
  onClose,
  query = '',
  header,
  handleSearchTermUpdated,
  nonNavigationSelectPatientAction,
  patientClickSideEffect,
}) => {
  const { t } = useTranslation();
  const {
    search: { disableTabletSearchOnKeyUp },
  } = useConfig<PatientSearchConfig>();

  const [searchTerm, setSearchTerm] = useState(query);
  const showSearchResults = Boolean(searchTerm?.trim());
  const debouncedSearchTerm = useDebounce(searchTerm);

  const handleClearSearchTerm = useCallback(() => {
    setSearchTerm('');
    handleSearchTermUpdated?.('');
  }, [handleSearchTermUpdated]);

  const onSearchTermChange = useCallback(
    (value: string) => {
      setSearchTerm(value);
      handleSearchTermUpdated?.(value);
    },
    [handleSearchTermUpdated],
  );

  return (
    <Overlay header={header ?? t('searchResults', 'Search results')} close={onClose}>
      <PatientSearchBar
        initialSearchTerm={query}
        onChange={(value) => !disableTabletSearchOnKeyUp && onSearchTermChange(value)}
        onClear={handleClearSearchTerm}
        onSubmit={onSearchTermChange}
      />
      {showSearchResults && (
        <AdvancedPatientSearchComponent
          query={debouncedSearchTerm}
          inTabletOrOverlay
          onPatientSelected={nonNavigationSelectPatientAction}
          patientClickSideEffect={patientClickSideEffect}
        />
      )}
    </Overlay>
  );
};

export default PatientSearchOverlay;
