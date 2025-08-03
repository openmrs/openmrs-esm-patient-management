import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, ButtonSet, Form, InlineNotification, TextArea } from '@carbon/react';
import classNames from 'classnames';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { getCoreTranslation, ResponsiveWrapper, showSnackbar, useAppContext } from '@openmrs/esm-framework';
import type { ObsPayload, WardPatientWorkspaceProps, WardViewContext } from '../../types';
import { useCreateEncounter } from '../../ward.resource';
import WardPatientWorkspaceBanner from '../patient-banner/patient-banner.component';
import styles from './cancel-admission-request.scss';

export default function CancelAdmissionRequestWorkspace({
  closeWorkspaceWithSavedChanges,
  wardPatient,
  promptBeforeClosing,
}: WardPatientWorkspaceProps) {
  const { patient, visit } = wardPatient ?? {};
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createEncounter, emrConfiguration, isLoadingEmrConfiguration, errorFetchingEmrConfiguration } =
    useCreateEncounter();
  const { wardPatientGroupDetails } = useAppContext<WardViewContext>('ward-view-context') ?? {};

  const zodSchema = useMemo(
    () =>
      z.object({
        note: z
          .string()
          .trim()
          .min(1, {
            message: t(
              'notesRequiredForCancellingRequest',
              'Notes required for cancelling admission or transfer request',
            ),
          }),
      }),
    [t],
  );

  type FormValues = z.infer<typeof zodSchema>;

  const {
    formState: { errors, isDirty },
    control,
    handleSubmit,
  } = useForm<FormValues>({
    resolver: zodResolver(zodSchema),
    defaultValues: { note: '' },
  });

  useEffect(() => {
    promptBeforeClosing(() => isDirty);
    return () => promptBeforeClosing(null);
  }, [isDirty, promptBeforeClosing]);

  const onSubmit = useCallback(
    (values: FormValues) => {
      setIsSubmitting(true);
      const obs: Array<ObsPayload> = [
        {
          concept: emrConfiguration?.consultFreeTextCommentsConcept?.uuid,
          value: values.note,
        },
        {
          concept: emrConfiguration?.admissionDecisionConcept?.uuid,
          value: {
            uuid: emrConfiguration?.denyAdmissionConcept?.uuid,
          },
        },
      ];

      createEncounter(patient, emrConfiguration?.cancelADTRequestEncounterType, visit?.uuid, obs)
        .then(() => {
          showSnackbar({
            title: t('admissionRequestCancelled', 'Admission request cancelled.'),
            kind: 'success',
          });
        })
        .catch((err: Error) => {
          showSnackbar({
            title: t('errorCancellingAdmissionRequest', 'Error cancelling admission request'),
            subtitle: err.message,
            kind: 'error',
          });
        })
        .finally(() => {
          setIsSubmitting(false);
          closeWorkspaceWithSavedChanges();
          wardPatientGroupDetails.mutate();
        });
    },
    [
      emrConfiguration?.consultFreeTextCommentsConcept?.uuid,
      emrConfiguration?.admissionDecisionConcept?.uuid,
      emrConfiguration?.denyAdmissionConcept?.uuid,
      emrConfiguration?.cancelADTRequestEncounterType,
      createEncounter,
      patient,
      t,
      closeWorkspaceWithSavedChanges,
      wardPatientGroupDetails,
      visit?.uuid,
    ],
  );

  const onError = useCallback(() => {
    setIsSubmitting(false);
  }, []);

  if (!wardPatientGroupDetails) return null;

  return (
    <div className={styles.flexWrapper}>
      <WardPatientWorkspaceBanner wardPatient={wardPatient} />
      <Form
        onSubmit={handleSubmit(onSubmit, onError)}
        className={classNames(styles.formContainer, styles.workspaceContent)}>
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
          <div className={styles.field}>
            <Controller
              name="note"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <ResponsiveWrapper>
                  <TextArea
                    {...field}
                    id="clinical-notes"
                    labelText={t('clinicalNotes', 'Clinical notes')}
                    invalid={!!error}
                    invalidText={error?.message}
                  />
                </ResponsiveWrapper>
              )}
            />
          </div>
        </div>
        <ButtonSet className={styles.buttonSet}>
          <Button size="xl" kind="secondary" onClick={closeWorkspaceWithSavedChanges}>
            {getCoreTranslation('cancel')}
          </Button>
          <Button
            type="submit"
            size="xl"
            disabled={isLoadingEmrConfiguration || isSubmitting || errorFetchingEmrConfiguration || !patient}>
            {getCoreTranslation('save')}
          </Button>
        </ButtonSet>
      </Form>
    </div>
  );
}
