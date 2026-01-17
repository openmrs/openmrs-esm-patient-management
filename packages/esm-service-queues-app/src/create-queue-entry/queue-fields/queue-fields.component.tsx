import React, { useCallback, useEffect, useMemo } from 'react';
import {
  FormGroup,
  InlineNotification,
  RadioButton,
  RadioButtonGroup,
  RadioButtonSkeleton,
  Select,
  SelectItem,
  SelectSkeleton,
  Stack,
} from '@carbon/react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { type TFunction } from 'i18next';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ResponsiveWrapper, showSnackbar, useConfig, useSession, type Visit } from '@openmrs/esm-framework';
import { type ConfigObject } from '../../config-schema';
import { postQueueEntry } from './queue-fields.resource';
import { useMutateQueueEntries } from '../../hooks/useQueueEntries';
import { useQueueLocations } from '../hooks/useQueueLocations';
import { useQueues } from '../../hooks/useQueues';
import { DUPLICATE_QUEUE_ENTRY_ERROR_CODE } from '../../constants';
import { useServiceQueuesStore } from '../../store/store';

export interface QueueFieldsProps {
  setOnSubmit(onSubmit: (visit: Visit) => Promise<void>): void;
  defaultInitialServiceQueue?: string;
}

const createQueueServiceSchema = (t: TFunction) =>
  z.object({
    queueLocation: z.string().trim(),
    queueService: z.string().trim(),
    priority: z.string().trim(),
  });

/**
 * This component contains form fields for starting a patient's queue entry.
 */

