import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import PatientSearchLaunch from './patient-search-icon.component';

const PatientSearchIconWrapper = () => {
  return (
    <BrowserRouter basename={window['getOpenmrsSpaBase']()}>
      <Routes>
        <Route path=":page/*" element={<PatientSearchLaunch />} />
      </Routes>
    </BrowserRouter>
  );
};

export default PatientSearchIconWrapper;
