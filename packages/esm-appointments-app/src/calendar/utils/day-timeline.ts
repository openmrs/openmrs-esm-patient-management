import dayjs from 'dayjs';
import { type Appointment } from '../../types';
import { formatTime } from '../../helpers/functions';

export const HOUR_HEIGHT_PX = 128;
export const MIN_BLOCK_HEIGHT_PX = 26;
export const ONE_LINE_HEIGHT_THRESHOLD_PX = 44;
export const BLOCK_BOTTOM_GAP_PX = 2;
export const MINUTES_PER_HOUR = 60;
export const DEFAULT_CLINIC_START_HOUR = 8;
export const DEFAULT_CLINIC_END_HOUR = 17;
export const DEFAULT_CONTAINER_WIDTH_PX = 1100;
export const DEFAULT_BLOCK_WIDTH_PX = 110;
export const DEFAULT_GAP_PX = 8;
export const LABEL_COLUMN_PX = 200;
export const SLOT_PADDING_PX = 48;
export const SCROLL_GUTTER_PX = 72;

export function getLaneCeiling(
  containerWidthPx: number = DEFAULT_CONTAINER_WIDTH_PX,
  blockWidthPx: number = DEFAULT_BLOCK_WIDTH_PX,
  gapPx: number = DEFAULT_GAP_PX,
): number {
  const available = containerWidthPx - LABEL_COLUMN_PX - SLOT_PADDING_PX - SCROLL_GUTTER_PX;
  return Math.max(1, Math.floor((available + gapPx) / (blockWidthPx + gapPx)));
}

export function appointmentDuration(appointment: Appointment): number {
  const DEFAULT_DURATION_MINS = 10;
  if (appointment.startDateTime != null && appointment.endDateTime != null) {
    const minutes = (appointment.endDateTime - appointment.startDateTime) / 60000;
    if (minutes > 0) {
      return minutes;
    }
  }
  const serviceDuration = appointment.service?.durationMins;
  if (typeof serviceDuration === 'number' && serviceDuration > 0) {
    return serviceDuration;
  }
  return DEFAULT_DURATION_MINS;
}

export function toMinutes(epochMs: number): number {
  const date = dayjs(epochMs);
  return date.hour() * MINUTES_PER_HOUR + date.minute();
}

export interface AppointmentInterval {
  appointment: Appointment;
  s: number;
  e: number;
}

export function getAppointmentIntervals(appts: ReadonlyArray<Appointment>): Array<AppointmentInterval> {
  return appts
    .filter((a) => a.startDateTime != null)
    .map((a) => {
      const s = toMinutes(a.startDateTime!);
      return { appointment: a, s, e: s + appointmentDuration(a) };
    });
}

export function packDayLanes(
  appts: ReadonlyArray<Appointment> | ReadonlyArray<AppointmentInterval>,
): Map<string, { lane: number; lanes: number }> {
  const intervals: Array<AppointmentInterval> =
    appts.length > 0 && 's' in appts[0]
      ? (appts as Array<AppointmentInterval>)
      : getAppointmentIntervals(appts as ReadonlyArray<Appointment>);

  const sorted = [...intervals].sort((x, y) => x.s - y.s || x.e - y.e);

  const result = new Map<string, { lane: number; lanes: number }>();
  let cluster: Array<{ appointment: Appointment; s: number; e: number }> = [];
  let clusterEnd = -1;

  const close = () => {
    if (!cluster.length) return;
    const laneEnds: Array<number> = [];
    const lanesFor: Array<{ uuid: string; lane: number }> = [];
    cluster.forEach(({ appointment, s, e }) => {
      let lane = laneEnds.findIndex((end) => end <= s);
      if (lane === -1) {
        lane = laneEnds.length;
        laneEnds.push(e);
      } else {
        laneEnds[lane] = e;
      }
      lanesFor.push({ uuid: appointment.uuid, lane });
    });
    lanesFor.forEach(({ uuid, lane }) => result.set(uuid, { lane, lanes: laneEnds.length }));
    cluster = [];
  };

  sorted.forEach((item) => {
    if (cluster.length && item.s >= clusterEnd) {
      close();
      clusterEnd = -1;
    }
    cluster.push(item);
    clusterEnd = Math.max(clusterEnd, item.e);
  });
  close();

  return result;
}

export function peakConcurrency(events: ReadonlyArray<{ s: number; e: number }>): number {
  const edges: Array<[number, number]> = [];
  events.forEach(({ s, e }) => {
    edges.push([s, 1], [e, -1]);
  });
  edges.sort((a, b) => a[0] - b[0] || a[1] - b[1]);

  let run = 0;
  let peak = 0;
  edges.forEach(([, delta]) => {
    run += delta;
    peak = Math.max(peak, run);
  });
  return peak;
}

