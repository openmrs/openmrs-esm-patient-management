import React, { useCallback, useMemo, useState } from 'react';
import { Button, ButtonSet, Form, InlineNotification, TextArea } from '@carbon/react';
import classNames from 'classnames';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import {
  closeWorkspaceGroup2,
  getCoreTranslation,
  ResponsiveWrapper,
  showSnackbar,
  useAppContext,
  Workspace2,
  type Workspace2DefinitionProps,
} from '@openmrs/esm-framework';
import type { ObsPayload, WardPatient, WardViewContext } from '../../types';
import { useCreateEncounter } from '../../ward.resource';
import WardPatientWorkspaceBanner from '../patient-banner/patient-banner.component';
import styles from './cancel-admission-request.scss';

interface CancelAdmissionRequestProps {
  wardPatient: WardPatient;
  relatedTransferPatients?: WardPatient[];
  closeWorkspace: Workspace2DefinitionProps['closeWorkspace'];
}

const CancelAdmissionRequest: React.FC<CancelAdmissionRequestProps> = ({
  closeWorkspace,
  wardPatient,
  relatedTransferPatients,
}) => {
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

      const allPatientsToCancel = [wardPatient, ...(relatedTransferPatients ?? [])];
      Promise.allSettled(
        allPatientsToCancel.map(({ patient: p, visit: v }) =>
          createEncounter(p, emrConfiguration?.cancelADTRequestEncounterType, v?.uuid, obs),
        ),
      )
        .then((results) => {
          results.forEach((result, i) => {
            const patientName = allPatientsToCancel[i].patient.person.preferredName.display;
            if (result.status === 'fulfilled') {
              showSnackbar({
                title: t('admissionRequestCancelledForPatient', 'Admission request cancelled for {{patientName}}', {
                  patientName,
                }),
                kind: 'success',
              });
            } else {
              showSnackbar({
                title: t('errorCancellingAdmissionRequest', 'Error cancelling admission request for {{patientName}}', {
                  patientName,
                }),
                subtitle: (result.reason as Error)?.message,
                kind: 'error',
              });
            }
          });

          if (results.some((r) => r.status === 'fulfilled')) {
            closeWorkspace({ discardUnsavedChanges: true });
            closeWorkspaceGroup2();
          }
        })
        .finally(() => {
          setIsSubmitting(false);
          wardPatientGroupDetails.mutate();
        });
    },
    [
      emrConfiguration?.consultFreeTextCommentsConcept?.uuid,
      emrConfiguration?.admissionDecisionConcept?.uuid,
      emrConfiguration?.denyAdmissionConcept?.uuid,
      emrConfiguration?.cancelADTRequestEncounterType,
      createEncounter,
      wardPatient,
      relatedTransferPatients,
      t,
      wardPatientGroupDetails,
      closeWorkspace,
    ],
  );

  const onError = useCallback(() => {
    setIsSubmitting(false);
  }, []);

  if (!wardPatientGroupDetails) return null;

  return (
    <Workspace2 title={t('cancelAdmissionRequest', 'Cancel admission request')} hasUnsavedChanges={isDirty}>
      <div className={styles.flexWrapper}>
        <WardPatientWorkspaceBanner wardPatient={wardPatient} />
        {relatedTransferPatients?.map((rp) => (
          <WardPatientWorkspaceBanner key={rp.patient.uuid} wardPatient={rp} />
        ))}
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
            <Button size="xl" kind="secondary" onClick={() => closeWorkspace()}>
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
    </Workspace2>
  );
};

export default CancelAdmissionRequest;
