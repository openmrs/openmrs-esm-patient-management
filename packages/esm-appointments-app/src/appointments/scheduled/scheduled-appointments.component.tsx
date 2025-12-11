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
    if (allowedExtensions && (currentTab === null || (currentTab !== 'all' && !allowedExtensions[currentTab]))) {
      setCurrentTab('all');
    }
  }, [allowedExtensions, currentTab]);

  const panelsToShow = scheduledAppointmentPanels.filter(shouldShowPanel);

  // Build dropdown items
  const statusDropdownItems = [
    {
      id: 'all',
      name: 'all',
      display: t('all', 'All'),
    },
    ...panelsToShow.map((panel) => ({
      id: panel.name,
      name: panel.name,
      display: t(panel.config.title),
    })),
  ];

  const selectedStatusItem =
    statusDropdownItems.find((item) => item.name === currentTab) || (statusDropdownItems[0] ?? null);

  const handleStatusChange = useCallback(({ selectedItem }: { selectedItem: any }) => {
    if (selectedItem?.name) {
      setCurrentTab(selectedItem.name);
    }
  }, []);

  const firstPanelToShow = panelsToShow[0];

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
            firstPanelToShow={firstPanelToShow}
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
  firstPanelToShow,
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
  firstPanelToShow: ConnectedExtension | undefined;
}) {
  const { t } = useTranslation();
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

  // When "all" is selected, show only the first extension with null status to get all appointments
  const isAllSelected = currentTab === 'all';
  const shouldShowExtension = isAllSelected ? firstPanelToShow?.name === extension.name : currentTab === extension.name;

  return (
    <div
      key={extension.name}
      style={{ display: shouldShowExtension ? 'block' : 'none' }}
      className={styles.extensionWrapper}>
      <Extension
        state={{
          date,
          appointmentServiceTypes,
          status: isAllSelected ? null : extension.config?.status,
          title: isAllSelected ? t('allAppointments', 'All') : extension.config?.title || extension.name,
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
