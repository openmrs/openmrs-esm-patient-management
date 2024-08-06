import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Button, Column, Form, InlineLoading, InlineNotification, Row, Stack, TextArea } from '@carbon/react';
import {
  createErrorHandler,
  type DefaultWorkspaceProps,
  type PatientUuid,
  ResponsiveWrapper,
  showSnackbar,
  translateFrom,
  useSession,
} from '@openmrs/esm-framework';
import { savePatientNote } from './notes-form.resource';
import styles from './notes-form.scss';
import { moduleName } from '../../../constant';
import useEmrConfiguration from '../../../hooks/useEmrConfiguration';

type NotesFormData = z.infer<typeof noteFormSchema>;

const noteFormSchema = z.object({
  wardClinicalNote: z.string().refine((val) => val.trim().length > 0, {
    //t('clinicalNoteErrorMessage','Clinical note is required')
    message: translateFrom(moduleName, 'clinicalNoteErrorMessage', 'Clinical note is required'),
  }),
});

interface PatientNotesFormProps extends DefaultWorkspaceProps {
  patientUuid: PatientUuid;
}

const PatientNotesForm: React.FC<PatientNotesFormProps> = ({
  closeWorkspaceWithSavedChanges,
  patientUuid,
  promptBeforeClosing,
}) => {
  const { emrConfiguration, isLoadingEmrConfiguration, errorFetchingEmrConfiguration } = useEmrConfiguration();
  const { t } = useTranslation();
  const session = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rows, setRows] = useState<number>();

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<NotesFormData>({
    mode: 'onSubmit',
    resolver: zodResolver(noteFormSchema),
    defaultValues: {
      wardClinicalNote: '',
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

      const notePayload = {
        patient: patientUuid,
        location: locationUuid,
        encounterType: emrConfiguration?.visitNoteEncounterType.uuid,
        encounterProviders: [
          {
            encounterRole: emrConfiguration?.clinicianEncounterRole.uuid,
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

      savePatientNote(notePayload, abortController)
        .then(() => {
          closeWorkspaceWithSavedChanges();
          showSnackbar({
            isLowContrast: true,
            subtitle: t('patientNoteNowVisible', 'It should be now visible in the notes history'),
            kind: 'success',
            title: t('visitNoteSaved', 'Patient note saved'),
          });
        })
        .catch((err) => {
          createErrorHandler();

          showSnackbar({
            title: t('patientNoteSaveError', 'Error saving patient note'),
            kind: 'error',
            isLowContrast: false,
            subtitle: err?.message,
          });
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    },
    [emrConfiguration, patientUuid, locationUuid, providerUuid],
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
      <Stack className={styles.formContainer} gap={2}>
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
                    rows={rows}
                    labelText={t('clinicalNoteLabel', 'Write your notes')}
                    placeholder={t('wardClinicalNotePlaceholder', 'Write any notes here')}
                    value={value}
                    onBlur={onBlur}
                    invalid={!!errors.wardClinicalNote}
                    invalidText={errors.wardClinicalNote?.message}
                    onChange={(event) => {
                      onChange(event);
                      const textareaLineHeight = 24; // This is the default line height for Carbon's TextArea component
                      const newRows = Math.ceil(event.target.scrollHeight / textareaLineHeight);
                      setRows(newRows);
                    }}
                  />
                </ResponsiveWrapper>
              )}
            />
          </Column>
        </Row>
      </Stack>
      <Button
        kind="primary"
        className={styles.saveButton}
        disabled={isSubmitting || isLoadingEmrConfiguration || errorFetchingEmrConfiguration}
        type="submit">
        {isSubmitting ? <InlineLoading description={t('saving', 'Saving...')} /> : <span>{t('save', 'Save')}</span>}
      </Button>
    </Form>
  );
};

export default PatientNotesForm;
