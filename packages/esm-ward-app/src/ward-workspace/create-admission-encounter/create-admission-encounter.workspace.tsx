import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonSet, InlineNotification, SkeletonText } from '@carbon/react';
import {
  closeWorkspaceGroup2,
  formatDatetime,
  parseDate,
  useVisit,
  Workspace2,
  type Workspace2DefinitionProps,
} from '@openmrs/esm-framework';
import { useAssignedBedByPatient } from '../../hooks/useAssignedBedByPatient';
import { useInpatientAdmissionByPatients } from '../../hooks/useInpatientAdmissionByPatients';
import { useInpatientRequestByPatients } from '../../hooks/useInpatientRequestByPatients';
import useRestPatient from '../../hooks/useRestPatient';
import useWardLocation from '../../hooks/useWardLocation';
import type { Bed, WardPatient } from '../../types';
import AdmitPatientButton from '../admit-patient-button.component';
import NoActiveVisitEmptyState from './no-active-visit-empty-state.component';
import WardPatientWorkspaceBanner from '../patient-banner/patient-banner.component';
import styles from './create-admission-encounter.scss';

export interface CreateAdmissionEncounterWorkspaceProps {
  selectedPatientUuid: string;
}

/**
 * This is the workspace that opens when clicking on a search result
 * from the workspace triggered by the "Add patient to ward" button.
 * It directly admits them to the current ward locations
 */
const CreateAdmissionEncounterWorkspace: React.FC<
  Workspace2DefinitionProps<
    CreateAdmissionEncounterWorkspaceProps,
    {
      startVisitWorkspaceName: string;
    },
    {}
  >
