import dayjs from 'dayjs';
import { AppointmentStatus, type Appointment, type DailyAppointmentsCountByService } from '../../types';

export interface AppointmentFilters {
  serviceUuids: Array<string>;
  providerUuids: Array<string>;
  locationUuids: Array<string>;
}

export interface FilterOption {
  uuid: string;
  label: string;
}

const appointmentProviderUuids = (appointment: Appointment): Array<string> => {
  const providers = appointment.providers?.length
    ? appointment.providers
    : appointment.provider
      ? [appointment.provider]
      : [];
  return providers.map((provider) => provider.uuid).filter(Boolean);
};

export const filterAppointments = (
  appointments: Array<Appointment>,
  filters: AppointmentFilters,
): Array<Appointment> => {
  const { serviceUuids, providerUuids, locationUuids } = filters;
  return appointments.filter((appointment) => {
    if (serviceUuids.length && !serviceUuids.includes(appointment.service?.uuid)) return false;
    if (providerUuids.length && !appointmentProviderUuids(appointment).some((uuid) => providerUuids.includes(uuid))) {
      return false;
    }
    if (locationUuids.length && !locationUuids.includes(appointment.location?.uuid)) return false;
    return true;
  });
};

export const aggregateDailyCountsByService = (
  appointments: Array<Appointment>,
): Array<DailyAppointmentsCountByService> => {
  const dailyMap = new Map<string, Map<string, { serviceName: string; serviceUuid: string; count: number }>>();

  appointments.forEach((appointment) => {
    if (appointment.status === AppointmentStatus.CANCELLED || appointment.startDateTime == null) return;

    const dateKey = dayjs(appointment.startDateTime).format('YYYY-MM-DD');
    const serviceUuid = appointment.service?.uuid ?? '';
    const serviceName = appointment.service?.name ?? '';

    let serviceMap = dailyMap.get(dateKey);
    if (!serviceMap) {
      serviceMap = new Map();
      dailyMap.set(dateKey, serviceMap);
    }

    const existing = serviceMap.get(serviceUuid);
    if (existing) {
      existing.count += 1;
    } else {
      serviceMap.set(serviceUuid, { serviceName, serviceUuid, count: 1 });
    }
  });

  return Array.from(dailyMap.entries())
    .map(([appointmentDate, serviceMap]) => ({
      appointmentDate,
      services: Array.from(serviceMap.values()),
    }))
    .sort((a, b) => a.appointmentDate.localeCompare(b.appointmentDate));
};

export const extractProviderOptions = (appointments: Array<Appointment>): Array<FilterOption> => {
  const map = new Map<string, string>();
  appointments?.forEach((appointment) => {
    const providers = appointment.providers?.length
      ? appointment.providers
      : appointment.provider
        ? [appointment.provider]
        : [];
    providers.forEach((provider) => {
      if (provider?.uuid && !map.has(provider.uuid)) {
        const label =
          (provider as { display?: string; person?: { display?: string }; name?: string }).person?.display ??
          provider.display ??
          (provider as { name?: string }).name ??
          provider.uuid;
        map.set(provider.uuid, label);
      }
    });
  });
  return Array.from(map.entries())
    .map(([uuid, label]) => ({ uuid, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
};

export const extractLocationOptions = (appointments: Array<Appointment>): Array<FilterOption> => {
  const map = new Map<string, string>();
  appointments?.forEach((appointment) => {
    if (appointment.location?.uuid && !map.has(appointment.location.uuid)) {
      const loc = appointment.location as { display?: string; name?: string; uuid: string };
      const label = loc.display ?? loc.name ?? loc.uuid;
      map.set(loc.uuid, label);
    }
  });
  return Array.from(map.entries())
    .map(([uuid, label]) => ({ uuid, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
};
