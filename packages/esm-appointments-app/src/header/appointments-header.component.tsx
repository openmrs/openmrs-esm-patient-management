import React, { useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, MultiSelect } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { PageHeader, PageHeaderContent, AppointmentsPictogram, OpenmrsDatePicker } from '@openmrs/esm-framework';
import { useAppointmentServices } from '../hooks/useAppointmentService';
import { useSelectedDate } from '../hooks/useSelectedDate';
import { useAppointmentsStore } from '../store';
import { launchCreateAppointmentForm } from '../helpers/functions';
import styles from './appointments-header.scss';

interface CalendarServiceItem {
  id: string;
  label: string;
  color?: string;
}

const ServiceFilterItem: React.FC<CalendarServiceItem> = ({ label, color }) => (
  <span className={styles.serviceFilterItem}>
    <span className={styles.serviceFilterSwatch} style={{ backgroundColor: color }} />
    {label}
  </span>
);

interface AppointmentHeaderProps {
  title: string;
  showServiceTypeFilter?: boolean;
  isCalendarView?: boolean;
  serviceColorMap?: Map<string, string>;
  selectedServiceUuids?: Array<string>;
  onServiceFilterChange?: (selectedUuids: Array<string>) => void;
}

const AppointmentsHeader: React.FC<AppointmentHeaderProps> = ({
  title,
  showServiceTypeFilter,
  isCalendarView,
  serviceColorMap,
  selectedServiceUuids = [],
  onServiceFilterChange,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { appointmentServiceTypes, setAppointmentServiceTypes } = useAppointmentsStore();
  const { serviceTypes } = useAppointmentServices();
  const selectedDate = useSelectedDate();

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

  const calendarServiceItems = useMemo(
    () =>
      serviceTypes?.map((item) => ({ id: item.uuid, label: item.name, color: serviceColorMap?.get(item.uuid) })) ?? [],
    [serviceTypes, serviceColorMap],
  );

  const handleCalendarServiceFilterChange = useCallback(
    ({ selectedItems }: { selectedItems: Array<CalendarServiceItem> | null }) => {
      onServiceFilterChange?.((selectedItems ?? []).map((item) => item.id));
    },
    [onServiceFilterChange],
  );

  const serviceSelectionLabel = useMemo(() => {
    const count = selectedServiceUuids.length;
    return count === 0
      ? t('allServices', 'All services')
      : t('serviceSelectionCount', '{{count}} service(s)', { count });
  }, [selectedServiceUuids, t]);

  return (
    <PageHeader className={styles.header} data-testid="appointments-header">
      <PageHeaderContent illustration={<AppointmentsPictogram />} title={title} />
      <div className={styles.rightJustifiedItems}>
        {isCalendarView ? (
          <div className={styles.calendarControls}>
            <MultiSelect
              id="calendarServiceFilter"
              className={styles.calendarServiceFilter}
              label={serviceSelectionLabel}
              titleText={t('service', 'Service')}
              hideLabel
              items={calendarServiceItems}
              itemToString={(item) => item?.label ?? ''}
              itemToElement={ServiceFilterItem}
              onChange={handleCalendarServiceFilterChange}
              selectedItems={calendarServiceItems.filter((item) => selectedServiceUuids.includes(item.id))}
              size="sm"
            />
            <Button kind="primary" renderIcon={Add} size="sm" onClick={() => launchCreateAppointmentForm(t)}>
              {t('newAppointment', 'New appointment')}
            </Button>
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
