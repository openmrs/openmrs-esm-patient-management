import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Column,
  Form,
  Layer,
  Stack,
  TextInput,
  Select,
  SelectItem,
  ButtonSet,
  Button,
  InlineNotification,
} from '@carbon/react';
import { showNotification, showToast, useLayoutType } from '@openmrs/esm-framework';
import styles from './queue-service.scss';
import { saveQueue, useServiceConcepts } from './queue-service.resource';
import { SearchTypes } from '../types';
import { mutate } from 'swr';
import { useQueueLocations } from '../patient-search/hooks/useQueueLocations';

interface QueueServiceFormProps {
  toggleSearchType: (searchMode: SearchTypes) => void;
  closePanel: () => void;
}

const QueueServiceForm: React.FC<QueueServiceFormProps> = ({ toggleSearchType, closePanel }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { queueConcepts } = useServiceConcepts();
  const [queueName, setQueueName] = useState('');
  const [queueConcept, setQueueConcept] = useState('');
  const [isMissingName, setMissingName] = useState(false);
  const [isMissingQueue, setMissingQueue] = useState(false);
  const [isMissingLocation, setMissingLocation] = useState(false);
  const [userLocation, setUserLocation] = useState('');
  const { queueLocations } = useQueueLocations();

  const createQueue = useCallback(
    (event) => {
      event.preventDefault();

      if (!queueName) {
        setMissingName(true);
        return;
      }
      if (!queueConcept) {
        setMissingQueue(true);
        return;
      }
      if (!userLocation) {
        setMissingLocation(true);
        return;
      }

      setMissingName(false);
      setMissingQueue(false);
      setMissingLocation(false);

      saveQueue(queueName, queueConcept, queueName, userLocation).then(
        ({ status }) => {
          if (status === 201) {
            showToast({
              title: t('addQueue', 'Add queue'),
              kind: 'success',
              description: t('queueAddedSuccessfully', 'Queue addeded successfully'),
            });
            closePanel();
            mutate(`/ws/rest/v1/queue?${userLocation}`);
            mutate(`/ws/rest/v1/queue?location=${userLocation}`);
          }
        },
        (error) => {
          showNotification({
            title: t('errorAddingQueue', 'Error adding queue'),
            kind: 'error',
            critical: true,
            description: error?.message,
          });
        },
      );
    },
    [queueName, queueConcept, userLocation, t, closePanel],
  );

  return (
    <Form onSubmit={createQueue} className={styles.form}>
      <Stack gap={4} className={styles.grid}>
        <Column>
          <h3 className={styles.heading}>{t('addNewQueue', 'Add new queue')}</h3>
          <Layer className={styles.input}>
            <TextInput
              id="queueName"
              invalidText="Required"
              labelText={t('queueName', 'Queue name')}
              onChange={(event) => setQueueName(event.target.value)}
              value={queueName}
            />
            {isMissingName && (
              <section>
                <InlineNotification
                  style={{ margin: '0', minWidth: '100%' }}
                  kind="error"
                  lowContrast={true}
                  title={t('missingQueueName', 'Missing queue name')}
                  subtitle={t('addQueueName', 'Please add a queue name')}
                />
              </section>
            )}
          </Layer>

          <Layer className={styles.input}>
            <Select
              labelText={t('selectServiceType', 'Select a service type')}
              id="queueConcept"
              invalidText="Required"
              value={queueConcept}
              onChange={(event) => setQueueConcept(event.target.value)}>
              {!queueConcept && <SelectItem text={t('selectServiceType', 'Select a service type')} />}
              {queueConcepts.length === 0 && <SelectItem text={t('noServicesAvailable', 'No services available')} />}
              {queueConcepts?.length > 0 &&
                queueConcepts.map((concept) => (
                  <SelectItem key={concept.uuid} text={concept.display} value={concept.uuid}>
                    {concept.display}
                  </SelectItem>
                ))}
            </Select>
            {isMissingQueue && (
              <section>
                <InlineNotification
                  style={{ margin: '0', minWidth: '100%' }}
                  kind="error"
                  lowContrast={true}
                  title={t('missingService', 'Missing service')}
                  subtitle={t('selectServiceType', 'Select a service type')}
                />
              </section>
            )}
          </Layer>

          <Layer className={styles.input}>
            <Select
              labelText={t('selectLocation', 'Select a location')}
              id="location"
              invalidText="Required"
              value={userLocation}
              onChange={(event) => setUserLocation(event.target.value)}>
              {!userLocation && <SelectItem text={t('selectLocation', 'Select a location')} />}
              {queueLocations.length === 0 && <SelectItem text={t('noLocationsAvailable', 'No locations available')} />}
              {queueLocations?.length > 0 &&
                queueLocations.map((location) => (
                  <SelectItem key={location.id} text={location.name} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
            </Select>
            {isMissingLocation && (
              <section>
                <InlineNotification
                  style={{ margin: '0', minWidth: '100%' }}
                  kind="error"
                  lowContrast={true}
                  title={t('missingLocation', 'Missing location')}
                  subtitle={t('selectLocation', 'Please select a location')}
                />
              </section>
            )}
          </Layer>
        </Column>
      </Stack>
      <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
        <Button className={styles.button} kind="secondary" onClick={() => closePanel()}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button className={styles.button} kind="primary" type="submit">
          {t('save', 'Save')}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default QueueServiceForm;
