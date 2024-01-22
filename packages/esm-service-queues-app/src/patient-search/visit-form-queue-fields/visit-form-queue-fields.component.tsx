import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { InlineNotification, Layer, Select, SelectItem, RadioButtonGroup, RadioButton, TextInput } from '@carbon/react';
import { useQueueLocations } from '../hooks/useQueueLocations';
import { usePriority, useStatus } from '../../active-visits/active-visits-table.resource';
import { useServices } from '../../patient-queue-metrics/queue-metrics.resource';
import styles from './visit-form-queue-fields.scss';
import { type ConfigObject, useConfig, useLayoutType } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';

const StartVisitQueueFields: React.FC = () => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { priorities } = usePriority();
  const { statuses } = useStatus();
  const { queueLocations } = useQueueLocations();
  const config = useConfig() as ConfigObject;
  const defaultStatus = config.concepts.defaultStatusConceptUuid;
  const defaultPriority = config.concepts.defaultPriorityConceptUuid;
  const emergencyPriorityConceptUuid = config.concepts.emergencyPriorityConceptUuid;
  const [selectedQueueLocation, setSelectedQueueLocation] = useState(queueLocations[0]?.id);
  const { allServices, isLoading } = useServices(selectedQueueLocation);
  const [priority, setPriority] = useState(defaultPriority);
  const [status, setStatus] = useState(defaultStatus);
  const [sortWeight, setSortWeight] = useState(0);
  const [service, setSelectedService] = useState('');

  useEffect(() => {
    if (priority === emergencyPriorityConceptUuid) {
      setSortWeight(1);
    }
  }, [priority]);

  useEffect(() => {
    if (allServices?.length > 0) {
      setSelectedService(allServices[0].uuid);
    }
  }, [allServices]);

  useEffect(() => {
    if (queueLocations?.length > 0) {
      setSelectedQueueLocation(queueLocations[0].id);
    }
  }, [queueLocations]);

  return (
    <div>
      <section className={styles.section}>
        <div className={styles.sectionTitle}>{t('queueLocation', 'Queue location')}</div>
        <ResponsiveWrapper isTablet={isTablet}>
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
        </ResponsiveWrapper>
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
            {!service ? <SelectItem text={t('selectQueueService', 'Select a queue service')} value="" /> : null}
            {allServices?.length > 0 &&
              allServices.map((service) => (
                <SelectItem key={service.uuid} text={service.name} value={service.uuid}>
                  {service.name}
                </SelectItem>
              ))}
          </Select>
        )}
      </section>

      <section className={classNames(styles.section, styles.sectionHidden)}>
        <div className={styles.sectionTitle}>{t('status', 'Status')}</div>
        <Select
          labelText={t('selectStatus', 'Select a status')}
          id="status"
          name="status"
          invalidText="Required"
          value={status}
          onChange={(event) => setStatus(event.target.value)}>
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
            defaultSelected={defaultPriority}
            onChange={(uuid) => {
              setPriority(uuid);
            }}>
            {priorities?.length > 0 &&
              priorities.map(({ uuid, display }) => <RadioButton key={uuid} labelText={display} value={uuid} />)}
          </RadioButtonGroup>
        )}
      </section>

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

function ResponsiveWrapper({ children, isTablet }) {
  return isTablet ? <Layer>{children}</Layer> : <div>{children}</div>;
}

export default StartVisitQueueFields;
