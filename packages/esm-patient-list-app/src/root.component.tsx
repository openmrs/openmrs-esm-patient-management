import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import PatientListList from './patient-list-list/patient-list-list.component';
import PatientListDetailComponent from './patient-list-detail/patient-list-detail.component';

const RootComponent: React.FC = () => {
  return (
    <BrowserRouter basename={`${window.spaBase}/patient-list`}>
      <Route exact path="/" component={PatientListList} />
      <Route exact path="/:patientListUuid/" component={PatientListDetailComponent} />
    </BrowserRouter>
  );
};

export default RootComponent;
