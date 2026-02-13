import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonSet, InlineNotification } from '@carbon/react';
import { Exit } from '@carbon/react/icons';
import { closeWorkspaceGroup2, ExtensionSlot, showSnackbar, useAppContext, Workspace2 } from '@openmrs/esm-framework';
import { type WardPatientWorkspaceDefinition, type WardPatientWorkspaceProps, type WardViewContext } from '../../types';
import { removePatientFromBed, useCreateEncounter } from '../../ward.resource';
import WardPatientWorkspaceBanner from '../patient-banner/patient-banner.component';
import styles from './patient-discharge.scss';

export default function PatientDischargeWorkspace({
  groupProps: { wardPatient },
  closeWorkspace,
}: WardPatientWorkspaceDefinition) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createEncounter, emrConfiguration, isLoadingEmrConfiguration, errorFetchingEmrConfiguration } =
    useCreateEncounter();
  const { wardPatientGroupDetails } = useAppContext<WardViewContext>('ward-view-context') ?? {};

  const submitDischarge = useCallback(() => {
    setIsSubmitting(true);

    createEncounter(wardPatient?.patient, emrConfiguration.exitFromInpatientEncounterType, wardPatient?.visit?.uuid)
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

          closeWorkspace({ discardUnsavedChanges: true });
          closeWorkspaceGroup2();
        }
      })
      .catch((err) => {
        // TODO: better way to handle / display error messages
        // https://openmrs.atlassian.net/browse/O3-5423
        showSnackbar({
          title: t('errorDischargingPatient', 'Error discharging patient'),
          subtitle: err?.responseBody?.error?.globalErrors?.[0]?.message ?? err.message,
          kind: 'error',
        });
      })
      .finally(() => {
        setIsSubmitting(false);
        wardPatientGroupDetails?.mutate?.();
      });
  }, [createEncounter, wardPatient, emrConfiguration, t, closeWorkspace, wardPatientGroupDetails]);

  if (!wardPatientGroupDetails) {
    return null;
  }

  return (
    <Workspace2 title={t('discharge', 'Discharge')}>
      <div className={styles.workspaceContent}>
        <div className={styles.patientWorkspaceBanner}>
          <WardPatientWorkspaceBanner wardPatient={wardPatient} />
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
    </Workspace2>
  );
}
