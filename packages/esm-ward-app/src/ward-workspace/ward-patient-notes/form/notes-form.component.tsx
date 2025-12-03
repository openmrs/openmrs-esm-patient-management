import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Button, Column, Form, InlineLoading, InlineNotification, Row, Stack, TextArea } from '@carbon/react';
import {
  type DefaultWorkspaceProps,
  isDesktop,
  type PatientUuid,
  ResponsiveWrapper,
  showSnackbar,
  translateFrom,
  useLayoutType,
  useSession,
} from '@openmrs/esm-framework';
import { moduleName } from '../../../constant';
import { createPatientNote } from '../notes.resource';
import useEmrConfiguration from '../../../hooks/useEmrConfiguration';
import styles from './notes-form.scss';
import { type EncounterPayload } from '../../../types';

type NotesFormData = z.infer<typeof noteFormSchema>;

interface PatientNotesFormProps {
  patientUuid: PatientUuid;
  encounterUuid?: string;
  initialNote?: string;
  promptBeforeClosing: DefaultWorkspaceProps['promptBeforeClosing'];
  closeWorkspaceWithSavedChanges: DefaultWorkspaceProps['closeWorkspaceWithSavedChanges'];
}

const noteFormSchema = z.object({
  wardClinicalNote: z.string().refine((val) => val.trim().length > 0, {
    //t('clinicalNoteErrorMessage','Clinical note is required')
    message: translateFrom(moduleName, 'clinicalNoteErrorMessage', 'Clinical note is required'),
  }),
});

const PatientNotesForm: React.FC<PatientNotesFormProps> = ({
  closeWorkspaceWithSavedChanges,
  patientUuid,
  promptBeforeClosing,
  encounterUuid,
  initialNote = '',
}) => {
  const { emrConfiguration, isLoadingEmrConfiguration, errorFetchingEmrConfiguration } = useEmrConfiguration();
  const { t } = useTranslation();
  const session = useSession();
  const isTablet = !isDesktop(useLayoutType());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<NotesFormData>({
    mode: 'onSubmit',
    resolver: zodResolver(noteFormSchema),
    defaultValues: {
      wardClinicalNote: initialNote,
    },
  });

  useEffect(() => {
    promptBeforeClosing(() => isDirty);
  }, [isDirty, promptBeforeClosing]);

  const locationUuid = session?.sessionLocation?.uuid;
  const providerUuid = session?.currentProvider?.uuid;

  const onSubmit = useCallback(
    (data: NotesFormData) => {
      const { wardClinicalNote } = data;
      setIsSubmitting(true);

      const notePayload: EncounterPayload = {
        uuid: encounterUuid || undefined,
        patient: patientUuid,
        location: locationUuid,
        encounterType: emrConfiguration?.inpatientNoteEncounterType?.uuid,
        encounterProviders: [
          {
            encounterRole: emrConfiguration?.clinicianEncounterRole?.uuid,
            provider: providerUuid,
          },
        ],
        obs: wardClinicalNote
          ? [
              {
                concept: { uuid: emrConfiguration?.consultFreeTextCommentsConcept.uuid, display: '' },
                value: wardClinicalNote,
              },
            ]
          : [],
      };

      const abortController = new AbortController();

      createPatientNote(notePayload, abortController)
        .then(() => {
          closeWorkspaceWithSavedChanges();
          showSnackbar({
            isLowContrast: true,
            kind: 'success',
            subtitle: t('patientNoteNowVisible', 'It should be now visible in the notes history'),
            title: t('visitNoteSaved', 'Patient note saved'),
          });
        })
        .catch((err) => {
          showSnackbar({
            isLowContrast: false,
            kind: 'error',
            subtitle: err?.message,
            title: t('patientNoteSaveError', 'Error saving patient note'),
          });
        })
        .finally(() => setIsSubmitting(false));
    },
    [
      closeWorkspaceWithSavedChanges,
      emrConfiguration?.clinicianEncounterRole?.uuid,
      emrConfiguration?.consultFreeTextCommentsConcept?.uuid,
      emrConfiguration?.inpatientNoteEncounterType?.uuid,
      locationUuid,
      patientUuid,
      providerUuid,
      encounterUuid,
      t,
    ],
  );

  const onError = (errors) => console.error(errors);

  return (
    <Form className={styles.form} onSubmit={handleSubmit(onSubmit, onError)}>
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
      <Stack className={styles.formContainer} gap={4}>
        <Row className={styles.row}>
          <Column sm={1}>
            <span className={styles.columnLabel}>{t('note', 'Note')}</span>
          </Column>
          <Column sm={3}>
            <Controller
              name="wardClinicalNote"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <ResponsiveWrapper>
                  <TextArea
                    id="additionalNote"
                    invalid={!!errors.wardClinicalNote}
                    invalidText={errors.wardClinicalNote?.message}
                    labelText={t('clinicalNoteLabel', 'Write your notes')}
                    onBlur={onBlur}
                    onChange={(event) => {
                      onChange(event);
                    }}
                    placeholder={t('wardClinicalNotePlaceholder', 'Write any notes here')}
                    rows={6}
                    value={value}
                  />
                </ResponsiveWrapper>
              )}
            />
          </Column>
        </Row>
        <div className={styles.saveButtonContainer}>
          <Button
            className={styles.saveButton}
            disabled={isSubmitting || isLoadingEmrConfiguration || errorFetchingEmrConfiguration}
            kind="primary"
            size={isTablet ? 'lg' : 'sm'}
            type="submit">
            {isSubmitting ? <InlineLoading description={t('saving', 'Saving...')} /> : <span>{t('save', 'Save')}</span>}
          </Button>
        </div>
      </Stack>
    </Form>
  );
};

export default PatientNotesForm;
