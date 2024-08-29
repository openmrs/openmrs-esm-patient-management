import React, { useCallback, useState } from 'react';
import { ExtensionSlot, showSnackbar, useAppContext, useSession } from '@openmrs/esm-framework';
import { Button, ButtonSet, InlineNotification } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import styles from './patient-discharge.scss';
import WardPatientWorkspaceBanner from '../patient-banner/patient-banner.component';
import {type WardPatientGroupDetails, type WardPatientWorkspaceProps } from '../../types';
import useEmrConfiguration from '../../hooks/useEmrConfiguration';
import { createEncounter, removePatientFromBed } from '../../ward.resource';
import useWardLocation from '../../hooks/useWardLocation';
import { useInpatientRequest } from '../../hooks/useInpatientRequest';
import { Exit } from '@carbon/react/icons';

export default function PatientDischargeWorkspace(props: WardPatientWorkspaceProps) {
  const { wardPatient, closeWorkspaceWithSavedChanges } = props;
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { currentProvider } = useSession();
  const { location } = useWardLocation();
  const { emrConfiguration, isLoadingEmrConfiguration, errorFetchingEmrConfiguration } = useEmrConfiguration();
  const wardGroupingDetails = useAppContext<WardPatientGroupDetails>('ward-patients-group');
  const { mutate: mutateAdmissionLocation } = wardGroupingDetails?.admissionLocationResponse ?? {};
  const { mutate: mutateInpatientRequest } = useInpatientRequest();

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
          closeWorkspaceWithSavedChanges();
          mutateAdmissionLocation();
          mutateInpatientRequest();
        }
      })
      .catch((err: Error) => {
        showSnackbar({
          title: t('errorDischargingPatient', 'Error discharging patient'),
          subtitle: err.message,
          kind: 'error',
        });
      })
      .finally(() => setIsSubmitting(false));
  }, [
    currentProvider,
    location,
    emrConfiguration,
    wardPatient?.patient?.uuid,
    wardPatient?.bed?.uuid,
    mutateAdmissionLocation,
    mutateInpatientRequest,
  ]);

  if (!wardGroupingDetails) return <></>;
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
