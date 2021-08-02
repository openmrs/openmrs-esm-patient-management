import React, { useCallback, useMemo, useRef } from 'react';
import Button from 'carbon-components-react/lib/components/Button';
import MultiSelect from 'carbon-components-react/lib/components/MultiSelect';
import TextArea from 'carbon-components-react/lib/components/TextArea';
import TextInput from 'carbon-components-react/lib/components/TextInput';
import Overlay from '../Overlay';
import { useTranslation } from 'react-i18next';
import { createPatientList } from '../patientListData/api';

interface CreateNewListProps {
  close: () => void;
}

const CreateNewList: React.FC<CreateNewListProps> = ({ close }) => {
  const { t } = useTranslation();
  const nameInputRef = useRef<HTMLInputElement>();
  const decriptionInputRef = useRef<HTMLTextAreaElement>();

  const createPL = useCallback(() => {
    // set loading
    createPatientList({
      name: nameInputRef.current.value,
      description: decriptionInputRef.current.value,
    }).then(close);
  }, [close]);

  const items = useMemo(
    () => [
      {
        id: 'age',
        text: t('age', 'Age'),
      },
      {
        id: 'gender',
        text: t('gender', 'Gender'),
      },
      {
        id: 'phone-number',
        text: t('phoneNumber', 'Phone number'),
      },
    ],
    [t],
  );

  return (
    <Overlay header={t('newPatientListHeader', 'New patient list')} close={close}>
      <h2>{t('configureList', 'Configure your patient list using the fields below')}</h2>
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
        <Button onClick={close}>{t('cancel', 'Cancel')}</Button>
        <Button onClick={createPL}>{t('save', 'Save')}</Button>
      </div>
    </Overlay>
  );
};

export default CreateNewList;
