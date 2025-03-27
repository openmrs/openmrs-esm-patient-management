import React, { useCallback, useEffect, useState } from 'react';
import {
  InlineNotification,
  RadioButton,
  RadioButtonGroup,
  RadioButtonSkeleton,
  Select,
  SelectItem,
  SelectSkeleton,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { ResponsiveWrapper, showSnackbar, useConfig, useSession, type Visit } from '@openmrs/esm-framework';
import { type ConfigObject } from '../../config-schema';
import { useQueues } from '../../hooks/useQueues';
import { useAddPatientToQueueContext } from '../add-patient-to-queue-context';
import { postQueueEntry } from './queue-fields.resource';
import { useMutateQueueEntries } from '../../hooks/useQueueEntries';
import { useQueueLocations } from '../hooks/useQueueLocations';
import styles from './queue-fields.scss';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { TFunction } from 'i18next';

export interface QueueFieldsProps {
  setOnSubmit(onSubmit: (visit: Visit) => Promise<any>): void;
}

/**
 * This component contains form fields for starting a patient's queue entry.
 */
const QueueFields: React.FC<QueueFieldsProps> = React.memo(({ setOnSubmit }) => {
  const { t } = useTranslation();
  const { queueLocations, isLoading: isLoadingQueueLocations } = useQueueLocations();
  const { sessionLocation } = useSession();
  const {
    visitQueueNumberAttributeUuid,
    concepts: { defaultStatusConceptUuid, defaultPriorityConceptUuid, emergencyPriorityConceptUuid },
  } = useConfig<ConfigObject>();
  const { currentServiceQueueUuid } = useAddPatientToQueueContext();
  const { mutateQueueEntries } = useMutateQueueEntries();

  const QueueServiceSchema = (t: TFunction) =>
    z.object({
      queueLocation: z.string().trim().min(1, t('queueLocationRequired', 'Queue location is required')),
      queueService: z.string().trim().min(1, t('queueServiceRequired', 'Queue service is required')),
      priority: z.string({ required_error: t('priorityIsRequired', 'Priority is required') }).trim(),
    });

  const {
    control,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(QueueServiceSchema(t)),
    defaultValues: {
      queueLocation: queueLocations[0]?.id || '',
      queueService: '',
      priority: defaultPriorityConceptUuid,
    },
    mode: 'onChange',
  });

  const queueLocation = watch('queueLocation');
  const queueService = watch('queueService');
  const priority = watch('priority');
  const { queues, isLoading: isLoadingQueues } = useQueues(queueLocation);
  const priorities = queues.find((q) => q.uuid === queueService)?.allowedPriorities ?? [];
  const sortWeight = priority === emergencyPriorityConceptUuid ? 1 : 0;

  const onSubmit = useCallback(
    async (visit: Visit) => {
      const isValid = await trigger();
      if (!isValid) {
        return Promise.reject(new Error('Form validation failed'));
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
      trigger,
      queueService,
      priority,
      queueLocation,
      defaultStatusConceptUuid,
      visitQueueNumberAttributeUuid,
      mutateQueueEntries,
      t,
      sortWeight,
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
    <form>
      <section className={styles.section}>
        <div className={styles.sectionTitle}>{t('queueLocation', 'Queue location')}</div>
        <ResponsiveWrapper>
          <Controller
            name="queueLocation"
            control={control}
            render={({ field }) =>
              isLoadingQueueLocations ? (
                <SelectSkeleton />
              ) : (
                <Select
                  {...field}
                  labelText={t('selectQueueLocation', 'Select a queue location')}
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
        </ResponsiveWrapper>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionTitle}>{t('service', 'Service')}</div>
        <Controller
          name="queueService"
          control={control}
          render={({ field }) =>
            isLoadingQueues ? (
              <SelectSkeleton />
            ) : !queues?.length ? (
              <InlineNotification
                className={styles.inlineNotification}
                kind={'error'}
                lowContrast
                subtitle={t('configureServices', 'Please configure services to continue.')}
                title={t('noServicesConfigured', 'No services configured')}
              />
            ) : (
              <Select
                {...field}
                labelText={t('selectQueueService', 'Select a queue service')}
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
      </section>
      {/* Status section of the form would go here; historical version of this code can be found at
          https://github.com/openmrs/openmrs-esm-patient-management/blame/6c31e5ff2579fc89c2fd0d12c13510a1f2e913e0/packages/esm-service-queues-app/src/patient-search/visit-form-queue-fields/visit-form-queue-fields.component.tsx#L115 */}

      {queueService && (
        <section className={styles.section}>
          <div className={styles.sectionTitle}>{t('priority', 'Priority')}</div>
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
                  className={styles.inlineNotification}
                  kind={'error'}
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
                  className={styles.radioButtonWrapper}
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
        </section>
      )}
    </form>
  );
});

export default QueueFields;
