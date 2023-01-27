import { AppointmentSummary, QueueServiceInfo } from '../types';
import { getGlobalStore } from '@openmrs/esm-framework';
import { useEffect, useState } from 'react';

export const getServiceCountByAppointmentType = (
  appointmentSummary: Array<AppointmentSummary>,
  appointmentType: string,
) => {
  return appointmentSummary
    .map((el) => Object.entries(el.appointmentCountMap).flatMap((el) => el[1][appointmentType]))
    .flat(1)
    .reduce((count, val) => count + val, 0);
};

const initialServiceNameState = { serviceName: '' };
const initialServiceUuidState = { serviceUuid: '' };
const intialStatusNameState = { status: '' };
const initialQueueLocationNameState = { queueLocationName: '' };
const initialQueueLocationUuidState = { queueLocationUuid: '' };

export function getSelectedServiceName() {
  return getGlobalStore<{ serviceName: string }>('queueSelectedServiceName', initialServiceNameState);
}

export function getSelectedServiceUuid() {
  return getGlobalStore<{ serviceUuid: string }>('queueSelectedServiceUuid', initialServiceUuidState);
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

export const updateSelectedServiceName = (currentServiceName: string) => {
  const store = getSelectedServiceName();
  store.setState({ serviceName: currentServiceName });
};

export const updateSelectedServiceUuid = (currentServiceUuid: string) => {
  const store = getSelectedServiceUuid();
  store.setState({ serviceUuid: currentServiceUuid });
};

export const updateSelectedAppointmentStatus = (currentAppointmentStatus: string) => {
  const store = getSelectedAppointmentStatus();
  store.setState({ status: currentAppointmentStatus });
};

export const updateSelectedQueueLocationName = (currentLocationName: string) => {
  const store = getSelectedQueueLocationName();
  store.setState({ queueLocationName: currentLocationName });
};

export const updateSelectedQueueLocationUuid = (currentLocationUuid: string) => {
  const store = getSelectedQueueLocationUuid();
  store.setState({ queueLocationUuid: currentLocationUuid });
};

export const useSelectedServiceName = () => {
  const [currentServiceName, setCurrentServiceName] = useState(initialServiceNameState.serviceName);

  useEffect(() => {
    getSelectedServiceName().subscribe(({ serviceName }) => setCurrentServiceName(serviceName));
  }, []);
  return currentServiceName;
};

export const useSelectedServiceUuid = () => {
  const [currentServiceUuid, setCurrentServiceUuid] = useState(initialServiceUuidState.serviceUuid);

  useEffect(() => {
    getSelectedServiceUuid().subscribe(({ serviceUuid }) => setCurrentServiceUuid(serviceUuid));
  }, []);
  return currentServiceUuid;
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
