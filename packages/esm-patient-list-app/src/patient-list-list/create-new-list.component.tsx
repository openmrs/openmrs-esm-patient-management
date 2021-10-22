import React, { useCallback, useMemo, useRef } from 'react';
import { Button, FilterableMultiSelect, TextArea, TextInput } from 'carbon-components-react';
import Overlay from '../overlay.component';
import { useTranslation } from 'react-i18next';
import { createPatientList } from '../api';
import styles from './patient-list-list.scss';
import { useLayoutType } from '@openmrs/esm-framework';

interface CreateNewListProps {
  close: () => void;
}

const CreateNewList: React.FC<CreateNewListProps> = ({ close }) => {
  const { t } = useTranslation();
  const nameInputRef = useRef<HTMLInputElement>();
  const decriptionInputRef = useRef<HTMLTextAreaElement>();
  const isDesktop = useLayoutType() === 'desktop';

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
    <Overlay
      header={t('newPatientListHeader', 'New patient list')}
      close={close}
      buttonsGroup={
        <div className={styles.buttonsGroup}>
          <Button onClick={close} kind="secondary" size="lg">
            {t('cancel', 'Cancel')}
          </Button>
          <Button onClick={createPL} size="lg">
            {t('createList', 'Create list')}
          </Button>
        </div>
      }>
      <h4 className={styles.header}>{t('configureList', 'Configure your patient list using the fields below')}</h4>
      <div>
        <TextInput
          labelText={t('newPatientListNameLabel', 'List name')}
          placeholder={t('listNamePlaceholder', 'e.g. Potential research participants')}
          id="list_name"
          ref={nameInputRef}
          light={!isDesktop}
        />
      </div>
      <div className={styles.input}>
        <TextArea
          placeholder={t(
            'listDescriptionPlaceholder',
            'e.g. Patients with diagnosed asthma who may be willing to be a part of a university research study',
          )}
          ref={decriptionInputRef}
          labelText={t('newPatientListDescriptionLabel', 'Describe the purpose of this list in a few words')}
          light={!isDesktop}
        />
      </div>
      <div className={styles.input}>
        <FilterableMultiSelect
          id="select"
          placeholder={t('search', 'Search')}
          titleText={t('newPatientListSeceltLabel', 'Choose which information to include in the list')}
          items={items}
          itemToString={(item) => (item ? item.text : '')}
          onChange={() => {}}
          light={!isDesktop}
        />
      </div>
    </Overlay>
  );
};

export default CreateNewList;
