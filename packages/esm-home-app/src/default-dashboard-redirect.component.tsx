import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAssignedExtensions, useConfig, useSession } from '@openmrs/esm-framework';
import { type DashboardConfig } from './types/index';
import { type ConfigSchema } from './config-schema';

export function DefaultDashboardRedirect() {
  const assignedExtensions = useAssignedExtensions('homepage-dashboard-slot');
  const { defaultDashboardPerRole } = useConfig<ConfigSchema>();
  const session = useSession();
  const roles = session?.user?.roles;
  const defaultDashboard =
    roles?.map((role) => defaultDashboardPerRole[role.display]).filter(Boolean)[0] ?? 'service-queues';

  const ungroupedDashboards = assignedExtensions.map((e) => e.meta).filter((e) => Object.keys(e).length) || [];
  const dashboards = ungroupedDashboards as Array<DashboardConfig>;
  const activeDashboard = dashboards.find((dashboard) => dashboard.name === defaultDashboard);

  return <Navigate to={`/home/${activeDashboard.name}`} />;
}
