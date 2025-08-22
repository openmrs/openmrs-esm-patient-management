import React from 'react';
import { BrowserRouter, Route, Routes, useParams } from 'react-router-dom';
import { useConfig, useLeftNav, WorkspaceContainer } from '@openmrs/esm-framework';
import DashboardContainer from './dashboard-container/dashboard-container.component';
import { type HomeConfig } from './config-schema';
import { DefaultDashboardRedirect } from './default-dashboard-redirect.component';
function HomeWorkspaceContainer() {
  const { dashboard } = useParams();
  return <WorkspaceContainer contextKey={dashboard ?? 'default'} />;
}
const Root: React.FC = () => {
  const spaBasePath = window.spaBase;
  const { leftNavMode } = useConfig<HomeConfig>();
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
            <Route
              path="/home/:dashboard/*"
              element={
                <>
                  <DashboardContainer />
                  <HomeWorkspaceContainer />
                </>
              }
            />
          </Routes>
        </BrowserRouter>
      </main>
    </>
  );
};

export default Root;
