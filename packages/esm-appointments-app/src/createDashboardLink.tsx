import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { DashboardExtension, type DashboardExtensionProps } from '@openmrs/esm-framework';

export const createDashboardLink = (config: Omit<DashboardExtensionProps, 'icon'> & { icon?: string }) => () => (
  <BrowserRouter>
    <DashboardExtension path={config.path} title={config.title} basePath={config.basePath} icon={config.icon} />
  </BrowserRouter>
);
