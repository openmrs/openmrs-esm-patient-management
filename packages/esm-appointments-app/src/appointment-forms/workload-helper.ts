import dayjs from 'dayjs';

export const getWeeklyCalendarDistribution = (
  startDate: Date,
  appointmentCount: Array<{ date: string; count: number }>,
) => {
  const distributionHashTable = new Map<string, number>([]);
  for (let i = 0; i <= 7; i++) {
    distributionHashTable.set(dayjs(startDate).add(i, 'day').format('YYYY-MM-DD'), 0);
  }
  appointmentCount.map(({ date, count }) => {
    if (distributionHashTable.has(date)) {
      distributionHashTable.set(date, count);
    }
  });

  return Array.from(distributionHashTable).flatMap(([date, value]) => ({ date: date, count: value }));
};
export const getMonthlyCalendarDistribution = (
  startDate: Date,
  appointmentCount: Array<{ date: string; count: number }>,
) => {
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
