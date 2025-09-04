import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import PatientSearchPageComponent from './patient-search-page/patient-search-page.component';
import { WorkspaceContainer } from '@openmrs/esm-framework';

const PatientSearchRootComponent: React.FC = () => {
  return (
    <BrowserRouter basename={window.getOpenmrsSpaBase()}>
      <Routes>
        <Route path="search" element={<PatientSearchPageComponent />} />
      </Routes>
      <WorkspaceContainer contextKey="search" />
    </BrowserRouter>
  );
};

export default PatientSearchRootComponent;
