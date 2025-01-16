import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, ButtonSet, Form, InlineNotification, TextArea } from '@carbon/react';
import classNames from 'classnames';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { ResponsiveWrapper, showSnackbar, useAppContext, useSession } from '@openmrs/esm-framework';
import type { ObsPayload, WardPatientWorkspaceProps, WardViewContext } from '../../types';
import { useCreateEncounter } from '../../ward.resource';
import useWardLocation from '../../hooks/useWardLocation';
import WardPatientWorkspaceBanner from '../patient-banner/patient-banner.component';
import styles from './cancel-admission-request.scss';

export default function CancelAdmissionRequestWorkspace({
  closeWorkspaceWithSavedChanges,
  wardPatient,
  promptBeforeClosing,
}: WardPatientWorkspaceProps) {
  const { patient } = wardPatient ?? {};
  const { t } = useTranslation();
  const [showErrorNotifications, setShowErrorNotifications] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createEncounter, emrConfiguration, isLoadingEmrConfiguration, errorFetchingEmrConfiguration } =
    useCreateEncounter();
  const { currentProvider } = useSession();
  const { location } = useWardLocation();
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

  const formDefaultValues: Partial<FormValues> = {
    note: '',
  };

  const {
    formState: { errors, isDirty },
    control,
    handleSubmit,
  } = useForm<FormValues>({ resolver: zodResolver(zodSchema), defaultValues: formDefaultValues });

  useEffect(() => {
    promptBeforeClosing(() => isDirty);
    return () => promptBeforeClosing(null);
  }, [isDirty, promptBeforeClosing]);

  const onSubmit = useCallback(
    (values: FormValues) => {
      setIsSubmitting(true);
      setShowErrorNotifications(false);
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

      createEncounter(patient, emrConfiguration?.cancelADTRequestEncounterType, obs)
        .then(() => {
          showSnackbar({
            title: t('admissionRequestCancelled', 'Admission request cancelled.'),
            kind: 'success',
          });
        })
        .catch((err: Error) => {
          showSnackbar({
            title: t('Error cancelling admission request', 'Error cancelling admission request'),
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
    ],
  );

  const onError = useCallback(() => {
    setIsSubmitting(false);
    setShowErrorNotifications(true);
  }, []);

  if (!wardPatientGroupDetails) return <></>;
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
            <h2 className={styles.productiveHeading02}>{t('clinicalNotes', 'Clinical notes')}</h2>
            <Controller
              name="note"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <ResponsiveWrapper>
                  <TextArea {...field} labelText={''} />
                </ResponsiveWrapper>
              )}
            />
          </div>
          {showErrorNotifications && (
            <div className={styles.notifications}>
              {Object.values(errors).map((error) => (
                <InlineNotification key={error.message} lowContrast subtitle={error?.message} hideCloseButton />
              ))}
            </div>
          )}
        </div>
        <ButtonSet className={styles.buttonSet}>
          <Button size="xl" kind="secondary" onClick={closeWorkspaceWithSavedChanges}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button
            type="submit"
            size="xl"
            disabled={isLoadingEmrConfiguration || isSubmitting || errorFetchingEmrConfiguration || !patient}>
            {t('save', 'Save')}
          </Button>
        </ButtonSet>
      </Form>
    </div>
  );
}
