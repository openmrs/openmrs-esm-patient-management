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
import type { DispositionType, ObsPayload, WardPatient, WardViewContext } from '../../types';
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

  /**
   * The type of request the form creates. 'ADMIT' records the disposition as an admission
   * request, 'TRANSFER' (the default) records it as a transfer request.
   */
  dispositionType?: Extract<DispositionType, 'ADMIT' | 'TRANSFER'>;

  onSuccess(): void;
  onCancel(): void;
  preSelectRelatedPatients?: boolean;
}

/**
 * Form to fill out for:
 * - an admitted patient without pending transfer request, to initiate a transfer request for a patient
 * - an admitted patient with pending transfer request, to create a request to transfer elsewhere
 * - an un-admitted patient with a pending admission request, to create a request to admit elsewhere
 */
export default function PatientAdmitOrTransferForm({
  wardPatient,
  relatedTransferPatients = [],
  dispositionType = 'TRANSFER',
  onSuccess,
  onCancel,
  preSelectRelatedPatients,
}: PatientAdmitOrTransferFormProps) {
  const { t } = useTranslation();
  const { patient, inpatientRequest, visit } = wardPatient ?? {};
  const [showErrorNotifications, setShowErrorNotifications] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createEncounter, emrConfiguration, isLoadingEmrConfiguration, errorFetchingEmrConfiguration } =
    useCreateEncounter();
  const isAdmitRequest = dispositionType === 'ADMIT';
  const dispositionsOfRequestedType = useMemo(
    () => emrConfiguration?.dispositions.filter(({ type }) => type === dispositionType),
    [emrConfiguration, dispositionType],
  );
  const { wardPatientGroupDetails } = useAppContext<WardViewContext>('ward-view-context') ?? {};
  const currentAdmission = wardPatientGroupDetails?.inpatientAdmissionsByPatientUuid?.get(patient?.uuid);
  const [selectedRelatedPatient, setCheckedRelatedPatient] = useState<string[]>(() =>
    preSelectRelatedPatients ? relatedTransferPatients.map((rp) => rp.patient.uuid) : [],
  );

  const zodSchema = useMemo(
    () =>
      z.object({
        location: z.string({
          required_error: isAdmitRequest
            ? t('pleaseSelectAdmissionLocation', 'Please select admission location')
            : t('pleaseSelectTransferLocation', 'Please select transfer location'),
        }),
        note: z.string().optional(),
        disposition:
          dispositionsOfRequestedType?.length > 1
            ? z.string({
                required_error: isAdmitRequest
                  ? t('pleaseSelectAdmissionType', 'Please select admission type')
                  : t('pleaseSelectTransferType', 'Please select transfer type'),
              })
            : z.string().optional(),
      }),
    [t, dispositionsOfRequestedType, isAdmitRequest],
  );

  type FormValues = z.infer<typeof zodSchema>;

  const formDefaultValues: Partial<FormValues> = useMemo(() => {
    const defaultValues: FormValues = {};
    if (dispositionsOfRequestedType?.length === 1) {
      defaultValues.disposition = dispositionsOfRequestedType[0].uuid;
    }
    return defaultValues;
  }, [dispositionsOfRequestedType]);

  const {
    formState: { errors, isDirty },
    control,
    handleSubmit,
    setValue,
  } = useForm<FormValues>({ resolver: zodResolver(zodSchema), defaultValues: formDefaultValues });

  useEffect(() => {
    if (dispositionsOfRequestedType?.length === 1) {
      setValue('disposition', dispositionsOfRequestedType[0].uuid);
    }
  }, [dispositionsOfRequestedType, setValue]);

  const onSubmit = useCallback(
    async (values: FormValues) => {
      setIsSubmitting(true);
      setShowErrorNotifications(false);
      const { dispositionDescriptor } = emrConfiguration;

      /**
       * A related patient can have a pending request of a different type than the primary patient's
       * — a mother awaiting admission may have a child awaiting transfer — so each of them keeps
       * their own request type. Anything else (no pending request, or a pending discharge) follows
       * the type this form was opened for.
       */
      const requestTypeOf = ({ inpatientRequest }: WardPatient) =>
        inpatientRequest?.dispositionType === 'ADMIT' || inpatientRequest?.dispositionType === 'TRANSFER'
          ? inpatientRequest.dispositionType
          : dispositionType;

      // The backend derives the request type from the disposition obs group: the disposition
      // concept determines whether it is an admission or a transfer request, and the location is
      // read from the concept matching that request type.
      const buildDispositionObs = (requestType: Extract<DispositionType, 'ADMIT' | 'TRANSFER'>) => {
        const disposition =
          requestType === dispositionType
            ? dispositionsOfRequestedType.find(({ uuid }) => uuid === values.disposition)
            : emrConfiguration.dispositions.find(({ type }) => type === requestType);

        const obs: Array<ObsPayload> = [
          {
            concept:
              requestType === 'ADMIT'
                ? dispositionDescriptor.admissionLocationConcept.uuid
                : dispositionDescriptor.internalTransferLocationConcept.uuid,
            value: values.location,
          },
          {
            concept: dispositionDescriptor.dispositionConcept.uuid,
            value: disposition?.conceptCode,
          },
        ];

        if (values.note) {
          obs.push({
            concept: emrConfiguration.consultFreeTextCommentsConcept.uuid,
            value: values.note,
          });
        }

        return obs;
      };

      const wardPatientsInRequest = [
        { wardPatient, requestType: dispositionType },
        ...relatedTransferPatients
          .filter((rp) => selectedRelatedPatient.includes(rp.patient.uuid))
          .map((rp) => ({ wardPatient: rp, requestType: requestTypeOf(rp) })),
      ];

      try {
        const results = await Promise.allSettled(
          wardPatientsInRequest.map(async ({ wardPatient: wardPatientInRequest, requestType }) => {
            const { patient: patientInRequest, visit: patientInRequestVisit } = wardPatientInRequest;

            return createEncounter(
              patientInRequest,
              emrConfiguration.transferRequestEncounterType,
              patientInRequestVisit?.uuid,
              [
                {
                  concept: dispositionDescriptor.dispositionSetConcept.uuid,
                  groupMembers: buildDispositionObs(requestType),
                },
              ],
            );
          }),
        );

        results.forEach((result, i) => {
          const { wardPatient: wardPatientInRequest, requestType } = wardPatientsInRequest[i];
          const patientName = wardPatientInRequest.patient.person.preferredName.display;
          const isAdmit = requestType === 'ADMIT';
          if (result.status === 'fulfilled') {
            showSnackbar({
              title: isAdmit
                ? t('admissionRequestCreatedForPatient', 'Admission request created for {{patientName}}', {
                    patientName,
                  })
                : t('patientTransferRequestCreatedForPatient', 'Transfer request created for {{patientName}}', {
                    patientName,
                  }),
              kind: 'success',
            });
          } else {
            showSnackbar({
              title: isAdmit
                ? t('errorCreatingAdmissionRequest', 'Error creating admission request for {{patientName}}', {
                    patientName,
                  })
                : t('errorCreatingTransferRequest', 'Error creating transfer request for {{patientName}}', {
                    patientName,
                  }),
              subtitle: (result.reason as Error)?.message,
              kind: 'error',
            });
          }
        });

        if (results.some((r) => r.status === 'fulfilled')) {
          onSuccess();
        }
      } finally {
        await wardPatientGroupDetails?.mutate?.();
        setIsSubmitting(false);
      }
    },
    [
      onSuccess,
      createEncounter,
      dispositionType,
      dispositionsOfRequestedType,
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
            <CheckboxGroup
              legendText={isAdmitRequest ? t('alsoAdmit', 'Also admit:') : t('alsoTransfer', 'Also transfer:')}>
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
        {dispositionsOfRequestedType?.length > 1 && (
          <div className={styles.field}>
            <h2 className={styles.productiveHeading02}>
              {isAdmitRequest ? t('admissionType', 'Admission type') : t('transferType', 'Transfer type')}
            </h2>
            <Controller
              name="disposition"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <ResponsiveWrapper>
                  <RadioButtonGroup
                    orientation="vertical"
                    {...field}
                    invalid={!!error?.message}
                    invalidText={error?.message}>
                    {dispositionsOfRequestedType.map((disposition) => (
                      <RadioButton
                        key={disposition.uuid}
                        id={disposition.uuid}
                        labelText={disposition.name}
                        value={disposition.uuid}
                      />
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
