import React, { useContext, useEffect, useState } from 'react';
import classNames from 'classnames';
import { InlineNotification, Select, SelectItem, RadioButtonGroup, RadioButton, TextInput } from '@carbon/react';
import { useQueueLocations } from '../hooks/useQueueLocations';
import styles from './visit-form-queue-fields.scss';
import { useConfig, ResponsiveWrapper, useSession } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { useQueues } from '../../hooks/useQueues';
import { type ConfigObject } from '../../config-schema';
import { SelectSkeleton } from '@carbon/react';
import { RadioButtonSkeleton } from '@carbon/react';
import { AddPatientToQueueContext } from '../patient-search.workspace';

const VisitFormQueueFields: React.FC = () => {
  const { t } = useTranslation();
  const { queueLocations, isLoading: isLoadingQueueLocations } = useQueueLocations();
  const { sessionLocation } = useSession();
  const config = useConfig<ConfigObject>();
  const [selectedQueueLocation, setSelectedQueueLocation] = useState(queueLocations[0]?.id);
  const { queues, isLoading: isLoadingQueues } = useQueues(selectedQueueLocation);
  const [priority, setPriority] = useState(config.concepts.defaultPriorityConceptUuid);
  const [sortWeight, setSortWeight] = useState(0);
  const [selectedService, setSelectedService] = useState('');
  const priorities = queues.find((q) => q.uuid === selectedService)?.allowedPriorities ?? [];
  const { currentServiceQueueUuid } = useContext(AddPatientToQueueContext);

  useEffect(() => {
    if (priority === config.concepts.emergencyPriorityConceptUuid) {
      setSortWeight(1);
    }
  }, [priority]);

  useEffect(() => {
    if (currentServiceQueueUuid) {
      setSelectedService(currentServiceQueueUuid);
    }
  }, [queues]);

  useEffect(() => {
    if (queueLocations.map((l) => l.id).includes(sessionLocation.uuid)) {
      setSelectedQueueLocation(sessionLocation.uuid);
    }
  }, [queueLocations]);

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
              defaultSelected={config.concepts.defaultPriorityConceptUuid}
              onChange={(uuid) => setPriority(uuid)}>
              {priorities.map(({ uuid, display }) => (
                <RadioButton key={uuid} labelText={display} value={uuid} />
              ))}
            </RadioButtonGroup>
          ) : null}
        </section>
      ) : null}

      <section className={classNames(styles.section, styles.sectionHidden)}>
        <TextInput
          type="number"
          id="sortWeight"
          name="sortWeight"
          labelText={t('sortWeight', 'Sort weight')}
          value={sortWeight}
        />
      </section>
    </div>
  );
};

export default VisitFormQueueFields;
