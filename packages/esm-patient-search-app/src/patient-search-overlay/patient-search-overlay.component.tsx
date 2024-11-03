import React from 'react';
import PatientSearchWorkspace from '../patient-search-workspace/patient-search.workspace';
import Overlay from '../ui-components/overlay';
import { type PatientSearchContextProps } from '../patient-search-context';
import { useTranslation } from 'react-i18next';

interface PatientSearchOverlayProps extends PatientSearchContextProps {
  onClose: () => void;
  handleSearchTermUpdated?: (value: string) => void;
  query?: string;
  header?: string;
}

/**
 * The PatientSearchOverlay is *only* used in tablet mode, in:
 * - openmrs/spa/search (in desktop mode, PatientSearchPageComponent renders
 *   its own search component in the main page instead of in an overlay)
 * - in the top nav, when the user clicks on the magnifying glass icon
 *   (in desktop mode, the inline CompactPatientSearchComponent is used instead)
 *
 * Although similar looking, this overlay behaves somewhat differently from a regular
 * workspace, and has its own overlay logic.
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

  return (
    <Overlay header={header ?? t('searchResults', 'Search results')} close={onClose}>
      <PatientSearchWorkspace
        initialQuery={query}
        handleSearchTermUpdated={handleSearchTermUpdated}
        nonNavigationSelectPatientAction={nonNavigationSelectPatientAction}
        patientClickSideEffect={patientClickSideEffect}
      />
    </Overlay>
  );
};

export default PatientSearchOverlay;
