import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, InlineLoading } from '@carbon/react';
import { ChevronLeft } from '@carbon/react/icons';
import { type Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { launchWorkspace2 } from '@openmrs/esm-framework';
import { type Appointment } from '../../types';
import { useAppointmentsByDate } from '../../hooks/useAppointmentsByDate';
import { appointmentDetailsWorkspace } from '../../constants';
import { buildHourSlots, buildTimelineRanges } from '../utils/day-timeline';
import { formatHourLabel } from '../utils/calendar-colors';
import AppointmentsTable from '../../appointments/common-components/appointments-table.component';
import HourRow from './hour-row.component';
import CollapsedBar from './collapsed-bar.component';
import styles from './daily-calendar-view.scss';

interface DailyCalendarViewProps {
  calendarSelectedDate: Dayjs;
  /** Reports the day's appointment count so the toolbar can show it (null while loading). */
  onAppointmentCountChange?: (count: number | null) => void;
}

const rangeKey = (kind: string, h0: number, h1: number) => `${kind}-${h0}-${h1}`;

const DailyCalendarView: React.FC<DailyCalendarViewProps> = ({ calendarSelectedDate, onAppointmentCountChange }) => {
  const { t } = useTranslation();
  const isoDate = calendarSelectedDate.format('YYYY-MM-DD');
  const { appointments, isLoading } = useAppointmentsByDate(isoDate);

  const [expandedRanges, setExpandedRanges] = useState<Set<string>>(new Set());
  const [tableHour, setTableHour] = useState<number | null>(null);

  useEffect(() => {
    setExpandedRanges(new Set());
    setTableHour(null);
  }, [isoDate]);

  useEffect(() => {
    onAppointmentCountChange?.(isLoading ? null : appointments.length);
  }, [appointments, isLoading, onAppointmentCountChange]);

  const hourSlots = useMemo(() => buildHourSlots(appointments), [appointments]);
  const timelineRanges = useMemo(() => buildTimelineRanges(appointments), [appointments]);
  const slotByHour = useMemo(() => new Map(hourSlots.map((slot) => [slot.hour, slot])), [hourSlots]);

  const handleBlockClick = useCallback((appointment: Appointment) => {
    launchWorkspace2(appointmentDetailsWorkspace, { appointment });
  }, []);

  const handleOpenTable = useCallback((hour: number) => {
    setTableHour(hour);
  }, []);

  const toggleRange = useCallback((key: string) => {
    setExpandedRanges((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <InlineLoading description={t('loadingAppointments', 'Loading appointments…')} />
      </div>
    );
  }

  const tableAppointments =
    tableHour != null ? (slotByHour.get(tableHour)?.blocks ?? []).map((b) => b.appointment) : [];
  const hourRangeLabel =
    tableHour != null ? `${formatHourLabel(tableHour)} – ${formatHourLabel((tableHour + 1) % 24)}` : '';

  return (
    <div className={styles.container} data-testid="daily-calendar">
      {tableHour != null ? (
        <div className={styles.tableOverlay}>
          <div className={styles.tableToolbar}>
            <Button
              kind="ghost"
              size="sm"
              renderIcon={ChevronLeft}
              iconDescription={t('back', 'Back')}
              onClick={() => setTableHour(null)}>
              {t('back', 'Back')}
            </Button>
            <span className={styles.tableHeading}>
              {t('appointmentsForHour', '{{count}} appointments · {{hourRange}}', {
                count: tableAppointments.length,
                hourRange: hourRangeLabel,
              })}
            </span>
          </div>
          <AppointmentsTable appointments={tableAppointments} isLoading={isLoading} noPadding />
        </div>
      ) : (
        <div className={styles.dayBody}>
          {timelineRanges.map((range) => {
            const key = rangeKey(range.kind, range.h0, range.h1);
            if (range.kind === 'live') {
              return Array.from({ length: range.h1 - range.h0 + 1 }, (_, i) => {
                const hour = range.h0 + i;
                const slot = slotByHour.get(hour);
                if (!slot) return null;
                return (
                  <HourRow
                    key={`live-${hour}`}
                    slot={slot}
                    onBlockClick={handleBlockClick}
                    onOpenTable={handleOpenTable}
                  />
                );
              });
            }
            if (expandedRanges.has(key)) {
              return Array.from({ length: range.h1 - range.h0 + 1 }, (_, i) => {
                const hour = range.h0 + i;
                const slot = slotByHour.get(hour);
                if (!slot) return null;
                return (
                  <HourRow
                    key={`expanded-${hour}`}
                    slot={slot}
                    onBlockClick={handleBlockClick}
                    onOpenTable={handleOpenTable}
                    onCollapse={i === 0 ? () => toggleRange(key) : undefined}
                  />
                );
              });
            }
            return <CollapsedBar key={key} range={range} onToggle={() => toggleRange(key)} />;
          })}
        </div>
      )}
    </div>
  );
};

export default DailyCalendarView;
