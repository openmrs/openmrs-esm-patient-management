import React, { useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, MultiSelect } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import {
  PageHeader,
  PageHeaderContent,
  AppointmentsPictogram,
  OpenmrsDatePicker,
  useStore,
  useWorkspaces,
} from '@openmrs/esm-framework';
import { workspace2Store } from '@openmrs/esm-extensions';
import { useAppointmentServices } from '../hooks/useAppointmentService';
import { useSelectedDate } from '../hooks/useSelectedDate';
import { useAppointmentsStore } from '../store';
import { launchCreateAppointmentForm } from '../helpers/functions';
import styles from './appointments-header.scss';

interface CalendarFilterOption {
  uuid: string;
  label: string;
  color?: string;
}

export interface CalendarFilters {
  serviceOptions: Array<CalendarFilterOption>;
  providerOptions: Array<CalendarFilterOption>;
  locationOptions: Array<CalendarFilterOption>;
  selectedServiceUuids: Array<string>;
  selectedProviderUuids: Array<string>;
  selectedLocationUuids: Array<string>;
  onServiceChange: (selectedItems: Array<{ id: string }>) => void;
  onProviderChange: (selectedItems: Array<{ id: string }>) => void;
  onLocationChange: (selectedItems: Array<{ id: string }>) => void;
}

interface AppointmentHeaderProps {
  title: string;
  showServiceTypeFilter?: boolean;
  isCalendarView?: boolean;
  calendarFilters?: CalendarFilters;
}

const AppointmentsHeader: React.FC<AppointmentHeaderProps> = ({
  title,
  showServiceTypeFilter,
  isCalendarView,
  calendarFilters,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { appointmentServiceTypes, setAppointmentServiceTypes } = useAppointmentsStore();
  const { serviceTypes } = useAppointmentServices();
  const selectedDate = useSelectedDate();

  const workspace2State = useStore(workspace2Store);
  const workspaces1Info = useWorkspaces();

  const isWorkspaceOpen = useMemo(() => {
    const isWorkspace2Open =
      Boolean(workspace2State?.openedWindows?.length) && !workspace2State?.isMostRecentlyOpenedWindowHidden;
    const isWorkspace1Open = Boolean(workspaces1Info?.active);
    return isWorkspace2Open || isWorkspace1Open;
  }, [workspace2State, workspaces1Info]);

  const selectedDateValue = useMemo(() => dayjs(selectedDate).toDate(), [selectedDate]);

  const handleChangeServiceTypeFilter = useCallback(
    ({ selectedItems }: { selectedItems: Array<{ id: string; label: string }> }) => {
      const selectedUuids = selectedItems.map((item) => item.id);
      setAppointmentServiceTypes(selectedUuids);
    },
    [setAppointmentServiceTypes],
  );

  const serviceTypeOptions = useMemo(
    () => serviceTypes?.map((item) => ({ id: item.uuid, label: item.name })) ?? [],
    [serviceTypes],
  );

  const toMultiSelectItems = useCallback((options: Array<CalendarFilterOption>) => {
    return options.map((option) =>
      option.color
        ? { id: option.uuid, label: option.label, color: option.color }
        : { id: option.uuid, label: option.label },
    );
  }, []);

  const renderServiceItemWithColor = useCallback((item: { id: string; label: string; color?: string }) => {
    if (!item) return null;
    return (
      <span className={styles.filterOptionLabel}>
        {item.color && <span className={styles.serviceColorSwatch} style={{ backgroundColor: item.color }} />}
        <span className={item.color ? styles.filterOptionTextWithColor : ''}>{item.label}</span>
      </span>
    );
  }, []);

  const handleMultiSelectChange = useCallback((handler: (selectedItems: Array<{ id: string }>) => void) => {
    return ({ selectedItems }: { selectedItems: Array<{ id: string; label: string }> }) => handler(selectedItems);
  }, []);

  const serviceFilterLabel = t('filterByService', 'Service');
  const providerFilterLabel = t('filterByProvider', 'Provider');
  const locationFilterLabel = t('filterByLocation', 'Location');
  const allServicesLabel = t('allServices', 'All services');
  const allProvidersLabel = t('allProviders', 'All providers');
  const allLocationsLabel = t('allLocations', 'All locations');

  const calendarFilterMultiselects = calendarFilters && (
    <div className={styles.calendarFilters}>
      <MultiSelect
        id="calendarServiceFilter"
        items={toMultiSelectItems(calendarFilters.serviceOptions)}
        itemToString={(item) => (item ? item.label : '')}
        itemToElement={renderServiceItemWithColor}
        label={allServicesLabel}
        titleText={serviceFilterLabel}
        onChange={handleMultiSelectChange(calendarFilters.onServiceChange)}
        selectedItems={toMultiSelectItems(
          calendarFilters.serviceOptions.filter((option) => calendarFilters.selectedServiceUuids.includes(option.uuid)),
        )}
      />
      <MultiSelect
        id="calendarProviderFilter"
        items={toMultiSelectItems(calendarFilters.providerOptions)}
        itemToString={(item) => (item ? item.label : '')}
        label={allProvidersLabel}
        titleText={providerFilterLabel}
        onChange={handleMultiSelectChange(calendarFilters.onProviderChange)}
        selectedItems={toMultiSelectItems(
          calendarFilters.providerOptions.filter((option) =>
            calendarFilters.selectedProviderUuids.includes(option.uuid),
          ),
        )}
      />
      <MultiSelect
        id="calendarLocationFilter"
        items={toMultiSelectItems(calendarFilters.locationOptions)}
        itemToString={(item) => (item ? item.label : '')}
        label={allLocationsLabel}
        titleText={locationFilterLabel}
        onChange={handleMultiSelectChange(calendarFilters.onLocationChange)}
        selectedItems={toMultiSelectItems(
          calendarFilters.locationOptions.filter((option) =>
            calendarFilters.selectedLocationUuids.includes(option.uuid),
          ),
        )}
      />
    </div>
  );

  return (
    <PageHeader
      className={`${styles.header} ${isCalendarView ? styles.calendarHeader : ''}`}
      data-testid="appointments-header">
      <PageHeaderContent illustration={<AppointmentsPictogram />} title={title} />
      <div className={styles.rightJustifiedItems}>
        {isCalendarView ? (
          <div className={styles.calendarActions}>
            {calendarFilterMultiselects}
            {!isWorkspaceOpen && (
              <Button kind="primary" renderIcon={Add} size="md" onClick={() => launchCreateAppointmentForm(t)}>
                {t('newAppointment', 'New appointment')}
              </Button>
            )}
          </div>
        ) : (
          <>
            <OpenmrsDatePicker
              data-testid="appointment-date-picker"
              id="appointment-date-picker"
              aria-label={t('appointmentDate', 'Appointment date')}
              onChange={(date) => {
                if (!date) return;
                const target = `/${dayjs(date).format('YYYY-MM-DD')}`;
                if (!location.pathname.endsWith(target)) navigate(target);
              }}
              value={selectedDateValue}
            />
            {showServiceTypeFilter && (
              <MultiSelect
                id="serviceTypeMultiSelect"
                items={serviceTypeOptions}
                itemToString={(item) => (item ? item.label : '')}
                label={t('filterAppointmentsByServiceType', 'Filter appointments by service type')}
                onChange={handleChangeServiceTypeFilter}
                type="inline"
                selectedItems={serviceTypeOptions.filter((item) => appointmentServiceTypes.includes(item.id))}
              />
            )}
          </>
        )}
      </div>
    </PageHeader>
  );
};

export default AppointmentsHeader;
