import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useConfig, useLeftNav } from '@openmrs/esm-framework';
import DashboardContainer from './dashboard-container/dashboard-container.component';
import { type ConfigSchema } from './config-schema';
import { DefaultDashboardRedirect } from './default-dashboard-redirect.component';

const Root: React.FC = () => {
  const spaBasePath = window.spaBase;
  const { leftNavMode } = useConfig<ConfigSchema>();
  useLeftNav({
    name: 'homepage-dashboard-slot',
    basePath: spaBasePath,
    mode: leftNavMode,
  });

  return (
    <>
      <main className="omrs-main-content">
        <BrowserRouter basename={window.spaBase}>
          <Routes>
            <Route path="/home" element={<DefaultDashboardRedirect />} />
            <Route path="/home/:dashboard/*" element={<DashboardContainer />} />
          </Routes>
        </BrowserRouter>
      </main>
    </>
  );
};

export default Root;
