import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAssignedExtensions } from '@openmrs/esm-framework';
import { type DashboardConfig } from './types/index';

export function DefaultDashboardRedirect() {
  const params = useParams();
  const assignedExtensions = useAssignedExtensions('homepage-dashboard-slot');

  const ungroupedDashboards = assignedExtensions.map((e) => e.meta).filter((e) => Object.keys(e).length) || [];
  const dashboards = ungroupedDashboards as Array<DashboardConfig>;
  const activeDashboard = dashboards.find((dashboard) => dashboard.name === params?.dashboard) || dashboards[0];

  return <Navigate to={`/home/${activeDashboard.name}`} />;
}
