import React, { useEffect, useState } from 'react';
import { InlineNotification, Layer, Select, SelectItem, RadioButtonGroup, RadioButton, TextInput } from '@carbon/react';
import { useQueueLocations } from '../hooks/useQueueLocations';
import { usePriority, useStatus } from '../../active-visits/active-visits-table.resource';
import { useServices } from '../../patient-queue-metrics/queue-metrics.resource';
import styles from './visit-form-queue-fields.scss';
import { ConfigObject, useConfig, useLayoutType } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';

const StartVisitQueueFields: React.FC = () => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { priorities } = usePriority();
  const [service, setSelectedService] = useState('');
  const { statuses } = useStatus();
  const { queueLocations } = useQueueLocations();
  const config = useConfig() as ConfigObject;
  const defaultStatus = config.concepts.defaultStatusConceptUuid;
  const defaultPriority = config.concepts.defaultPriorityConceptUuid;
  const emergencyPriorityConceptUuid = config.concepts.emergencyPriorityConceptUuid;
  const [selectedQueueLocation, setSelectedQueueLocation] = useState(queueLocations[0]?.id);
  const { allServices, isLoading } = useServices(selectedQueueLocation);
  const [priority, setPriority] = useState(defaultPriority);
  const [status, setStatus] = useState('');
  const [sortWeight, setSortWeight] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setSelectedService(allServices.length > 0 ? allServices[0].uuid : '');
    }
  }, [isLoading, allServices]);

  useEffect(() => {
    setStatus(defaultStatus);
  }, [defaultStatus]);

  // to sort sortWeight
  useEffect(() => {
    if (priority === emergencyPriorityConceptUuid) {
      setSortWeight(1);
    } else {
      setSortWeight(0);
    }
  }, [priority]);

  return (
    <div>
      <section className={styles.section}>
        <div className={styles.sectionTitle}>{t('queueLocation', 'Queue Location')}</div>
        {isTablet ? (
          <Layer>
            <Select
              labelText={t('selectQueueLocation', 'Select a queue location')}
              id="queueLocation"
              name="queueLocation"
              invalidText="Required"
              value={selectedQueueLocation}
              onChange={(event) => setSelectedQueueLocation(event.target.value)}>
              {queueLocations?.length > 0 &&
                queueLocations.map((location) => (
                  <SelectItem key={location.id} text={location.name} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
            </Select>
          </Layer>
        ) : (
          <Select
            labelText={t('selectQueueLocation', 'Select a queue location')}
            id="queueLocation"
            name="queueLocation"
            invalidText="Required"
            value={selectedQueueLocation}
            onChange={(event) => setSelectedQueueLocation(event.target.value)}>
            {queueLocations?.length > 0 &&
              queueLocations.map((location) => (
                <SelectItem key={location.id} text={location.name} value={location.id}>
                  {location.name}
                </SelectItem>
              ))}
          </Select>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionTitle}>{t('service', 'Service')}</div>
        {!allServices?.length ? (
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
            value={service}
            onChange={(event) => setSelectedService(event.target.value)}>
            {allServices?.length > 0 &&
              allServices.map((service) => (
                <SelectItem key={service.uuid} text={service.name} value={service.uuid}>
                  {service.name}
                </SelectItem>
              ))}
          </Select>
        )}
      </section>

      <section className={`${styles.section} ${styles.sectionHidden}`}>
        <div className={styles.sectionTitle}>{t('status', 'Status')}</div>
        <Select
          labelText={t('selectStatus', 'Select a status')}
          id="status"
          name="status"
          invalidText="Required"
          value={status}
          onChange={(event) => setSelectedService(event.target.value)}>
          {!statuses ? <SelectItem text={t('chooseStatus', 'Select a status')} value="" /> : null}
          {statuses?.length > 0 &&
            statuses.map((status) => (
              <SelectItem key={status.uuid} text={status.display} value={status.uuid}>
                {status.display}
              </SelectItem>
            ))}
        </Select>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionTitle}>{t('priority', 'Priority')}</div>
        {!priorities?.length ? (
          <InlineNotification
            className={styles.inlineNotification}
            kind={'error'}
            lowContrast
            subtitle={t('configurePriorities', 'Please configure priorities to continue.')}
            title={t('noPrioritiesConfigured', 'No priorities configured')}
          />
        ) : (
          <RadioButtonGroup
            className={styles.radioButtonWrapper}
            name="priority"
            id="priority"
            valueSelected={defaultPriority}
            onChange={(event) => {
              setPriority(event.name as any);
            }}>
            {priorities?.length > 0 &&
              priorities.map((priority) => (
                <RadioButton key={priority.uuid} labelText={priority.display} value={priority.uuid} />
              ))}
          </RadioButtonGroup>
        )}
      </section>

      <section className={`${styles.section} ${styles.sectionHidden}`}>
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

export default StartVisitQueueFields;
