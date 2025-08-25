import React from 'react';
import { BrowserRouter, Route, Routes, useParams } from 'react-router-dom';
import { useLeftNav, WorkspaceContainer } from '@openmrs/esm-framework';
import BedAdministrationTable from './bed-administration/bed-administration-table.component';
import BedTagAdministrationTable from './bed-tag/bed-tag-administration-table.component';
import BedTypeAdministrationTable from './bed-type/bed-type-administration-table.component';
import Home from './home.component';
import LeftPanel from './left-panel/left-panel.component';
import WardWithBeds from './ward-with-beds/ward-with-beds.component';
import styles from './root.scss';

function BedManagementWorkspaceContainer() {
  const { bedId } = useParams();
  return <WorkspaceContainer contextKey={bedId ?? 'default'} />;
}
const Root: React.FC = () => {
  const spaBasePath = window.spaBase;
  const bedManagementBasename = window.getOpenmrsSpaBase() + 'bed-management';

  useLeftNav({ name: 'bed-management-left-panel-slot', basePath: spaBasePath });

  return (
    <BrowserRouter basename={bedManagementBasename}>
      <LeftPanel />
      <main className={styles.container}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/location/:location" element={<WardWithBeds />} />
          <Route path="/bed-administration" element={<BedAdministrationTable />} />
          <Route path="/bed-tags" element={<BedTagAdministrationTable />} />
          <Route path="/bed-types" element={<BedTypeAdministrationTable />} />
          <Route path="/:bedId" element={<BedManagementWorkspaceContainer />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
};

export default Root;
