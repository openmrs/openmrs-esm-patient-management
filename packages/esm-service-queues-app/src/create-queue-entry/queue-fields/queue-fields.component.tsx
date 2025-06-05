import React, { useCallback, useEffect } from 'react';
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

/**
 * This component contains form fields for starting a patient's queue entry.
 */

const QueueFields = React.memo(({ setOnSubmit }: QueueFieldsProps) => {
  const { t } = useTranslation();
  const schema = React.useMemo(() => createQueueServiceSchema(t), [t]);
  const { queueLocations, isLoading: isLoadingQueueLocations } = useQueueLocations();
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
  } = useForm({
    defaultValues: {
      priority: defaultPriorityConceptUuid,
      queueLocation: queueLocations[0]?.id || '',
      queueService: '',
    },
    mode: 'onChange',
    resolver: zodResolver(schema),
  });

  const queueLocation = watch('queueLocation');
  const queueService = watch('queueService');
  const priority = watch('priority');
  const { queues, isLoading: isLoadingQueues } = useQueues(queueLocation);
  const priorities = queues.find((q) => q.uuid === queueService)?.allowedPriorities ?? [];
  const sortWeight = priority === emergencyPriorityConceptUuid ? 1 : 0;

  const onSubmit = useCallback(
    async (visit: Visit) => {
      const isValid = await trigger(['queueLocation', 'queueService', 'priority']);

      if (!isValid) {
        const errorMessages = Object.entries(errors)
          .map(([, error]) => `${error?.message ?? 'Invalid'}`)
          .join('\n');
        return Promise.reject(new Error(`Form validation failed:\n${errorMessages}`));
      }
      return postQueueEntry(
        visit.uuid,
        queueService,
        visit.patient.uuid,
        priority,
        defaultStatusConceptUuid,
        sortWeight,
        queueLocation,
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
            subtitle: error?.message,
          });
          throw error;
        });
    },
    [
      defaultStatusConceptUuid,
      mutateQueueEntries,
      priority,
      queueLocation,
      queueService,
      sortWeight,
      t,
      trigger,
      visitQueueNumberAttributeUuid,
      errors,
    ],
  );

  useEffect(() => {
    setOnSubmit?.(onSubmit);
  }, [onSubmit, setOnSubmit]);

  useEffect(() => {
    if (currentServiceQueueUuid) {
      setValue('queueService', currentServiceQueueUuid, { shouldValidate: true });
    }
  }, [currentServiceQueueUuid, setValue]);

  useEffect(() => {
    if (queueLocations.map((l) => l.id).includes(sessionLocation.uuid)) {
      setValue('queueLocation', sessionLocation.uuid, { shouldValidate: true });
    }
  }, [queueLocations, sessionLocation.uuid, setValue]);

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
                  invalid={!!errors.queueLocation}
                  invalidText={errors.queueLocation?.message}
                  onChange={(event) => field.onChange(event.target.value)}>
                  <SelectItem text={t('selectQueueLocation', 'Select a queue location')} value="" />
                  {queueLocations?.map((location) => (
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
                onChange={(event) => field.onChange(event.target.value)}>
                <SelectItem text={t('selectQueueService', 'Select a queue service')} value="" />
                {queues?.map((service) => (
                  <SelectItem key={service.uuid} text={service.name} value={service.uuid}>
                    {service.name}
                  </SelectItem>
                ))}
              </Select>
            )
          }
        />
      </FormGroup>
      {/* Status section of the form would go here; historical version of this code can be found at
      https://github.com/openmrs/openmrs-esm-patient-management/blame/6c31e5ff2579fc89c2fd0d12c13510a1f2e913e0/packages/esm-service-queues-app/src/patient-search/visit-form-queue-fields/visit-form-queue-fields.component.tsx#L115 */}

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
