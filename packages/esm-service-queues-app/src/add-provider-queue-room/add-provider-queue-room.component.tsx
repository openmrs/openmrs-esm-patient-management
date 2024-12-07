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
import { useQueueLocations } from '../create-queue-entry/hooks/useQueueLocations';
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
  updateSelectedService,
  useIsPermanentProviderQueueRoom,
  useSelectedQueueLocationName,
  useSelectedQueueLocationUuid,
  useSelectedService,
} from '../helpers/helpers';
import useQueueServices from '../hooks/useQueueService';
import styles from './add-provider-queue-room.scss';

interface AddProviderQueueRoomProps {
  closeModal: () => void;
  providerUuid: string;
}

const AddProviderQueueRoom: React.FC<AddProviderQueueRoomProps> = ({ closeModal, providerUuid }) => {
  const { t } = useTranslation();
  const { providerRoom } = useProvidersQueueRoom(providerUuid);
  const currentIsPermanentProviderQueueRoom = useIsPermanentProviderQueueRoom() ?? false;
  const currentLocationName = useSelectedQueueLocationName();
  const currentLocationUuid = useSelectedQueueLocationUuid();
  const currentService = useSelectedService();

  const [isMissingQueueRoom, setIsMissingQueueRoom] = useState(false);
  const [queueProviderMapUuid, setQueueProviderMapUuid] = useState('');
  const [queueRoomUuid, setQueueRoomUuid] = useState('');

  useEffect(() => {
    if (providerRoom?.length > 0) {
      setQueueRoomUuid(providerRoom?.[0].queueRoom?.uuid);
      setQueueProviderMapUuid(providerRoom?.[0].uuid);
    }
  }, [providerRoom]);

  const { mutate } = useProvidersQueueRoom(providerUuid);
  const { queueLocations } = useQueueLocations();
  const { rooms } = useQueueRooms(currentLocationUuid, currentService?.serviceUuid);
  const { services } = useQueueServices();

  const handleServiceChange = ({ selectedItem }) => {
    localStorage.setItem('queueServiceName', selectedItem.name);
    localStorage.setItem('queueService', selectedItem.uuid);
    updateSelectedService(selectedItem.uuid, selectedItem.name);
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
        () => {
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
        () => {
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
      <ModalHeader closeModal={closeModal} title={t('addAProviderQueueRoom', 'Add a provider queue room?')} />
      <ModalBody>
        <Form onSubmit={onSubmit}>
          <section className={styles.section}>
            <Dropdown
              aria-label={t('selectQueueLocation', 'Select a queue location')}
              id="queueLocation"
              initialSelectedItem={{ uuid: currentLocationUuid, name: currentLocationName }}
              items={queueLocations}
              itemToString={(item) => (item ? item.name : '')}
              label=""
              onChange={handleQueueLocationChange}
              size="md"
              titleText={t('queueLocation', 'Queue location')}
              type="default"
            />
          </section>

          <section className={styles.section}>
            <Dropdown
              aria-label={t('selectService', 'Select a service')}
              id="service"
              initialSelectedItem={{ uuid: currentService?.serviceUuid, display: currentService?.serviceDisplay }}
              items={services ?? []}
              itemToString={(item) => (item ? item.display : '')}
              label=""
              onChange={handleServiceChange}
              size="md"
              titleText={t('queueService', 'Queue service')}
              type="default"
            />
          </section>

          <section className={styles.section}>
            <div className={styles.sectionTitle}>{t('queueRoom', 'Queue room')}</div>
            <div className={styles.filterContainer}>
              <Select
                id="service"
                invalidText="Required"
                labelText={t('selectRoom', 'Select a room')}
                onChange={(event) => {
                  setQueueRoomUuid(event.target.value);
                  localStorage.setItem('lastUpdatedQueueRoomTimestamp', new Date().toString());
                }}
                value={queueRoomUuid}>
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
              checked={currentIsPermanentProviderQueueRoom}
              className={styles.checkbox}
              id="retainLocation"
              labelText={t('retainLocation', 'Retain location')}
              onChange={handleRetainLocation}
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
