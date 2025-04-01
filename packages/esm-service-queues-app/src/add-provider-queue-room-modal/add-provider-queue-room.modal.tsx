import React, { useCallback } from 'react';
import { type TFunction, useTranslation } from 'react-i18next';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Button,
  Checkbox,
  Dropdown,
  Form,
  InlineLoading,
  InlineNotification,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Stack,
} from '@carbon/react';
import { getCoreTranslation, showSnackbar } from '@openmrs/esm-framework';
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

interface AddProviderQueueRoomModalProps {
  closeModal: () => void;
  providerUuid: string;
}

const createProviderQueueRoomSchema = (t: TFunction) =>
  z.object({
    queueLocationUuid: z
      .string({
        required_error: t('queueLocationIsRequired', 'Queue location is required'),
      })
      .trim()
      .min(1, t('queueLocationIsRequired', 'Queue location is required')),
    queueProviderMapUuid: z.string(),
    queueRoomUuid: z
      .string({
        required_error: t('queueRoomIsRequired', 'Queue room is required'),
      })
      .trim()
      .min(1, t('queueRoomIsRequired', 'Queue room is required')),
    currentIsPermanentProviderQueueRoom: z.boolean().or(z.string()),
  });

type ProviderQueueRoomData = z.infer<ReturnType<typeof createProviderQueueRoomSchema>>;

