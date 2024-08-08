import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ResponsiveWrapper, showSnackbar, useSession, type DefaultWorkspaceProps } from '@openmrs/esm-framework';
import styles from './patient-transfer-swap.scss';
import { Form, ButtonSet, Button } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useAdmissionLocation } from '../../hooks/useAdmissionLocation';
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { WardPatientWorkspaceProps } from '../../ward-patient-workspace/types';
import LocationSelector from '../../location-selector/location-selector.component';
import { TextArea } from '@carbon/react';
import { InlineNotification } from '@carbon/react';
import useEmrConfiguration from '../../hooks/useEmrConfiguration';
import { createEncounter } from '../../ward.resource';
import useWardLocation from '../../hooks/useWardLocation';
import type { ObsPayload } from '../../types';
import { RadioButtonGroup } from '@carbon/react';
import { RadioButton } from '@carbon/react';

export default function PatientTransferForm({
  closeWorkspace,
  closeWorkspaceWithSavedChanges,
  patient,
  patientUuid,
  promptBeforeClosing,
}: WardPatientWorkspaceProps) {
  const { t } = useTranslation();
  const [showErrorNotifications, setShowErrorNotifications] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { emrConfiguration, isLoadingEmrConfiguration, errorFetchingEmrConfiguration } = useEmrConfiguration();
  const { user, currentProvider } = useSession();
  const { location } = useWardLocation();
  const dispositionsWithTypeTransfer = useMemo(
    () => emrConfiguration?.dispositions.filter(({ type }) => type === 'TRANSFER'),
    [emrConfiguration],
  );
  const { mutate } = useAdmissionLocation();

  const zodSchema = useMemo(
    () =>
      z.object({
        location: z.string({
          required_error: t('pleaseSelectTransferLocation', 'Please select transfer location'),
        }),
        note: z.string().optional(),
        transferType:
          dispositionsWithTypeTransfer?.length > 1
            ? z.string({
                required_error: t('pleaseSelectTransferType', 'Please select transfer type'),
              })
            : z.string().optional(),
      }),
    [t, dispositionsWithTypeTransfer],
  );

  type FormValues = z.infer<typeof zodSchema>;

  const formDefaultValues: Partial<FormValues> = useMemo(() => {
    const defaultValues: FormValues = {};
    if (dispositionsWithTypeTransfer?.length === 1) {
      defaultValues.transferType = dispositionsWithTypeTransfer[0].uuid;
    }
    return defaultValues;
  }, [dispositionsWithTypeTransfer]);

  const {
    formState: { errors, isDirty },
    control,
    handleSubmit,
    getValues,
    setValue,
  } = useForm<FormValues>({ resolver: zodResolver(zodSchema), defaultValues: formDefaultValues });

  useEffect(() => {
    if (dispositionsWithTypeTransfer?.length === 1) {
      setValue('transferType', dispositionsWithTypeTransfer[0].uuid);
    }
  }, [dispositionsWithTypeTransfer]);

  useEffect(() => {
    promptBeforeClosing(() => isDirty);
    return () => promptBeforeClosing(null);
  }, [isDirty]);

  const onSubmit = useCallback(
    (values: FormValues) => {
      setIsSubmitting(true);
      setShowErrorNotifications(false);
      const obs: Array<ObsPayload> = [
        {
          concept: emrConfiguration.dispositionDescriptor.internalTransferLocationConcept.uuid,
          value: values.location,
        },
        {
          concept: emrConfiguration.dispositionDescriptor.dispositionConcept.uuid,
          value: dispositionsWithTypeTransfer.find(({ uuid }) => uuid === values.transferType)?.conceptCode,
        },
      ];

      if (values.note) {
        obs.push({
          concept: emrConfiguration.consultFreeTextCommentsConcept.uuid,
          value: values.note,
        });
      }

      createEncounter({
        patient: patientUuid,
        encounterType: emrConfiguration.visitNoteEncounterType.uuid,
        location: location.uuid,
        encounterProviders: [
          {
            encounterRole: emrConfiguration.clinicianEncounterRole.uuid,
            provider: currentProvider?.uuid,
          },
        ],
        obs: [
          {
            concept: emrConfiguration.dispositionDescriptor.dispositionSetConcept.uuid,
            groupMembers: obs,
          },
        ],
      })
        .then((resp) => {
          if (resp.ok) {
            closeWorkspaceWithSavedChanges();
            mutate();
          }
        })
        .catch((err: Error) => {
          showSnackbar({
            title: t('errorSavingEncounter', 'Error saving encounter'),
            subtitle: err.message,
            kind: 'error',
          });
        })
        .finally(() => setIsSubmitting(false));
    },
    [
      setShowErrorNotifications,
      currentProvider,
      location,
      emrConfiguration,
      patientUuid,
      dispositionsWithTypeTransfer,
      mutate,
    ],
  );

  const onError = useCallback(() => {
    setIsSubmitting(false);
    setShowErrorNotifications(true);
  }, []);

  return (
    <Form onSubmit={handleSubmit(onSubmit, onError)} className={styles.formContainer}>
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
          <h2 className={styles.productiveHeading02}>{t('selectALocation', 'Select a location')}</h2>
          <Controller
            name="location"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <LocationSelector {...field} invalid={!!error?.message} invalidText={error?.message} />
            )}
          />
        </div>
        {dispositionsWithTypeTransfer?.length > 1 && (
          <div className={styles.field}>
            <h2 className={styles.productiveHeading02}>{t('transferType', 'Transfer type')}</h2>
            <Controller
              name="transferType"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <ResponsiveWrapper>
                  <RadioButtonGroup
                    orientation="vertical"
                    {...field}
                    invalid={!!error?.message}
                    invalidText={error?.message}>
                    {dispositionsWithTypeTransfer.map((disposition) => (
                      <RadioButton id={disposition.uuid} labelText={disposition.name} value={disposition.uuid} />
                    ))}
                  </RadioButtonGroup>
                </ResponsiveWrapper>
              )}
            />
          </div>
        )}
        <div className={styles.field}>
          <h2 className={styles.productiveHeading02}>{t('notes', 'Notes')}</h2>
          <Controller
            name="note"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <ResponsiveWrapper>
                <TextArea {...field} invalid={!!error?.message} invalidText={error?.message} />
              </ResponsiveWrapper>
            )}
          />
        </div>
        {showErrorNotifications && (
          <div className={styles.notifications}>
            {Object.values(errors).map((error) => (
              <InlineNotification lowContrast subtitle={error?.message} hideCloseButton />
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
          disabled={isLoadingEmrConfiguration || isSubmitting || errorFetchingEmrConfiguration}>
          {t('save', 'Save')}
        </Button>
      </ButtonSet>
    </Form>
  );
}
