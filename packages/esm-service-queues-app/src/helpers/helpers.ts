import { useEffect, useState } from 'react';
import { getGlobalStore } from '@openmrs/esm-framework';
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

const initialQueueLocationNameState = { queueLocationName: sessionStorage.getItem('queueLocationName') };
const initialQueueLocationUuidState = { queueLocationUuid: sessionStorage.getItem('queueLocationUuid') };
const initialServiceUuidState = {
  serviceUuid: sessionStorage.getItem('queueServiceUuid'),
  serviceDisplay: sessionStorage.getItem('queueServiceDisplay'),
};
const intialStatusNameState = { status: '' };
const initialQueueStatusState = { statusUuid: null, statusDisplay: null };
const initialSelectedQueueRoomTimestamp = { providerQueueRoomTimestamp: new Date() };
const initialPermanentProviderQueueRoomState = {
  isPermanentProviderQueueRoom: sessionStorage.getItem('isPermanentProviderQueueRoom'),
};

export function getSelectedService() {
  return getGlobalStore<{ serviceUuid: string; serviceDisplay: string }>(
    'queueSelectedServiceUuid',
    initialServiceUuidState,
  );
}

export function getSelectedAppointmentStatus() {
  return getGlobalStore<{ status: string }>('appointmentSelectedStatus', intialStatusNameState);
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
  sessionStorage.setItem('queueServiceDisplay', currentServiceDisplay);
  sessionStorage.setItem('queueServiceUuid', currentServiceUuid);
  store.setState({ serviceUuid: currentServiceUuid, serviceDisplay: currentServiceDisplay });
};

export const updateSelectedAppointmentStatus = (currentAppointmentStatus: string) => {
  const store = getSelectedAppointmentStatus();
  store.setState({ status: currentAppointmentStatus });
};

export const updateSelectedQueueLocationName = (currentLocationName: string) => {
  const store = getSelectedQueueLocationName();
  sessionStorage.setItem('queueLocationName', currentLocationName);
  store.setState({ queueLocationName: currentLocationName });
};

export const updateSelectedQueueLocationUuid = (currentLocationUuid: string) => {
  const store = getSelectedQueueLocationUuid();
  sessionStorage.setItem('queueLocationUuid', currentLocationUuid);
  store.setState({ queueLocationUuid: currentLocationUuid });
};

export const updatedSelectedQueueRoomTimestamp = (currentProviderRoomTimestamp: Date) => {
  const store = getSelectedQueueRoomTimestamp();
  store.setState({ providerQueueRoomTimestamp: currentProviderRoomTimestamp });
};

export const updateIsPermanentProviderQueueRoom = (currentIsPermanentProviderQueueRoom) => {
  const store = getIsPermanentProviderQueueRoom();
  sessionStorage.setItem('isPermanentProviderQueueRoom', currentIsPermanentProviderQueueRoom);
  store.setState({ isPermanentProviderQueueRoom: currentIsPermanentProviderQueueRoom });
};

export const updateSelectedQueueStatus = (currentQueueStatusUuid: string, currentQueueStatusDisplay: string) => {
  const store = getSelectedQueueStatus();
  store.setState({ statusUuid: currentQueueStatusUuid, statusDisplay: currentQueueStatusDisplay });
};

export const useSelectedService = () => {
  const [currentService, setCurrentService] = useState(getSelectedService()?.getState());

  useEffect(() => {
    getSelectedService().subscribe((newSelectedService) => setCurrentService(newSelectedService));
  }, []);
  return currentService;
};

export const useSelectedAppointmentStatus = () => {
  const [currentAppointmentStatus, setCurrentAppointmentStatus] = useState(intialStatusNameState.status);

  useEffect(() => {
    getSelectedAppointmentStatus().subscribe(({ status }) => setCurrentAppointmentStatus(status));
  }, []);
  return currentAppointmentStatus;
};

export const useSelectedQueueLocationName = () => {
  const [currentQueueLocationName, setCurrentQueueLocationName] = useState(
    initialQueueLocationNameState.queueLocationName,
  );

  useEffect(() => {
    getSelectedQueueLocationName().subscribe(({ queueLocationName }) => setCurrentQueueLocationName(queueLocationName));
  }, []);
  return currentQueueLocationName;
};

export const useSelectedQueueLocationUuid = () => {
  const [currentQueueLocationUuid, setCurrentQueueLocationUuid] = useState(
    initialQueueLocationUuidState.queueLocationUuid,
  );

  useEffect(() => {
    getSelectedQueueLocationUuid().subscribe(({ queueLocationUuid }) => setCurrentQueueLocationUuid(queueLocationUuid));
  }, []);
  return currentQueueLocationUuid;
};

export const useSelectedProviderRoomTimestamp = () => {
  const [currentProviderRoomTimestamp, setCurrentProviderRoomTimestamp] = useState(
    initialSelectedQueueRoomTimestamp.providerQueueRoomTimestamp,
  );

  useEffect(() => {
    getSelectedQueueRoomTimestamp().subscribe(({ providerQueueRoomTimestamp }) =>
      setCurrentProviderRoomTimestamp(providerQueueRoomTimestamp),
    );
  }, []);
  return currentProviderRoomTimestamp;
};

export const useIsPermanentProviderQueueRoom = () => {
  const [currentIsPermanentProviderQueueRoom, setCurrentIsPermanentProviderQueueRoom] = useState(
    initialPermanentProviderQueueRoomState.isPermanentProviderQueueRoom,
  );

  useEffect(() => {
    getIsPermanentProviderQueueRoom().subscribe(({ isPermanentProviderQueueRoom }) =>
      setCurrentIsPermanentProviderQueueRoom(isPermanentProviderQueueRoom),
    );
  }, []);
  return currentIsPermanentProviderQueueRoom;
};

export const useSelectedQueueStatus = () => {
  const [currentQueueStatus, setCurrentQueueStatus] = useState(getSelectedQueueStatus()?.getState());

  useEffect(() => {
    getSelectedQueueStatus().subscribe((newStatus) => setCurrentQueueStatus(newStatus));
  }, []);
  return currentQueueStatus;
};

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value) || /^[0-9a-f]{36}$/i.test(value);
}
