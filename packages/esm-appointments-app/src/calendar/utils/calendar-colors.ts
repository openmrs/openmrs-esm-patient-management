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
 * Generates a fallback HSL color for a service UUID when the handpicked color palette is exhausted.
 *
 * @param serviceUuid - The service UUID string to hash.
 * @returns An HSL color string formatted as `hsl(hue, 65%, 42%)`.
 */
export function getFallbackServiceColor(serviceUuid: string): string {
  let hash = 0;
  for (let i = 0; i < serviceUuid.length; i++) {
    hash = (hash << 5) - hash + serviceUuid.charCodeAt(i);
    hash |= 0;
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, 42%)`;
}

/*
 * If the list of services exceeds the palette size, it falls back to a hash-derived HSL color.
 *
 * @param services - Ordered list of service objects containing at least a uuid.
 * @returns A Map mapping service UUID to hex/HSL color string.
 */
export function buildServiceColorMap(services: ReadonlyArray<{ uuid: string }>): Map<string, string> {
  const map = new Map<string, string>();
  services.forEach(({ uuid }, index) => {
    if (index < SERVICE_COLOR_PALETTE.length) {
      map.set(uuid, SERVICE_COLOR_PALETTE[index]);
    } else {
      map.set(uuid, getFallbackServiceColor(uuid));
    }
  });
  return map;
}

/** Accent + background color pairs per service, matching the design mockup. */
const SERVICE_COLOR_PAIRS: ReadonlyArray<Readonly<{ color: string; bg: string }>> = [
  { color: '#009ce5', bg: '#e2f2fb' },
  { color: '#7db344', bg: '#eef5e4' },
  { color: '#9e6aae', bg: '#f2ecf4' },
  { color: '#f4900f', bg: '#fdf0e0' },
] as const;

function serviceColorIndex(serviceName: string): number {
  let hash = 0;
  for (let i = 0; i < serviceName.length; i++) {
    hash = (hash << 5) - hash + serviceName.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % SERVICE_COLOR_PAIRS.length;
}

export function getServiceColor(serviceName: string): string {
  return SERVICE_COLOR_PAIRS[serviceColorIndex(serviceName)].color;
}

export function getServiceBackgroundColor(serviceName: string): string {
  return SERVICE_COLOR_PAIRS[serviceColorIndex(serviceName)].bg;
}

export const CALENDAR_HOURS: ReadonlyArray<number> = Array.from({ length: 24 }, (_, i) => i) as ReadonlyArray<number>;

export function formatHourLabel(hour: number): string {
  const h = hour % 24;
  const h12 = h % 12 || 12;
  const period = h < 12 ? 'AM' : 'PM';
  return `${h12} ${period}`;
}
