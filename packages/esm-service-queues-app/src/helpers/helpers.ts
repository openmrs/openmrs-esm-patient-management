import { getGlobalStore, useStore } from '@openmrs/esm-framework';
import type { AppointmentSummary } from '../types';

export const getServiceCountByAppointmentType = (
  appointmentSummary: Array<AppointmentSummary>,
  appointmentType: string,
) => {
  return appointmentSummary
    .map((appointment) =>
      Object.entries(appointment.appointmentCountMap).flatMap((appointment) => appointment[1][appointmentType]),
    )
    .flat(1)
    .reduce((count, val) => count + val, 0);
};

/**
 * This function is mainly useful for not writing null/ undefined in the session storage
 */
export function updateValueInSessionStorage(key: string, value: string) {
  if (value === undefined || value === null) {
    sessionStorage.removeItem(key);
  } else {
    sessionStorage.setItem(key, value);
  }
}

/**
 * This function fetches the value for the passed key from session storage
 */
export function getValueFromSessionStorage(key: string): string | null {
  return sessionStorage.getItem(key);
}

const initialQueueLocationNameState = {
  queueLocationName: getValueFromSessionStorage('queueLocationName'),
};
const initialQueueLocationUuidState = {
  queueLocationUuid: getValueFromSessionStorage('queueLocationUuid'),
};
const initialServiceUuidState = {
  serviceUuid: getValueFromSessionStorage('queueServiceUuid'),
  serviceDisplay: getValueFromSessionStorage('queueServiceDisplay'),
};
const intialAppointmentStatusNameState = { status: '' };
const initialQueueStatusState = {
  statusUuid: getValueFromSessionStorage('queueStatusUuid'),
  statusDisplay: getValueFromSessionStorage('queueStatusDisplay'),
};
const initialSelectedQueueRoomTimestamp = { providerQueueRoomTimestamp: new Date() };
const initialPermanentProviderQueueRoomState = {
  isPermanentProviderQueueRoom: getValueFromSessionStorage('isPermanentProviderQueueRoom'),
};

export function getSelectedService() {
  return getGlobalStore<{ serviceUuid: string; serviceDisplay: string }>(
    'queueSelectedServiceUuid',
    initialServiceUuidState,
  );
}

export function getSelectedAppointmentStatus() {
  return getGlobalStore<{ status: string }>('appointmentSelectedStatus', intialAppointmentStatusNameState);
}

export function getSelectedQueueLocationName() {
  return getGlobalStore<{ queueLocationName: string }>('queueLocationNameSelected', initialQueueLocationNameState);
}

export function getSelectedQueueLocationUuid() {
  return getGlobalStore<{ queueLocationUuid: string }>('queueLocationUuidSelected', initialQueueLocationUuidState);
}

export function getSelectedQueueStatus() {
  return getGlobalStore<{ statusUuid: string; statusDisplay: string }>(
    'queueStatusUuidSelected',
    initialQueueStatusState,
  );
}

export function getSelectedQueueRoomTimestamp() {
  return getGlobalStore<{ providerQueueRoomTimestamp: Date }>(
    'queueProviderRoomTimestamp',
    initialSelectedQueueRoomTimestamp,
  );
}

export function getIsPermanentProviderQueueRoom() {
  return getGlobalStore<{ isPermanentProviderQueueRoom: string }>(
    'isPermanentProviderQueueRoom',
    initialPermanentProviderQueueRoomState,
  );
}

export const updateSelectedService = (currentServiceUuid: string, currentServiceDisplay: string) => {
  const store = getSelectedService();
  updateValueInSessionStorage('queueServiceDisplay', currentServiceDisplay);
  updateValueInSessionStorage('queueServiceUuid', currentServiceUuid);
  store.setState({ serviceUuid: currentServiceUuid, serviceDisplay: currentServiceDisplay });
};

export const updateSelectedAppointmentStatus = (currentAppointmentStatus: string) => {
  const store = getSelectedAppointmentStatus();
  store.setState({ status: currentAppointmentStatus });
};

export const updateSelectedQueueLocationName = (currentLocationName: string) => {
  const store = getSelectedQueueLocationName();
  updateValueInSessionStorage('queueLocationName', currentLocationName);
  store.setState({ queueLocationName: currentLocationName });
};

export const updateSelectedQueueLocationUuid = (currentLocationUuid: string) => {
  const store = getSelectedQueueLocationUuid();
  updateValueInSessionStorage('queueLocationUuid', currentLocationUuid);
  store.setState({ queueLocationUuid: currentLocationUuid });
};

export const updateSelectedQueueRoomTimestamp = (currentProviderRoomTimestamp: Date) => {
  const store = getSelectedQueueRoomTimestamp();
  store.setState({ providerQueueRoomTimestamp: currentProviderRoomTimestamp });
};

export const updateIsPermanentProviderQueueRoom = (currentIsPermanentProviderQueueRoom) => {
  const store = getIsPermanentProviderQueueRoom();
  updateValueInSessionStorage('isPermanentProviderQueueRoom', currentIsPermanentProviderQueueRoom);
  store.setState({ isPermanentProviderQueueRoom: currentIsPermanentProviderQueueRoom });
};

export const updateSelectedQueueStatus = (currentQueueStatusUuid: string, currentQueueStatusDisplay: string) => {
  const store = getSelectedQueueStatus();
  updateValueInSessionStorage('queueStatusUuid', currentQueueStatusUuid);
  updateValueInSessionStorage('queueStatusDisplay', currentQueueStatusDisplay);
  store.setState({ statusUuid: currentQueueStatusUuid, statusDisplay: currentQueueStatusDisplay });
};

export const useSelectedService = () => {
  return useStore(getSelectedService());
};

export const useSelectedAppointmentStatus = () => {
  return useStore(getSelectedAppointmentStatus()).status;
};

export const useSelectedQueueLocationName = () => {
  return useStore(getSelectedQueueLocationName()).queueLocationName;
};

export const useSelectedQueueLocationUuid = () => {
  return useStore(getSelectedQueueLocationUuid()).queueLocationUuid;
};

export const useSelectedProviderRoomTimestamp = () => {
  return useStore(getSelectedQueueRoomTimestamp()).providerQueueRoomTimestamp;
};

export const useIsPermanentProviderQueueRoom = () => {
  return useStore(getIsPermanentProviderQueueRoom()).isPermanentProviderQueueRoom;
};

export const useSelectedQueueStatus = () => {
  return useStore(getSelectedQueueStatus());
};

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value) || /^[0-9a-f]{36}$/i.test(value);
}
