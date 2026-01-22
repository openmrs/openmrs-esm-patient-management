import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, InlineNotification, SkeletonText } from '@carbon/react';
import {
  ArrowLeftIcon,
  closeWorkspaceGroup2,
  type DefaultWorkspaceProps,
  useVisit,
  Workspace2,
  type Workspace2DefinitionProps,
} from '@openmrs/esm-framework';
import { useAssignedBedByPatient } from '../../hooks/useAssignedBedByPatient';
import { useInpatientAdmissionByPatients } from '../../hooks/useInpatientAdmissionByPatients';
import { useInpatientRequestByPatients } from '../../hooks/useInpatientRequestByPatients';
import useRestPatient from '../../hooks/useRestPatient';
import useWardLocation from '../../hooks/useWardLocation';
import useLocations from '../../hooks/useLocations';
import useEmrConfiguration from '../../hooks/useEmrConfiguration';
import type { Bed, WardPatient } from '../../types';
import AdmitPatientButton from '../admit-patient-button.component';
import WardPatientWorkspaceBanner from '../patient-banner/patient-banner.component';
import styles from './create-admission-encounter.workspace.scss';

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
> = ({ closeWorkspace, workspaceProps: { selectedPatientUuid } }) => {
  const { location } = useWardLocation();
  const { patient, isLoading: isLoadingPatient, error: errorLoadingPatient } = useRestPatient(selectedPatientUuid);
  const { activeVisit, isLoading: isLoadingVisit, error: errorLoadingVisit } = useVisit(selectedPatientUuid);
  const { t } = useTranslation();
  const { emrConfiguration } = useEmrConfiguration();
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

  const locationFilterCriteria: Array<Array<string>> = useMemo(() => {
    const criteria = [];
    if (emrConfiguration) {
      criteria.push(['_tag', emrConfiguration.supportsTransferLocationTag.name]);
    }
    if (activeVisit?.location) {
      criteria.push(['partof:below', activeVisit.location.uuid]);
    }
    if (location) {
      criteria.push(['_id', location.uuid]);
    }
    return criteria;
  }, [emrConfiguration, activeVisit?.location, location]);

  const { data: validLocations, isLoading: isLoadingLocationValidation } = useLocations(
    locationFilterCriteria,
    1,
    !emrConfiguration || !activeVisit?.location || !location,
  );

  const isWardLocationInvalidForVisit =
    !isLoadingLocationValidation &&
    emrConfiguration &&
    activeVisit?.location.uuid !== location?.uuid &&
    (!validLocations || validLocations?.length === 0);

  const isLoading =
    isLoadingPatient ||
    isLoadingVisit ||
    isLoadingBed ||
    isLoadingInpatientAdmission ||
    isLoadingInpatientRequest ||
    isLoadingLocationValidation;
  const hasError =
    errorLoadingPatient || errorLoadingVisit || errorLoadingBed || errorInpatientAdmission || errorInpatientRequests;

  let content: JSX.Element = null;
  if (isLoading) {
    content = <SkeletonText />;
  } else if (hasError) {
    content = (
      <div>
        <InlineNotification
          kind="error"
          lowContrast={true}
          title={t('errorLoadingPatientInfo', 'Error loading patient info')}
        />
        <Button
          kind="ghost"
          renderIcon={(props) => <ArrowLeftIcon size={24} {...props} />}
          iconDescription={t('backToSearchResults', 'Back to search results')}
          size="sm"
          onClick={() => closeWorkspace()}>
          <span>{t('backToSearchResults', 'Back to search results')}</span>
        </Button>
      </div>
    );
  } else {
    const assignedBedDetail = bedData.data.results[0];
    const isAssignedBedAtCurrentLocation = assignedBedDetail?.physicalLocation?.uuid == location.uuid;
    const isAdmittedToCurrentLocation = inpatientAdmissions[0]?.currentInpatientLocation?.uuid == location.uuid;
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
    content = (
      <div>
        <WardPatientWorkspaceBanner wardPatient={wardPatient} />
        {activeVisit ? (
          <div>
            <p className={styles.visitLocationInfo}>
              {t('visitLocation', 'Visit location')}: <strong>{activeVisit.location.display}</strong>
            </p>
            {isWardLocationInvalidForVisit && (
              <InlineNotification
                kind="warning"
                lowContrast={true}
                hideCloseButton={true}
                title={t('cannotAdmitToThisLocation', 'Cannot admit patient to this ward')}
                subtitle={t(
                  'wardNotSubLocationOfVisit',
                  "This ward ({{wardLocation}}) is not a sub-location of the patient's visit location ({{visitLocation}}). Please use a different ward or update the patient's visit location.",
                  {
                    wardLocation: location.display,
                    visitLocation: activeVisit.location.display,
                  },
                )}
              />
            )}
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
            <AdmitPatientButton
              wardPatient={wardPatient}
              dispositionType={inpatientAdmissions[0] ? 'TRANSFER' : 'ADMIT'}
              onAdmitPatientSuccess={async () => {
                await closeWorkspace({ discardUnsavedChanges: true });
                closeWorkspaceGroup2();
              }}
              disabled={isAdmittedToCurrentLocation || isWardLocationInvalidForVisit}
            />
          </div>
        ) : (
          <div>
            {/* TODO: This is a placeholder, and will likely change with ongoing designs with RDE */}
            {t('patienthasNoActiveVisit', 'Patient has no active visit')}
          </div>
        )}
        <Button
          kind="ghost"
          renderIcon={(props) => <ArrowLeftIcon size={24} {...props} />}
          iconDescription={t('backToSearchResults', 'Back to search results')}
          size="sm"
          onClick={() => closeWorkspace()}>
          <span>{t('backToSearchResults', 'Back to search results')}</span>
        </Button>
      </div>
    );
  }

  return <Workspace2 title={t('admitPatient', 'Admit patient')}>{content}</Workspace2>;
};

export default CreateAdmissionEncounterWorkspace;
