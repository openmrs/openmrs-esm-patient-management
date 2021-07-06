import React from 'react';
import Search from 'carbon-components-react/lib/components/Search';
import ButtonSet from 'carbon-components-react/lib/components/ButtonSet';
import Button from 'carbon-components-react/lib/components/Button';
import { useTranslation } from 'react-i18next';

import { OpenmrsCohort } from '../patientListData/api';

const CheckboxedPatientList: React.FC<{
  patientListList: Array<OpenmrsCohort>;
  selectedPatientListList: Array<string>;
  setSelectedPatientListList: (value: Array<string>) => void;
}> = () => {
  return <div></div>;
};

/**
 * layout grid
 *
 * header | close
 * search
 * ListList
 * spacer
 * buttons
 *
 *
 */

const AddPatient: React.FC<{ close: () => void; patientUuid: string }> = ({ close, patientUuid }) => {
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = React.useState('');

  return (
    <div>
      <h1>{t('add_patient_to_list', 'Add patient to list')}</h1>
      <h3>{t('add_patient_to_list', 'Add patient to list')}</h3>
      <Search
        style={{ backgroundColor: 'white', borderBottomColor: '#e0e0e0' }}
        labelText={t('search_for_list', 'Search for a list')}
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
      <div>
        {
          // list of five patients list here
        }
      </div>
      <ButtonSet>
        <Button>Create new patient list</Button>
        <Button onClick={close}>Cancel</Button>
        <Button>Add to list</Button>
      </ButtonSet>
    </div>
  );
};

export default AddPatient;