export interface PositionedBlock {
  appointment: Appointment;
  s: number;
  e: number;
  lane: number;
  lanes: number;
  topPx: number;
  heightPx: number;
  isContinuation?: boolean;
}

export interface HourSlot {
  hour: number;
  blocks: Array<PositionedBlock>;
  allAppointments: Array<Appointment>;
  peak: number;
  exceedsCeiling: boolean;
  minHeightPx: number;
}

export function buildHourSlots(
  appointments: ReadonlyArray<Appointment>,
  ceiling: number = getLaneCeiling(),
): Array<HourSlot> {
  const withTime = getAppointmentIntervals(appointments);
  const laneMap = packDayLanes(withTime);

  const slots: Array<HourSlot> = [];
  for (let hour = 0; hour < 24; hour++) {
    const h0 = hour * MINUTES_PER_HOUR;
    const h1 = h0 + MINUTES_PER_HOUR;
    const blocks = withTime
      .filter(({ s, e }) => s < h1 && e > h0)
      .map(({ appointment, s, e }) => {
        const packed = laneMap.get(appointment.uuid);
        const isContinuation = s < h0;
        const startMin = Math.max(s, h0);
        const endMin = Math.min(e, h1);
        return {
          appointment,
          s,
          e,
          lane: packed?.lane ?? 0,
          lanes: packed?.lanes ?? 1,
          topPx: ((startMin - h0) / MINUTES_PER_HOUR) * HOUR_HEIGHT_PX,
          heightPx: Math.max(
            MIN_BLOCK_HEIGHT_PX,
            ((endMin - startMin) / MINUTES_PER_HOUR) * HOUR_HEIGHT_PX - BLOCK_BOTTOM_GAP_PX,
          ),
          isContinuation,
        };
      });

    const byLane = new Map<number, Array<PositionedBlock>>();
    blocks.forEach((block) => {
      const list = byLane.get(block.lane) ?? [];
      list.push(block);
      byLane.set(block.lane, list);
    });

    let maxBottom = 0;
    byLane.forEach((list) => {
      list.sort((a, b) => a.topPx - b.topPx || a.s - b.s);
      let prevBottom = -Infinity;
      list.forEach((block) => {
        if (block.topPx < prevBottom) {
          block.topPx = prevBottom;
        }
        prevBottom = Math.max(prevBottom, block.topPx + block.heightPx);
        maxBottom = Math.max(maxBottom, prevBottom);
      });
    });

    const minHeightPx = Math.max(HOUR_HEIGHT_PX, Math.ceil(maxBottom));
    const live = withTime.filter(({ s, e }) => s < h1 && e > h0);
    const allAppointments = live.map((x) => x.appointment);
    const peak = peakConcurrency(live);
    slots.push({ hour, blocks, allAppointments, peak, exceedsCeiling: peak > ceiling, minHeightPx });
  }
  return slots;
}

export type TimelineRangeKind = 'earlier' | 'live' | 'empty' | 'later';

export interface TimelineRange {
  kind: TimelineRangeKind;
  h0: number;
  h1: number;
}

export function buildTimelineRanges(
  clinicStart: number = DEFAULT_CLINIC_START_HOUR,
  clinicEnd: number = DEFAULT_CLINIC_END_HOUR,
): Array<TimelineRange> {
  const ranges: Array<TimelineRange> = [];

  if (clinicStart > 0) {
    ranges.push({ kind: 'earlier', h0: 0, h1: clinicStart - 1 });
  }

  ranges.push({ kind: 'live', h0: clinicStart, h1: clinicEnd - 1 });

  if (clinicEnd <= 23) {
    ranges.push({ kind: 'later', h0: clinicEnd, h1: 23 });
  }

  return ranges;
}

/**
 * Formats a time range from start/end minutes-of-day to a localized display string.
 *
 * @param sMin   - Start time in minutes of day (0–1439)
 * @param eMin   - End time in minutes of day (0–1439)
 * @param locale - BCP-47 locale string (defaults to 'en' for backward compatibility)
 */
export function formatTimeRange(sMin: number, eMin: number, locale = 'en'): string {
  const formatMinute = (minute: number): string => {
    const normalized = ((minute % 1440) + 1440) % 1440;
    const d = new Date(0, 0, 1, Math.floor(normalized / MINUTES_PER_HOUR), normalized % MINUTES_PER_HOUR);
    return formatTime(d, locale);
  };
  return `${formatMinute(sMin)} – ${formatMinute(eMin)}`;
}

export function hexToRgba(hex: string, alpha: number): string {
  const match = /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.exec(hex);
  if (!match) {
    return `color-mix(in srgb, ${hex} ${Math.round(alpha * 100)}%, transparent)`;
  }
  const cleanHex = match[1];
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  const r = parseInt(cleanHex[0] + cleanHex[0], 16);
  const g = parseInt(cleanHex[1] + cleanHex[1], 16);
  const b = parseInt(cleanHex[2] + cleanHex[2], 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
