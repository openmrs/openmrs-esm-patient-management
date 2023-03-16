import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import PatientListList from './patient-list-list/patient-list-list.component';
import PatientListDetailComponent from './patient-list-detail/patient-list-detail.component';

const RootComponent: React.FC = () => {
  return (
    <BrowserRouter basename={`${window.spaBase}/patient-lists`}>
      <Routes>
        <Route path="/" element={<PatientListList />} />
        <Route path="/:patientListUuid/" element={<PatientListDetailComponent />} />
      </Routes>
    </BrowserRouter>
  );
};

export default RootComponent;
