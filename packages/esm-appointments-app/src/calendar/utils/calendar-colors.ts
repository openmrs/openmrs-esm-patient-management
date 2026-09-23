export type CarbonTagType = 'blue' | 'cyan' | 'green' | 'gray' | 'magenta' | 'purple' | 'red' | 'teal' | 'warm-gray';

export const STATUS_TAG_TYPES: Readonly<Record<string, CarbonTagType>> = {
  Scheduled: 'blue',
  CheckedIn: 'teal',
  Completed: 'green',
  Missed: 'red',
  Cancelled: 'warm-gray',
  Requested: 'magenta',
} as const;

export const DEFAULT_STATUS_TAG_TYPE: CarbonTagType = 'gray';

export const SERVICE_COLOR_PALETTE: ReadonlyArray<string> = [
  '#73A947',
  '#1990DC',
  '#925FA2',
  '#EB8A28',
  '#A11B4C',
  '#EF4B28',
  '#DFBD4B',
  '#197440',
  '#3747A7',
  '#81249B',
  '#CF2255',
  '#E96321',
  '#B9C343',
  '#198A7D',
  '#6E7BC0',
  '#6D4C41',
  '#CC1514',
  '#A993D2',
  '#565656',
  '#DF736A',
  '#F3B83C',
  '#36AC72',
  '#3C79EB',
  '#9D9084',
  '#1ABC9C',
  '#2ECC71',
  '#3498DB',
  '#9B59B6',
  '#34495E',
  '#16A085',
  '#27AE60',
  '#2980B9',
  '#8E44AD',
  '#aaa69d',
  '#C0392B',
  '#D35400',
  '#F39C12',
  '#E74C3C',
  '#E67E22',
  '#F1C40F',
  '#F78FB3',
  '#574B90',
  '#786FA6',
  '#F19066',
  '#F5CD79',
  '#546DE5',
  '#C44569',
  '#63CDDA',
  '#596275',
  '#3DC1D3',
  '#CF6A87',
  '#38ADA9',
  '#079992',
  '#0A3D62',
  '#1E3799',
  '#FA983A',
  '#E55039',
  '#40407A',
  '#B33939',
];

/**
 * Generates a fallback hex color for a service UUID when the handpicked color palette is exhausted.
 *
 * @param serviceUuid - The service UUID string to hash.
 * @returns A hex color string formatted as `#RRGGBB`.
 */
export function getFallbackServiceColor(serviceUuid: string): string {
  let hash = 0;
  for (let i = 0; i < serviceUuid.length; i++) {
    hash = (hash << 5) - hash + serviceUuid.charCodeAt(i);
    hash |= 0;
  }
  const hue = Math.abs(hash) % 360;
  return hslToHex(hue, 65, 42);
}

function hslToHex(h: number, s: number, l: number): string {
  const lFrac = l / 100;
  const a = (s * Math.min(lFrac, 1 - lFrac)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = lFrac - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0')
      .toUpperCase();
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/*
 * If the list of services exceeds the palette size, it falls back to a hash-derived hex color.
 *
 * @param services - Ordered list of service objects containing at least a uuid.
 * @returns A Map mapping service UUID to hex color string.
 */
export function buildServiceColorMap(services: ReadonlyArray<{ uuid: string }>): Map<string, string> {
  const map = new Map<string, string>();
  let paletteIndex = 0;
  for (const { uuid } of services) {
    if (!uuid || map.has(uuid)) {
      continue;
    }
    if (paletteIndex < SERVICE_COLOR_PALETTE.length) {
      map.set(uuid, SERVICE_COLOR_PALETTE[paletteIndex++]);
    } else {
      map.set(uuid, getFallbackServiceColor(uuid));
    }
  }
  return map;
}

export const CALENDAR_HOURS: ReadonlyArray<number> = Array.from({ length: 24 }, (_, i) => i) as ReadonlyArray<number>;

export function formatHourLabel(hour: number): string {
  const h = hour % 12 || 12;
  const period = hour < 12 ? 'AM' : 'PM';
  return `${h} ${period}`;
}
