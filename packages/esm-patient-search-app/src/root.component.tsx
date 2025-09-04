import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { WorkspaceContainer } from '@openmrs/esm-framework';
import PatientSearchPageComponent from './patient-search-page/patient-search-page.component';

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
