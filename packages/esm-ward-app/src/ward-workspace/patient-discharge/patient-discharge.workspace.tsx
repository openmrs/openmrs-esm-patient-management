import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonSet, Form, InlineNotification, InlineLoading, TextArea } from '@carbon/react';
import {
  closeWorkspaceGroup2,
  ExtensionSlot,
  ResponsiveWrapper,
  showSnackbar,
  useAppContext,
  Workspace2,
} from '@openmrs/esm-framework';
import { type ObsPayload, type WardPatientWorkspaceDefinition, type WardViewContext } from '../../types';
import { removePatientFromBed, useCreateEncounter } from '../../ward.resource';
import WardPatientWorkspaceBanner from '../patient-banner/patient-banner.component';
import styles from './patient-discharge.scss';

export default function PatientDischargeWorkspace({
  groupProps: { wardPatient },
  closeWorkspace,
}: WardPatientWorkspaceDefinition) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dischargeNote, setDischargeNote] = useState('');
  const { createEncounter, emrConfiguration, isLoadingEmrConfiguration, errorFetchingEmrConfiguration } =
    useCreateEncounter();
  const { wardPatientGroupDetails } = useAppContext<WardViewContext>('ward-view-context') ?? {};

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      try {
        const note = dischargeNote;
        const obs: Array<ObsPayload> = [];

        if (note) {
          obs.push({
            concept: emrConfiguration?.consultFreeTextCommentsConcept?.uuid,
            value: note,
          });
        }

        await createEncounter(
          wardPatient?.patient,
          emrConfiguration.exitFromInpatientEncounterType,
          wardPatient?.visit?.uuid,
          obs,
        );

        if (wardPatient?.bed?.id) {
          await removePatientFromBed(wardPatient.bed.id, wardPatient?.patient?.uuid);
        }

        showSnackbar({
          title: t('patientWasDischarged', 'Patient was discharged'),
          kind: 'success',
        });

        closeWorkspace({ discardUnsavedChanges: true });
        closeWorkspaceGroup2();
        wardPatientGroupDetails?.mutate?.();
      } catch (err) {
        const message =
          err?.responseBody?.error?.globalErrors?.[0]?.message ||
          err?.responseBody?.error?.message ||
          err?.message ||
          t('unableToDischargePatient', 'Unable to discharge patient. Please try again.');

        showSnackbar({
          title: t('errorDischargingPatient', 'Error discharging patient'),
          subtitle: message,
          kind: 'error',
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [createEncounter, wardPatient, emrConfiguration, dischargeNote, t, closeWorkspace, wardPatientGroupDetails],
  );

  if (!wardPatientGroupDetails) {
    return null;
  }

  return (
    <Workspace2 title={t('discharge', 'Discharge')}>
      <div className={styles.workspaceContent}>
        <div className={styles.patientWorkspaceBanner}>
          <WardPatientWorkspaceBanner wardPatient={wardPatient} />
        </div>
        <Form className={styles.workspaceForm} onSubmit={onSubmit}>
          <div>
            {errorFetchingEmrConfiguration && (
              <div>
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

          <div>
            <ResponsiveWrapper>
              <TextArea
                value={dischargeNote}
                onChange={(e) => setDischargeNote(e.target.value)}
                labelText={t('dischargeNote', 'Discharge Note (optional)')}
                placeholder={t('dischargeNotePlaceholder', 'Write any notes here')}
              />
            </ResponsiveWrapper>
          </div>
          <ButtonSet className={styles.buttonSet}>
            <Button size="xl" kind="secondary" onClick={() => closeWorkspace()} disabled={isSubmitting}>
              {t('cancel', 'Cancel')}
            </Button>
            <Button
              type="submit"
              size="xl"
              disabled={
                isLoadingEmrConfiguration || isSubmitting || errorFetchingEmrConfiguration || !wardPatient?.patient
              }>
              {isSubmitting ? (
                <InlineLoading description={t('discharging', 'Discharging') + '...'} />
              ) : (
                <span>{t('confirmDischarge', 'Confirm Discharge')}</span>
              )}
            </Button>
          </ButtonSet>
        </Form>
      </div>
    </Workspace2>
  );
}
