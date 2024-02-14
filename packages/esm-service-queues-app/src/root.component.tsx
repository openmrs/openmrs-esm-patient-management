import React from 'react';
import { SWRConfig } from 'swr';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AppointmentsTable from './queue-patient-linelists/scheduled-appointments-table.component';
import Home from './home.component';
import ServicesTable from './queue-patient-linelists/queue-services-table.component';
import QueueScreen from './queue-screen/queue-screen.component';
import { QueueTableByStatus } from './queue-table/queue-table-by-status.component';
import { QueueTableByStatusView } from './views/queue-table-by-status-view.component';

const swrConfiguration = {
  // Maximum number of retries when the backend returns an error
  errorRetryCount: 3,
};

const Root: React.FC = () => {
  const serviceQueuesBasename = window.getOpenmrsSpaBase() + 'home/service-queues';

  return (
    <main>
      <SWRConfig value={swrConfiguration}>
        <BrowserRouter basename={serviceQueuesBasename}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/queue-table-by-status/:queueUuid" element={<QueueTableByStatusView />} />
            <Route path="/queue-table-by-status/:queueUuid/:statusUuid" element={<QueueTableByStatusView />} />
            <Route path="/screen" element={<QueueScreen />} />
            <Route path="/appointments-list/:value/" element={<AppointmentsTable />} />
            <Route path="/queue-list/:service/:serviceUuid/:locationUuid" element={<ServicesTable />} />
          </Routes>
        </BrowserRouter>
      </SWRConfig>
    </main>
  );
};

export default Root;
