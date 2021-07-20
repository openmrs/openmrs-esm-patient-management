import React from 'react';
import Overlay from '../Overlay';
import { useTranslation } from 'react-i18next';
import { useSinglePatientListData } from '../patientListData';

export interface PatientListProps {
  close: () => void;
  listUuid: string;
}

const PatientList: React.FC<PatientListProps> = ({ close, listUuid }) => {
  const { data } = useSinglePatientListData(false, listUuid);
  const { t } = useTranslation();

  return (
    <Overlay close={close} header={t('patientListHeader', 'patient list')}>
      <p>{listUuid}</p>
      <ul>
        {data.map((item) => (
          <li key={item.patientUuid}>{item.patientUuid}</li>
        ))}
      </ul>
    </Overlay>
  );
};

export default PatientList;
