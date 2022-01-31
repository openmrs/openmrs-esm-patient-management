import React, { useContext, useEffect, useState } from 'react';
import sectionStyles from '../section.scss';
import styles from './relationships.scss';
import { Button, Select, SelectItem } from 'carbon-components-react';
import { FieldArray } from 'formik';
import { useTranslation } from 'react-i18next';
import { Autosuggest } from '../../input/custom-input/autosuggest/autosuggest.component';
import { PatientRegistrationContext } from '../../patient-registration-context';
import { ResourcesContext } from '../../../offline.resources';
import { fetchPerson } from '../../patient-registration.resource';

interface RelationshipType {
  display: string;
  uuid: string;
  direction: string;
}

async function searchPerson(query: string) {
  const abortController = new AbortController();
  const searchResults = await fetchPerson(query, abortController);
  return searchResults.data.results;
}

export interface RelationshipsSectionProps {
  id: 'relationships';
}

export const RelationshipsSection: React.FC<RelationshipsSectionProps> = () => {
  const { relationshipTypes } = useContext(ResourcesContext);
  const [displayRelationshipTypes, setDisplayRelationshipTypes] = useState<RelationshipType[]>([]);
  const { setFieldValue } = React.useContext(PatientRegistrationContext);
  const { t } = useTranslation();

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

  const handleSuggestionSelected = (field: string, selectedSuggestion: string) => {
    setFieldValue(field, selectedSuggestion);
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
                      <div className={styles.searchBox} style={{ marginBottom: '1rem' }}>
                        <Autosuggest
                          name={`relationships[${index}].relatedPerson`}
                          placeholder="Find person"
                          onSuggestionSelected={handleSuggestionSelected}
                          getSearchResults={searchPerson}
                          getDisplayValue={(item) => item.display}
                          getFieldValue={(item) => item.uuid}
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
