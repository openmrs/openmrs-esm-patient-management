import React, { useCallback, SyntheticEvent, useEffect, useState } from 'react';
import { Button, Dropdown, OnChangeData, TextArea, TextInput } from 'carbon-components-react';
import Overlay from '../../overlay.component';
import { useTranslation } from 'react-i18next';
import styles from './create-edit-patient-list.scss';
import { useLayoutType, showToast, useSessionUser } from '@openmrs/esm-framework';
import { createPatientList, editPatientList } from '../../api/api-remote';
import { useCohortTypes } from '../../api/hooks';
import { OpenmrsCohort, NewCohortData } from '../../api/types';

interface CreateEditPatientListProps {
  close: () => void;
  edit?: boolean;
  patientListDetails?: OpenmrsCohort;
  onSuccess?: () => void;
}

const CreateEditPatientList: React.FC<CreateEditPatientListProps> = ({
  close,
  edit = false,
  patientListDetails = null,
  onSuccess = () => {},
}) => {
  const { t } = useTranslation();
  const [cohortDetails, setCohortDetails] = useState<NewCohortData>({
    name: '',
    description: '',
    cohortType: '',
    location: '',
  });
  const isDesktop = useLayoutType() === 'desktop';
  const user = useSessionUser();
  const { data: cohortTypes } = useCohortTypes();

  useEffect(() => {
    setCohortDetails({
      name: patientListDetails?.name || '',
      description: patientListDetails?.description || '',
      cohortType: patientListDetails?.cohortType?.uuid || '',
      location: user?.sessionLocation?.uuid,
    });
  }, [user, patientListDetails]);

  const createPL = useCallback(() => {
    // set loading
    if (!edit) {
      createPatientList(cohortDetails)
        .then(() =>
          showToast({
            title: t('successCreatedPatientList', 'Created patient list'),
            description: `${t('successCreatedPatientListDescription', 'Successfully created patient list')} : ${
              cohortDetails?.name
            }`,
            kind: 'success',
          }),
        )
        .then(onSuccess)
        .then(close)
        .catch(() =>
          showToast({
            title: t('error', 'Error'),
            description: `${t('errorCreatePatientListDescription', "Couldn't create patient list")} : ${
              cohortDetails?.name
            }`,
            kind: 'error',
          }),
        );
    } else {
      editPatientList(patientListDetails.uuid, cohortDetails)
        .then(() =>
          showToast({
            title: t('successUpdatePatientList', 'Updated patient list'),
            description: t('successUpdatePatientListDescription', 'Successfully updated patient list'),
            kind: 'success',
          }),
        )
        .then(onSuccess)
        .then(close)
        .catch(() =>
          showToast({
            title: t('error', 'Error'),
            description: `${t('errorUpdatePatientListDescription', "Couldn't update patient list")} : ${
              cohortDetails?.name
            }`,
            kind: 'error',
          }),
        );
    }
  }, [close, user, cohortDetails]);

  const handleChange = useCallback(
    ({ currentTarget }: SyntheticEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setCohortDetails((cohortDetails) => ({
        ...cohortDetails,
        [currentTarget?.name]: currentTarget?.value,
      }));
    },
    [setCohortDetails],
  );

  const handleTypeChange = useCallback(
    ({ selectedItem }: OnChangeData) => {
      setCohortDetails((cohortDetails) => ({
        ...cohortDetails,
        cohortType: cohortTypes?.find((type) => type?.display === selectedItem)?.uuid,
      }));
    },
    [setCohortDetails, cohortTypes],
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
          <Button
            onClick={createPL}
            size="lg"
            disabled={Object.values(cohortDetails)?.some(
              (value) => value === '' || value === undefined || value === null,
            )}>
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
          name="name"
          onChange={handleChange}
          light={!isDesktop}
          value={cohortDetails?.name}
        />
      </div>
      <div className={styles.input}>
        <TextArea
          name="description"
          onChange={handleChange}
          placeholder={t(
            'listDescriptionPlaceholder',
            'e.g. Patients with diagnosed asthma who may be willing to be a part of a university research study',
          )}
          labelText={t('newPatientListDescriptionLabel', 'Describe the purpose of this list in a few words')}
          light={!isDesktop}
          value={cohortDetails?.description}
        />
      </div>
      <div className={styles.input}>
        <Dropdown
          id="cohortType"
          label={t('selectCohortType', 'Select patient list type')}
          titleText={t('newPatientListCohortTypeLabel', 'Choose the type for the new patient list')}
          items={cohortTypes?.map((type) => type?.display) || []}
          selectedItem={
            cohortTypes?.find((type) => type.uuid === cohortDetails?.cohortType)?.display ||
            cohortTypes?.find((type) => type.uuid === patientListDetails?.cohortType?.uuid)?.display
          }
          onChange={handleTypeChange}
          light={!isDesktop}
        />
      </div>
    </Overlay>
  );
};

export default CreateEditPatientList;
