import { createGlobalStore, useStore } from '@openmrs/esm-framework';

export function updateValueInSessionStorage(key: string, value: string) {
  if (value === undefined || value === null) {
    sessionStorage.removeItem(key);
  } else {
    sessionStorage.setItem(key, value);
  }
}

export function getValueFromSessionStorage(key: string): string | null {
  return sessionStorage.getItem(key);
}

export interface ServiceQueuesState {
  selectedQueueLocationName?: string;
  selectedQueueLocationUuid?: string;
  selectedServiceUuid?: string;
  selectedServiceDisplay?: string;
  selectedQueueStatusUuid?: string;
  selectedQueueStatusDisplay: string;
}

const initialServiceQueuesState: ServiceQueuesState = {
  selectedQueueLocationName: getValueFromSessionStorage('queueLocationName'),
  selectedQueueLocationUuid: getValueFromSessionStorage('queueLocationUuid'),
  selectedServiceUuid: getValueFromSessionStorage('queueServiceUuid'),
  selectedServiceDisplay: getValueFromSessionStorage('queueServiceDisplay'),
  selectedQueueStatusUuid: getValueFromSessionStorage('queueStatusUuid'),
  selectedQueueStatusDisplay: getValueFromSessionStorage('queueStatusDisplay'),
};

const serviceQueuesStore = createGlobalStore<ServiceQueuesState>('serviceQueues', initialServiceQueuesState);

export const updateSelectedService = (currentServiceUuid: string, currentServiceDisplay: string) => {
  updateValueInSessionStorage('queueServiceUuid', currentServiceUuid);
  updateValueInSessionStorage('queueServiceDisplay', currentServiceDisplay);
  serviceQueuesStore.setState({
    selectedServiceUuid: currentServiceUuid,
    selectedServiceDisplay: currentServiceDisplay,
  });
};

export const updateSelectedQueueLocationName = (currentLocationName: string) => {
  updateValueInSessionStorage('queueLocationName', currentLocationName);
  serviceQueuesStore.setState({ selectedQueueLocationName: currentLocationName });
};

export const updateSelectedQueueLocationUuid = (currentLocationUuid: string) => {
  updateValueInSessionStorage('queueLocationUuid', currentLocationUuid);
  serviceQueuesStore.setState({ selectedQueueLocationUuid: currentLocationUuid });
};

export const updateSelectedQueueStatus = (currentQueueStatusUuid: string, currentQueueStatusDisplay: string) => {
  updateValueInSessionStorage('queueStatusUuid', currentQueueStatusUuid);
  updateValueInSessionStorage('queueStatusDisplay', currentQueueStatusDisplay);
  serviceQueuesStore.setState({
    selectedQueueStatusUuid: currentQueueStatusUuid,
    selectedQueueStatusDisplay: currentQueueStatusDisplay,
  });
};

export function useServiceQueuesStore() {
  return useStore(serviceQueuesStore);
}
