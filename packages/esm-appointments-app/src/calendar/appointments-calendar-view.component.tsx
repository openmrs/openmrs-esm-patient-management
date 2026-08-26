import React, { useState, useCallback, useMemo } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useLocations, type OpenmrsResource } from '@openmrs/esm-framework';
import { useAppointmentsCalendar } from '../hooks/useAppointmentsCalendar';
import { useMonthlyAppointments } from '../hooks/useMonthlyAppointments';
import { useAppointmentServices } from '../hooks/useAppointmentService';
import { useProviders } from '../hooks/useProviders';
import AppointmentsHeader from '../header/appointments-header.component';
import { useSelectedDate } from '../hooks/useSelectedDate';
import { type CalendarViewMode } from '../types';
import CalendarHeader from './header/calendar-header.component';
import MonthlyCalendarView from './monthly/monthly-calendar-view.component';
import DailyCalendarView from './daily/daily-calendar-view.component';
import ServicesLegend from './services-legend.component';
import { buildServiceColorMap } from './utils/calendar-colors';
import {
  aggregateDailyCountsByService,
  extractLocationOptions,
  extractProviderOptions,
  filterAppointments,
} from './utils/calendar-filters';
import styles from './appointments-calendar-view-view.scss';

const AppointmentsCalendarView: React.FC = () => {
  const { t } = useTranslation();
  const selectedDate = useSelectedDate();
  const [viewMode, setViewMode] = useState<CalendarViewMode>('monthly');
  const [calendarSelectedDate, setCalendarSelectedDate] = useState<Dayjs>(dayjs(selectedDate));
  const [serviceUuids, setServiceUuids] = useState<Array<string>>([]);
  const [providerUuids, setProviderUuids] = useState<Array<string>>([]);
  const [locationUuids, setLocationUuids] = useState<Array<string>>([]);
  const { serviceTypes } = useAppointmentServices();
  const { providers } = useProviders();
  const locations = useLocations();
  const serviceColorMap = useMemo(() => buildServiceColorMap(serviceTypes), [serviceTypes]);

  const isMonthly = viewMode === 'monthly';
  const hasProviderOrLocationFilter = providerUuids.length > 0 || locationUuids.length > 0;
  const hasServiceFilter = serviceUuids.length > 0;

  const { calendarEvents: summaryEvents } = useAppointmentsCalendar(calendarSelectedDate.toISOString(), viewMode);

  const { appointments: monthlyAppointments } = useMonthlyAppointments(calendarSelectedDate);

  const filteredSummaryEvents = useMemo(() => {
    if (!summaryEvents) return [];
    if (!hasServiceFilter) return summaryEvents;
    return summaryEvents
      .map((event) => ({
        ...event,
        services: (event.services ?? []).filter((s) => serviceUuids.includes(s.serviceUuid)),
      }))
      .filter((event) => event.services.length > 0);
  }, [summaryEvents, hasServiceFilter, serviceUuids]);

  const filteredMonthlyEvents = useMemo(() => {
    if (!isMonthly || (!hasProviderOrLocationFilter && !hasServiceFilter)) return null;
    return aggregateDailyCountsByService(
      filterAppointments(monthlyAppointments, { serviceUuids, providerUuids, locationUuids }),
    );
  }, [
    isMonthly,
    hasProviderOrLocationFilter,
    hasServiceFilter,
    monthlyAppointments,
    serviceUuids,
    providerUuids,
    locationUuids,
  ]);

  const calendarEvents = isMonthly
    ? hasProviderOrLocationFilter
      ? filteredMonthlyEvents
      : filteredSummaryEvents
    : summaryEvents;

  const appointmentCount = useMemo(() => {
    if (!calendarEvents) return 0;
    return calendarEvents.reduce(
      (sum, event) =>
        sum + (event.services ?? []).reduce((serviceSum, service) => serviceSum + (service.count ?? 0), 0),
      0,
    );
  }, [calendarEvents]);

  const handleToday = useCallback(() => {
    setCalendarSelectedDate(dayjs());
  }, []);

  const handlePrev = useCallback(() => {
    if (viewMode === 'monthly') setCalendarSelectedDate((d) => d.subtract(1, 'month'));
    else setCalendarSelectedDate((d) => d.subtract(1, 'day'));
  }, [viewMode]);

  const handleNext = useCallback(() => {
    if (viewMode === 'monthly') setCalendarSelectedDate((d) => d.add(1, 'month'));
    else setCalendarSelectedDate((d) => d.add(1, 'day'));
  }, [viewMode]);

  const handleViewModeChange = useCallback((mode: CalendarViewMode) => {
    setViewMode(mode);
  }, []);

  const handleSelectDate = useCallback((isoDate: string) => {
    setCalendarSelectedDate(dayjs(isoDate));
    setViewMode('daily');
  }, []);

  const legendServices = useMemo(() => {
    const legendMap = new Map<string, { uuid: string; name: string }>();
    calendarEvents?.forEach((event) => {
      event.services?.forEach((service) => {
        const key = service.serviceUuid || service.serviceName;
        if (service.serviceName && key && !legendMap.has(key)) {
          legendMap.set(key, { name: service.serviceName, uuid: service.serviceUuid ?? key });
        }
      });
    });
    return Array.from(legendMap.values());
  }, [calendarEvents]);

  const onServiceChange = useCallback(
    (selectedItems: Array<{ id: string }>) => setServiceUuids(selectedItems.map((item) => item.id)),
    [],
  );
  const onProviderChange = useCallback(
    (selectedItems: Array<{ id: string }>) => setProviderUuids(selectedItems.map((item) => item.id)),
    [],
  );
  const onLocationChange = useCallback(
    (selectedItems: Array<{ id: string }>) => setLocationUuids(selectedItems.map((item) => item.id)),
    [],
  );

  const filterOptions = useMemo(() => {
    const serviceOptions = serviceTypes.map((service) => ({
      uuid: service.uuid,
      label: service.name,
      color: serviceColorMap.get(service.uuid),
    }));

    const providerMap = new Map<string, string>();
    if (Array.isArray(providers) && providers.length > 0) {
      providers.forEach((provider: OpenmrsResource & { person?: OpenmrsResource }) => {
        const uuid = provider?.uuid;
        const label = provider?.person?.display ?? provider?.display ?? provider?.name ?? uuid;
        if (uuid && label) {
          providerMap.set(uuid, label);
        }
      });
    }
    extractProviderOptions(monthlyAppointments ?? []).forEach((opt) => {
      if (opt.uuid && opt.label && !providerMap.has(opt.uuid)) providerMap.set(opt.uuid, opt.label);
    });

    const providerOptions = Array.from(providerMap.entries())
      .map(([uuid, label]) => ({ uuid, label }))
      .sort((a, b) => a.label.localeCompare(b.label));

    const locationMap = new Map<string, string>();
    if (Array.isArray(locations) && locations.length > 0) {
      locations.forEach((loc: OpenmrsResource) => {
        const uuid = loc?.uuid;
        const label = loc?.display ?? loc?.name ?? uuid;
        if (uuid && label) {
          locationMap.set(uuid, label);
        }
      });
    }
    extractLocationOptions(monthlyAppointments ?? []).forEach((opt) => {
      if (opt.uuid && opt.label && !locationMap.has(opt.uuid)) locationMap.set(opt.uuid, opt.label);
    });

    const locationOptions = Array.from(locationMap.entries())
      .map(([uuid, label]) => ({ uuid, label }))
      .sort((a, b) => a.label.localeCompare(b.label));

    return { serviceOptions, providerOptions, locationOptions };
  }, [serviceTypes, providers, locations, monthlyAppointments, serviceColorMap]);

  const calendarFilters = useMemo(
    () => ({
      ...filterOptions,
      selectedServiceUuids: serviceUuids,
      selectedProviderUuids: providerUuids,
      selectedLocationUuids: locationUuids,
      onServiceChange,
      onProviderChange,
      onLocationChange,
    }),
    [filterOptions, serviceUuids, providerUuids, locationUuids, onServiceChange, onProviderChange, onLocationChange],
  );

  return (
    <div data-testid="appointments-calendar" className={styles.backgroundColor}>
      <AppointmentsHeader title={t('calendar', 'Calendar')} isCalendarView calendarFilters={calendarFilters} />
      <CalendarHeader
        viewMode={viewMode}
        calendarSelectedDate={calendarSelectedDate}
        appointmentCount={appointmentCount}
        onViewModeChange={handleViewModeChange}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
      />
      {viewMode === 'monthly' && (
        <MonthlyCalendarView
          events={calendarEvents ?? []}
          calendarSelectedDate={calendarSelectedDate}
          onSelectDate={handleSelectDate}
          serviceColorMap={serviceColorMap}
        />
      )}
      {viewMode === 'daily' && (
        <DailyCalendarView calendarSelectedDate={calendarSelectedDate} serviceColorMap={serviceColorMap} />
      )}
      <ServicesLegend services={legendServices} serviceColorMap={serviceColorMap} />
    </div>
  );
};

export default AppointmentsCalendarView;
