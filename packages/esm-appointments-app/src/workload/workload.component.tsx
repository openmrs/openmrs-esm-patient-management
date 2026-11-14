import React, { useState } from 'react';
import { useAppointmentServices } from '../hooks/useAppointmentService';
import { useMonthlyAppointmentSummary } from './workload.resource';
import MonthlyCalendarView from './monthly-view-workload/monthly-view.component';
import styles from './workload.scss';

interface WorkloadProps {
  selectedService: string;
  /**
   * When undefined, e.g., while the date field is being edited, the last defined date is shown instead,
   * or the current date if there hasn't been one.
   */
  appointmentDate?: Date;
  onWorkloadDateChange: (pickedDate: Date) => void;
}

const Workload: React.FC<WorkloadProps> = ({ selectedService, appointmentDate, onWorkloadDateChange }) => {
  const { serviceTypes } = useAppointmentServices();
  const serviceUuid = serviceTypes?.find((service) => service.name === selectedService)?.uuid;

  const [displayDate, setDisplayDate] = useState(() => appointmentDate ?? new Date());
  if (appointmentDate && appointmentDate !== displayDate) {
    setDisplayDate(appointmentDate);
  }

  const monthlyCalendarWorkload = useMonthlyAppointmentSummary(displayDate, serviceUuid);

  const handleDateClick = (pickedDate: Date) => onWorkloadDateChange(pickedDate);

  return (
    <div className={styles.workLoadContainer}>
      <MonthlyCalendarView
        calendarWorkload={monthlyCalendarWorkload}
        dateToDisplay={displayDate.toISOString()}
        onDateClick={handleDateClick}
      />
    </div>
  );
};

export default Workload;
