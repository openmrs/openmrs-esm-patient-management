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
import { restBaseUrl, showSnackbar, useLayoutType } from '@openmrs/esm-framework';
import { mutate } from 'swr';
import { useQueueLocations } from '../patient-search/hooks/useQueueLocations';
import { saveQueueRoom } from './queue-room.resource';
import styles from './queue-room-form.scss';
import { useQueues } from '../helpers/useQueues';

interface QueueRoomFormProps {
  closePanel: () => void;
}

const QueueRoomForm: React.FC<QueueRoomFormProps> = ({ closePanel }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const [queueRoomName, setQueueRoomName] = useState('');
  const [queueRoomService, setQueueRoomService] = useState('');
  const [isMissingRoomName, setMissingRoomName] = useState(false);
  const [isMissingQueueRoomService, setMissingQueueRoomService] = useState(false);
  const [selectedQueueLocation, setSelectedQueueLocation] = useState('');
  const { queues } = useQueues(selectedQueueLocation);
  const { queueLocations } = useQueueLocations();

  const createQueueRoom = useCallback(
    (event) => {
      event.preventDefault();

      if (!queueRoomName) {
        setMissingRoomName(true);
        return;
      }
      if (!queueRoomService) {
        setMissingQueueRoomService(true);
        return;
      }

      setMissingRoomName(false);
      setMissingQueueRoomService(false);

      saveQueueRoom(queueRoomName, queueRoomName, queueRoomService).then(
        ({ status }) => {
          if (status === 201) {
            showSnackbar({
              title: t('addQueueRoom', 'Add queue room'),
              kind: 'success',
              subtitle: t('queueRoomAddedSuccessfully', 'Queue room added successfully'),
            });
            closePanel();
            mutate(`${restBaseUrl}/queueroom`);
          }
        },
        (error) => {
          showSnackbar({
            title: t('errorAddingQueueRoom', 'Error adding queue room'),
            kind: 'error',
            isLowContrast: false,
            subtitle: error?.message,
          });
        },
      );
    },
    [queueRoomName, queueRoomService, t, closePanel],
  );

  return (
    <Form onSubmit={createQueueRoom} className={styles.form}>
      <Stack gap={4} className={styles.grid}>
        <Column>
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
        </Column>

        <Column>
          <Layer className={styles.input}>
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
          </Layer>
        </Column>

        <Column>
          <Layer className={styles.input}>
            <section className={styles.section}>
              <Select
                labelText={t('selectService', 'Select a service')}
                id="service"
                invalidText="Required"
                value={queueRoomService}
                onChange={(event) => setQueueRoomService(event.target.value)}>
                {!queueRoomService ? <SelectItem text={t('selectService', 'Select a service')} value="" /> : null}
                {queues?.length > 0 &&
                  queues.map((service) => (
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

export default QueueRoomForm;
