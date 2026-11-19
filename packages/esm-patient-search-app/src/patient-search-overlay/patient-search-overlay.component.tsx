import React from 'react';
import { useTranslation } from 'react-i18next';
import PatientSearchWorkspace from '../patient-search-workspace/patient-search.workspace';
import { type PatientSelectionCallback } from '../patient-search-context';
import Overlay from '../ui-components/overlay.component';
import { useIsSearchWorkspaceOpen } from './use-is-search-workspace-open';

interface PatientSearchOverlayProps {
  onClose: () => void;
  query?: string;
  /** Called just before following a result's link to the patient chart. */
  patientClickSideEffect?: PatientSelectionCallback;
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
const PatientSearchOverlay: React.FC<PatientSearchOverlayProps> = ({ onClose, query = '', patientClickSideEffect }) => {
  const { t } = useTranslation();
  // The overlay covers the whole screen, above the workspaces. Hide it (rather than unmount it, which would
  // lose the search) while the start visit workspace is open, so that the workspace can be used; the results
  // come back when the workspace is closed.
  const isWorkspaceOpen = useIsSearchWorkspaceOpen();

  return (
    <div hidden={isWorkspaceOpen}>
      <Overlay header={t('searchResults', 'Search results')} close={onClose}>
        <PatientSearchWorkspace initialQuery={query} patientClickSideEffect={patientClickSideEffect} />
      </Overlay>
    </div>
  );
};

export default PatientSearchOverlay;
