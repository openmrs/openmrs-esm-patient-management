import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import PatientSearchLaunch from './patient-search-icon.component';

const PatientSearchIconWrapper = () => {
  return (
    <BrowserRouter basename={window['getOpenmrsSpaBase']()}>
      <Route path="/" component={PatientSearchLaunch} />
    </BrowserRouter>
  );
};

export default PatientSearchIconWrapper;
