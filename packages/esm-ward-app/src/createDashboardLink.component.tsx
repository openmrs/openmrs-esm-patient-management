import React, { useMemo } from 'react';
import classNames from 'classnames';
import { ConfigurableLink } from '@openmrs/esm-framework';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export interface DashboardLinkConfig {
  name: string;
  title: string;
}

function DashboardExtension({ dashboardLinkConfig }: { dashboardLinkConfig: DashboardLinkConfig }) {
  const { t } = useTranslation();
  const { name } = dashboardLinkConfig;
  const location = useLocation();
  const spaBasePath = `${window.spaBase}`;

  const navLink = decodeURIComponent(location.pathname);

  return (
    <ConfigurableLink
      className={classNames('cds--side-nav__link', {
        'active-left-nav-link': navLink.match(name),
      })}
      to={`${spaBasePath}/${name}`}>
      {t('ward', 'Ward')}
    </ConfigurableLink>
  );
}

export const createDashboardLink = (dashboardLinkConfig: DashboardLinkConfig) => () => (
  <BrowserRouter>
    <DashboardExtension dashboardLinkConfig={dashboardLinkConfig} />
  </BrowserRouter>
);
