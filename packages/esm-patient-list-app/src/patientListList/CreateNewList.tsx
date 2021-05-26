import Button from 'carbon-components-react/lib/components/Button';
import MultiSelect from 'carbon-components-react/lib/components/MultiSelect';
import TextArea from 'carbon-components-react/lib/components/TextArea';
import TextInput from 'carbon-components-react/lib/components/TextInput';
import React from 'react';

import { createPatientList } from '../patientListData';
import { PATIENT_LIST_TYPE } from '../patientListData/types';
import Overlay from '../Overlay';
import { useTranslation } from 'react-i18next';

const items = [
  {
    id: 'age',
    text: 'Age',
  },
  {
    id: 'gender',
    text: 'Gender',
  },
  {
    id: 'phone-number',
    text: 'Phone number',
  },
];

const CreateNewList: React.FC<{ close: () => void; finished: () => void }> = ({ close, finished }) => {
  const { t } = useTranslation();
  const nameInputRef = React.useRef<HTMLInputElement>();
  const decriptionInputRef = React.useRef<HTMLTextAreaElement>();

  const createPL = React.useCallback(() => {
    // set loading
    createPatientList(nameInputRef.current.value, decriptionInputRef.current.value, PATIENT_LIST_TYPE.USER).then(() => {
      finished();
      close();
    });
  }, [finished, close]);

  return (
    <Overlay header={t('newPatientListHeader', 'New patient list')} close={close}>
      <h2>Configure your patient list using the fields below</h2>
      <TextInput labelText={t('newPatientListNameLabel', 'List name')} id="list_name" ref={nameInputRef} />
      <TextArea
        ref={decriptionInputRef}
        labelText={t('newPatientListDescriptionLabel', 'Describe the purpose of this list in a few words')}
      />
      <br />
      <MultiSelect
        id="select"
        label={t('newPatientListSeceltLabel', 'Chose which information to include in the list')}
        items={items}
        itemToString={(item) => (item ? item.text : '')}
        onChange={() => {}}
      />
      <div>
        <Button onClick={close}>Cancel</Button>
        <Button onClick={createPL}>Save</Button>
      </div>
    </Overlay>
  );
};

export default CreateNewList;