const QueueFields = React.memo(({ setOnSubmit, defaultInitialServiceQueue }: QueueFieldsProps) => {
  const { t } = useTranslation();
  const schema = useMemo(() => createQueueServiceSchema(t), [t]);
  const { sessionLocation } = useSession();
  const { queueLocations, isLoading: isLoadingQueueLocations } = useQueueLocations();
  const memoizedQueueLocations = useMemo(
    () => queueLocations.map((l) => ({ id: l.id, name: l.name })),
    [queueLocations],
  );
  const {
    concepts: { defaultStatusConceptUuid, defaultPriorityConceptUuid, emergencyPriorityConceptUuid },
    visitQueueNumberAttributeUuid,
  } = useConfig<ConfigObject>();
  const { selectedServiceUuid } = useServiceQueuesStore();
  const { mutateQueueEntries } = useMutateQueueEntries();

  const {
    control,
    formState: { errors, touchedFields, isSubmitted },
    setValue,
    trigger,
    watch,
    getValues,
    clearErrors,
  } = useForm({
    defaultValues: {
      priority: '',
      queueLocation: '',
      queueService: '',
    },
    mode: 'onChange',
    resolver: zodResolver(schema),
  });

  const queueLocation = watch('queueLocation');
  const queueService = watch('queueService');
  const priority = watch('priority');

  const { queues, isLoading: isLoadingQueues } = useQueues(queueLocation);
  const memoizedQueues = useMemo(
    () => queues.map((q) => ({ uuid: q.uuid, name: q.name, allowedPriorities: q.allowedPriorities })),
    [queues],
  );
  const priorities = useMemo(() => {
    return memoizedQueues.find((q) => q.uuid === queueService)?.allowedPriorities ?? [];
  }, [memoizedQueues, queueService]);

  const sortWeight = priority === emergencyPriorityConceptUuid ? 1 : 0;
  const isDataLoaded = !isLoadingQueueLocations && !isLoadingQueues;

  const hasCompleteQueueEntry = queueLocation && queueService && priority;

  const onSubmit = useCallback(
    async (visit: Visit) => {
      try {
        const formValues = getValues();

        if (!hasCompleteQueueEntry) {
          let missingField;
          if (!queueLocation) {
            missingField = t('location', 'Location');
          } else if (!formValues.queueService) {
            missingField = t('service', 'Service');
          } else if (!formValues.priority) {
            missingField = t('priority', 'Priority');
          }
          const errorMessage = t('missingRequiredFields', 'Missing required fields: {{fields}}', {
            fields: missingField,
          });

          const isFormValid = await trigger(['queueLocation', 'queueService', 'priority']);
          if (!isFormValid) {
            const errorMessages = Object.entries(errors)
              .map(([field, error]) => `${field}: ${error?.message ?? 'Invalid'}`)
              .join('\n');
            showSnackbar({
              title: t('formValidationFailed', 'Form validation failed'),
              kind: 'error',
              isLowContrast: false,
              subtitle: errorMessages,
            });
            throw new Error(`Form validation failed:\n${errorMessages}`);
          }

          throw new Error(errorMessage);
        } else {
          return postQueueEntry(
            visit.uuid,
            formValues.queueService,
            visit.patient.uuid,
            formValues.priority,
            defaultStatusConceptUuid,
            sortWeight,
            formValues.queueLocation,
            visitQueueNumberAttributeUuid,
          )
            .then(() => {
              showSnackbar({
                kind: 'success',
                isLowContrast: true,
                title: t('addedPatientToQueue', 'Added patient to queue'),
                subtitle: t('queueEntryAddedSuccessfully', 'Queue entry added successfully'),
              });
              mutateQueueEntries();
            })
            .catch((error) => {
              const errorMessage = error?.responseBody?.error?.message || error?.message || '';
              const isDuplicatePatientError = errorMessage.includes(DUPLICATE_QUEUE_ENTRY_ERROR_CODE);

              if (isDuplicatePatientError) {
                showSnackbar({
                  title: t('patientAlreadyInQueue', 'Patient already in queue'),
                  kind: 'warning',
                  isLowContrast: false,
                  subtitle: t('duplicateQueueEntry', 'This patient is already in the selected queue.'),
                });
              } else {
                showSnackbar({
                  title: t('queueEntryError', 'Error adding patient to the queue'),
                  kind: 'error',
                  isLowContrast: false,
                  subtitle: error?.message ?? t('unknownError', 'An unknown error occurred'),
                });
              }
              throw error;
            });
        }
      } catch (error) {
        showSnackbar({
          title: !hasCompleteQueueEntry
            ? t('incompleteForm', 'Incomplete form')
            : t('unexpectedError', 'Unexpected error'),
          kind: 'error',
          isLowContrast: false,
          subtitle: error?.message ?? t('unknownError', 'An unknown error occurred'),
        });
        throw error;
      }
    },
    [
      defaultStatusConceptUuid,
      mutateQueueEntries,
      sortWeight,
      t,
      trigger,
      visitQueueNumberAttributeUuid,
      errors,
      getValues,
      hasCompleteQueueEntry,
      queueLocation,
    ],
  );

  useEffect(() => {
    setOnSubmit?.(onSubmit);
  }, [onSubmit, setOnSubmit]);

  useEffect(() => {
    const currentQueueLocation = getValues('queueLocation');

    if (
      sessionLocation?.uuid &&
      !currentQueueLocation &&
      !touchedFields.queueLocation &&
      memoizedQueueLocations.length > 0
    ) {
      const locationExists = memoizedQueueLocations.some((loc) => loc.id === sessionLocation.uuid);
      if (locationExists) {
        setValue('queueLocation', sessionLocation.uuid, { shouldValidate: isDataLoaded });
      }
    }
  }, [sessionLocation, memoizedQueueLocations, getValues, touchedFields.queueLocation, setValue, isDataLoaded]);

  useEffect(() => {
    const service = getValues('queueService');
    if (selectedServiceUuid && !service && !touchedFields.queueService) {
      setValue('queueService', selectedServiceUuid, { shouldValidate: isDataLoaded });
    }
  }, [selectedServiceUuid, getValues, touchedFields.queueService, setValue, isDataLoaded]);

  useEffect(() => {
    if (defaultInitialServiceQueue && memoizedQueues.length > 0 && !queueService && queueLocation) {
      const initialServiceQueue = memoizedQueues.find((queue) => queue.name === defaultInitialServiceQueue);
      if (initialServiceQueue && queueService !== initialServiceQueue.uuid) {
        setValue('queueService', initialServiceQueue.uuid, { shouldValidate: isDataLoaded });
      }
    }
  }, [defaultInitialServiceQueue, memoizedQueues, queueService, setValue, isDataLoaded, queueLocation]);

  useEffect(() => {
    if (queueLocation && queueService) {
      const isServiceValid = memoizedQueues.some((queue) => queue.uuid === queueService);
      if (!isServiceValid) {
        setValue('queueService', '', { shouldValidate: isDataLoaded });
        setValue('priority', '', { shouldValidate: isDataLoaded });
      }
    }
  }, [queueLocation, memoizedQueues, queueService, setValue, isDataLoaded]);

  useEffect(() => {
    if (queueService && priorities.length > 0) {
      const isPriorityValid = priorities.some((p) => p.uuid === priority);
      if (!isPriorityValid) {
        const defaultPriority = priorities.find((p) => p.uuid === defaultPriorityConceptUuid) || priorities[0];
        setValue('priority', defaultPriority.uuid, { shouldValidate: false });
      }
    } else if (queueService && priorities.length === 0 && priority !== '') {
      setValue('priority', '', { shouldValidate: false });
    } else if (!queueService && priority !== '') {
      setValue('priority', '', { shouldValidate: false });
      clearErrors('priority');
    }
  }, [queueService, priorities, priority, defaultPriorityConceptUuid, setValue, clearErrors]);

  useEffect(() => {
    if (!queueLocation) {
      setValue('queueService', '', { shouldValidate: false });
      setValue('priority', '', { shouldValidate: false });
      clearErrors(['queueService', 'priority']);
    }
  }, [queueLocation, setValue, clearErrors]);

  return (
    /*
     * Do not style this component directly. It is used in multiple contexts:
     * 1. As an extension in the Visit form in the Patient Chart
     * 2. In the Add patient to queue modal
     *
     * Instead, use the parent component's styling context or create a wrapper component with specific styles.
     */
    <Stack gap={5}>
      <ResponsiveWrapper>
        <FormGroup legendText={t('queueLocation', 'Queue Location')}>
          <Controller
            name="queueLocation"
            control={control}
            render={({ field }) =>
              isLoadingQueueLocations ? (
                <SelectSkeleton />
              ) : (
                <Select
                  {...field}
                  labelText=""
                  id="queueLocation"
                  invalid={!!errors.queueLocation && (touchedFields.queueLocation || isSubmitted)}
                  invalidText={errors.queueLocation?.message}
                  onChange={(event) => {
                    field.onChange(event.target.value);
                    if (event.target.value !== queueLocation) {
                      setValue('queueService', '', { shouldValidate: false });
                      setValue('priority', '', { shouldValidate: false });
                      clearErrors(['queueService', 'priority']);
                    }
                  }}>
                  <SelectItem text={t('selectQueueLocation', 'Select a queue location')} value="" />
                  {memoizedQueueLocations?.map((location) => (
                    <SelectItem key={location.id} text={location.name} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </Select>
              )
            }
          />
        </FormGroup>
      </ResponsiveWrapper>

      {queueLocation && (
        <FormGroup legendText={t('service', 'Service')}>
          <Controller
            name="queueService"
            control={control}
            render={({ field }) =>
              isLoadingQueues ? (
                <SelectSkeleton />
              ) : !memoizedQueues?.length ? (
                <InlineNotification
                  kind="error"
                  lowContrast
                  subtitle={t('configureServices', 'Please configure services to continue.')}
                  title={t('noServicesConfigured', 'No services configured')}
                />
              ) : (
                <Select
                  {...field}
                  labelText=""
                  id="queueService"
                  invalid={!!errors.queueService && (touchedFields.queueService || isSubmitted)}
                  invalidText={errors.queueService?.message}
                  onChange={(event) => {
                    field.onChange(event.target.value);
                    if (event.target.value !== queueService) {
                      setValue('priority', '', { shouldValidate: false });
                      clearErrors('priority');
                    }
                  }}>
                  <SelectItem text={t('selectQueueService', 'Select a queue service')} value="" />
                  {memoizedQueues?.map((service) => (
                    <SelectItem key={service.uuid} text={service.name} value={service.uuid}>
                      {service.name}
                    </SelectItem>
                  ))}
                </Select>
              )
            }
          />
        </FormGroup>
      )}
      {/* Status section of the form would go here; historical version of this code can be found at
      https://github.com/openmrs/openmrs-esm-patient-management/blame/6c31e5ff2579fc89c2fd0d12c13510a1f2e913e0/packages/esm-service-queues-app/src/patient-search/visit-form-queue-fields/visit-form-queue-fields.component.tsx#L115 */}

      {queueLocation && queueService && (
        <FormGroup legendText={t('priority', 'Priority')}>
          <Controller
            name="priority"
            control={control}
            render={({ field }) =>
              isLoadingQueues ? (
                <RadioButtonGroup name="priority">
                  <RadioButtonSkeleton />
                  <RadioButtonSkeleton />
                  <RadioButtonSkeleton />
                </RadioButtonGroup>
              ) : !priorities?.length ? (
                <InlineNotification
                  kind="error"
                  lowContrast
                  title={t('noPrioritiesForServiceTitle', 'No priorities available')}>
                  {t(
                    'noPrioritiesForService',
                    'The selected service does not have any allowed priorities. This is an error in configuration. Please contact your system administrator.',
                  )}
                </InlineNotification>
              ) : (
                <RadioButtonGroup
                  {...field}
                  id="priority"
                  valueSelected={field.value}
                  onChange={(uuid) => field.onChange(uuid)}>
                  {priorities.map(({ uuid, display }) => (
                    <RadioButton key={uuid} labelText={display} value={uuid} />
                  ))}
                </RadioButtonGroup>
              )
            }
          />
        </FormGroup>
      )}
    </Stack>
  );
});

export default QueueFields;
