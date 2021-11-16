import React, { useContext, useEffect, useState } from 'react';
import sectionStyles from '../section.scss';
import styles from './relationships.scss';
import { Button, DatePicker, DatePickerInput, Select, SelectItem, TextInput } from 'carbon-components-react';
import { FieldArray, useField } from 'formik';
import { useTranslation } from 'react-i18next';
import { PatientRegistrationContext } from '../../patient-registration-context';
import { ResourcesContext } from '../../../offline.resources';
import { generateFormatting } from '../../date-util';

interface RelationshipType {
  display: string;
  uuid: string;
  direction: string;
}

export interface RelationshipsSectionProps {
  id: 'relationships';
}

export const RelationshipsSection: React.FC<RelationshipsSectionProps> = () => {
  const { relationshipTypes } = useContext(ResourcesContext);
  const [displayRelationshipTypes, setDisplayRelationshipTypes] = useState<RelationshipType[]>([]);
  const { setFieldValue } = React.useContext(PatientRegistrationContext);
  const { t } = useTranslation();
  const [field, meta] = useField('relatedPersonBirthdate');
  const invalidText = meta.error && t(meta.error);
  const { format, placeHolder, dateFormat } = generateFormatting(['d', 'm', 'Y'], '/');

  useEffect(() => {
    const tmp: RelationshipType[] = [];
    relationshipTypes.results.forEach((type) => {
      const aIsToB = {
        display: type.aIsToB,
        uuid: type.uuid,
        direction: 'aIsToB',
      };
      const bIsToA = {
        display: type.bIsToA,
        uuid: type.uuid,
        direction: 'bIsToA',
      };
      aIsToB.display === bIsToA.display ? tmp.push(aIsToB) : tmp.push(aIsToB, bIsToA);
    });
    setDisplayRelationshipTypes(tmp);
  }, [relationshipTypes]);

  const handleRelationshipTypeChange = (event) => {
    const { target } = event;
    const field = target.name;
    const value = target.options[target.selectedIndex].value;
    setFieldValue(field, value);
  };

  const handlePersonEntered = (event) => {
    const { target } = event;
    const field = target.name;
    const value = target.value;
    setFieldValue(field, value);
  };

  return (
    <section className={sectionStyles.formSection} aria-label="Relationships Section">
      <section className={sectionStyles.fieldGroup}>
        <FieldArray name="relationships">
          {({
            push,
            remove,
            form: {
              values: { relationships },
            },
          }) => (
            <div>
              {relationships && relationships.length > 0 ? (
                <div>
                  <br />
                  {relationships.map((_relationship: any, index: React.Key) => (
                    <div key={index} className={styles.relationship}>
                      <div className={styles.fullName} style={{ marginBottom: '1rem' }}>
                        <TextInput
                          id="fullName"
                          name={`relationships[${index}].relatedPerson`}
                          onChange={handlePersonEntered}
                          labelText={t('fullNameLabelText', 'Full name')}
                          light
                        />
                      </div>
                      <div className={`${styles.selectRelationshipType}`} style={{ marginBottom: '1rem' }}>
                        <Select
                          light={true}
                          id="select"
                          defaultValue="placeholder-item"
                          labelText={t('relationship', 'Relationship')}
                          onChange={handleRelationshipTypeChange}
                          name={`relationships[${index}].relationship`}>
                          <SelectItem
                            disabled
                            hidden
                            value="placeholder-item"
                            text={t('relationshipToPatient', 'Relationship to patient')}
                          />
                          {displayRelationshipTypes.map((type) => (
                            <SelectItem
                              text={type.display}
                              value={`${type.uuid}/${type.direction}`}
                              key={type.display}
                            />
                          ))}
                        </Select>
                        <DatePicker
                          dateFormat={dateFormat}
                          datePickerType="single"
                          light
                          onChange={(e) => setFieldValue(`relationships[${index}].relatedPersonBirthdate`, e)}>
                          <DatePickerInput
                            id="relatedPersonBirthdate"
                            name={`relationships[${index}].relatedPersonBirthdate`}
                            placeholder={placeHolder}
                            labelText={t('relatedPersonDateOfBirthLabelText', 'Date of Birth(optional)')}
                            invalid={!!(meta.touched && meta.error)}
                            invalidText={invalidText}
                            {...field}
                            value={format(field.value)}
                          />
                        </DatePicker>
                      </div>
                      <div className={styles.actions}>
                        {relationships.length - 1 === index && (
                          <Button kind="ghost" onClick={() => push({})}>
                            {t('addRelationshipButtonText', 'Add Relationship')}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </FieldArray>
      </section>
    </section>
  );
};
