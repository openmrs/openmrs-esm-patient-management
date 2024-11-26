import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  ButtonSet,
  Column,
  Form,
  InlineNotification,
  Layer,
  Select,
  SelectItem,
  Stack,
  TextInput,
} from '@carbon/react';
import { mutate } from 'swr';
import { type DefaultWorkspaceProps, restBaseUrl, showSnackbar } from '@openmrs/esm-framework';
import { saveQueue, useServiceConcepts } from './queue-service.resource';
import { useQueueLocations } from '../create-queue-entry/hooks/useQueueLocations';
import styles from './queue-service-form.scss';

const QueueServiceForm: React.FC<DefaultWorkspaceProps> = ({ closeWorkspace }) => {
  const { t } = useTranslation();
  const { queueConcepts } = useServiceConcepts();
  const { queueLocations } = useQueueLocations();
  const [queueName, setQueueName] = useState('');
  const [queueConcept, setQueueConcept] = useState('');
  const [isMissingName, setMissingName] = useState(false);
  const [isMissingQueue, setMissingQueue] = useState(false);
  const [isMissingLocation, setMissingLocation] = useState(false);
  const [userLocation, setUserLocation] = useState('');

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
            showSnackbar({
              title: t('addQueue', 'Add queue'),
              kind: 'success',
              subtitle: t('queueAddedSuccessfully', 'Queue added successfully'),
            });
            closeWorkspace();
            mutate(`${restBaseUrl}/queue?${userLocation}`);
            mutate(`${restBaseUrl}/queue?location=${userLocation}`);
          }
        },
        (error) => {
          showSnackbar({
            title: t('errorAddingQueue', 'Error adding queue'),
            kind: 'error',
            isLowContrast: false,
            subtitle: error?.message,
          });
        },
      );
    },
    [queueName, queueConcept, userLocation, t, closeWorkspace],
  );

  return (
    <Form onSubmit={createQueue} className={styles.form}>
      <Stack gap={4} className={styles.grid}>
        <Column>
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
                {/* TODO: Use a zod schema instead of this */}
                <InlineNotification
                  style={{ margin: '0', minWidth: '100%' }}
                  kind="error"
                  lowContrast
                  title={t('missingQueueName', 'Missing queue name')}
                  subtitle={t('addQueueName', 'Please add a queue name')}
                />
              </section>
            )}
          </Layer>
        </Column>

        <Column>
          <Layer className={styles.input}>
            <Select
              labelText={t('selectServiceType', 'Select a service type')}
              id="queueConcept"
              invalidText="Required"
              onChange={(event) => setQueueConcept(event.target.value)}
              value={queueConcept}>
              {!queueConcept && <SelectItem text={t('selectServiceType', 'Select a service type')} value="" />}
              {queueConcepts.length === 0 && (
                <SelectItem text={t('noServicesAvailable', 'No services available')} value="" />
              )}
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
                  lowContrast
                  title={t('missingService', 'Missing service')}
                  subtitle={t('selectServiceType', 'Select a service type')}
                />
              </section>
            )}
          </Layer>
        </Column>

        <Column>
          <Layer className={styles.input}>
            <Select
              id="location"
              invalidText="Required"
              labelText={t('selectALocation', 'Select a location')}
              onChange={(event) => setUserLocation(event.target.value)}
              value={userLocation}>
              {!userLocation && <SelectItem text={t('selectALocation', 'Select a location')} value="" />}
              {queueLocations.length === 0 && (
                <SelectItem text={t('noLocationsAvailable', 'No locations available')} value="" />
              )}
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
                  lowContrast
                  title={t('missingLocation', 'Missing location')}
                  subtitle={t('pleaseSelectLocation', 'Please select a location')}
                />
              </section>
            )}
          </Layer>
        </Column>
      </Stack>
      <ButtonSet className={styles.buttonSet}>
        <Button className={styles.button} kind="secondary" onClick={closeWorkspace}>
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
