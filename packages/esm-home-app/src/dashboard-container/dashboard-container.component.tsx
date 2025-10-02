import React from 'react';
import { useParams } from 'react-router-dom';
import {
  useLayoutType,
  isDesktop,
  ExtensionSlot,
  WorkspaceContainer,
  useConfig,
  useAssignedExtensions,
  closeWorkspace,
  useWorkspaces,
} from '@openmrs/esm-framework';
import type { DashboardConfig } from '../types/index';
import styles from './dashboard-container.scss';
import classNames from 'classnames';
import { type HomeConfig } from '../config-schema';

export default function DashboardContainer() {
  const params = useParams();
  const layout = useLayoutType();
  const { leftNavMode } = useConfig<HomeConfig>();
  const assignedExtensions = useAssignedExtensions('homepage-dashboard-slot');

  const ungroupedDashboards = assignedExtensions.map((e) => e.meta).filter((e) => Object.keys(e).length) || [];
  const dashboards = ungroupedDashboards as Array<DashboardConfig>;
  const activeDashboard = dashboards.find((dashboard) => dashboard.name === params?.dashboard) || dashboards[0];
  const { workspaces } = useWorkspaces();
  const prevDashboardRef = React.useRef<string | undefined>(params?.dashboard);
  React.useEffect(() => {
    if (prevDashboardRef.current && prevDashboardRef.current !== params?.dashboard) {
      if (Array.isArray(workspaces) && workspaces.length) {
        workspaces.forEach((workspace) => {
          closeWorkspace(workspace.name);
        });
      }
    }
    prevDashboardRef.current = params?.dashboard;
  }, [params?.dashboard, workspaces]);

  return (
    <div className={styles.homePageWrapper}>
      <section
        className={classNames([
          isDesktop(layout) ? styles.dashboardContainer : styles.dashboardContainerTablet,
          leftNavMode == 'normal' ? styles.hasLeftNav : '',
        ])}>
        {isDesktop(layout) && <ExtensionSlot name="home-sidebar-slot" key={layout} />}
        <ExtensionSlot
          className={styles.dashboardView}
          name={activeDashboard?.slot}
          state={{ dashboardTitle: activeDashboard?.name }}
        />
      </section>
      <WorkspaceContainer overlay contextKey="home" />
    </div>
  );
}
