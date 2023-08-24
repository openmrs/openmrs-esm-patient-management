import React from 'react';
import { SWRConfig } from 'swr';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AppointmentsTable from './queue-patient-linelists/scheduled-appointments-table.component';
import Home from './home.component';
import ServicesTable from './queue-patient-linelists/queue-services-table.component';
import QueueScreen from './queue-screen/queue-screen.component';

const swrConfiguration = {
  errorRetryCount: 3,
};

const Root: React.FC = () => {
  return (
    <main>
      <SWRConfig value={swrConfiguration}>
        <BrowserRouter basename={window.getOpenmrsSpaBase()}>
          <Routes>
            <Route path="home/service-queues" element={<Home />} />
            <Route path="home/service-queues/screen" element={<QueueScreen />} />
            <Route path="home/service-queues/appointments-list/:value/" element={<AppointmentsTable />} />
            <Route path="home/service-queues/queue-list/:value/" element={<ServicesTable />} />
          </Routes>
        </BrowserRouter>
      </SWRConfig>
    </main>
  );
};

export default Root;
