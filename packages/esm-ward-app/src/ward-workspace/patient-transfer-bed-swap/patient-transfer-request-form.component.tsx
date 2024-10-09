import { Button, ButtonSet, Form, InlineNotification, RadioButton, RadioButtonGroup, TextArea } from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ResponsiveWrapper, showSnackbar, useAppContext, useSession } from '@openmrs/esm-framework';
import classNames from 'classnames';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import useEmrConfiguration from '../../hooks/useEmrConfiguration';
import useWardLocation from '../../hooks/useWardLocation';
import LocationSelector from '../../location-selector/location-selector.component';
import type { ObsPayload, WardViewContext, WardPatientWorkspaceProps } from '../../types';
import { createEncounter } from '../../ward.resource';
import styles from './patient-transfer-swap.scss';

export default function PatientTransferForm({
  closeWorkspaceWithSavedChanges,
  wardPatient,
  promptBeforeClosing,
}: WardPatientWorkspaceProps) {
  const { patient } = wardPatient ?? {};
  const { t } = useTranslation();
  const [showErrorNotifications, setShowErrorNotifications] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { emrConfiguration, isLoadingEmrConfiguration, errorFetchingEmrConfiguration } = useEmrConfiguration();
  const { currentProvider } = useSession();
  const { location } = useWardLocation();
  const dispositionsWithTypeTransfer = useMemo(
    () => emrConfiguration?.dispositions.filter(({ type }) => type === 'TRANSFER'),
    [emrConfiguration],
  );
  const { wardPatientGroupDetails } = useAppContext<WardViewContext>('ward-view-context') ?? {};
  const { mutate: mutateAdmissionLocation } = wardPatientGroupDetails?.admissionLocationResponse ?? {};
  const { mutate: mutateInpatientAdmission } = wardPatientGroupDetails?.inpatientAdmissionResponse ?? {};
  const { mutate: mutateInpatientRequest } = wardPatientGroupDetails?.inpatientRequestResponse ?? {};

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
        patient: patient?.uuid,
        encounterType: emrConfiguration.transferRequestEncounterType.uuid,
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
        .then(() => {
          showSnackbar({
            title: t('patientTransferRequestCreated', 'Patient transfer request created'),
            kind: 'success',
          });
        })
        .catch((err: Error) => {
          showSnackbar({
            title: t('errorCreatingTransferRequest', 'Error creating transfer request'),
            subtitle: err.message,
            kind: 'error',
          });
        })
        .finally(() => {
          setIsSubmitting(false);
          closeWorkspaceWithSavedChanges();
          mutateAdmissionLocation();
          mutateInpatientAdmission();
          mutateInpatientRequest();
        });
    },
    [
      setShowErrorNotifications,
      currentProvider,
      location,
      emrConfiguration,
      patient?.uuid,
      dispositionsWithTypeTransfer,
      mutateAdmissionLocation,
      mutateInpatientAdmission,
      mutateInpatientRequest,
    ],
  );

  const onError = useCallback(() => {
    setIsSubmitting(false);
    setShowErrorNotifications(true);
  }, []);

  if (!wardPatientGroupDetails) return <></>;
  return (
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
          disabled={isLoadingEmrConfiguration || isSubmitting || errorFetchingEmrConfiguration || !patient}>
          {t('save', 'Save')}
        </Button>
      </ButtonSet>
    </Form>
  );
}
