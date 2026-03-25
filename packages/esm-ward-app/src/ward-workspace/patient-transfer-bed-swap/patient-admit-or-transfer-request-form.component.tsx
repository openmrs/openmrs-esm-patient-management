import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  ButtonSet,
  Checkbox,
  CheckboxGroup,
  Form,
  InlineNotification,
  RadioButton,
  RadioButtonGroup,
  Stack,
  TextArea,
} from '@carbon/react';
import classNames from 'classnames';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ResponsiveWrapper, showSnackbar, useAppContext } from '@openmrs/esm-framework';
import { useCreateEncounter } from '../../ward.resource';
import type { ObsPayload, WardPatient, WardViewContext } from '../../types';
import LocationSelector from '../../location-selector/location-selector.component';
import WardPatientName from '../../ward-patient-card/row-elements/ward-patient-name.component';
import WardPatientIdentifier from '../../ward-patient-card/row-elements/ward-patient-identifier.component';
import styles from './patient-transfer-swap.scss';

export interface PatientAdmitOrTransferFormProps {
  wardPatient: WardPatient;

  /**
   * Related patients that are in the same bed as wardPatient. On transfer or bed swap
   * these related patients have the option to be transferred / swapped together
   */
  relatedTransferPatients?: WardPatient[];

  onSuccess(): void;
  onCancel(): void;
}

/**
 * Form to fill out for:
 * - an admitted patient without pending transfer request, to initiate a transfer request for a patient
 * - an admitted patient with pending transfer request, to create a request to transfer elsewhere
 * - an un-admitted patient, to create a request to admit
 */
export default function PatientAdmitOrTransferForm({
  wardPatient,
  relatedTransferPatients = [],
  onSuccess,
  onCancel,
}: PatientAdmitOrTransferFormProps) {
  const { t } = useTranslation();
  const { patient, inpatientRequest, visit } = wardPatient ?? {};
  const [showErrorNotifications, setShowErrorNotifications] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createEncounter, emrConfiguration, isLoadingEmrConfiguration, errorFetchingEmrConfiguration } =
    useCreateEncounter();
  const dispositionsWithTypeTransfer = useMemo(
    () => emrConfiguration?.dispositions.filter(({ type }) => type === 'TRANSFER'),
    [emrConfiguration],
  );
  const { wardPatientGroupDetails } = useAppContext<WardViewContext>('ward-view-context') ?? {};
  const currentAdmission = wardPatientGroupDetails?.inpatientAdmissionsByPatientUuid?.get(patient?.uuid);
  const [selectedRelatedPatient, setCheckedRelatedPatient] = useState<string[]>([]);

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
  }, [dispositionsWithTypeTransfer, setValue]);

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

      const wardPatientsToTransfer = [
        wardPatient,
        ...relatedTransferPatients.filter((rp) => selectedRelatedPatient.includes(rp.patient.uuid)),
      ];

      Promise.all(
        wardPatientsToTransfer.map(async (wardPatientToTransfer) => {
          const { patient: patientToTransfer, visit: patientToTransferVisit } = wardPatientToTransfer;

          return createEncounter(
            patientToTransfer,
            emrConfiguration.transferRequestEncounterType,
            patientToTransferVisit?.uuid,
            [
              {
                concept: emrConfiguration.dispositionDescriptor.dispositionSetConcept.uuid,
                groupMembers: obs,
              },
            ],
          );
        }),
      )
        .then(() => {
          showSnackbar({
            title: t('patientTransferRequestCreated', 'Patient transfer request created'),
            kind: 'success',
          });
          onSuccess();
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
          wardPatientGroupDetails.mutate();
        });
    },
    [
      onSuccess,
      createEncounter,
      dispositionsWithTypeTransfer,
      emrConfiguration,
      t,
      wardPatientGroupDetails,
      selectedRelatedPatient,
      relatedTransferPatients,
      wardPatient,
    ],
  );

  const onError = useCallback(() => {
    setIsSubmitting(false);
    setShowErrorNotifications(true);
  }, []);

  if (!wardPatientGroupDetails) {
    return <></>;
  }
  return (
    <Form
      onSubmit={handleSubmit(onSubmit, onError)}
      className={classNames(styles.formContainer, styles.workspaceContent)}>
      <Stack gap={4}>
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
        {currentAdmission ? (
          inpatientRequest && (
            <InlineNotification
              kind="info"
              lowContrast={true}
              hideCloseButton={true}
              title={t('patientCurrentlyAdmittedToWardLocation', 'Patient currently admitted to {{wardLocation}}', {
                wardLocation: currentAdmission.currentInpatientLocation.display,
              })}
            />
          )
        ) : (
          <InlineNotification
            kind="info"
            lowContrast={true}
            hideCloseButton={true}
            title={t('patientCurrentlyNotAdmitted', 'Patient currently not admitted')}
          />
        )}
        {relatedTransferPatients?.length > 0 && (
          <div>
            <CheckboxGroup legendText={t('alsoTransfer', 'Also transfer:')}>
              {relatedTransferPatients?.map(({ patient: relatedPatient }) => (
                <Checkbox
                  checked={selectedRelatedPatient.includes(relatedPatient.uuid)}
                  className={styles.checkbox}
                  id={relatedPatient.uuid}
                  key={'also-transfer-' + relatedPatient.uuid}
                  labelText={
                    <div className={styles.relatedPatientTransferSwapOption}>
                      <WardPatientName patient={relatedPatient} />
                      <WardPatientIdentifier id="patient-identifier" patient={relatedPatient} />
                    </div>
                  }
                  onChange={(_, { checked, id }) => {
                    const currentValue = selectedRelatedPatient;
                    setCheckedRelatedPatient(
                      checked ? [...currentValue, id] : currentValue.filter((item) => item !== id),
                    );
                  }}
                />
              ))}
            </CheckboxGroup>
          </div>
        )}
        <div className={styles.field}>
          <h2 className={styles.productiveHeading02}>{t('selectALocation', 'Select a location')}</h2>
          <Controller
            name="location"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <LocationSelector
                name={field.name}
                field={field}
                invalid={!!error?.message}
                invalidText={error?.message}
                ancestorLocation={visit?.location}
                excludeLocations={currentAdmission ? [currentAdmission.currentInpatientLocation] : []}
              />
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
                <TextArea
                  {...field}
                  labelText={t('notes', 'Notes')}
                  invalid={!!error?.message}
                  invalidText={error?.message}
                />
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
      </Stack>
      <ButtonSet className={styles.buttonSet}>
        <Button size="xl" kind="secondary" onClick={onCancel}>
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
