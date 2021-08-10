import React from 'react';
import Overlay from '../overlay.component';
import { useTranslation } from 'react-i18next';
import { useGetAllPatientListMembersQuery } from '../api';
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
    <Overlay close={close} header={t('patientListHeader', 'Patient list')}>
      <p>{listUuid}</p>
      <ul>{data && data.map((item) => <li key={item.id}>{item.id}</li>)}</ul>
    </Overlay>
  );
};

export default PatientListMembersOverlay;
