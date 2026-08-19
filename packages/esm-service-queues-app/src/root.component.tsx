import React from 'react';
import { BrowserRouter, Route, Routes, useParams } from 'react-router-dom';
import { userHasAccess, useSession } from '@openmrs/esm-framework';
import Home from './home.component';
import QueueScreen from './queue-screen/queue-screen.component';
import QueueTableByStatusView from './views/queue-table-by-status-view.component';
import AdminPage from './admin/admin-page/admin-page.component';
import ClinicAdministratorHome from './clinic-administrator/clinic-administrator-home.component';
import SwrConfig from './swr-config.component';
import { clinicAdministratorPrivilege } from './constants';

const Root: React.FC = () => {
  const serviceQueuesBasename = window.getOpenmrsSpaBase() + 'home/service-queues';

  return (
    <main>
      <SwrConfig>
        <BrowserRouter basename={serviceQueuesBasename}>
          <Routes>
            <Route path="/" element={<DefaultView />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/waiting-list" element={<Home />} />
            <Route path="/queue-table-by-status/:queueUuid" element={<QueueTableByStatusViewWrapper />} />
            <Route path="/screen" element={<QueueScreen />} />
          </Routes>
        </BrowserRouter>
      </SwrConfig>
    </main>
  );
};

function DefaultView() {
  const session = useSession();

  if (!session?.user) {
    return null;
  }

  return userHasAccess(clinicAdministratorPrivilege, session.user) ? <ClinicAdministratorHome /> : <Home />;
}

function QueueTableByStatusViewWrapper() {
  const { queueUuid } = useParams();
  return <QueueTableByStatusView queueUuid={queueUuid} />;
}

export default Root;
