import React from 'react';
import { useTranslation } from 'react-i18next';
import Overlay from '../Overlay';
import { useSinglePatientListData } from '../patientListData';

const PatientList: React.FC<{ close: () => void; listUuid: string }> = ({ close, listUuid }) => {
  const { data } = useSinglePatientListData(false, listUuid);
  const { t } = useTranslation();

  return (
    <Overlay close={close} header={'patient list'}>
      <p>{listUuid}</p>
      <p>patient list goes here</p>
    </Overlay>
  );
};

export default PatientList;
