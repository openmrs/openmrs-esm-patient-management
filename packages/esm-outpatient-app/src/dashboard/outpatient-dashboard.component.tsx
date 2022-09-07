import { attach, detach, ExtensionSlot, useExtensionStore, useLayoutType, isDesktop } from '@openmrs/esm-framework';
import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PatientQueueHeader from '../patient-queue-header/patient-queue-header.component';
import { useNavGroups } from '../side-menu/nav-group/nav-group';
import styles from './outpatient-dashboard.scss';

export interface DashboardConfig {
  name: string;
  slot: string;
  title: string;
}

export const OutpatientDashboard = () => {
  const { view } = useParams();
  const layout = useLayoutType();
  const navigate = useNavigate();
  const extensionStore = useExtensionStore();
  const { navGroups } = useNavGroups();

  const ungroupedDashboards =
    extensionStore.slots['outpatient-dashboard-slot']?.assignedExtensions
      .map((e) => e.meta)
      .filter((e) => Object.keys(e).length) || [];
  const groupedDashboards = navGroups
    .map((slotName) => extensionStore.slots[slotName]?.assignedExtensions.map((e) => e.meta))
    .flat();
  const dashboards = ungroupedDashboards.concat(groupedDashboards) as Array<DashboardConfig>;
  const currentDashboard = useMemo(() => dashboards.find((dashboard) => dashboard.name === view), [dashboards, view]);

  useEffect(() => {
    if (!currentDashboard) {
      // redirect to the home dashboard
      return navigate('/home');
    }
  }, [currentDashboard, navigate]);

  useEffect(() => {
    if (!isDesktop(layout)) {
      attach('global-nav-menu-slot', 'outpatient-side-nav-ext');
    }
    return () => detach('global-nav-menu-slot', 'outpatient-side-nav-ext');
  }, [layout]);

  return (
    <div className={styles.dashboardContainer}>
      {isDesktop(layout) && <ExtensionSlot extensionSlotName="outpatient-sidebar-slot" key={layout} />}
      {currentDashboard && (
        <div className={`cds--grid ${styles.dashboardContent}`}>
          <PatientQueueHeader title={currentDashboard.title} />
          <ExtensionSlot extensionSlotName={currentDashboard.slot} />
        </div>
      )}
    </div>
  );
};
