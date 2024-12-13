import {
  InlineNotification,
  RadioButton,
  RadioButtonGroup,
  RadioButtonSkeleton,
  Select,
  SelectItem,
  SelectSkeleton,
} from '@carbon/react';
import { ResponsiveWrapper, showSnackbar, useConfig, useSession, type Visit } from '@openmrs/esm-framework';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type ConfigObject } from '../../config-schema';
import { useMutateQueueEntries } from '../../hooks/useQueueEntries';
import { useQueues } from '../../hooks/useQueues';
import { AddPatientToQueueContext } from '../create-queue-entry.workspace';
import { useQueueLocations } from '../hooks/useQueueLocations';
import { postQueueEntry } from './queue-fields.resource';
import styles from './queue-fields.scss';

export interface QueueFieldsProps {
  setOnSubmit(onSubmit: (visit: Visit) => Promise<any>);
}

/**
 * This component contains form fields for starting a patient's queue entry.
 */
const QueueFields: React.FC<QueueFieldsProps> = ({ setOnSubmit }) => {
  const { t } = useTranslation();
  const { queueLocations, isLoading: isLoadingQueueLocations } = useQueueLocations();
  const { sessionLocation } = useSession();
  const {
    visitQueueNumberAttributeUuid,
    concepts: { defaultStatusConceptUuid, defaultPriorityConceptUuid, emergencyPriorityConceptUuid },
  } = useConfig<ConfigObject>();
  const [selectedQueueLocation, setSelectedQueueLocation] = useState(queueLocations[0]?.id);
  const { queues, isLoading: isLoadingQueues } = useQueues(selectedQueueLocation);
  const [selectedService, setSelectedService] = useState('');
  const { currentServiceQueueUuid } = useContext(AddPatientToQueueContext);
  const [priority, setPriority] = useState(defaultPriorityConceptUuid);
  const priorities = queues.find((q) => q.uuid === selectedService)?.allowedPriorities ?? [];
  const { mutateQueueEntries } = useMutateQueueEntries();
  const memoMutateQueueEntries = useCallback(mutateQueueEntries, [mutateQueueEntries]);

  const sortWeight = priority === emergencyPriorityConceptUuid ? 1 : 0;

  const onSubmit = useCallback(
    (visit: Visit) => {
      if (selectedQueueLocation && selectedService && priority) {
        return postQueueEntry(
          visit.uuid,
          selectedService,
          visit.patient.uuid,
          priority,
          defaultStatusConceptUuid,
          sortWeight,
          selectedQueueLocation,
          visitQueueNumberAttributeUuid,
        )
          .then(() => {
            showSnackbar({
              kind: 'success',
              isLowContrast: true,
              title: t('addedPatientToQueue', 'Added patient to queue'),
              subtitle: t('queueEntryAddedSuccessfully', 'Queue entry added successfully'),
            });
            memoMutateQueueEntries();
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
      } else {
        return Promise.resolve();
      }
    },
    [
      selectedQueueLocation,
      selectedService,
      priority,
      sortWeight,
      defaultStatusConceptUuid,
      visitQueueNumberAttributeUuid,
      memoMutateQueueEntries,
      t,
    ],
  );

  useEffect(() => {
    setOnSubmit?.(onSubmit);
  }, [onSubmit, setOnSubmit]);

  useEffect(() => {
    if (currentServiceQueueUuid) {
      setSelectedService(currentServiceQueueUuid);
    }
  }, [currentServiceQueueUuid, queues]);

  useEffect(() => {
    if (queueLocations.map((l) => l.id).includes(sessionLocation.uuid)) {
      setSelectedQueueLocation(sessionLocation.uuid);
    }
  }, [queueLocations, sessionLocation.uuid]);

  return (
    <div>
      <section className={styles.section}>
        <div className={styles.sectionTitle}>{t('queueLocation', 'Queue location')}</div>
        <ResponsiveWrapper>
          {isLoadingQueueLocations ? (
            <SelectSkeleton />
          ) : (
            <Select
              labelText={t('selectQueueLocation', 'Select a queue location')}
              id="queueLocation"
              name="queueLocation"
              invalidText="Required"
              value={selectedQueueLocation}
              onChange={(event) => setSelectedQueueLocation(event.target.value)}>
              {!selectedQueueLocation ? (
                <SelectItem text={t('selectQueueLocation', 'Select a queue location')} value="" />
              ) : null}
              {queueLocations?.length > 0 &&
                queueLocations.map((location) => (
                  <SelectItem key={location.id} text={location.name} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
            </Select>
          )}
        </ResponsiveWrapper>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionTitle}>{t('service', 'Service')}</div>
        {isLoadingQueues ? (
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
            labelText={t('selectService', 'Select a service')}
            id="service"
            name="service"
            invalidText="Required"
            value={selectedService}
            onChange={(event) => setSelectedService(event.target.value)}>
            {!selectedService ? <SelectItem text={t('selectQueueService', 'Select a queue service')} value="" /> : null}
            {queues?.length > 0 &&
              queues.map((service) => (
                <SelectItem key={service.uuid} text={service.name} value={service.uuid}>
                  {service.name}
                </SelectItem>
              ))}
          </Select>
        )}
      </section>

      {/* Status section of the form would go here; historical version of this code can be found at
          https://github.com/openmrs/openmrs-esm-patient-management/blame/6c31e5ff2579fc89c2fd0d12c13510a1f2e913e0/packages/esm-service-queues-app/src/patient-search/visit-form-queue-fields/visit-form-queue-fields.component.tsx#L115 */}

      {selectedService ? (
        <section className={styles.section}>
          <div className={styles.sectionTitle}>{t('priority', 'Priority')}</div>
          {isLoadingQueues ? (
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
          ) : priorities.length ? (
            <RadioButtonGroup
              className={styles.radioButtonWrapper}
              name="priority"
              id="priority"
              defaultSelected={defaultPriorityConceptUuid}
              onChange={(uuid) => setPriority(uuid)}>
              {priorities.map(({ uuid, display }) => (
                <RadioButton key={uuid} labelText={display} value={uuid} />
              ))}
            </RadioButtonGroup>
          ) : null}
        </section>
      ) : null}
    </div>
  );
};

export default QueueFields;
