import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ContentSwitcher, Switch } from '@carbon/react';
import { useAppointmentDate } from '../../helpers';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isSameOrBefore);
import styles from './scheduled-appointments.scss';
import { ExtensionSlot, Extension, useConnectedExtensions } from '@openmrs/esm-framework';

interface ScheduledAppointmentsProps {
  visits: Array<any>;
  isLoading: boolean;
  appointmentServiceType?: string;
}

type DateType = 'pastDate' | 'today' | 'futureDate';

const ScheduledAppointments: React.FC<ScheduledAppointmentsProps> = ({ visits, appointmentServiceType }) => {
  const scheduledAppointmentsPanelsSlot = 'scheduled-appointments-panels-slot';

  const { t } = useTranslation();
  const { currentAppointmentDate: date } = useAppointmentDate();

  const [currentTab, setCurrentTab] = useState<string>(null);
  const [dateType, setDateType] = useState<DateType>('today');
  const scheduledAppointmentPanels = useConnectedExtensions(scheduledAppointmentsPanelsSlot);

  const isDateInPast = dayjs(date).isBefore(dayjs(), 'date');
  const isDateInFuture = dayjs(date).isAfter(dayjs(), 'date');
  const isToday = dayjs(date).isSame(dayjs(), 'date');

  useEffect(() => {
    if (dayjs(date).isBefore(dayjs(), 'date')) {
      setDateType('pastDate');
    } else if (dayjs(date).isAfter(dayjs(), 'date')) {
      setDateType('futureDate');
    } else {
      setDateType('today');
    }
  }, [date]);

  // set the default tab on first render
  useEffect(() => {
    if (!currentTab) {
      setCurrentTab(getDefaultTab(scheduledAppointmentPanels));
    }
  }, [scheduledAppointmentPanels]);

  // set the default tab whenever the date type changes
  useEffect(() => {
    setCurrentTab(getDefaultTab(scheduledAppointmentPanels));
  }, [dateType]);

  const getDefaultTab = (panels) => {
    return panels?.find(
      (panel) =>
        (isDateInPast && panel.meta.showForPastDate) ||
        (isToday && panel.meta.showForToday) ||
        (isDateInFuture && panel.meta.showForFutureDate),
    )?.meta.title;
  };

  return (
    <>
      {dateType === 'today' && (
        <ContentSwitcher className={styles.switcher} size="sm" onChange={({ name }) => setCurrentTab(name)}>
          {scheduledAppointmentPanels.map((panel) => {
            return panel.meta.showForToday ? (
              <Switch name={panel.meta.title} text={t(panel.meta.title, panel.meta.title)} />
            ) : (
              <></>
            );
          })}
        </ContentSwitcher>
      )}

      {dateType === 'pastDate' && (
        <ContentSwitcher className={styles.switcher} size="sm" onChange={({ name }) => setCurrentTab(name)}>
          {scheduledAppointmentPanels.map((panel) => {
            return panel.meta.showForPastDate ? (
              <Switch name={panel.meta.title} text={t(panel.meta.title, panel.meta.title)} />
            ) : (
              <></>
            );
          })}
        </ContentSwitcher>
      )}

      {dateType === 'futureDate' && (
        <ContentSwitcher className={styles.switcher} size="sm" onChange={({ name }) => setCurrentTab(name)}>
          {scheduledAppointmentPanels.map((panel) => {
            return panel.meta.showForFutureDate ? (
              <Switch name={panel.meta.title} text={t(panel.meta.title, panel.meta.title)} />
            ) : (
              <></>
            );
          })}
        </ContentSwitcher>
      )}

      <ExtensionSlot name={scheduledAppointmentsPanelsSlot}>
        {(extension) =>
          extension.meta.title === currentTab && (
            <div className={styles.container}>
              <Extension
                state={{
                  date,
                  appointmentServiceType,
                  status: extension.meta.status,
                  statusText: extension.meta.title,
                }}
              />
            </div>
          )
        }
      </ExtensionSlot>
    </>
  );
};

export default ScheduledAppointments;