const AddProviderQueueRoomModal: React.FC<AddProviderQueueRoomModalProps> = ({ closeModal, providerUuid }) => {
  const { t } = useTranslation();
  const { providerRoom, mutate } = useProvidersQueueRoom(providerUuid);
  const isPermanentProviderQueueRoom = useIsPermanentProviderQueueRoom() ?? false;
  const currentLocationName = useSelectedQueueLocationName();
  const currentLocationUuid = useSelectedQueueLocationUuid();
  const currentService = useSelectedService();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<ProviderQueueRoomData>({
    mode: 'all',
    resolver: zodResolver(createProviderQueueRoomSchema(t)),
    defaultValues: {
      queueLocationUuid: currentLocationUuid ?? '',
      queueProviderMapUuid: providerRoom?.[0]?.uuid ?? '',
      queueRoomUuid: providerRoom?.[0]?.queueRoom?.uuid ?? '',
      currentIsPermanentProviderQueueRoom: isPermanentProviderQueueRoom ?? false,
    },
  });

  const { queueLocations } = useQueueLocations();
  const { rooms, error: errorFetchingQueueRooms } = useQueueRooms(currentLocationUuid, currentService?.serviceUuid);
  const { services } = useQueueServices();

  const handleServiceChange = useCallback(({ selectedItem }) => {
    if (!selectedItem) {
      return;
    }

    localStorage.setItem('queueServiceName', selectedItem.name);
    localStorage.setItem('queueService', selectedItem.uuid);
    updateSelectedService(selectedItem.uuid, selectedItem.name);
  }, []);

  const handleQueueLocationChange = useCallback(
    ({ selectedItem }) => {
      if (!selectedItem) {
        return;
      }

      localStorage.setItem('queueLocationUuid', selectedItem.id);
      localStorage.setItem('queueLocationName', selectedItem.name);
      updateSelectedQueueLocationName(selectedItem.name);
      updateSelectedQueueLocationUuid(selectedItem.id);
      setValue('queueLocationUuid', selectedItem.id);
    },
    [setValue],
  );

  const handleRetainLocation = useCallback((isChecked: boolean) => {
    localStorage.setItem('isPermanentProviderQueueRoom', String(isChecked));
    updateIsPermanentProviderQueueRoom(isChecked);
  }, []);

  const onSubmit = useCallback(
    async (data: ProviderQueueRoomData) => {
      try {
        if (providerRoom?.length) {
          await updateProviderToQueueRoom(data.queueProviderMapUuid, data.queueRoomUuid, providerUuid);
          showSnackbar({
            isLowContrast: true,
            title: t('queueRoomUpdated', 'Queue room updated'),
            kind: 'success',
            subtitle: t('queueRoomUpdatedSuccessfully', 'Queue room updated successfully'),
          });
        } else {
          await addProviderToQueueRoom(data.queueRoomUuid, providerUuid);
          showSnackbar({
            isLowContrast: true,
            title: t('queueRoomAdded', 'Queue room added'),
            kind: 'success',
            subtitle: t('queueRoomAddedSuccessfully', 'Queue room added successfully'),
          });
        }

        const timestamp = new Date().toString();
        localStorage.setItem('lastUpdatedQueueRoomTimestamp', timestamp);
        updatedSelectedQueueRoomTimestamp(new Date());
        await mutate();
        closeModal();
      } catch (error) {
        showSnackbar({
          title: t('queueRoomAddFailed', 'Error adding queue room'),
          kind: 'error',
          isLowContrast: false,
          subtitle: error?.message,
        });
      }
    },
    [closeModal, mutate, providerUuid, providerRoom, t],
  );

  return (
    <div>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader closeModal={closeModal} title={t('addAProviderQueueRoom', 'Add provider queue room')} />
        <ModalBody>
          <Stack gap={4}>
            <section>
              <Controller
                control={control}
                name="queueLocationUuid"
                render={({ field }) => (
                  <Dropdown
                    {...field}
                    aria-label={t('queueLocation', 'Queue location')}
                    id="queueLocation"
                    initialSelectedItem={queueLocations?.find((location) => location.id === currentLocationUuid)}
                    invalid={!!errors.queueLocationUuid}
                    invalidText={errors.queueLocationUuid?.message}
                    items={queueLocations ?? []}
                    itemToString={(item) => item?.name ?? ''}
                    label={t('queueLocation', 'Queue location')}
                    onChange={(e) => {
                      if (!e.selectedItem) {
                        return;
                      }
                      field.onChange(e.selectedItem?.id);
                      handleQueueLocationChange(e);
                    }}
                    titleText={t('queueLocation', 'Queue location')}
                  />
                )}
              />
            </section>

            <section>
              <Controller
                control={control}
                name="queueProviderMapUuid"
                render={({ field }) => (
                  <Dropdown
                    {...field}
                    aria-label={t('queueService', 'Queue service')}
                    id="queueService"
                    initialSelectedItem={{
                      display: currentService?.serviceDisplay,
                      uuid: currentService?.serviceUuid,
                    }}
                    itemToString={(item) => item?.display ?? ''}
                    items={services ?? []}
                    label={t('queueService', 'Queue service')}
                    onChange={({ selectedItem }) => {
                      const value = selectedItem?.uuid ?? '';
                      field.onChange(value);
                      handleServiceChange({ selectedItem });
                    }}
                    titleText={t('queueService', 'Queue service')}
                  />
                )}
              />
            </section>

            <section>
              <Controller
                control={control}
                name="queueRoomUuid"
                render={({ field }) => (
                  <Select
                    {...field}
                    disabled={errorFetchingQueueRooms}
                    id="queueRoom"
                    invalid={!!errors.queueRoomUuid}
                    invalidText={errors.queueRoomUuid?.message}
                    labelText={t('queueRoom', 'Queue room')}
                    onChange={(event) => field.onChange(event.target.value)}>
                    <SelectItem text={t('selectQueueRoom', 'Select a queue room')} value="" />
                    {rooms?.map((room) => <SelectItem key={room.uuid} text={room.display} value={room.uuid} />)}
                  </Select>
                )}
              />
              {errorFetchingQueueRooms && (
                <InlineNotification
                  className={styles.errorNotification}
                  kind="error"
                  onClick={() => {}}
                  subtitle={errorFetchingQueueRooms}
                  title={t('errorFetchingQueueRooms', 'Error fetching queue rooms')}
                />
              )}
            </section>

            <section>
              <Controller
                control={control}
                name="currentIsPermanentProviderQueueRoom"
                render={({ field }) => (
                  <Checkbox
                    checked={Boolean(field.value)}
                    className={styles.checkbox}
                    id="permanentLocation"
                    labelText={t('retainLocation', 'Retain location')}
                    onChange={(_, { checked }) => {
                      field.onChange(checked);
                      handleRetainLocation(checked);
                    }}
                  />
                )}
              />
            </section>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button kind="secondary" onClick={closeModal}>
            {getCoreTranslation('cancel', 'Cancel')}
          </Button>
          <Button disabled={isSubmitting} kind="primary" type="submit">
            {isSubmitting ? (
              <InlineLoading description={t('saving', 'Saving') + '...'} />
            ) : (
              <span>{getCoreTranslation('save', 'Save')}</span>
            )}
          </Button>
        </ModalFooter>
      </Form>
    </div>
  );
};

export default AddProviderQueueRoomModal;
