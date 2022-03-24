import React, { useContext, useState } from 'react';
import styles from './../field.scss';
import { PersonAttributeValue } from '../../patient-registration-types';
import { Button } from 'carbon-components-react';
import { TrashCan16, Edit16 } from '@carbon/icons-react';
import { useTranslation } from 'react-i18next';
import { useField } from 'formik';
import { PatientRegistrationContext } from '../../patient-registration-context';
import { useLayoutType } from '@openmrs/esm-framework';

interface PersonAttributeFieldProps {
  personAttributeTypeUuid: string;
  isLoadingPersonAttributeTypeDetails: boolean;
  inputField: JSX.Element;
  personAttributeTypeName: string;
}

export const PersonAttributeField: React.FC<PersonAttributeFieldProps> = ({
  personAttributeTypeUuid,
  isLoadingPersonAttributeTypeDetails,
  inputField,
  personAttributeTypeName,
}) => {
  const { setFieldValue } = useContext(PatientRegistrationContext);
  const [editAttributeValue, setEditAttributeValue] = useState<boolean>(false);
  const { t } = useTranslation();
  const [field] = useField<PersonAttributeValue['']>(`attributes.${personAttributeTypeUuid}`);
  const { value } = field;
  const isDesktop = useLayoutType() === 'desktop';

  const handleEdit = () => {
    setEditAttributeValue(true);
  };
  const handleDelete = () => {
    if (value?.action === 'UPDATE') {
      setFieldValue(`attributes.${personAttributeTypeUuid}.action`, 'DELETE');
    }
    setFieldValue(`attributes.${personAttributeTypeUuid}.value`, null);
    setEditAttributeValue(false);
  };

  const handleRestore = () => {
    if (value?.action) {
      setFieldValue(`attributes.${personAttributeTypeUuid}.action`, 'UPDATE');
    }
    setEditAttributeValue(true);
  };

  return !isLoadingPersonAttributeTypeDetails ? (
    <div className={styles.halfWidthInDesktopView}>
      <div className={styles.attributeLabelText}>
        <span className={`${styles.label01} ${styles.text02}`}>{personAttributeTypeName}</span>
        {value?.action === 'UPDATE' && !editAttributeValue && (
          <Button kind="ghost" onClick={handleEdit} size={isDesktop ? 'sm' : 'lg'}>
            {t('editButtonText', 'Edit')}
          </Button>
        )}
      </div>
      <div className={styles.attributeField}>
        {editAttributeValue ? (
          <>
            {inputField}
            <Button
              kind="danger--ghost"
              hasIconOnly
              renderIcon={TrashCan16}
              className={styles.trashCan}
              iconDescription={t('delete', 'Delete')}
              onClick={handleDelete}
              size={isDesktop ? 'sm' : 'lg'}
            />
          </>
        ) : value?.action === 'UPDATE' ? (
          <p className={styles.bodyShort02}>{personAttributeTypeName}</p>
        ) : (
          <div>
            <Button kind="ghost" onClick={handleRestore} size={isDesktop ? 'sm' : 'lg'}>
              {t('add', 'Add')} {personAttributeTypeName}
            </Button>
          </div>
        )}
      </div>
    </div>
  ) : null;
};
