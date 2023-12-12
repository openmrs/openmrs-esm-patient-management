import React, { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ContentSwitcher, Switch } from '@carbon/react';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import {
  ExtensionSlot,
  Extension,
  useConnectedExtensions,
  type ConnectedExtension,
  type ConfigObject,
} from '@openmrs/esm-framework';
import { useAppointmentDate } from '../../helpers';
import styles from './scheduled-appointments.scss';

dayjs.extend(isSameOrBefore);

interface ScheduledAppointmentsProps {
  visits: Array<any>;
  isLoading: boolean;
  appointmentServiceType?: string;
}

type DateType = 'pastDate' | 'today' | 'futureDate';

const scheduledAppointmentsPanelsSlot = 'scheduled-appointments-panels-slot';

const ScheduledAppointments: React.FC<ScheduledAppointmentsProps> = ({ visits, appointmentServiceType }) => {
  const { t } = useTranslation();
  const { currentAppointmentDate: date } = useAppointmentDate();

  // added to prevent auto-removal of translations for dynamic keys
  // t('checkedIn', 'Checked In');
  // t('expected', 'Expected');

  const [currentTab, setCurrentTab] = useState<string>(null);
  const [dateType, setDateType] = useState<DateType>('today');
  const scheduledAppointmentPanels = useConnectedExtensions(scheduledAppointmentsPanelsSlot);
  const { allowedExtensions, showExtension, hideExtension } = useAllowedExtensions();
  const shouldShowPanel = useCallback(
    (panel: Omit<ConnectedExtension, 'config'>) => allowedExtensions[panel.name] ?? false,
    [allowedExtensions],
  );

  useEffect(() => {
    const dayjsDate = dayjs(date);
    const now = dayjs();
    if (dayjsDate.isBefore(now, 'date')) {
      setDateType('pastDate');
    } else if (dayjsDate.isAfter(now, 'date')) {
      setDateType('futureDate');
    } else {
      setDateType('today');
    }
  }, [date]);

  useEffect(() => {
    // This is intended to cover two things:
    //  1. If no current tab is set, set it to the first allowed tab
    //  2. If a current tab is set, but the tab is no longer allowed in this context, set it to the
    //     first allowed tab
    if (allowedExtensions && (currentTab === null || !allowedExtensions[currentTab])) {
      for (const extension of Object.getOwnPropertyNames(allowedExtensions)) {
        if (allowedExtensions[extension]) {
          setCurrentTab(extension);
          break;
        }
      }
    }
  }, [allowedExtensions, currentTab]);

  const panelsToShow = scheduledAppointmentPanels.filter(shouldShowPanel);

  return (
    <>
      <ContentSwitcher
        className={styles.switcher}
        size="sm"
        onChange={({ name }) => setCurrentTab(name)}
        selectedIndex={panelsToShow.findIndex((panel) => panel.name == currentTab) ?? 0}
        selectionMode="manual">
        {panelsToShow.map((panel) => {
          return <Switch key={`panel-${panel.name}`} name={panel.name} text={t(panel.config.title)} />;
        })}
      </ContentSwitcher>

      <ExtensionSlot name={scheduledAppointmentsPanelsSlot}>
        {(extension) => {
          return (
            <ExtensionWrapper
              extension={extension}
              currentTab={currentTab}
              appointmentServiceType={appointmentServiceType}
              date={date}
              dateType={dateType}
              showExtensionTab={showExtension}
              hideExtensionTab={hideExtension}
            />
          );
        }}
      </ExtensionSlot>
    </>
  );
};

function useAllowedExtensions() {
  const [allowedExtensions, dispatch] = useReducer(
    (state: Record<string, boolean>, action: { type: 'show_extension' | 'hide_extension'; extension: string }) => {
      let addedState = {} as Record<string, boolean>;
      switch (action.type) {
        case 'show_extension':
          addedState[action.extension] = true;
          break;
        case 'hide_extension':
          addedState[action.extension] = false;
          break;
      }

      return { ...state, ...addedState };
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
  appointmentServiceType,
  date,
  dateType,
  showExtensionTab,
  hideExtensionTab,
}: {
  extension: ConnectedExtension;
  currentTab: string;
  appointmentServiceType: string;
  date: string;
  dateType: DateType;
  showExtensionTab: (extension: string) => void;
  hideExtensionTab: (extension: string) => void;
}) {
  const currentConfig = useRef(null);
  const currentDateType = useRef(dateType);

  // This use effect hook controls whether the tab for this extension should render
  useEffect(() => {
    if (
      currentConfig.current === null ||
      (currentConfig.current !== null && !shallowEqual(currentConfig.current, extension.config)) ||
      currentDateType.current !== dateType
    ) {
      currentConfig.current = extension.config;
      currentDateType.current = dateType;
      shouldDisplayExtensionTab(extension?.config, dateType)
        ? showExtensionTab(extension.name)
        : hideExtensionTab(extension.name);
    }
  }, [extension, dateType, showExtensionTab, hideExtensionTab]);

  return (
    <div
      key={extension.name}
      className={styles.container}
      style={{ display: currentTab === extension.name ? 'block' : 'none' }}>
      <Extension
        state={{
          date,
          appointmentServiceType,
          status: extension.config?.status,
          title: extension.config?.title,
        }}
      />
    </div>
  );
}

function shouldDisplayExtensionTab(config: ConfigObject | undefined, dateType: DateType): boolean {
  if (!config) {
    return false;
  }

  switch (dateType) {
    case 'futureDate':
      return config.showForFutureDate ?? false;
    case 'pastDate':
      return config.showForPastDate ?? false;
    case 'today':
      return config.showForToday ?? false;
  }
}

function shallowEqual(objA: object, objB: object) {
  if (Object.is(objA, objB)) {
    return true;
  }

  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
    return false;
  }

  const objAKeys = Object.getOwnPropertyNames(objA);
  const objBKeys = Object.getOwnPropertyNames(objB);

  return objAKeys.length === objBKeys.length && objAKeys.every((key) => objA[key] === objB[key]);
}

export default ScheduledAppointments;
