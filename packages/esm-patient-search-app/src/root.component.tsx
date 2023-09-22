import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import PatientSearchPageComponent from './patient-search-page/patient-search-page.component';

const PatientSearchRootComponent: React.FC = () => {
  return (
    <BrowserRouter basename={window.getOpenmrsSpaBase()}>
      <Routes>
        <Route path="search" element={<PatientSearchPageComponent />} />
      </Routes>
    </BrowserRouter>
  );
};

export default PatientSearchRootComponent;
