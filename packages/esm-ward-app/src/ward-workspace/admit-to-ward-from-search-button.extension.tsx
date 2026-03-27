import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Tag, ButtonSkeleton } from '@carbon/react';
import {
  openmrsFetch,
  restBaseUrl,
  showSnackbar,
  useAppContext,
  useFeatureFlag,
  type Visit,
  type Workspace2DefinitionProps,
} from '@openmrs/esm-framework';
import { CheckmarkFilled } from '@carbon/react/icons';
import { useSWRConfig } from 'swr';
import useSWRImmutable from 'swr/immutable';
import { useAssignedBedByPatient } from '../hooks/useAssignedBedByPatient';
import useRestPatient from '../hooks/useRestPatient';
import useWardLocation from '../hooks/useWardLocation';
import type { Bed, InpatientAdmission, WardPatient, WardViewContext } from '../types';
import { useAdmitPatient } from '../ward.resource';
import styles from './admit-to-ward-from-search-button.scss';

interface AdmitToWardFromSearchButtonProps {
  patientUuid: string;
  activeVisit: Visit;
  launchChildWorkspace: Workspace2DefinitionProps['launchChildWorkspace'];
  closeWorkspace: Workspace2DefinitionProps['closeWorkspace'];
}

// prettier-ignore
const admissionRep =
    'custom:(visit,' +
    'patient:(uuid),' +
    'currentInpatientLocation,' +
    ')';

/**
 * Extension rendered in `active-visit-patient-search-actions-slot` inside the ward patient search panel.
 * Shows 'Admit patient' for patients with an active visit not yet admitted to this ward,
 * or an 'Already admitted' tag if they are already admitted at this location.
 * Renders the button immediately (no loading state) — admission/bed data loads silently in the background.
 */
const AdmitToWardFromSearchButton: React.FC<AdmitToWardFromSearchButtonProps> = ({
  patientUuid,
  activeVisit,
  launchChildWorkspace,
}) => {
  const { t } = useTranslation();
  const { location } = useWardLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutate } = useSWRConfig();

  const { patient } = useRestPatient(patientUuid);
  const { data: bedData } = useAssignedBedByPatient(patientUuid);
  const isBedManagementModuleInstalled = useFeatureFlag('bedmanagement-module');
  const { admitPatient, isLoadingEmrConfiguration, errorFetchingEmrConfiguration } = useAdmitPatient();
  const { wardPatientGroupDetails } = useAppContext<WardViewContext>('ward-view-context') ?? {};

  const admissionUrl = patientUuid
    ? `${restBaseUrl}/emrapi/inpatient/admission?v=${admissionRep}&patients=${patientUuid}`
    : null;
  const { data: admissionData, isLoading: isLoadingAdmission } = useSWRImmutable<
    { data: { results: InpatientAdmission[] } },
    Error
  >(admissionUrl, openmrsFetch);

  if (isLoadingAdmission) {
    return <ButtonSkeleton />;
  }

  const inpatientAdmission = admissionData?.data?.results?.[0];
  const assignedBedDetail = bedData?.data?.results?.[0];
  const isAssignedBedAtCurrentLocation = assignedBedDetail?.physicalLocation?.uuid === location?.uuid;
  const isAdmitted = !!inpatientAdmission;

  if (isAdmitted) {
    return (
      <Tag className={styles.alreadyAdmittedTag} type="green" renderIcon={CheckmarkFilled}>
        {t('alreadyAdmitted', 'Already admitted')}
      </Tag>
    );
  }

  const handleAdmit = async () => {
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
      inpatientAdmission: inpatientAdmission ?? null,
      inpatientRequest: null,
    };

    setIsSubmitting(true);
    if (isBedManagementModuleInstalled && !wardPatient.bed) {
      launchChildWorkspace('admit-patient-form-workspace', { wardPatient });
      setIsSubmitting(false);
    } else {
      try {
        const response = await admitPatient(patient, 'ADMIT', activeVisit.uuid);
        await wardPatientGroupDetails?.mutate?.();
        if (response && response?.ok) {
          mutate(admissionUrl);
          showSnackbar({
            kind: 'success',
            title: t('patientAdmittedSuccessfully', 'Patient admitted successfully'),
            subtitle: t('patientAdmittedToLocation', 'Patient admitted successfully to {{location}}', {
              location: location?.display,
            }),
          });
        }
      } catch (err) {
        const errorMessage =
          err?.responseBody?.error?.globalErrors?.[0]?.message ??
          err.message ??
          t('unknownError', 'An unknown error occurred');
        showSnackbar({
          kind: 'error',
          title: t('errrorAdmitingPatient', 'Failed to admit patient'),
          subtitle: errorMessage,
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Button
      aria-label={t('admitPatient', 'Admit patient')}
      disabled={isSubmitting || isLoadingEmrConfiguration || errorFetchingEmrConfiguration || isLoadingAdmission}
      className={styles.admitButton}
      kind="primary"
      onClick={handleAdmit}>
      {t('admitPatient', 'Admit patient')}
    </Button>
  );
};

export default AdmitToWardFromSearchButton;
