import dayjs from 'dayjs';
import { useAppointmentSummary } from './forms.resource';
import { useAppointmentDate } from '../../helpers';
interface AppointmentCount {
  date: string;
  count: number;
}

export const getMonthlyCalendarDistribution = (startDate: Date, appointmentCount: Array<AppointmentCount>) => {
  const distributionHashTable = new Map<string, number>([]);
  for (let i = 0; i <= 35; i++) {
    distributionHashTable.set(dayjs(startDate).add(i, 'day').format('YYYY-MM-DD'), 0);
  }
  appointmentCount.map(({ date, count }) => {
    if (distributionHashTable.has(date)) {
      distributionHashTable.set(date, count);
    }
  });

  return Array.from(distributionHashTable).flatMap(([date, value]) => ({ date: date, count: value }));
};

export const useCalendarDistribution = (servieUuid: string, distributionType: 'month' | 'week') => {
  const appointmentStartDate = useAppointmentDate();
  const appointmentSummary = useAppointmentSummary(new Date(appointmentStartDate), servieUuid);
  const monthlyData = getMonthlyCalendarDistribution(new Date(appointmentStartDate), appointmentSummary) ?? [];
  return distributionType === 'month' ? monthlyData : monthlyData.slice(0, 7);
};
