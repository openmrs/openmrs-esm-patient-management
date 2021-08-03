import React from 'react';
import Overlay from '../Overlay';
import { useTranslation } from 'react-i18next';
import { useGetAllPatientListMembersQuery } from '../patientListData';
import { useSessionUser } from '@openmrs/esm-framework';

export interface PatientListMembersOverlayProps {
  close: () => void;
  listUuid: string;
}

const PatientListMembersOverlay: React.FC<PatientListMembersOverlayProps> = ({ close, listUuid }) => {
  const userId = useSessionUser()?.user.uuid;
  const { data } = useGetAllPatientListMembersQuery(userId, listUuid);
  const { t } = useTranslation();

  return (
    <Overlay close={close} header={t('patientListHeader', 'patient list')}>
      <p>{listUuid}</p>
      <ul>{data && data.map((item) => <li key={item.id}>{item.id}</li>)}</ul>
    </Overlay>
  );
};

export default PatientListMembersOverlay;
