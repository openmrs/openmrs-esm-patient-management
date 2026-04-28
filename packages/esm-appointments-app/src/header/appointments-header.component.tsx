import React, { useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { MultiSelect } from '@carbon/react';
import { PageHeader, PageHeaderContent, AppointmentsPictogram, OpenmrsDatePicker } from '@openmrs/esm-framework';
import { useAppointmentServices } from '../hooks/useAppointmentService';
import { useSelectedDate } from '../hooks/useSelectedDate';
import { useAppointmentsStore } from '../store';
import styles from './appointments-header.scss';

interface AppointmentHeaderProps {
  title: string;
  showServiceTypeFilter?: boolean;
}

const AppointmentsHeader: React.FC<AppointmentHeaderProps> = ({ title, showServiceTypeFilter }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { appointmentServiceTypes, setAppointmentServiceTypes } = useAppointmentsStore();
  const { serviceTypes } = useAppointmentServices();
  const selectedDate = useSelectedDate();

  const selectedDateValue = useMemo(() => dayjs(selectedDate).toDate(), [selectedDate]);

  const handleChangeServiceTypeFilter = useCallback(
    ({ selectedItems }) => {
      const selectedUuids = selectedItems.map((item) => item.id);
      setAppointmentServiceTypes(selectedUuids);
    },
    [setAppointmentServiceTypes],
  );

  const serviceTypeOptions = useMemo(
    () => serviceTypes?.map((item) => ({ id: item.uuid, label: item.name })) ?? [],
    [serviceTypes],
  );

  return (
    <PageHeader className={styles.header} data-testid="appointments-header">
      <PageHeaderContent illustration={<AppointmentsPictogram />} title={title} />
      <div className={styles.rightJustifiedItems}>
        <OpenmrsDatePicker
          data-testid="appointment-date-picker"
          id="appointment-date-picker"
          aria-label={t('appointmentDate', 'Appointment date')}
          onChange={(date) => {
            if (!date) {
              return;
            }

            const target = `/${dayjs(date).format('YYYY-MM-DD')}`;
            if (!location.pathname.endsWith(target)) {
              navigate(target);
            }
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
      </div>
    </PageHeader>
  );
};

export default AppointmentsHeader;
