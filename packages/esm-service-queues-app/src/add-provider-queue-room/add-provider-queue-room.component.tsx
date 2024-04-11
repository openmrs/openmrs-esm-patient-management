import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Checkbox,
  Dropdown,
  Form,
  InlineNotification,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
} from '@carbon/react';
import { showSnackbar } from '@openmrs/esm-framework';
import { useQueueLocations } from '../patient-search/hooks/useQueueLocations';
import {
  addProviderToQueueRoom,
  updateProviderToQueueRoom,
  useProvidersQueueRoom,
  useQueueRooms,
} from './add-provider-queue-room.resource';
import {
  updatedSelectedQueueRoomTimestamp,
  updateIsPermanentProviderQueueRoom,
  updateSelectedQueueLocationName,
  updateSelectedQueueLocationUuid,
  updateSelectedServiceName,
  updateSelectedServiceUuid,
  useIsPermanentProviderQueueRoom,
  useSelectedQueueLocationUuid,
  useSelectedServiceName,
  useSelectedServiceUuid,
} from '../helpers/helpers';
import styles from './add-provider-queue-room.scss';
import { useQueues } from '../helpers/useQueues';

interface AddProviderQueueRoomProps {
  providerUuid: string;
  closeModal: () => void;
}

const AddProviderQueueRoom: React.FC<AddProviderQueueRoomProps> = ({ providerUuid, closeModal }) => {
  const { t } = useTranslation();

  const currentLocationName = useSelectedServiceName();
  const currentLocationUuid = useSelectedQueueLocationUuid();
  const currentServiceUuid = useSelectedServiceUuid();
  const currentServiceName = useSelectedServiceName();
  const currentIsPermanentProviderQueueRoom = useIsPermanentProviderQueueRoom();
  const { providerRoom, isLoading: loading } = useProvidersQueueRoom(providerUuid);
  const [queueRoomUuid, setQueueRoomUuid] = useState('');
  const [queueProviderMapUuid, setQueueProviderMapUuid] = useState('');

  useEffect(() => {
    if (providerRoom?.length > 0) {
      setQueueRoomUuid(providerRoom?.[0].queueRoom?.uuid);
      setQueueProviderMapUuid(providerRoom?.[0].uuid);
    }
  }, [providerRoom]);

  const { mutate } = useProvidersQueueRoom(providerUuid);
  const { queues } = useQueues(currentLocationUuid);
  const { rooms } = useQueueRooms(currentLocationUuid, currentLocationUuid);
  const { queueLocations } = useQueueLocations();
  const [isMissingQueueRoom, setIsMissingQueueRoom] = useState(false);

  const handleServiceChange = ({ selectedItem }) => {
    localStorage.setItem('queueServiceName', selectedItem.name);
    localStorage.setItem('queueServiceUuid', selectedItem.uuid);
    updateSelectedServiceName(selectedItem.name);
    updateSelectedServiceUuid(selectedItem.uuid);
  };

  const handleQueueLocationChange = ({ selectedItem }) => {
    localStorage.setItem('queueLocationUuid', selectedItem.id);
    localStorage.setItem('queueLocationName', selectedItem.name);
    updateSelectedQueueLocationName(selectedItem.name);
    updateSelectedQueueLocationUuid(selectedItem.id);
  };

  const handleRetainLocation = (e) => {
    localStorage.setItem('isPermanentProviderQueueRoom', JSON.parse(e.target.checked));
    updateIsPermanentProviderQueueRoom(JSON.parse(e.target.checked));
  };

  const onSubmit = useCallback(() => {
    if (!queueRoomUuid) {
      setIsMissingQueueRoom(true);
      return;
    }
    setIsMissingQueueRoom(false);

    if (providerRoom?.length > 0) {
      updateProviderToQueueRoom(queueProviderMapUuid, queueRoomUuid, providerUuid).then(
        ({ status }) => {
          if (status === 200) {
            showSnackbar({
              isLowContrast: true,
              title: t('updateRoom', 'Update room'),
              kind: 'success',
              subtitle: t('queueRoomUpdatedSuccessfully', 'Queue room updated successfully'),
            });
            closeModal();
            localStorage.setItem('lastUpdatedQueueRoomTimestamp', new Date().toString());
            updatedSelectedQueueRoomTimestamp(new Date());
            mutate();
          }
        },
        (error) => {
          showSnackbar({
            title: t('queueRoomAddFailed', 'Error adding queue room'),
            kind: 'error',
            isLowContrast: false,
            subtitle: error?.message,
          });
          closeModal();
        },
      );
    } else {
      addProviderToQueueRoom(queueRoomUuid, providerUuid).then(
        ({ status }) => {
          if (status === 201) {
            showSnackbar({
              isLowContrast: true,
              title: t('addRoom', 'Add room'),
              kind: 'success',
              subtitle: t('queueRoomAddedSuccessfully', 'Queue room added successfully'),
            });
            closeModal();
            localStorage.setItem('lastUpdatedQueueRoomTimestamp', new Date().toString());
            updatedSelectedQueueRoomTimestamp(new Date());
            mutate();
          }
        },
        (error) => {
          showSnackbar({
            title: t('queueRoomAddFailed', 'Error adding queue room'),
            kind: 'error',
            isLowContrast: false,
            subtitle: error?.message,
          });
        },
      );
    }
  }, [queueRoomUuid, providerRoom?.length, queueProviderMapUuid, providerUuid, t, closeModal, mutate]);

  return (
    <div>
      <ModalHeader closeModal={closeModal} title={t('addProviderQueueRoom', 'Add provider queue room?')} />
      <ModalBody>
        <Form onSubmit={onSubmit}>
          <section className={styles.section}>
            <div className={styles.sectionTitle}>{t('queueLocation', 'Queue location')}</div>
            <Dropdown
              id="queueLocation"
              aria-label={t('selectQueueLocation', 'Select a queue location')}
              label=""
              type="default"
              items={queueLocations}
              itemToString={(item) => (item ? item.name : '')}
              onChange={handleQueueLocationChange}
              size="md"
              initialSelectedItem={{ uuid: currentLocationUuid, name: currentLocationName }}
            />
          </section>

          <section className={styles.section}>
            <div className={styles.sectionTitle}>{t('queueService', 'Queue service')}</div>
            <Dropdown
              id="service"
              aria-label={t('selectService', 'Select a service')}
              type="default"
              label=""
              items={queues}
              itemToString={(item) => (item ? item.display : '')}
              onChange={handleServiceChange}
              size="md"
              initialSelectedItem={{ uuid: currentServiceUuid, display: currentServiceName }}
            />
          </section>

          <section className={styles.section}>
            <div className={styles.sectionTitle}>{t('queueRoom', 'Queue room')}</div>
            <div className={styles.filterContainer}>
              <Select
                labelText={t('selectRoom', 'Select a room')}
                id="service"
                invalidText="Required"
                value={queueRoomUuid}
                defaultValue={queueRoomUuid}
                onChange={(event) => {
                  setQueueRoomUuid(event.target.value);
                  localStorage.setItem('lastUpdatedQueueRoomTimestamp', new Date().toString());
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

          <section className={styles.section}>
            <Checkbox
              onChange={handleRetainLocation}
              checked={currentIsPermanentProviderQueueRoom}
              labelText={t('retainLocation', 'Retain location')}
              id="retianLocation"
              className={styles.checkbox}
            />
          </section>
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
