import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, ButtonSet, Form, InlineNotification, InlineLoading, TextArea } from '@carbon/react';
import {
  closeWorkspaceGroup2,
  ExtensionSlot,
  ResponsiveWrapper,
  showModal,
  showSnackbar,
  useAppContext,
  Workspace2,
} from '@openmrs/esm-framework';
import { Controller, useForm } from 'react-hook-form';
import { type ObsPayload, type WardPatientWorkspaceDefinition, type WardViewContext } from '../../types';
import { removePatientFromBed, useCreateEncounter } from '../../ward.resource';
import WardPatientWorkspaceBanner from '../patient-banner/patient-banner.component';
import styles from './patient-discharge.scss';

const createNoteSchema = (translate: (key: string, defaultMessage: string) => string) =>
  z.object({
    dischargeNote: z
      .string()
      .trim()
      .min(1, {
        message: translate('dischargeNoteErrorMessage', 'discharge note is required'),
      }),
  });

type DischargeData = z.infer<ReturnType<typeof createNoteSchema>>;

export default function PatientDischargeWorkspace({
  groupProps: { wardPatient },
  closeWorkspace,
}: WardPatientWorkspaceDefinition) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createEncounter, emrConfiguration, isLoadingEmrConfiguration, errorFetchingEmrConfiguration } =
    useCreateEncounter();
  const { wardPatientGroupDetails } = useAppContext<WardViewContext>('ward-view-context') ?? {};

  const noteSchema = useMemo(() => createNoteSchema(t), [t]);

  const { control, handleSubmit } = useForm<DischargeData>({
    resolver: zodResolver(noteSchema),
    defaultValues: { dischargeNote: '' },
  });

  const performDischarge = useCallback(
    (data: DischargeData) => {
      setIsSubmitting(true);

      const { dischargeNote } = data;

      const obs: Array<ObsPayload> = [];

      if (dischargeNote) {
        obs.push({
          concept: emrConfiguration?.consultFreeTextCommentsConcept?.uuid,
          value: dischargeNote,
        });
      }

      createEncounter(
        wardPatient?.patient,
        emrConfiguration.exitFromInpatientEncounterType,
        wardPatient?.visit?.uuid,
        obs,
      )
        .then((response) => {
          if (response?.ok) {
            if (wardPatient?.bed?.id) {
              return removePatientFromBed(wardPatient.bed.id, wardPatient?.patient?.uuid);
            }
            return response;
          }
        })
        .then((response) => {
          if (!response?.ok) {
            throw new Error('Discharge failed');
          }
          showSnackbar({
            title: t('patientWasDischarged', 'Patient was discharged'),
            kind: 'success',
          });

          closeWorkspace({ discardUnsavedChanges: true });
          closeWorkspaceGroup2();
          wardPatientGroupDetails?.mutate?.();
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
        });
    },
    [createEncounter, wardPatient, emrConfiguration, t, closeWorkspace, wardPatientGroupDetails],
  );

  const onSubmit = useCallback(
    (data: DischargeData) => {
      const dispose = showModal('PatientDischargeConfirmationModal', {
        closeModal: () => dispose(),
        onConfirm: () => performDischarge(data),
      });
    },
    [performDischarge],
  );

  const onError = (errors) => console.error(errors);

  if (!wardPatientGroupDetails) {
    return null;
  }

  return (
    <Workspace2 title={t('discharge', 'Discharge')}>
      <div className={styles.workspaceContent}>
        <div className={styles.patientWorkspaceBanner}>
          <WardPatientWorkspaceBanner wardPatient={wardPatient} />
        </div>
        <Form className={styles.workspaceForm} onSubmit={handleSubmit(onSubmit, onError)}>
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

          <div className={styles.field}>
            <h2 className={styles.columnLabel}>{t('note', 'Note')}</h2>
            <Controller
              name="dischargeNote"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <ResponsiveWrapper>
                  <TextArea
                    {...field}
                    invalid={!!error?.message}
                    invalidText={error?.message}
                    placeholder={t('dischargeNotePlaceholder', 'Write any notes here')}
                  />
                </ResponsiveWrapper>
              )}
            />
          </div>
          <ButtonSet className={styles.buttonSet}>
            <Button size="xl" kind="secondary" onClick={() => closeWorkspace()} disabled={isSubmitting}>
              {t('cancel', 'Cancel')}
            </Button>
            <Button
              type="submit"
              size="xl"
              disabled={isLoadingEmrConfiguration || isSubmitting || errorFetchingEmrConfiguration}>
              {isSubmitting ? (
                <InlineLoading className={styles.spinner} description={t('discharging', 'Discharging') + '...'} />
              ) : (
                <span>{t('Discharge', 'Discharge')}</span>
              )}
            </Button>
          </ButtonSet>
        </Form>
      </div>
    </Workspace2>
  );
}