> = ({
  closeWorkspace,
  workspaceProps: { selectedPatientUuid },
  windowProps: { startVisitWorkspaceName },
  launchChildWorkspace,
}) => {
  const { location } = useWardLocation();
  const { patient, isLoading: isLoadingPatient, error: errorLoadingPatient } = useRestPatient(selectedPatientUuid);
  const { activeVisit, isLoading: isLoadingVisit, error: errorLoadingVisit } = useVisit(selectedPatientUuid);
  const { t } = useTranslation();
  const {
    data: bedData,
    isLoading: isLoadingBed,
    error: errorLoadingBed,
  } = useAssignedBedByPatient(selectedPatientUuid);
  const {
    data: inpatientAdmissions,
    isLoading: isLoadingInpatientAdmission,
    error: errorInpatientAdmission,
  } = useInpatientAdmissionByPatients([selectedPatientUuid]);
  const {
    inpatientRequests,
    isLoading: isLoadingInpatientRequest,
    error: errorInpatientRequests,
  } = useInpatientRequestByPatients([selectedPatientUuid]);

  const isLoading =
    isLoadingPatient || isLoadingVisit || isLoadingBed || isLoadingInpatientAdmission || isLoadingInpatientRequest;
  const hasError =
    errorLoadingPatient || errorLoadingVisit || errorLoadingBed || errorInpatientAdmission || errorInpatientRequests;

  let content: JSX.Element = null;
  let showFooter = false;
  let showAdmitAction = false;
  let footerWardPatient: WardPatient = null;
  let footerDispositionType: 'ADMIT' | 'TRANSFER' = 'ADMIT';
  let footerAdmitDisabled = false;

  if (isLoading) {
    content = <SkeletonText />;
  } else if (hasError) {
    showFooter = true;
    content = (
      <InlineNotification
        kind="error"
        lowContrast={true}
        title={t('errorLoadingPatientInfo', 'Error loading patient info')}
      />
    );
  } else {
    const assignedBedDetail = bedData.data.results[0];
    const isAssignedBedAtCurrentLocation = assignedBedDetail?.physicalLocation?.uuid === location.uuid;
    const isAdmittedToCurrentLocation = inpatientAdmissions[0]?.currentInpatientLocation?.uuid === location.uuid;
    const isAdmittedToOtherLocation = inpatientAdmissions[0] && !isAdmittedToCurrentLocation;

    const wardPatient: WardPatient = {
      patient,
      visit: activeVisit,
      bed: isAssignedBedAtCurrentLocation
        ? ({
            id: assignedBedDetail.bedId,
            bedNumber: assignedBedDetail.bedNumber,
            bedType: assignedBedDetail.bedType,
          } as Bed)
        : null,
      inpatientAdmission: inpatientAdmissions[0],
      inpatientRequest: null,
    };
    showFooter = Boolean(activeVisit);
    showAdmitAction = Boolean(activeVisit);
    footerWardPatient = wardPatient;
    footerDispositionType = inpatientAdmissions[0] ? 'TRANSFER' : 'ADMIT';
    footerAdmitDisabled = isAdmittedToCurrentLocation;

    content = (
      <>
        <WardPatientWorkspaceBanner wardPatient={wardPatient} />
        {activeVisit ? (
          <div className={styles.visitContext}>
            <div className={styles.visitDetails}>
              <span className={styles.visitDetailsLabel}>{t('activeVisit', 'Active visit')}</span>
              <span>
                {activeVisit.visitType?.display}
                {activeVisit.location?.display ? ` · ${activeVisit.location.display}` : ''}
                {activeVisit.startDatetime
                  ? ` · ${t('startedDatetime', 'Started {{datetime}}', {
                      datetime: formatDatetime(parseDate(activeVisit.startDatetime)),
                      interpolation: { escapeValue: false },
                    })}`
                  : ''}
              </span>
            </div>
            {isAdmittedToCurrentLocation && (
              <InlineNotification
                kind="warning"
                lowContrast={true}
                hideCloseButton={true}
                title={t('patientAlreadyAdmittedToCurrentLocation', 'Patient already admitted to current location')}
              />
            )}
            {isAdmittedToOtherLocation && (
              <InlineNotification
                kind="warning"
                lowContrast={true}
                hideCloseButton={true}
                title={t('patientCurrentlyAdmittedToWardLocation', 'Patient currently admitted to {{wardLocation}}', {
                  wardLocation: inpatientAdmissions[0].currentInpatientLocation.display,
                })}
              />
            )}
            {inpatientRequests[0] && (
              <InlineNotification
                kind="warning"
                lowContrast={true}
                hideCloseButton={true}
                title={t(
                  'patientHasPendingAdmissionRequest',
                  'Patient already has a pending admission request to location {{location}}',
                  {
                    location: inpatientRequests[0].dispositionLocation.display,
                  },
                )}
              />
            )}
          </div>
        ) : (
          <NoActiveVisitEmptyState
            patientUuid={selectedPatientUuid}
            patient={patient}
            launchChildWorkspace={launchChildWorkspace}
            startVisitWorkspaceName={startVisitWorkspaceName}
            closeWorkspace={() => closeWorkspace()}
          />
        )}
      </>
    );
  }

  return (
    <Workspace2 title={t('admitPatient', 'Admit patient')}>
      <div id="create-admission-encounter-workspace" className={styles.workspaceWrapper}>
        <div className={styles.workspaceContent}>{content}</div>
        {showFooter && (
          <ButtonSet className={styles.buttonSet}>
            <Button size="xl" kind="secondary" onClick={() => closeWorkspace()}>
              {t('backToSearchResults', 'Back to search results')}
            </Button>
            {showAdmitAction && (
              <AdmitPatientButton
                wardPatient={footerWardPatient}
                dispositionType={footerDispositionType}
                onAdmitPatientSuccess={async () => {
                  await closeWorkspace({ discardUnsavedChanges: true });
                  closeWorkspaceGroup2();
                }}
                disabled={footerAdmitDisabled}
                kind="primary"
                size="xl"
              />
            )}
          </ButtonSet>
        )}
      </div>
    </Workspace2>
  );
};

export default CreateAdmissionEncounterWorkspace;
