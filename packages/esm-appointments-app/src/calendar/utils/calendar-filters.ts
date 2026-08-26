import dayjs from 'dayjs';
import { type OpenmrsResource } from '@openmrs/esm-framework';
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

interface ProviderResource extends OpenmrsResource {
  person?: OpenmrsResource;
}

interface LocationResource extends OpenmrsResource {
  name?: string;
}

interface ProviderItemResource extends OpenmrsResource {
  person?: OpenmrsResource;
  provider?: OpenmrsResource & { person?: OpenmrsResource };
}

const appointmentProviderUuids = (appointment: Appointment): Array<string> => {
  const providers: Array<ProviderItemResource> = appointment.providers?.length
    ? appointment.providers
    : appointment.provider
      ? [appointment.provider]
      : [];
  const uuids = new Set<string>();
  providers.forEach((provider) => {
    if (provider?.uuid) uuids.add(provider.uuid);
    if (provider?.provider?.uuid) uuids.add(provider.provider.uuid);
    if (provider?.person?.uuid) uuids.add(provider.person.uuid);
    if (provider?.provider?.person?.uuid) uuids.add(provider.provider.person.uuid);
  });
  return Array.from(uuids);
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

    const parsedDate = isNaN(Number(appointment.startDateTime))
      ? appointment.startDateTime
      : Number(appointment.startDateTime);
    const dateKey = dayjs(parsedDate).format('YYYY-MM-DD');
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
    const providers: Array<ProviderResource> = appointment.providers?.length
      ? appointment.providers
      : appointment.provider
        ? [appointment.provider]
        : [];
    providers.forEach((provider) => {
      if (provider?.uuid && !map.has(provider.uuid)) {
        const label = provider.person?.display ?? provider.display ?? provider.name ?? provider.uuid;
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
      const loc = appointment.location as LocationResource;
      const label = loc.display ?? loc.name ?? loc.uuid;
      map.set(loc.uuid, label);
    }
  });
  return Array.from(map.entries())
    .map(([uuid, label]) => ({ uuid, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
};
