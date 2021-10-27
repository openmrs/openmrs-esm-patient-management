import React, { useCallback, useMemo, useRef } from 'react';
import { Button, FilterableMultiSelect, TextArea, TextInput } from 'carbon-components-react';
import Overlay from '../../overlay.component';
import { useTranslation } from 'react-i18next';
import { createPatientList, OpenmrsCohort, OpenmrsCohortMember, editPatientList } from '../../api';
import styles from './create-edit-patient-list.scss';
import { useLayoutType, showToast, useSessionUser } from '@openmrs/esm-framework';

interface CreateNewListProps {
  close: () => void;
  edit?: boolean;
  patientListDetails?: OpenmrsCohort;
  onSuccess?: () => void;
}

const CreateEditNewList: React.FC<CreateNewListProps> = ({
  close,
  edit = false,
  patientListDetails = null,
  onSuccess = () => {},
}) => {
  const { t } = useTranslation();
  const nameInputRef = useRef<HTMLInputElement>();
  const decriptionInputRef = useRef<HTMLTextAreaElement>();
  const isDesktop = useLayoutType() === 'desktop';
  const user = useSessionUser();

  const createPL = useCallback(() => {
    // set loading
    if (!edit) {
      createPatientList({
        name: nameInputRef.current.value,
        description: decriptionInputRef.current.value,
        location: user?.sessionLocation?.uuid,
      })
        .then(() =>
          showToast({
            title: t('successCreatedPatientList', 'Created Patient List'),
            description: t(
              'successCreatedPatientListDescription',
              `Successfully created patient list : ${nameInputRef.current.value}`,
            ),
            kind: 'success',
          }),
        )
        .then(onSuccess)
        .then(close)
        .catch(() =>
          showToast({
            title: t('error', 'Error'),
            description: t(
              'errorCreatedPatientListDescription',
              `Couldn't create patient list : ${nameInputRef.current.value}`,
            ),
            kind: 'error',
          }),
        );
    } else {
      editPatientList(patientListDetails.uuid, {
        name: nameInputRef.current.value,
        description: decriptionInputRef.current.value,
        location: user?.sessionLocation?.uuid,
      })
        .then(() =>
          showToast({
            title: t('successEditedPatientList', 'Editted Patient List'),
            description: t('successEditPatientListDescription', `Successfully editted patient list`),
            kind: 'success',
          }),
        )
        .then(onSuccess)
        .then(close)
        .catch(() =>
          showToast({
            title: t('error', 'Error'),
            description: t(
              'errorCreatedPatientListDescription',
              `Couldn't edit patient list : ${nameInputRef.current.value}`,
            ),
            kind: 'error',
          }),
        );
    }
  }, [close, user]);

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
      header={!edit ? t('newPatientListHeader', 'New patient list') : t('editPatientListHeader', 'Edit patient list')}
      close={close}
      buttonsGroup={
        <div className={styles.buttonsGroup}>
          <Button onClick={close} kind="secondary" size="lg">
            {t('cancel', 'Cancel')}
          </Button>
          <Button onClick={createPL} size="lg">
            {!edit ? t('createList', 'Create list') : t('editList', 'Edit list')}
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
          defaultValue={edit ? patientListDetails?.name : ''}
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
          defaultValue={edit ? patientListDetails?.description : ''}
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

export default CreateEditNewList;
