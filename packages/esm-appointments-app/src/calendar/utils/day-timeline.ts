import { type Appointment } from '../../types';
import { formatAMPM } from '../../helpers/functions';

export const HOUR_HEIGHT_PX = 128;
/** Tall enough for the one-line block text (12px line + padding). */
export const MIN_BLOCK_HEIGHT_PX = 26;
const MINUTES_PER_HOUR = 60;
const LABEL_COLUMN_PX = 200;
const SLOT_PADDING_PX = 48;
const SCROLL_GUTTER_PX = 72;

/**
 * Peak concurrency legibility ceiling. The mockup sized this for its 834px
 * canvas (incl. sidebar); the real calendar container is wider, so blocks
 * stay wider here at the same lane count.
 */
export function getLaneCeiling(containerWidthPx: number = 1100, blockWidthPx: number = 110, gapPx: number = 8): number {
  const available = containerWidthPx - LABEL_COLUMN_PX - SLOT_PADDING_PX - SCROLL_GUTTER_PX;
  return Math.max(1, Math.floor((available + gapPx) / (blockWidthPx + gapPx)));
}

export function appointmentDuration(appointment: Appointment): number {
  if (appointment.startDateTime != null && appointment.endDateTime != null) {
    const minutes = (appointment.endDateTime - appointment.startDateTime) / 60000;
    if (minutes > 0) return minutes;
  }
  return appointment.service.durationMins ?? 10;
}

export function toMinutes(epochMs: number): number {
  const date = new Date(epochMs);
  return date.getHours() * MINUTES_PER_HOUR + date.getMinutes();
}

/** Greedy lane packing over overlapping clusters (prototype packDayLanes). */
export function packDayLanes(appts: ReadonlyArray<Appointment>): Map<string, { lane: number; lanes: number }> {
  const sorted = appts
    .filter((a) => a.startDateTime != null)
    .map((a) => {
      const s = toMinutes(a.startDateTime);
      return { appointment: a, s, e: s + appointmentDuration(a) };
    })
    .sort((x, y) => x.s - y.s || x.e - y.e);

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

/** Sweep-line peak concurrency; back-to-back (e === next s) never counts as simultaneous. */
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
  /** Top offset in px within the start-hour row. */
  topPx: number;
  /** Block height in px (full duration; may spill past the hour boundary). */
  heightPx: number;
}

export interface HourSlot {
  hour: number;
  blocks: Array<PositionedBlock>;
  peak: number;
  exceedsCeiling: boolean;
}

/**
 * Builds the 24-hour grid. A block renders in its start hour with full-duration
 * height (it may spill across the hour boundary); peak concurrency counts every
 * appointment intersecting the hour (spill-in and spill-out included).
 */
export function buildHourSlots(
  appointments: ReadonlyArray<Appointment>,
  ceiling: number = getLaneCeiling(),
): Array<HourSlot> {
  const withTime = appointments
    .filter((a) => a.startDateTime != null)
    .map((a) => {
      const s = toMinutes(a.startDateTime);
      return { appointment: a, s, e: s + appointmentDuration(a) };
    });

  const laneMap = packDayLanes(appointments);

  const slots: Array<HourSlot> = [];
  for (let hour = 0; hour < 24; hour++) {
    const h0 = hour * MINUTES_PER_HOUR;
    const h1 = h0 + MINUTES_PER_HOUR;
    const blocks = withTime
      .filter(({ appointment, s }) => Math.floor(s / MINUTES_PER_HOUR) === hour)
      .map(({ appointment, s, e }) => {
        const packed = laneMap.get(appointment.uuid);
        return {
          appointment,
          s,
          e,
          lane: packed?.lane ?? 0,
          lanes: packed?.lanes ?? 1,
          topPx: ((s - hour * MINUTES_PER_HOUR) / MINUTES_PER_HOUR) * HOUR_HEIGHT_PX,
          heightPx: Math.max(MIN_BLOCK_HEIGHT_PX, ((e - s) / MINUTES_PER_HOUR) * HOUR_HEIGHT_PX - 2),
        };
      });
    // short appointments get a minimum height for readability; push same-lane
    // neighbors apart so those min-height blocks never overlap each other
    const byLane = new Map<number, Array<PositionedBlock>>();
    blocks.forEach((block) => {
      const list = byLane.get(block.lane) ?? [];
      list.push(block);
      byLane.set(block.lane, list);
    });
    byLane.forEach((list) => {
      list.sort((a, b) => a.topPx - b.topPx || a.s - b.s);
      let prevBottom = -Infinity;
      list.forEach((block) => {
        if (block.topPx < prevBottom) {
          block.topPx = prevBottom;
        }
        prevBottom = Math.max(prevBottom, block.topPx + block.heightPx);
      });
    });
    const live = withTime.filter(({ s, e }) => s < h1 && e > h0);
    const peak = peakConcurrency(live);
    slots.push({ hour, blocks, peak, exceedsCeiling: peak > ceiling });
  }
  return slots;
}

export type TimelineRangeKind = 'earlier' | 'live' | 'empty' | 'later';

export interface TimelineRange {
  kind: TimelineRangeKind;
  h0: number;
  h1: number;
}

/**
 * Live hours are those touched by an appointment's span (min 30 min, matching
 * the visual block height). Untouched hours collapse into 'earlier'/'later'/
 * 'empty' ranges. An empty day shows clinic hours as live (empty slots).
 */
export function buildTimelineRanges(
  appointments: ReadonlyArray<Appointment>,
  clinicStart: number = 8,
  clinicEnd: number = 17,
): Array<TimelineRange> {
  const live = new Set<number>();
  if (appointments.length) {
    appointments.forEach((a) => {
      if (a.startDateTime == null) return;
      const s = toMinutes(a.startDateTime);
      const endMin = s + Math.max(appointmentDuration(a), 30);
      const lastH = Math.min(23, Math.floor((endMin - 1) / MINUTES_PER_HOUR));
      for (let h = Math.floor(s / MINUTES_PER_HOUR); h <= lastH; h++) live.add(h);
    });
  } else {
    for (let h = clinicStart; h <= clinicEnd; h++) live.add(h);
  }

  const ranges: Array<TimelineRange> = [];
  let h = 0;
  while (h <= 23) {
    const isLive = live.has(h);
    let j = h;
    while (j <= 23 && live.has(j) === isLive) j++;
    if (isLive) {
      ranges.push({ kind: 'live', h0: h, h1: j - 1 });
    } else {
      const kind: TimelineRangeKind = h === 0 ? 'earlier' : j - 1 === 23 ? 'later' : 'empty';
      ranges.push({ kind, h0: h, h1: j - 1 });
    }
    h = j;
  }
  return ranges;
}

/** "9:00 AM – 9:15 AM" */
export function formatTimeRange(sMin: number, eMin: number): string {
  const from = new Date(0, 0, 1, Math.floor(sMin / MINUTES_PER_HOUR), sMin % MINUTES_PER_HOUR);
  const to = new Date(0, 0, 1, Math.floor(eMin / MINUTES_PER_HOUR), eMin % MINUTES_PER_HOUR);
  return `${formatAMPM(from)} – ${formatAMPM(to)}`;
}
