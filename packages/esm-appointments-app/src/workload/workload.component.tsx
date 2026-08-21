import React, { useState } from 'react';
import { useAppointmentServices } from '../hooks/useAppointmentService';
import { useCalendarDistribution, useMonthlyCalendarDistribution } from './workload.resource';
import MonthlyCalendarView from './monthly-view-workload/monthly-view.component';
import styles from './workload.scss';

interface WorkloadProps {
  selectedService: string;
  appointmentDate: Date;
  onWorkloadDateChange: (pickedDate: Date) => void;
}

const Workload: React.FC<WorkloadProps> = ({ selectedService, appointmentDate, onWorkloadDateChange }) => {
  const { serviceTypes } = useAppointmentServices();
  const serviceUuid = serviceTypes?.find((service) => service.name === selectedService)?.uuid;

  const [selectedTab, setSelectedTab] = useState(0);

  const calendarWorkload = useCalendarDistribution(serviceUuid, selectedTab === 0 ? 'week' : 'month', appointmentDate);

  const monthlyCalendarWorkload = useMonthlyCalendarDistribution(
    serviceUuid,
    selectedTab === 0 ? 'week' : 'month',
    appointmentDate,
  );

  const handleDateClick = (pickedDate: Date) => onWorkloadDateChange(pickedDate);

  return (
    <div className={styles.workLoadContainer}>
      <MonthlyCalendarView
        calendarWorkload={monthlyCalendarWorkload}
        dateToDisplay={appointmentDate.toISOString()}
        onDateClick={handleDateClick}
      />
    </div>
  );
};

export default Workload;
