import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { setLeftNav, unsetLeftNav } from '@openmrs/esm-framework';
import BedAdministrationTable from './bed-administration/bed-administration-table.component';
import BedTagAdministrationTable from './bed-tag/bed-tag-administration-table.component';
import BedTypeAdministrationTable from './bed-type/bed-type-administration-table.component';
import Home from './home.component';
import LeftPanel from './left-panel/left-panel.component';
import WardWithBeds from './ward-with-beds/ward-with-beds.component';
import styles from './root.scss';

const Root: React.FC = () => {
  const spaBasePath = window.spaBase;
  const bedManagementBasename = window.getOpenmrsSpaBase() + 'bed-management';

  useEffect(() => {
    setLeftNav({
      name: 'bed-management-left-panel-slot',
      basePath: spaBasePath,
    });
    return () => unsetLeftNav('bed-management-left-panel-slot');
  }, [spaBasePath]);

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
        </Routes>
      </main>
    </BrowserRouter>
  );
};

export default Root;
