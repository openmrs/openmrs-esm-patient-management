import { attach, detach, ExtensionSlot, useExtensionStore, useLayoutType } from '@openmrs/esm-framework';
import React, { useEffect } from 'react';
import PatientQueueHeader from '../appointments-header/appointments-header.component';
import { useNavGroups } from '../side-menu/nav-group/nav-group';
import styles from './appointments-dashboard.scss';

export interface DashboardConfig {
  name: string;
  slot: string;
  title: string;
}

export const AppointmentsDashboard = ({ match }) => {
  const {
    params: { view },
  } = match;
  const layout = useLayoutType();

  const extensionStore = useExtensionStore();
  const { navGroups } = useNavGroups();

  const ungroupedDashboards =
    extensionStore.slots['appointments-dashboard-slot']?.assignedExtensions
      .map((e) => e.meta)
      .filter((e) => Object.keys(e).length) || [];
  const groupedDashboards = navGroups
    .map((slotName) => extensionStore.slots[slotName]?.assignedExtensions.map((e) => e.meta))
    .flat();
  const dashboards = ungroupedDashboards.concat(groupedDashboards) as Array<DashboardConfig>;
  const currentDashboard = dashboards.find((dashboard) => dashboard.name === view) || dashboards[0];

  useEffect(() => {
    if (layout != 'desktop') {
      attach('global-nav-menu-slot', 'appointments-side-nav-ext');
    }
    return () => detach('global-nav-menu-slot', 'appointments-side-nav-ext');
  }, [layout]);

  return (
    <div className={styles.dashboardContainer}>
      {layout === 'desktop' && <ExtensionSlot extensionSlotName="appointments-sidebar-slot" key={layout} />}
      {currentDashboard && (
        <div className={`bx--grid ${styles.dashboardContent}`}>
          <PatientQueueHeader title={currentDashboard.title} />
          <DashboardView
            dashboardSlot={currentDashboard.slot}
            title={currentDashboard.title}
            key={currentDashboard.slot}
          />
        </div>
      )}
    </div>
  );
};

const DashboardView: React.FC<{ dashboardSlot: string; title: string }> = ({ dashboardSlot, title }) => {
  return <ExtensionSlot extensionSlotName={dashboardSlot} state={{ dashboardTitle: title }} />;
};
