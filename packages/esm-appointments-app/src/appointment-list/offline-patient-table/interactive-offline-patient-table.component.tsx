import React from 'react';
import OfflinePatientTable from './offline-patient-table.component';

const InteractiveOfflinePatientTable: React.FC = () => {
  return <OfflinePatientTable isInteractive showHeader={false} />;
};

export default InteractiveOfflinePatientTable;
