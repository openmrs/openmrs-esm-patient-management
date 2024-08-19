import React, { useCallback, useState } from 'react';
import { ExtensionSlot, showSnackbar, useFeatureFlag, useSession } from '@openmrs/esm-framework';
import { Button, ButtonSet, InlineNotification } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import styles from './patient-discharge.scss';
import WardPatientWorkspaceBanner from '../patient-banner/patient-banner.component';
import type { ObsPayload, WardPatientWorkspaceProps } from '../../types';
import useEmrConfiguration from '../../hooks/useEmrConfiguration';
import { createEncounter } from '../../ward.resource';
import useWardLocation from '../../hooks/useWardLocation';
import { useAdmissionLocation } from '../../hooks/useAdmissionLocation';
import { useInpatientRequest } from '../../hooks/useInpatientRequest';

const DischargeTypes = {
  MEDICAL: 'medical',
  AGAINST_ADVICE: 'against-advice',
  ABSCONDED: 'absconded',
} as const;

type DischargeTypeValues = (typeof DischargeTypes)[keyof typeof DischargeTypes];

export default function PatientDischargeWorkspace(props: WardPatientWorkspaceProps) {
  const { wardPatient, closeWorkspaceWithSavedChanges } = props;
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const isBedManagementModuleInstalled = useFeatureFlag('bedmanagement-module');
  const { currentProvider } = useSession();
  const { location } = useWardLocation();
  const { emrConfiguration, isLoadingEmrConfiguration, errorFetchingEmrConfiguration } = useEmrConfiguration();
  const { mutate: mutateAdmissionLocation } = useAdmissionLocation();
  const { mutate: mutateInpatientRequest } = useInpatientRequest();

  const submitDischarge = useCallback(() => {
    setIsSubmitting(true);
    const obs: Array<ObsPayload> = [
      {
        concept: emrConfiguration.dischargeForm.uuid,
        value: '',
      },
    ];

    createEncounter({
      patient: props?.wardPatient?.patient?.uuid,
      encounterType: emrConfiguration.dischargeForm.uuid,
      location: location.uuid,
      encounterProviders: [
        {
          encounterRole: emrConfiguration.clinicianEncounterRole.uuid,
          provider: currentProvider?.uuid,
        },
      ],
      obs: [],
    })
      .then(() => {
        showSnackbar({
          title: t('patientTransferRequestCreated', 'Patient was discharged'),
          kind: 'success',
        });
        closeWorkspaceWithSavedChanges();
        mutateAdmissionLocation();
        mutateInpatientRequest();
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
    mutateAdmissionLocation,
    mutateInpatientRequest,
  ]);

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
            type="submit"
            size="xl"
            disabled={isLoadingEmrConfiguration || isSubmitting || errorFetchingEmrConfiguration}
            onClick={submitDischarge}>
            {t('proceedWithPatientDischarge', 'Proceed with patient discharge')}
          </Button>
        </ButtonSet>
      </div>
    </div>
  );
}
