import React from 'react';
import Overlay from '../Overlay';
import { useSingePatientListData } from '../patientListData';
import { PatientListBase } from '../patientListData/types';

const PatientList: React.FC<{ close: () => void; listUuid: string }> = ({ close, listUuid }) => {
  const { data } = useSingePatientListData(false, listUuid);

  return (
    <Overlay close={close} header={'patient list'}>
      <p>{listUuid}</p>
      <p>patient list goes here</p>
    </Overlay>
  );
};

export default PatientList;
