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

export interface ServiceColorTheme {
  swatch: string;
  bg: string;
}

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

const themeCache = new Map<string, ServiceColorTheme>();
const assignedServiceIndices = new Map<string, number>();

export function getServiceTheme(serviceUuid?: string, serviceName?: string, serviceColor?: string): ServiceColorTheme {
  const identifier = serviceUuid || serviceName || '';
  const cacheKey = serviceColor ? `${identifier}_${serviceColor}` : identifier;

  if (!cacheKey) {
    return {
      swatch: 'hsl(0, 0%, 45%)',
      bg: 'hsl(0, 0%, 96%)',
    };
  }

  if (themeCache.has(cacheKey)) {
    return themeCache.get(cacheKey)!;
  }

  let theme: ServiceColorTheme;

  if (serviceColor && serviceColor.startsWith('#')) {
    theme = {
      swatch: serviceColor,
      bg: serviceColor + '1a',
    };
  } else {
    if (!assignedServiceIndices.has(identifier)) {
      assignedServiceIndices.set(identifier, assignedServiceIndices.size);
    }
    const serviceIndex = assignedServiceIndices.get(identifier)!;

    if (serviceIndex < SERVICE_COLOR_PALETTE.length) {
      const hexColor = SERVICE_COLOR_PALETTE[serviceIndex];
      theme = {
        swatch: hexColor,
        bg: hexColor + '1a',
      };
    } else {
      let hash = 0;
      for (let i = 0; i < identifier.length; i++) {
        hash = (hash << 5) - hash + identifier.charCodeAt(i);
        hash |= 0;
      }
      const hue = Math.abs(hash) % 360;
      theme = {
        swatch: `hsl(${hue}, 65%, 42%)`,
        bg: `hsl(${hue}, 65%, 96%)`,
      };
    }
  }

  themeCache.set(cacheKey, theme);
  return theme;
}

export function getServiceColor(serviceUuid?: string, serviceName?: string, serviceColor?: string): string {
  return getServiceTheme(serviceUuid, serviceName, serviceColor).swatch;
}

export const CALENDAR_HOURS: ReadonlyArray<number> = Array.from({ length: 24 }, (_, i) => i) as ReadonlyArray<number>;

export function formatHourLabel(hour: number): string {
  const h = hour % 12 || 12;
  const period = hour < 12 ? 'AM' : 'PM';
  return `${h} ${period}`;
}

export interface TimeBlock {
  label: string;
  startHour: number;
  endHour: number;
}

export const TIME_BLOCKS: ReadonlyArray<TimeBlock> = [
  { label: '12 AM – 6 AM', startHour: 0, endHour: 6 },
  { label: '6 AM – 12 PM', startHour: 6, endHour: 12 },
  { label: '12 PM – 6 PM', startHour: 12, endHour: 18 },
  { label: '6 PM – 12 AM', startHour: 18, endHour: 24 },
];
