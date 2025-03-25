import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, InlineNotification, SkeletonText } from '@carbon/react';
import { ArrowLeftIcon, type DefaultWorkspaceProps, useVisit } from '@openmrs/esm-framework';
import { useAssignedBedByPatient } from '../../hooks/useAssignedBedByPatient';
import { useInpatientAdmissionByPatients } from '../../hooks/useInpatientAdmissionByPatients';
import { useInpatientRequestByPatients } from '../../hooks/useInpatientRequestByPatients';
import useRestPatient from '../../hooks/useRestPatient';
import useWardLocation from '../../hooks/useWardLocation';
import type { Bed, WardPatient } from '../../types';
import AdmitPatientButton from '../admit-patient-button.component';
import WardPatientWorkspaceBanner from '../patient-banner/patient-banner.component';

export interface CreateAdmissionEncounterWorkspaceProps {
  patientUuid: string;
  handleReturnToSearchList?: () => void;
}

/**
 * This is the workspace that opens when clicking on a search result
 * from the workspace triggered by the "Add patient to ward" button.
 * It directly admits them to the current ward locations
 */
const CreateAdmissionEncounterWorkspace: React.FC<CreateAdmissionEncounterWorkspaceProps & DefaultWorkspaceProps> = ({
  patientUuid,
  handleReturnToSearchList,
  closeWorkspaceWithSavedChanges,
}) => {
  const { location } = useWardLocation();
  const { patient, isLoading: isLoadingPatient, error: errorLoadingPatient } = useRestPatient(patientUuid);
  const { activeVisit, isLoading: isLoadingVisit, error: errorLoadingVisit } = useVisit(patientUuid);
  const { t } = useTranslation();
  const { data: bedData, isLoading: isLoadingBed, error: errorLoadingBed } = useAssignedBedByPatient(patientUuid);
  const {
    data: inpatientAdmissions,
    isLoading: isLoadingInpatientAdmission,
    error: errorInpatientAdmission,
  } = useInpatientAdmissionByPatients([patientUuid]);
  const {
    inpatientRequests,
    isLoading: isLoadingInpatientRequest,
    error: errorInpatientRequests,
  } = useInpatientRequestByPatients([patientUuid]);

  const isLoading =
    isLoadingPatient || isLoadingVisit || isLoadingBed || isLoadingInpatientAdmission || isLoadingInpatientRequest;
  const hasError =
    errorLoadingPatient || errorLoadingVisit || errorLoadingBed || errorInpatientAdmission || errorInpatientRequests;

  if (isLoading) {
    return <SkeletonText />;
  } else if (hasError) {
    return (
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
          onClick={() => handleReturnToSearchList?.()}>
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
    return (
      <div>
        <WardPatientWorkspaceBanner wardPatient={wardPatient} />
        {activeVisit ? (
          <div>
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
              onAdmitPatientSuccess={() => closeWorkspaceWithSavedChanges()}
              disabled={isAdmittedToCurrentLocation}
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
          onClick={() => handleReturnToSearchList?.()}>
          <span>{t('backToSearchResults', 'Back to search results')}</span>
        </Button>
      </div>
    );
  }
};

export default CreateAdmissionEncounterWorkspace;
