import { useSessionUser } from '@openmrs/esm-framework';
import React, { CSSProperties, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePatientListDataQuery } from '../api';
import PatientListTable from './patient-list-table.component';

interface PatientListResultsProps {
  nameFilter?: string;
  style?: CSSProperties;
  enter: Object;
  openPatientList: (uuid: string) => void;
}

const PatientListResults: React.FC<PatientListResultsProps> = ({ nameFilter, style, enter, openPatientList }) => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<string>();
  const userId = useSessionUser()?.user.uuid;
  const queryFilter = useMemo(() => ({ name: filter }), [filter]);
  const { data, isFetching, refetch } = usePatientListDataQuery(userId, queryFilter);

  useEffect(() => {
    setFilter(nameFilter);
  }, [enter]);

  return (
    <div style={{ ...style }}>
      <h3 style={{ padding: '1rem' }}>{t('patientListSearchResultHeader', 'Search results')}</h3>
      {data && (
        <p style={{ color: '#525252', borderBottom: 'solid 1px #e0e0e0', margin: '0rem 1rem', fontSize: '0.75rem' }}>
          Found {data.length} lists
        </p>
      )}
      <PatientListTable
        style={{ paddingTop: '0.5rem' }}
        loading={isFetching}
        patientLists={data}
        refetch={refetch}
        openPatientList={openPatientList}
      />
    </div>
  );
};

export default PatientListResults;
