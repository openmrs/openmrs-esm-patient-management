import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import PatientListList from './patient-list-list/patient-list-list.component';
import PatientListDetails from './patient-list/patient-list-detail.component';

const PatientList: React.FC<{}> = () => {
  return (
    <BrowserRouter basename={`${window.spaBase}/patient-list`}>
      <Route exact path="/" component={PatientListList} />
      <Route exact path="/:patientListUuid" component={PatientListDetails} />
    </BrowserRouter>
  );
};

export default PatientList;
