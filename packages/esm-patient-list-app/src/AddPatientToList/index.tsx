import React from 'react';
import Search from 'carbon-components-react/lib/components/Search';
import ButtonSet from 'carbon-components-react/lib/components/ButtonSet';
import Button from 'carbon-components-react/lib/components/Button';
import { useTranslation } from 'react-i18next';
import styles from './add-patient-to-list.scss';

import { OpenmrsCohort } from '../patientListData/api';

const CheckboxedPatientList: React.FC<{
  patientListList: Array<OpenmrsCohort>;
  selectedPatientListList: Array<string>;
  setSelectedPatientListList: (value: Array<string>) => void;
}> = () => {
  return <div></div>;
};

const AddPatient: React.FC<{ close: () => void; patientUuid: string }> = ({ close, patientUuid }) => {
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = React.useState('');

  return (
    <div className={styles.modalContent}>
      <div className={styles.modalHeader}>
        <h1 className={styles.productiveHeading03}>{t('addPatientToList', 'Add patient to list')}</h1>
        <h3 className={styles.bodyLong01} style={{ margin: '1rem 0' }}>
          {t('searchForAListToAddThisPatientTo', 'Search for a list to add this patient to.')}
        </h3>
      </div>
      <div style={{ marginBottom: '0.875rem' }}>
        <Search
          style={{ backgroundColor: 'white', borderBottom: '1px solid #e0e0e0' }}
          labelText={t('searchForList', 'Search for a list')}
          onChange={({ target }) => {
            setSearchValue(target.value);
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              // trigger search or search on typing?
            }
          }}
          value={searchValue}
        />
      </div>
      <div className={styles.buttonSet}>
        <Button kind="ghost">Create new patient list</Button>
        <div>
          <Button kind="secondary" className={styles.largeButtons} onClick={close}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button className={styles.largeButtons}>{t('addToList', 'Add to list')}</Button>
        </div>
      </div>
    </div>
  );
};

export default AddPatient;
