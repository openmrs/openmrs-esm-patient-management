import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, InlineLoading, InlineNotification } from '@carbon/react';
import { ChevronLeft } from '@carbon/react/icons';
import { type Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { launchWorkspace2 } from '@openmrs/esm-framework';
import { type Appointment } from '../../types';
import { useAppointmentsByDate } from '../../hooks/useAppointmentsByDate';
import { appointmentsFormWorkspace } from '../../constants';
import {
  buildHourSlots,
  buildTimelineRanges,
  getLaneCeiling,
  DEFAULT_CONTAINER_WIDTH_PX,
  type HourSlot,
  type TimelineRange,
} from '../utils/day-timeline';
import { formatHourLabel } from '../utils/calendar-colors';
import AppointmentsTable from '../../appointments/common-components/appointments-table.component';
import HourRow from './hour-row.component';
import CollapsedBar from './collapsed-bar.component';
import styles from './daily-calendar-view.scss';

interface DailyCalendarViewProps {
  calendarSelectedDate: Dayjs;
  /** Reports the day's appointment count so the toolbar can show it (null while loading). */
  onAppointmentCountChange?: (count: number | null) => void;
  serviceColorMap?: Map<string, string>;
}

const rangeKey = (kind: string, h0: number, h1: number) => `${kind}-${h0}-${h1}`;

const DailyCalendarView: React.FC<DailyCalendarViewProps> = ({
  calendarSelectedDate,
  onAppointmentCountChange,
  serviceColorMap,
}) => {
  const { t } = useTranslation();
  const isoDate = calendarSelectedDate.format('YYYY-MM-DD');
  const { appointments, isLoading, error } = useAppointmentsByDate(isoDate);

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(DEFAULT_CONTAINER_WIDTH_PX);
  const [expandedRanges, setExpandedRanges] = useState<Set<string>>(new Set());
  const [tableHour, setTableHour] = useState<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    let frameId: number | null = null;
    const observer = new ResizeObserver((entries) => {
      if (frameId != null) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        for (const entry of entries) {
          if (entry.contentRect.width > 0) {
            setContainerWidth(entry.contentRect.width);
          }
        }
      });
    });
    observer.observe(el);
    return () => {
      if (frameId != null) cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, []);

  const laneCeiling = useMemo(() => getLaneCeiling(containerWidth), [containerWidth]);

  const { timelineRanges, slotByHour, rangeCounts } = useMemo(() => {
    const slots = buildHourSlots(appointments, laneCeiling);
    const ranges = buildTimelineRanges();
    const byHour = new Map<number, HourSlot>(slots.map((slot) => [slot.hour, slot]));
    const counts = new Map<string, number>();

    ranges.forEach((range) => {
      let count = 0;
      for (let h = range.h0; h <= range.h1; h++) {
        count += byHour.get(h)?.blocks.length ?? 0;
      }
      counts.set(rangeKey(range.kind, range.h0, range.h1), count);
    });

    return {
      timelineRanges: ranges,
      slotByHour: byHour,
      rangeCounts: counts,
    };
  }, [appointments, laneCeiling]);

  useEffect(() => {
    setExpandedRanges(new Set());
    setTableHour(null);
    onAppointmentCountChange?.(null);
  }, [isoDate, onAppointmentCountChange]);

  useEffect(() => {
    onAppointmentCountChange?.(isLoading ? null : appointments.length);
  }, [appointments, isLoading, onAppointmentCountChange]);

  const handleBlockClick = useCallback((appointment: Appointment) => {
    if (appointment?.patient?.uuid) {
      launchWorkspace2(appointmentsFormWorkspace, { patientUuid: appointment.patient.uuid, appointment });
    }
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

  const renderHourRange = useCallback(
    (h0: number, h1: number, prefix: string, filterEmpty = false) => {
      const rows: Array<React.ReactNode> = [];
      for (let hour = h0; hour <= h1; hour++) {
        const slot = slotByHour.get(hour);
        if (slot) {
          if (filterEmpty && slot.allAppointments.length === 0) {
            continue;
          }
          rows.push(
            <HourRow
              key={hour}
              slot={slot}
              onBlockClick={handleBlockClick}
              onOpenTable={handleOpenTable}
              serviceColorMap={serviceColorMap}
            />,
          );
        }
      }
      return rows;
    },
    [slotByHour, handleBlockClick, handleOpenTable, serviceColorMap],
  );

  if (isLoading) {
    return (
      <div className={styles.container}>
        <InlineLoading description={t('loadingAppointments', 'Loading appointments…')} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <InlineNotification
          kind="error"
          lowContrast
          title={t('errorLoadingAppointments', 'Error loading appointments')}
          subtitle={error.message}
        />
      </div>
    );
  }

  const tableAppointments = tableHour != null ? (slotByHour.get(tableHour)?.allAppointments ?? []) : [];
  const hourRangeLabel =
    tableHour != null ? `${formatHourLabel(tableHour)} – ${formatHourLabel((tableHour + 1) % 24)}` : '';

  return (
    <div ref={containerRef} className={styles.container} data-testid="daily-calendar">
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
              {t('appointmentsForHour', '{{count}} appointment · {{hourRange}}', {
                count: tableAppointments.length,
                defaultValue_other: '{{count}} appointments · {{hourRange}}',
                hourRange: hourRangeLabel,
              })}
            </span>
          </div>
          <AppointmentsTable appointments={tableAppointments} isLoading={isLoading} noPadding />
        </div>
      ) : (
        <div className={styles.dayBody} role="list">
          {appointments.length === 0 && (
            <div className={styles.emptyStateBanner} data-testid="daily-empty-state">
              <p className={styles.emptyStateText}>
                {t('noAppointmentsScheduledForDate', 'No appointments scheduled for this date')}
              </p>
            </div>
          )}
          {timelineRanges.map((range) => {
            const key = rangeKey(range.kind, range.h0, range.h1);
            const count = rangeCounts.get(key) ?? 0;
            const isLive = range.kind === 'live';
            const isToggled = expandedRanges.has(key);

            const isDefaultExpanded = isLive;
            const isExpanded = isDefaultExpanded ? !isToggled : isToggled;

            if (isExpanded) {
              const filterEmpty = isLive && count > 0;
              return (
                <React.Fragment key={key}>
                  <CollapsedBar range={range} onToggle={() => toggleRange(key)} expanded count={count} />
                  {renderHourRange(range.h0, range.h1, isLive ? 'live' : 'expanded', filterEmpty)}
                </React.Fragment>
              );
            }

            return <CollapsedBar key={key} range={range} onToggle={() => toggleRange(key)} count={count} />;
          })}
        </div>
      )}
    </div>
  );
};

export default DailyCalendarView;
