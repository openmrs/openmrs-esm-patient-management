import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import uniqBy from 'lodash-es/uniqBy';
import {
  Button,
  Dropdown,
  DropdownSkeleton,
  InlineNotification,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Stack,
} from '@carbon/react';
import { getLocale } from '@openmrs/esm-framework';
import { useQueueLocations } from '../../create-queue-entry/hooks/useQueueLocations';
import { useQueues } from '../../hooks/useQueues';
import {
  updateSelectedQueueLocationName,
  updateSelectedQueueLocationUuid,
  updateSelectedService,
  useServiceQueuesStore,
} from '../../store/store';

interface ChangeQueueLocationModalProps {
  closeModal: () => void;
}

const ALL = 'all';

interface LocationItem {
  id: string;
  name: string;
}

interface ServiceItem {
  uuid: string;
  display: string;
}

const ChangeQueueLocationModal: React.FC<ChangeQueueLocationModalProps> = ({ closeModal }) => {
  const { t } = useTranslation();
  const { queueLocations, isLoading, error } = useQueueLocations();
  const { selectedQueueLocationUuid, selectedServiceUuid } = useServiceQueuesStore();

  const [locationUuid, setLocationUuid] = useState(selectedQueueLocationUuid ?? ALL);
  const [serviceUuid, setServiceUuid] = useState(selectedServiceUuid ?? ALL);

  const { queues, isLoading: isLoadingQueues } = useQueues(locationUuid === ALL ? undefined : locationUuid);
  const services = useMemo(
    () =>
      uniqBy(
        queues.flatMap((queue) => queue.service),
        (service) => service?.uuid,
      ).sort((a, b) => a.display.localeCompare(b.display, getLocale())),
    [queues],
  );

  const allLocation: LocationItem = { id: ALL, name: t('all', 'All') };
  const locationItems: LocationItem[] = [
    allLocation,
    ...queueLocations.map((location) => ({ id: location.id ?? '', name: location.name ?? '' })),
  ];
  const allService: ServiceItem = { uuid: ALL, display: t('all', 'All') };
  const serviceItems: ServiceItem[] = [
    allService,
    ...services.map((service) => ({ uuid: service.uuid ?? '', display: service.display ?? '' })),
  ];

  const handleLocationChange = ({ selectedItem }: { selectedItem: LocationItem }) => {
    setLocationUuid(selectedItem.id);
    setServiceUuid(ALL);
  };

  const handleSubmit = () => {
    if (locationUuid === ALL) {
      updateSelectedQueueLocationUuid(null);
      updateSelectedQueueLocationName(null);
    } else {
      const location = queueLocations.find(({ id }) => id === locationUuid);
      updateSelectedQueueLocationUuid(location?.id);
      updateSelectedQueueLocationName(location?.name);
    }

    if (serviceUuid === ALL) {
      updateSelectedService(null, t('all', 'All'));
    } else {
      const service = services.find(({ uuid }) => uuid === serviceUuid);
      updateSelectedService(service?.uuid, service?.display);
    }
    closeModal();
  };

  return (
    <>
      <ModalHeader closeModal={closeModal} title={t('changeQueueLocation', 'Change queue location')} />
      <ModalBody>
        {isLoading ? (
          <DropdownSkeleton />
        ) : error ? (
          <InlineNotification
            hideCloseButton
            kind="error"
            lowContrast
            title={t('failedToLoadLocations', 'Failed to load locations')}
            subtitle={error?.message}
          />
        ) : (
          <Stack gap={5}>
            <Dropdown
              id="changeQueueLocationDropdown"
              titleText={t('location', 'Location')}
              label={t('selectQueueLocation', 'Select a queue location')}
              items={locationItems}
              itemToString={(item: LocationItem | null) => item?.name ?? ''}
              selectedItem={locationItems.find(({ id }) => id === locationUuid) ?? allLocation}
              onChange={handleLocationChange}
            />
            <Dropdown
              id="changeQueueServiceDropdown"
              titleText={t('service', 'Service')}
              label={t('selectService', 'Select a service')}
              items={serviceItems}
              itemToString={(item: ServiceItem | null) => item?.display ?? ''}
              selectedItem={serviceItems.find(({ uuid }) => uuid === serviceUuid) ?? allService}
              onChange={({ selectedItem }: { selectedItem: ServiceItem }) => setServiceUuid(selectedItem?.uuid ?? ALL)}
              disabled={isLoadingQueues}
            />
          </Stack>
        )}
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="primary" disabled={isLoading || !!error} onClick={handleSubmit}>
          {t('change', 'Change')}
        </Button>
      </ModalFooter>
    </>
  );
};

export default ChangeQueueLocationModal;
