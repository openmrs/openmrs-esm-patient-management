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
  TextArea,
  ButtonSet,
  Button,
  InlineNotification,
} from '@carbon/react';
import { showNotification, showToast, useLayoutType } from '@openmrs/esm-framework';
import styles from './queue-room.scss';
import { SearchTypes } from '../types';
import { mutate } from 'swr';
import { useQueueLocations } from '../patient-search/hooks/useQueueLocations';
import { useServices } from '../active-visits/active-visits-table.resource';
import { saveQueueRoom } from './queue-room.resource';

interface QueueRoomFormProps {
  toggleSearchType: (searchMode: SearchTypes) => void;
  closePanel: () => void;
}

const QueueRoomForm: React.FC<QueueRoomFormProps> = ({ toggleSearchType, closePanel }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const [queueRoomName, setQueueRoomName] = useState('');
  const [queueRoomService, setQueueRoomService] = useState('');
  const [queueRoomDescription, setQueueRoomDescription] = useState('');
  const [isMissingRoomName, setMissingRoomName] = useState(false);
  const [isMissingRoomDescription, setMissingRoomDescription] = useState(false);
  const [isMissingQueueRoomService, setMissingQueueRoomService] = useState(false);
  const [selectedQueueLocation, setSelectedQueueLocation] = useState('');
  const { services } = useServices(selectedQueueLocation);
  const { queueLocations } = useQueueLocations();

  const createQueueRoom = useCallback(
    (event) => {
      event.preventDefault();

      if (!queueRoomName) {
        setMissingRoomName(true);
        return;
      }
      if (!queueRoomDescription) {
        setMissingRoomDescription(true);
        return;
      }
      if (!queueRoomService) {
        setMissingQueueRoomService(true);
        return;
      }

      setMissingRoomName(false);
      setMissingRoomDescription(false);
      setMissingQueueRoomService(false);

      saveQueueRoom(queueRoomName, queueRoomDescription, queueRoomService, new AbortController()).then(
        ({ status }) => {
          if (status === 201) {
            showToast({
              title: t('addQueueRoom', 'Add queue room'),
              kind: 'success',
              description: t('queueRoomAddedSuccessfully', 'Queue room addeded successfully'),
            });
            closePanel();
            mutate(`/ws/rest/v1/queueroom`);
          }
        },
        (error) => {
          showNotification({
            title: t('errorAddingQueueRoom', 'Error adding queue room'),
            kind: 'error',
            critical: true,
            description: error?.message,
          });
        },
      );
    },
    [queueRoomName, queueRoomDescription, queueRoomService, t, closePanel],
  );

  return (
    <Form onSubmit={createQueueRoom} className={styles.form}>
      <Stack gap={4} className={styles.grid}>
        <Column>
          <h3 className={styles.heading}>{t('addNewQueueRoom', 'Add new queue room')}</h3>
          <Layer className={styles.input}>
            <TextInput
              id="queueRoomName"
              invalidText="Required"
              labelText={t('queueRoomName', 'Queue room name')}
              onChange={(event) => setQueueRoomName(event.target.value)}
              value={queueRoomName}
            />
            {isMissingRoomName && (
              <section>
                <InlineNotification
                  style={{ margin: '0', minWidth: '100%' }}
                  kind="error"
                  lowContrast={true}
                  title={t('missingQueueRoomName', 'Missing queue room name')}
                  subtitle={t('addQueueRoomName', 'Please add a queue room name')}
                />
              </section>
            )}
          </Layer>
          <Layer className={styles.input}>
            <TextArea
              rows={3}
              id="queueRoomDescription"
              invalidText="Required"
              labelText={t('queueRoomDescription', 'Queue room description')}
              onChange={(event) => setQueueRoomDescription(event.target.value)}
              value={queueRoomDescription}
            />
          </Layer>
          {isMissingRoomDescription && (
            <section>
              <InlineNotification
                style={{ margin: '0', minWidth: '100%' }}
                kind="error"
                lowContrast={true}
                title={t('missingQueueRoomDescription', 'Missing queue room description')}
                subtitle={t('addQueueRoomDescription', 'Please add a queue room description')}
              />
            </section>
          )}

          <section className={styles.section}>
            <Select
              labelText={t('selectQueueLocation', 'Select a queue location')}
              id="location"
              invalidText="Required"
              value={selectedQueueLocation}
              onChange={(event) => {
                setSelectedQueueLocation(event.target.value);
              }}>
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
          </section>

          <section className={styles.section}>
            <Select
              labelText={t('selectService', 'Select a service')}
              id="service"
              invalidText="Required"
              value={queueRoomService}
              onChange={(event) => setQueueRoomService(event.target.value)}>
              {!queueRoomService ? <SelectItem text={t('selectService', 'Select a service')} value="" /> : null}
              {services?.length > 0 &&
                services.map((service) => (
                  <SelectItem key={service.uuid} text={service.display} value={service.uuid}>
                    {service.display}
                  </SelectItem>
                ))}
            </Select>
          </section>
          {isMissingQueueRoomService && (
            <section>
              <InlineNotification
                style={{ margin: '0', minWidth: '100%' }}
                kind="error"
                lowContrast={true}
                title={t('missingQueueRoomService', 'Missing queue room service')}
                subtitle={t('addQueueRoomService', 'Please add a queue room service')}
              />
            </section>
          )}
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

export default QueueRoomForm;
