import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Column, Form, Layer, Stack, TextInput, Select, SelectItem, TextArea, ButtonSet, Button } from '@carbon/react';
import { showNotification, showToast, useLayoutType, useLocations, useSession } from '@openmrs/esm-framework';
import styles from './queue-service.scss';
import { saveQueue, useServiceConcepts } from './queue-service.resource';
import { SearchTypes } from '../types';
import { mutate } from 'swr';
import { WarningAlt } from '@carbon/react/icons';

interface QueueServiceFormProps {
  toggleSearchType: (searchMode: SearchTypes) => void;
  closePanel: () => void;
}

const QueueServiceForm: React.FC<QueueServiceFormProps> = ({ toggleSearchType, closePanel }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { queueConcepts } = useServiceConcepts();
  const locations = useLocations();
  const [queueName, setQueueName] = useState('');
  const [queueConcept, setQueueConcept] = useState('');
  const [queueDescription, setQueueDescription] = useState('');
  const [isMissingAllFields, setMissingAllFields] = useState(false);
  const [userLocation, setUserLocation] = useState('');
  const session = useSession();

  useEffect(() => {
    if (!userLocation && session?.sessionLocation !== null) {
      setUserLocation(session?.sessionLocation?.uuid);
    }
  }, [session, locations, userLocation]);

  const createQueue = useCallback(
    (event) => {
      event.preventDefault();

      if (!queueName || !queueConcept || !queueDescription || !userLocation) {
        setMissingAllFields(true);
        return;
      }
      setMissingAllFields(false);
      saveQueue(queueName, queueConcept, queueDescription, userLocation, new AbortController()).then(
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
    [queueName, queueConcept, queueDescription, userLocation, t, closePanel],
  );

  return (
    <Form onSubmit={createQueue} className={styles.form}>
      <Stack gap={4} className={styles.grid}>
        <Column>
          <h3 className={styles.heading}>{t('addNewQueue', 'Add new queue')}</h3>
          <Layer className={styles.input}>
            {isMissingAllFields === true && (
              <div className={styles.warningContainer}>
                <WarningAlt size={16} />{' '}
                <p className={styles.warning}>{t('allFieldsAreRequired', 'All fields are required')}</p>
              </div>
            )}
            <TextInput
              id="queueName"
              invalidText="Required"
              labelText={t('queueName', 'Queue name')}
              onChange={(event) => setQueueName(event.target.value)}
              value={queueName}
            />
          </Layer>
          <Layer className={styles.input}>
            <TextArea
              rows={3}
              id="queueDescription"
              invalidText="Required"
              labelText={t('queueDescription', 'Queue description')}
              onChange={(event) => setQueueDescription(event.target.value)}
              value={queueDescription}
            />
          </Layer>

          <Layer className={styles.input}>
            <Select
              labelText={t('selectQueueConcept', 'Select a concept for the queue')}
              id="queueConcept"
              invalidText="Required"
              value={queueConcept}
              onChange={(event) => setQueueConcept(event.target.value)}
              light>
              {!queueConcept && <SelectItem text={t('selectQueueConcept', 'Select a concept for the queue')} />}
              {queueConcepts.length === 0 && <SelectItem text={t('noConceptsAvailable', 'No concepts available')} />}
              {queueConcepts?.length > 0 &&
                queueConcepts.map((concept) => (
                  <SelectItem key={concept.uuid} text={concept.display} value={concept.uuid}>
                    {concept.display}
                  </SelectItem>
                ))}
            </Select>
          </Layer>

          <Layer className={styles.input}>
            <Select
              labelText={t('selectLocation', 'Select a location')}
              id="location"
              invalidText="Required"
              value={userLocation}
              onChange={(event) => setUserLocation(event.target.value)}
              light>
              {locations.length === 0 && <SelectItem text={t('noLocationsAvailable', 'No locations available')} />}
              {locations?.length > 0 &&
                locations.map((location) => (
                  <SelectItem key={location.uuid} text={location.display} value={location.uuid}>
                    {location.display}
                  </SelectItem>
                ))}
            </Select>
          </Layer>
        </Column>
      </Stack>
      <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
        <Button className={styles.button} kind="secondary" onClick={() => toggleSearchType(SearchTypes.BASIC)}>
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
