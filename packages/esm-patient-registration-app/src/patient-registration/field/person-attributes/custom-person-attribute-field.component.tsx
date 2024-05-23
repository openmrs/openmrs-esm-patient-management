import React from 'react';
import { Field } from 'formik';
import { Layer, Select, SelectItem } from '@carbon/react';
import { type PersonAttributeTypeResponse } from '../../patient-registration.types';
import { useTranslation } from 'react-i18next';
import styles from './../field.scss';
import classNames from 'classnames';

type CustomPersonAttributeFieldProps = {
  id: string;
  personAttributeType: PersonAttributeTypeResponse;
  answerConceptSetUuid: string;
  label?: string;
  customConceptAnswers: Array<{ uuid: string; label?: string }>;
  required: boolean;
};

const CustomPersonAttributeField: React.FC<CustomPersonAttributeFieldProps> = ({
  personAttributeType,
  required,
  id,
  label,
  customConceptAnswers,
}) => {
  const { t } = useTranslation();
  const fieldName = `attributes.${personAttributeType.uuid}`;

  return (
    <div className={classNames(styles.customField, styles.halfWidthInDesktopView)}>
      <Layer>
        <Field name={fieldName}>
          {({ field, form: { touched, errors }, meta }) => {
            return (
              <>
                <Select
                  id={id}
                  name={`person-attribute-${personAttributeType.uuid}`}
                  labelText={label ?? personAttributeType?.display}
                  invalid={errors[fieldName] && touched[fieldName]}
                  required={required}
                  {...field}>
                  <SelectItem value={''} text={t('selectAnOption', 'Select an option')} />
                  {customConceptAnswers.map((answer) => (
                    <SelectItem key={answer.uuid} value={answer.uuid} text={answer.uuid} />
                  ))}
                </Select>
              </>
            );
          }}
        </Field>
      </Layer>
    </div>
  );
};

export default CustomPersonAttributeField;
