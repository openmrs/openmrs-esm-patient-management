import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import PatientSearchPageComponent from './patient-search-page/patient-search-page.component';

const PatientSearchRootComponent: React.FC = () => {
  return (
    <BrowserRouter basename={`${window['getOpenmrsSpaBase']()}search`}>
      <Route path="/:query" component={PatientSearchPageComponent} />
    </BrowserRouter>
  );
};

export default PatientSearchRootComponent;
