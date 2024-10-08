import { Button, ButtonSet, InlineNotification } from '@carbon/react';
import { Exit } from '@carbon/react/icons';
import { ExtensionSlot, showSnackbar, useAppContext, useSession } from '@openmrs/esm-framework';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useEmrConfiguration from '../../hooks/useEmrConfiguration';
import useWardLocation from '../../hooks/useWardLocation';
import { type WardViewContext, type WardPatientWorkspaceProps } from '../../types';
import { createEncounter, removePatientFromBed } from '../../ward.resource';
import WardPatientWorkspaceBanner from '../patient-banner/patient-banner.component';
import styles from './patient-discharge.scss';

export default function PatientDischargeWorkspace(props: WardPatientWorkspaceProps) {
  const { wardPatient, closeWorkspaceWithSavedChanges } = props;
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { currentProvider } = useSession();
  const { location } = useWardLocation();
  const { emrConfiguration, isLoadingEmrConfiguration, errorFetchingEmrConfiguration } = useEmrConfiguration();
  const {wardPatientGroupDetails} = useAppContext<WardViewContext>('ward-view-context');
  const { mutate: mutateAdmissionLocation } = wardPatientGroupDetails?.admissionLocationResponse ?? {};
  const { mutate: mutateInpatientRequest } = wardPatientGroupDetails?.inpatientRequestResponse ?? {};
  const { mutate: mutateInpatientAdmission } = wardPatientGroupDetails?.inpatientAdmissionResponse ?? {};

  const submitDischarge = useCallback(() => {
    setIsSubmitting(true);

    createEncounter({
      patient: wardPatient?.patient?.uuid,
      encounterType: emrConfiguration.exitFromInpatientEncounterType.uuid,
      location: location.uuid,
      encounterProviders: [
        {
          encounterRole: emrConfiguration.clinicianEncounterRole.uuid,
          provider: currentProvider?.uuid,
        },
      ],
      obs: [],
    })
      .then((response) => {
        if (response?.ok) {
          if (wardPatient?.bed?.id) {
            return removePatientFromBed(wardPatient.bed.id, wardPatient?.patient?.uuid);
          }
          return response;
        }
      })
      .then((response) => {
        if (response?.ok) {
          showSnackbar({
            title: t('patientWasDischarged', 'Patient was discharged'),
            kind: 'success',
          });
        }
      })
      .catch((err: Error) => {
        showSnackbar({
          title: t('errorDischargingPatient', 'Error discharging patient'),
          subtitle: err.message,
          kind: 'error',
        });
      })
      .finally(() => {
        setIsSubmitting(false);
        closeWorkspaceWithSavedChanges();
        mutateAdmissionLocation();
        mutateInpatientRequest();
        mutateInpatientAdmission();
      });
  }, [
    currentProvider,
    location,
    emrConfiguration,
    wardPatient?.patient?.uuid,
    wardPatient?.bed?.uuid,
    mutateAdmissionLocation,
    mutateInpatientRequest,
    mutateInpatientAdmission,
  ]);

  if (!wardPatientGroupDetails) return <></>;
  return (
    <div className={styles.workspaceContent}>
      <div className={styles.patientWorkspaceBanner}>
        <WardPatientWorkspaceBanner {...props?.wardPatient} />
      </div>
      <div className={styles.workspaceForm}>
        <div>
          {errorFetchingEmrConfiguration && (
            <div className={styles.formError}>
              <InlineNotification
                kind="error"
                title={t('somePartsOfTheFormDidntLoad', "Some parts of the form didn't load")}
                subtitle={t(
                  'fetchingEmrConfigurationFailed',
                  'Fetching EMR configuration failed. Try refreshing the page or contact your system administrator.',
                )}
                lowContrast
                hideCloseButton
              />
            </div>
          )}
        </div>
        <ExtensionSlot name="ward-patient-discharge-slot" />
        <ButtonSet className={styles.buttonSet}>
          <Button
            size="sm"
            kind="ghost"
            renderIcon={(props) => <Exit size={16} {...props} />}
            disabled={
              isLoadingEmrConfiguration || isSubmitting || errorFetchingEmrConfiguration || !wardPatient?.patient
            }
            onClick={submitDischarge}>
            {t('proceedWithPatientDischarge', 'Proceed with patient discharge')}
          </Button>
        </ButtonSet>
      </div>
    </div>
  );
}
