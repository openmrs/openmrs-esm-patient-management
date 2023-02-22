import React, { useCallback, useState } from 'react';
import {
  Button,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Form,
  Select,
  SelectItem,
  InlineNotification,
} from '@carbon/react';
import { showNotification, showToast } from '@openmrs/esm-framework';
import { useServices } from '../active-visits/active-visits-table.resource';
import { useTranslation } from 'react-i18next';
import styles from './add-provider-queue-room.scss';
import { useSWRConfig } from 'swr';
import { useQueueLocations } from '../patient-search/hooks/useQueueLocations';
import { addProviderToQueueRoom, useQueueRooms } from './add-provider-queue-room.resource';
import { updatedSelectedQueueRoomTimestamp } from '../helpers/helpers';

interface AddProviderQueueRoomProps {
  providerUuid: string;
  closeModal: () => void;
}

const AddProviderQueueRoom: React.FC<AddProviderQueueRoomProps> = ({ providerUuid, closeModal }) => {
  const { t } = useTranslation();

  const [queueUuid, setQueueUuid] = useState('');
  const [queueRoomUuid, setQueueRoomUuid] = useState('');
  const { mutate } = useSWRConfig();
  const [selectedQueueLocation, setSelectedQueueLocation] = useState('');
  const { services } = useServices(selectedQueueLocation);
  const { rooms } = useQueueRooms(selectedQueueLocation, queueUuid);
  const { queueLocations } = useQueueLocations();
  const [isMissingQueueRoom, setIsMissingQueueRoom] = useState(false);
  const [isMissingService, setIsMissingService] = useState(false);

  const onSubmit = useCallback(() => {
    if (!queueUuid) {
      setIsMissingService(true);
      return;
    }
    setIsMissingService(false);

    if (!queueRoomUuid) {
      setIsMissingQueueRoom(true);
      return;
    }
    setIsMissingQueueRoom(false);

    addProviderToQueueRoom(queueRoomUuid, providerUuid, new AbortController()).then(
      ({ status }) => {
        if (status === 201) {
          showToast({
            critical: true,
            title: t('addEntry', 'Add entry'),
            kind: 'success',
            description: t('queueEntryAddedSuccessfully', 'Queue Entry Added Successfully'),
          });
          closeModal();
          mutate(`/ws/rest/v1/visit-queue-entry?v=full`);
          mutate(`/ws/rest/v1/visit?includeInactive=false`);
          mutate(`/ws/rest/v1/visit-queue-entry?location=${selectedQueueLocation}&v=full`);
        }
      },
      (error) => {
        showNotification({
          title: t('queueEntryAddFailed', 'Error adding queue entry status'),
          kind: 'error',
          critical: true,
          description: error?.message,
        });
      },
    );
  }, [queueUuid, providerUuid, queueRoomUuid, t, closeModal, mutate]);

  return (
    <div>
      <ModalHeader closeModal={closeModal} title={t('addProviderQueueRoom', 'Add provider queue room?')} />
      <ModalBody>
        <Form onSubmit={onSubmit}>
          <section className={styles.section}>
            <Select
              labelText={t('selectQueueLocation', 'Select a queue location')}
              id="location"
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
          </section>

          <section className={styles.section}>
            <div className={styles.sectionTitle}>{t('queueService', 'Queue service')}</div>
            <Select
              labelText={t('selectService', 'Select a service')}
              id="service"
              invalidText="Required"
              value={queueUuid}
              onChange={(event) => setQueueUuid(event.target.value)}>
              {!queueUuid ? <SelectItem text={t('chooseService', 'Select a service')} value="" /> : null}
              {services?.length > 0 &&
                services.map((service) => (
                  <SelectItem key={service.uuid} text={service.display} value={service.uuid}>
                    {service.display}
                  </SelectItem>
                ))}
            </Select>
          </section>
          {isMissingService && (
            <section>
              <InlineNotification
                style={{ margin: '0', minWidth: '100%' }}
                kind="error"
                lowContrast={true}
                title={t('missingService', 'Please select a service')}
              />
            </section>
          )}

          <section className={styles.section}>
            <div className={styles.sectionTitle}>{t('queueRoom', 'Queue room')}</div>
            <div className={styles.filterContainer}>
              <Select
                labelText={t('selectRoom', 'Select a room')}
                id="service"
                invalidText="Required"
                value={queueRoomUuid}
                onChange={(event) => {
                  setQueueRoomUuid(event.target.value);
                  updatedSelectedQueueRoomTimestamp(new Date());
                }}>
                {!queueRoomUuid ? <SelectItem text={t('chooseRoom', 'Select a room')} value="" /> : null}
                {rooms?.length > 0 &&
                  rooms.map((room) => (
                    <SelectItem key={room.uuid} text={room.display} value={room.uuid}>
                      {room.display}
                    </SelectItem>
                  ))}
              </Select>
            </div>
          </section>
          {isMissingQueueRoom && (
            <section>
              <InlineNotification
                style={{ margin: '0', minWidth: '100%' }}
                kind="error"
                lowContrast={true}
                title={t('missingQueueRoom', 'Please select a queue room')}
              />
            </section>
          )}
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button onClick={onSubmit}>{t('save', 'Save')}</Button>
      </ModalFooter>
    </div>
  );
};

export default AddProviderQueueRoom;
