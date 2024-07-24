import React, { useMemo } from 'react';
import last from 'lodash-es/last';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { ConfigurableLink } from '@openmrs/esm-framework';

export interface LinkConfig {
  name: string;
  title: string;
}

function LinkExtension({ config }: { config: LinkConfig }) {
  const { name, title } = config;
  const location = useLocation();

  let urlSegment = useMemo(() => decodeURIComponent(last(location.pathname.split('/'))), [location.pathname]);

  const isUUID = (value) => {
    const regex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;
    return regex.test(value);
  };

  if (isUUID(urlSegment)) {
    urlSegment = 'summary';
  }

  return (
    <ConfigurableLink
      to={`${window.getOpenmrsSpaBase()}bed-management${name && name !== 'bed-management' ? `/${name}` : ''}`}
      className={`cds--side-nav__link ${name === urlSegment && 'active-left-nav-link'}`}>
      {title}
    </ConfigurableLink>
  );
}

export const createLeftPanelLink = (config: LinkConfig) => () => (
  <BrowserRouter>
    <LinkExtension config={config} />
  </BrowserRouter>
);
