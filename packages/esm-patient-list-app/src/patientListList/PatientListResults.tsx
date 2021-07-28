import { useSessionUser } from '@openmrs/esm-framework';
import React, { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { usePatientListData } from '../patientListData';
import PatientListTable from './PatientListTable';

interface PatientListResultsProps {
  nameFilter?: string;
  setListStarred: (listUuid: string, star: boolean) => void;
  style?: CSSProperties;
  enter: Object;
  openPatientList: (uuid: string) => void;
}

const PatientListResults: React.FC<PatientListResultsProps> = ({
  nameFilter,
  setListStarred,
  style,
  enter,
  openPatientList,
}) => {
  const { t } = useTranslation();
  const [filter, setFilter] = React.useState<string>();
  const userId = useSessionUser()?.user.uuid;
  const { data, loading } = usePatientListData(userId, { name: filter });

  React.useEffect(() => {
    setFilter(nameFilter);
  }, [enter]);

  return (
    <div style={{ ...style }}>
      <h3 style={{ padding: '1rem' }}>{t('patientListSearchResultHeader', 'Search results')}</h3>
      {data !== undefined && (
        <p style={{ color: '#525252', borderBottom: 'solid 1px #e0e0e0', margin: '0rem 1rem', fontSize: '0.75rem' }}>
          Found {data.length} lists
        </p>
      )}
      <PatientListTable
        loading={loading}
        patientLists={data}
        setListStarred={setListStarred}
        style={{ paddingTop: '0.5rem' }}
        openPatientList={openPatientList}
      />
    </div>
  );
};

export default PatientListResults;
