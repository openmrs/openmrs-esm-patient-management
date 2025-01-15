import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Checkbox,
  Dropdown,
  Form,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
} from '@carbon/react';
import { showSnackbar } from '@openmrs/esm-framework';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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

interface QueueLocation {
  id: string;
  name: string;
}

interface Service {
  uuid: string;
  display: string;
}

const createProviderQueueRoomSchema = (t: Function) =>
  z.object({
    queueLocation: z.object(
      {
        id: z.string(),
        name: z.string().min(1, t('selectQueueLocation', 'Select a queue location')),
      },
      {
        required_error: t('selectQueueLocation', 'Select a queue location'),
      },
    ),
    service: z.object(
      {
        uuid: z.string(),
        display: z.string().min(1, t('selectQueueService', 'Select a queue service')),
      },
      {
        required_error: t('selectQueueService', 'Select a queue service'),
      },
    ),
    queueRoomUuid: z.string().min(1, t('missingQueueRoom', 'Please select a queue room')),
    isPermanent: z.boolean().default(false).or(z.string()),
  });

type ProviderQueueRoomData = z.infer<ReturnType<typeof createProviderQueueRoomSchema>>;

const AddProviderQueueRoom: React.FC<AddProviderQueueRoomProps> = ({ closeModal, providerUuid }) => {
  const { t } = useTranslation();
  const { providerRoom, mutate } = useProvidersQueueRoom(providerUuid);
  const currentIsPermanentProviderQueueRoom = useIsPermanentProviderQueueRoom() ?? false;
  const currentLocationName = useSelectedQueueLocationName();
  const currentLocationUuid = useSelectedQueueLocationUuid();
  const currentService = useSelectedService();

  const { queueLocations } = useQueueLocations();
  const { services } = useQueueServices();

  const defaultValues: ProviderQueueRoomData = {
    queueLocation: {
      id: currentLocationUuid || '',
      name: currentLocationName || '',
    },
    service: {
      uuid: currentService?.serviceUuid || '',
      display: currentService?.serviceDisplay || '',
    },
    queueRoomUuid: providerRoom?.[0]?.queueRoom?.uuid || '',
    isPermanent: currentIsPermanentProviderQueueRoom,
  };

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<ProviderQueueRoomData>({
    mode: 'all',
    resolver: zodResolver(createProviderQueueRoomSchema(t)),
    defaultValues,
  });

  const selectedLocation = watch('queueLocation');
  const selectedService = watch('service');
  const { rooms } = useQueueRooms(selectedLocation.id, selectedService.uuid);

  const handleSaveQueueRoom = async (data: ProviderQueueRoomData) => {
    try {
      if (providerRoom?.length > 0) {
        await updateProviderToQueueRoom(providerRoom[0].uuid, data.queueRoomUuid, providerUuid);
        showSnackbar({
          isLowContrast: true,
          title: t('updateRoom', 'Update room'),
          kind: 'success',
          subtitle: t('queueRoomUpdatedSuccessfully', 'Queue room updated successfully'),
        });
      } else {
        await addProviderToQueueRoom(data.queueRoomUuid, providerUuid);
        showSnackbar({
          isLowContrast: true,
          title: t('addRoom', 'Add room'),
          kind: 'success',
          subtitle: t('queueRoomAddedSuccessfully', 'Queue room added successfully'),
        });
      }

      const timestamp = new Date().toString();
      localStorage.setItem('lastUpdatedQueueRoomTimestamp', timestamp);
      localStorage.setItem('queueLocationUuid', data.queueLocation.id);
      localStorage.setItem('queueLocationName', data.queueLocation.name);
      localStorage.setItem('queueService', data.service.uuid);
      localStorage.setItem('queueServiceName', data.service.display);
      localStorage.setItem('isPermanentProviderQueueRoom', String(data.isPermanent));

      updatedSelectedQueueRoomTimestamp(new Date());
      updateSelectedQueueLocationName(data.queueLocation.name);
      updateSelectedQueueLocationUuid(data.queueLocation.id);
      updateSelectedService(data.service.uuid, data.service.display);
      updateIsPermanentProviderQueueRoom(data.isPermanent);

      mutate();
      closeModal();
    } catch (error) {
      showSnackbar({
        title: t('queueRoomAddFailed', 'Error adding queue room'),
        kind: 'error',
        isLowContrast: false,
        subtitle: error?.message,
      });
    }
  };

  return (
    <div>
      <ModalHeader
        className={styles.modalHeader}
        closeModal={closeModal}
        title={t('addAProviderQueueRoom', 'Add a provider queue room?')}
      />
      <ModalBody>
        <Form onSubmit={handleSubmit(handleSaveQueueRoom)}>
          <section className={styles.section}>
            <Controller
              control={control}
              name="queueLocation"
              render={({ field: { onChange, value } }) => (
                <Dropdown
                  selectedItem={value}
                  onChange={({ selectedItem }) => onChange(selectedItem)}
                  aria-label={t('selectQueueLocation', 'Select a queue location')}
                  id="queueLocation"
                  items={queueLocations ?? []}
                  itemToString={(item) => (item ? item.name : '')}
                  label=""
                  size="md"
                  titleText={t('queueLocation', 'Queue location')}
                  type="default"
                  invalid={!!errors.queueLocation}
                  invalidText={errors.queueLocation?.name?.message}
                />
              )}
            />
          </section>

          <section className={styles.section}>
            <Controller
              control={control}
              name="service"
              render={({ field: { onChange, value } }) => (
                <Dropdown
                  selectedItem={value}
                  onChange={({ selectedItem }) => onChange(selectedItem)}
                  aria-label={t('selectService', 'Select a service')}
                  id="service"
                  items={services ?? []}
                  itemToString={(item) => (item ? item.display : '')}
                  label=""
                  size="md"
                  titleText={t('queueService', 'Queue service')}
                  type="default"
                  invalid={!!errors.service}
                  invalidText={errors.service?.display?.message}
                />
              )}
            />
          </section>

          <section className={styles.section}>
            <Controller
              control={control}
              name="queueRoomUuid"
              render={({ field }) => (
                <Select
                  {...field}
                  id="service"
                  invalidText={errors.queueRoomUuid?.message}
                  invalid={!!errors.queueRoomUuid}
                  labelText={t('selectRoom', 'Select a room')}
                  onChange={(event) => field.onChange(event.target.value)}>
                  <SelectItem text={t('chooseRoom', 'Select a room')} value="" />
                  {rooms.length > 0 &&
                    rooms?.map((room) => (
                      <SelectItem key={room.uuid} text={room.display} value={room.uuid}>
                        {room.display}
                      </SelectItem>
                    ))}
                </Select>
              )}
            />
          </section>

          <section className={styles.section}>
            <Controller
              control={control}
              name="isPermanent"
              render={({ field: { value, onChange } }) => (
                <Checkbox
                  checked={value}
                  className={styles.checkbox}
                  id="retainLocation"
                  labelText={t('retainLocation', 'Retain location')}
                  onChange={(event) => onChange(event.target.checked)}
                />
              )}
            />
          </section>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="primary" type="submit" disabled={isSubmitting}>
          {t('save', 'Save')}
        </Button>
      </ModalFooter>
    </div>
  );
};

export default AddProviderQueueRoom;
