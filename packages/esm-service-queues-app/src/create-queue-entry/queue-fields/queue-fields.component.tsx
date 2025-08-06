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
import { type TFunction, useTranslation } from 'react-i18next';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ResponsiveWrapper, showSnackbar, useConfig, useSession, type Visit } from '@openmrs/esm-framework';
import { type ConfigObject } from '../../config-schema';
import { postQueueEntry } from './queue-fields.resource';
import { useAddPatientToQueueContext } from '../add-patient-to-queue-context';
import { useMutateQueueEntries } from '../../hooks/useQueueEntries';
import { useQueueLocations } from '../hooks/useQueueLocations';
import { useQueues } from '../../hooks/useQueues';

export interface QueueFieldsProps {
  setOnSubmit(onSubmit: (visit: Visit) => Promise<void>): void;
  defaultInitialServiceQueue?: string;
}

const createQueueServiceSchema = (t: TFunction) =>
  z.object({
    queueLocation: z
      .string({ required_error: t('queueLocationRequired', 'Queue location is required') })
      .trim()
      .min(1, t('queueLocationRequired', 'Queue location is required')),
    queueService: z
      .string({ required_error: t('queueServiceRequired', 'Queue service is required') })
      .trim()
      .min(1, t('queueServiceRequired', 'Queue service is required')),
    priority: z
      .string({ required_error: t('priorityIsRequired', 'Priority is required') })
      .trim()
      .min(1, t('priorityIsRequired', 'Priority is required')),
  });

const QueueFields = React.memo(({ setOnSubmit, defaultInitialServiceQueue }: QueueFieldsProps) => {
  const { t } = useTranslation();
  const schema = useMemo(() => createQueueServiceSchema(t), [t]);
  const { queueLocations, isLoading: isLoadingQueueLocations } = useQueueLocations();
  const memoizedQueueLocations = useMemo(
    () => queueLocations,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(queueLocations.map((l) => ({ id: l.id, name: l.name })))],
  );
  const { sessionLocation } = useSession();
  const {
    concepts: { defaultStatusConceptUuid, defaultPriorityConceptUuid, emergencyPriorityConceptUuid },
    visitQueueNumberAttributeUuid,
  } = useConfig<ConfigObject>();
  const { currentServiceQueueUuid } = useAddPatientToQueueContext();
  const { mutateQueueEntries } = useMutateQueueEntries();

  const {
    control,
    formState: { errors },
    setValue,
    trigger,
    watch,
    getValues,
  } = useForm({
    defaultValues: {
      priority: defaultPriorityConceptUuid,
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
    () => queues,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(queues.map((q) => ({ uuid: q.uuid, name: q.name })))],
  );
  const priorities = useMemo(() => {
    return queues.find((q) => q.uuid === queueService)?.allowedPriorities ?? [];
  }, [queues, queueService]);

  const sortWeight = priority === emergencyPriorityConceptUuid ? 1 : 0;

  const onSubmit = useCallback(
    async (visit: Visit) => {
      try {
        const formValues = getValues();
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

          return Promise.reject(new Error(`Form validation failed:\n${errorMessages}`));
        }

        if (!formValues.queueLocation || !formValues.queueService || !formValues.priority) {
          const missingFields = [];
          if (!formValues.queueLocation) missingFields.push('Queue Location');
          if (!formValues.queueService) missingFields.push('Queue Service');
          if (!formValues.priority) missingFields.push('Priority');

          const errorMessage = t('missingRequiredFields', 'Missing required fields: {{fields}}', {
            fields: missingFields.join(', '),
          });

          showSnackbar({
            title: t('incompleteForm', 'Incomplete form'),
            kind: 'error',
            isLowContrast: false,
            subtitle: errorMessage,
          });

          return Promise.reject(new Error(errorMessage));
        }

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
            showSnackbar({
              title: t('queueEntryError', 'Error adding patient to the queue'),
              kind: 'error',
              isLowContrast: false,
              subtitle: error?.message ?? t('unknownError', 'An unknown error occurred'),
            });
            throw error;
          });
      } catch (error) {
        showSnackbar({
          title: t('unexpectedError', 'Unexpected error'),
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
    ],
  );

  useEffect(() => {
    setOnSubmit?.(onSubmit);
  }, [onSubmit, setOnSubmit]);

  useEffect(() => {
    if (memoizedQueueLocations.length > 0 && !queueLocation) {
      const sessionLocationMatch = memoizedQueueLocations.find((location) => location.id === sessionLocation?.uuid);

      if (sessionLocationMatch) {
        setValue('queueLocation', sessionLocationMatch.id, { shouldValidate: true });
      } else {
        setValue('queueLocation', memoizedQueueLocations[0].id, { shouldValidate: true });
      }
    }
  }, [memoizedQueueLocations, queueLocation, sessionLocation?.uuid, setValue]);

  useEffect(() => {
    if (currentServiceQueueUuid && currentServiceQueueUuid !== queueService) {
      setValue('queueService', currentServiceQueueUuid, { shouldValidate: true });
    }
  }, [currentServiceQueueUuid, queueService, setValue]);

  useEffect(() => {
    if (defaultInitialServiceQueue && memoizedQueues.length > 0 && !queueService) {
      const initialServiceQueue = memoizedQueues.find((queue) => queue.name === defaultInitialServiceQueue);
      if (initialServiceQueue) {
        setValue('queueService', initialServiceQueue.uuid, { shouldValidate: true });
      }
    }
  }, [defaultInitialServiceQueue, memoizedQueues, queueService, setValue]);

  useEffect(() => {
    if (queueLocation && queueService) {
      const isServiceValid = memoizedQueues.some((queue) => queue.uuid === queueService);
      if (!isServiceValid) {
        setValue('queueService', '', { shouldValidate: true });
        setValue('priority', defaultPriorityConceptUuid, { shouldValidate: true });
      }
    }
  }, [queueLocation, memoizedQueues, queueService, setValue, defaultPriorityConceptUuid]);

  useEffect(() => {
    if (queueService && priorities.length > 0) {
      const isPriorityValid = priorities.some((p) => p.uuid === priority);
      if (!isPriorityValid) {
        const defaultPriority = priorities.find((p) => p.uuid === defaultPriorityConceptUuid) || priorities[0];
        setValue('priority', defaultPriority.uuid, { shouldValidate: true });
      }
    } else if (queueService && priorities.length === 0) {
      setValue('priority', '', { shouldValidate: false });
    }
  }, [queueService, priorities, priority, defaultPriorityConceptUuid, setValue]);

  return (
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
                  invalid={!!errors.queueLocation}
                  invalidText={errors.queueLocation?.message}
                  onChange={(event) => {
                    field.onChange(event.target.value);
                    if (event.target.value !== queueLocation) {
                      setValue('queueService', '', { shouldValidate: true });
                      setValue('priority', defaultPriorityConceptUuid, { shouldValidate: true });
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

      <FormGroup legendText={t('service', 'Service')}>
        <Controller
          name="queueService"
          control={control}
          render={({ field }) =>
            isLoadingQueues ? (
              <SelectSkeleton />
            ) : !queues?.length ? (
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
                invalid={!!errors.queueService}
                invalidText={errors.queueService?.message}
                onChange={(event) => {
                  field.onChange(event.target.value);
                  if (event.target.value !== queueService) {
                    setValue('priority', defaultPriorityConceptUuid, { shouldValidate: true });
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

      {queueService && (
        <FormGroup legendText={t('priority', 'Priority')}>
          <Controller
            name="priority"
            control={control}
            render={({ field }) =>
              isLoadingQueues ? (
                <RadioButtonGroup>
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
