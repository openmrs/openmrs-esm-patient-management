import React, { useContext, useState } from 'react';
import styles from './../field.scss';
import { PersonAttributeValue } from '../../patient-registration-types';
import { Button } from 'carbon-components-react';
import { TrashCan16, Edit16 } from '@carbon/icons-react';
import { useTranslation } from 'react-i18next';
import { useField } from 'formik';
import { PatientRegistrationContext } from '../../patient-registration-context';

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

  const handleEdit = () => {
    setEditAttributeValue(true);
  };
  const handleDelete = () => {
    setFieldValue(`attributes.${personAttributeTypeUuid}.action`, 'DELETE');
    setFieldValue(`attributes.${personAttributeTypeUuid}.value`, '');
    setEditAttributeValue(false);
  };

  const handleRestore = () => {
    setFieldValue(`attributes.${personAttributeTypeUuid}.action`, 'UPDATE');
    setEditAttributeValue(true);
  };

  return !isLoadingPersonAttributeTypeDetails ? (
    <div className={`${styles.halfWidthInDesktopView} ${styles.attributeField}`}>
      {!value?.action || editAttributeValue ? (
        <>
          {inputField}
          {value?.action === 'UPDATE' && (
            <Button
              kind="danger--ghost"
              hasIconOnly
              renderIcon={TrashCan16}
              className={styles.trashCan}
              iconDescription={t('delete', 'Delete')}
              onClick={handleDelete}
            />
          )}
        </>
      ) : value.action === 'UPDATE' ? (
        <>
          <div className={styles.attributeText}>
            <span className={styles.label01}>{personAttributeTypeName}</span>
            <p className={styles.bodyShort02}>{value?.value}</p>
          </div>
          <Button
            kind="ghost"
            hasIconOnly
            renderIcon={Edit16}
            iconDescription={t('edit', 'Edit')}
            onClick={handleEdit}
          />
        </>
      ) : (
        <div>
          <Button kind="ghost" onClick={handleRestore}>
            {t('add', 'Add')} {personAttributeTypeName}
          </Button>
        </div>
      )}
    </div>
  ) : null;
};
