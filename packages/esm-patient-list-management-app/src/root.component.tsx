import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ListDetails from './list-details/list-details.component';
import ListsDashboard from './lists-dashboard/lists-dashboard.component';

const RootComponent: React.FC = () => {
  const patientListsBasename = window.getOpenmrsSpaBase() + 'home/patient-lists';

  return (
    <BrowserRouter basename={patientListsBasename}>
      <Routes>
        <Route path="/" element={<ListsDashboard />} />
        <Route path="/:patientListUuid" element={<ListDetails />} />
      </Routes>
    </BrowserRouter>
  );
};

export default RootComponent;
