import React from 'react';
import Overlay from '../Overlay';
import { useTranslation } from 'react-i18next';
import { useSinglePatientListData } from '../patientListData';

export interface PatientListMembersOverlayProps {
  close: () => void;
  listUuid: string;
}

const PatientListMembersOverlay: React.FC<PatientListMembersOverlayProps> = ({ close, listUuid }) => {
  const { loading, data } = useSinglePatientListData(listUuid);
  const { t } = useTranslation();

  return (
    <Overlay close={close} header={t('patientListHeader', 'patient list')}>
      <p>{listUuid}</p>
      <ul>{!loading && data && data.map((item) => <li key={item.patientUuid}>{item.patientUuid}</li>)}</ul>
    </Overlay>
  );
};

export default PatientListMembersOverlay;
