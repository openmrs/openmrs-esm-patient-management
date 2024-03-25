import React, { useMemo } from 'react';
import classNames from 'classnames';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ConfigurableLink, useConfig } from '@openmrs/esm-framework';
import { Button } from '@carbon/react';
import styles from './root.scss';
export interface DashboardLinkConfig {
  name: string;
  title: string;
  renderIcon: React.ComponentType<any>;
}

function DashboardExtension({ dashboardLinkConfig }: { dashboardLinkConfig: DashboardLinkConfig }) {
  const { t } = useTranslation();
  const { name, title, renderIcon } = dashboardLinkConfig;
  const location = useLocation();
  const spaBasePath = `${window.spaBase}/home`;
  const config = useConfig();

  const navLink = useMemo(() => {
    const pathArray = location.pathname.split('/home');
    const lastElement = pathArray[pathArray.length - 1];
    return decodeURIComponent(lastElement);
  }, [location.pathname]);

  return (
    <div>
      <ConfigurableLink
        className={classNames('cds--side-nav__link', {
          'active-left-nav-link': navLink.match(name),
        })}
        to={`${spaBasePath}/${name}`}>
        {config.showDashboardLinkIcon ? (
          <Button
            className={styles.navlinkIcon}
            hasIconOnly
            size="sm"
            kind="ghost"
            renderIcon={renderIcon}
            iconDescription="Add"
          />
        ) : null}{' '}
        {t('serviceQueues', 'Service queues')}
      </ConfigurableLink>
    </div>
  );
}

export const createDashboardLink = (dashboardLinkConfig: DashboardLinkConfig) => () => (
  <BrowserRouter>
    <DashboardExtension dashboardLinkConfig={dashboardLinkConfig} />
  </BrowserRouter>
);
