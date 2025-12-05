import React, { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import {
  ExtensionSlot,
  Extension,
  useConnectedExtensions,
  type ConnectedExtension,
  useLayoutType,
  isDesktop,
} from '@openmrs/esm-framework';
import { useAppointmentsStore } from '../../store';
import styles from './scheduled-appointments.scss';

dayjs.extend(isSameOrBefore);

type DateType = 'pastDate' | 'today' | 'futureDate';
const scheduledAppointmentsPanelsSlot = 'scheduled-appointments-panels-slot';

const ScheduledAppointments: React.FC<{ appointmentServiceTypes?: Array<string> }> = ({ appointmentServiceTypes }) => {
  const { t } = useTranslation();
  const { selectedDate } = useAppointmentsStore();
  const layout = useLayoutType();
  const responsiveSize = isDesktop(layout) ? 'sm' : 'md';

  const [currentTab, setCurrentTab] = useState<string | null>(null);
  const [dateType, setDateType] = useState<DateType>('today');

  const scheduledAppointmentPanels = useConnectedExtensions(scheduledAppointmentsPanelsSlot);
  const { allowedExtensions, showExtension, hideExtension } = useAllowedExtensions();

  const shouldShowPanel = useCallback(
    (panel: Omit<ConnectedExtension, 'config'>) => allowedExtensions[panel.name] ?? false,
    [allowedExtensions],
  );

  useEffect(() => {
    const dayjsDate = dayjs(selectedDate);
    const now = dayjs();
    if (dayjsDate.isBefore(now, 'date')) setDateType('pastDate');
    else if (dayjsDate.isAfter(now, 'date')) setDateType('futureDate');
    else setDateType('today');
  }, [selectedDate]);

  useEffect(() => {
    if (allowedExtensions && (currentTab === null || !allowedExtensions[currentTab])) {
      for (const ext of Object.keys(allowedExtensions)) {
        if (allowedExtensions[ext]) {
          setCurrentTab(ext);
          break;
        }
      }
    }
  }, [allowedExtensions, currentTab]);

  const panelsToShow = scheduledAppointmentPanels.filter(shouldShowPanel);

  // Build dropdown items
  const statusDropdownItems = panelsToShow.map((panel) => ({
    id: panel.name,
    name: panel.name,
    display: t(panel.config.title),
  }));

  const selectedStatusItem =
    statusDropdownItems.find((item) => item.name === currentTab) || (statusDropdownItems[0] ?? null);

  const handleStatusChange = useCallback(({ selectedItem }: { selectedItem: any }) => {
    if (selectedItem?.name) {
      setCurrentTab(selectedItem.name);
    }
  }, []);

  return (
    <div className={styles.container}>
      <ExtensionSlot name={scheduledAppointmentsPanelsSlot}>
        {(extension) => (
          <ExtensionWrapper
            extension={extension}
            currentTab={currentTab}
            appointmentServiceTypes={appointmentServiceTypes}
            date={selectedDate}
            dateType={dateType}
            showExtensionTab={showExtension}
            hideExtensionTab={hideExtension}
            statusDropdownItems={statusDropdownItems}
            selectedStatusItem={selectedStatusItem}
            onStatusChange={handleStatusChange}
            responsiveSize={responsiveSize}
          />
        )}
      </ExtensionSlot>
    </div>
  );
};

function useAllowedExtensions() {
  const [allowedExtensions, dispatch] = useReducer(
    (state: Record<string, boolean>, action: { type: 'show_extension' | 'hide_extension'; extension: string }) => {
      return { ...state, [action.extension]: action.type === 'show_extension' };
    },
    {},
  );

  return {
    allowedExtensions: allowedExtensions as Readonly<Record<string, boolean>>,
    showExtension: (extension: string) => dispatch({ type: 'show_extension', extension }),
    hideExtension: (extension: string) => dispatch({ type: 'hide_extension', extension }),
  };
}

function ExtensionWrapper({
  extension,
  currentTab,
  appointmentServiceTypes,
  date,
  dateType,
  showExtensionTab,
  hideExtensionTab,
  statusDropdownItems,
  selectedStatusItem,
  onStatusChange,
  responsiveSize,
}: {
  extension: ConnectedExtension;
  currentTab: string | null;
  appointmentServiceTypes: Array<string>;
  date: string;
  dateType: DateType;
  showExtensionTab: (ext: string) => void;
  hideExtensionTab: (ext: string) => void;
  statusDropdownItems: Array<{ id: string; name: string; display: string }>;
  selectedStatusItem: { id: string; name: string; display: string } | null;
  onStatusChange: ({ selectedItem }: { selectedItem: any }) => void;
  responsiveSize: string;
}) {
  const currentConfig = useRef(extension.config);
  const currentDateType = useRef(dateType);

  useEffect(() => {
    const configChanged = !shallowEqual(currentConfig.current, extension.config);
    const dateTypeChanged = currentDateType.current !== dateType;

    // Always evaluate once to populate allowedExtensions so the dropdown is rendered on first load.
    if (configChanged || dateTypeChanged || !currentConfig.current) {
      currentConfig.current = extension.config;
      currentDateType.current = dateType;
    }

    const shouldShow = shouldDisplayExtensionTab(extension.config, dateType);
    shouldShow ? showExtensionTab(extension.name) : hideExtensionTab(extension.name);
  }, [extension, dateType, showExtensionTab, hideExtensionTab]);

  return (
    <div
      key={extension.name}
      style={{ display: currentTab === extension.name ? 'block' : 'none' }}
      className={styles.extensionWrapper}>
      <Extension
        state={{
          date,
          appointmentServiceTypes,
          status: extension.config?.status,
          title: extension.config?.title,
          statusDropdownItems,
          selectedStatusItem,
          onStatusChange,
          responsiveSize,
        }}
      />
    </div>
  );
}

function shouldDisplayExtensionTab(config: any, dateType: DateType): boolean {
  if (!config) return false;
  switch (dateType) {
    case 'futureDate':
      return config.showForFutureDate ?? false;
    case 'pastDate':
      return config.showForPastDate ?? false;
    case 'today':
      return config.showForToday ?? false;
    default:
      return false;
  }
}

function shallowEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((key) => Object.prototype.hasOwnProperty.call(b, key) && a[key] === b[key]);
}

export default ScheduledAppointments;
