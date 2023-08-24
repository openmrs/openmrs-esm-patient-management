import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import PatientListList from './patient-list-list/patient-list-list.component';
import PatientListDetailComponent from './patient-list-detail/patient-list-detail.component';

const RootComponent: React.FC = () => {
  return (
    <BrowserRouter basename={window.getOpenmrsSpaBase()}>
      <Routes>
        <Route path="home/patient-lists" element={<PatientListList />} />
        <Route path="home/patient-lists/:patientListUuid" element={<PatientListDetailComponent />} />
      </Routes>
    </BrowserRouter>
  );
};

export default RootComponent;
