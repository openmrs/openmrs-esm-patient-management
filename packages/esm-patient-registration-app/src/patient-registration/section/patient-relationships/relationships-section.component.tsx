import React, { useContext, useEffect, useState } from 'react';
import sectionStyles from '../section.scss';
import styles from './relationships.scss';
import { Button, Select, SelectItem, OverflowMenu, OverflowMenuItem } from 'carbon-components-react';
import { FieldArray } from 'formik';
import { useTranslation } from 'react-i18next';
import { Autosuggest } from '../../input/custom-input/autosuggest/autosuggest.component';
import { PatientRegistrationContext } from '../../patient-registration-context';
import { ResourcesContext } from '../../../offline.resources';
import { fetchPerson } from '../../patient-registration.resource';
import { Input } from '../../input/basic-input/input/input.component';
import { FormValues } from '../../patient-registration-types';

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

  return (
    <section aria-label="Relationships Section">
      <FieldArray name="relationships">
        {({
          push,
          remove,
          form: {
            values: { relationships },
          },
        }) => (
          <div>
            {relationships && relationships.length > 0
              ? relationships.map((relationship: FormValues['relationships'][0], index) =>
                  relationship.action !== 'DELETE' ? (
                    <div key={index} className={sectionStyles.formSection}>
                      <RelationshipView
                        relationship={relationship}
                        index={index}
                        displayRelationshipTypes={displayRelationshipTypes}
                        key={index}
                        remove={remove}
                      />
                      <br />
                    </div>
                  ) : null,
                )
              : null}
            <div className={styles.actions}>
              <Button kind="ghost" onClick={() => push({})}>
                {t('addRelationshipButtonText', 'Add Relationship')}
              </Button>
            </div>
          </div>
        )}
      </FieldArray>
    </section>
  );
};

interface RelationshipViewProps {
  relationship: FormValues['relationships'][0];
  index: number;
  displayRelationshipTypes: RelationshipType[];
  remove: <T>(index: number) => T;
}

const RelationshipView: React.FC<RelationshipViewProps> = ({
  relationship,
  index,
  displayRelationshipTypes,
  remove,
}) => {
  const { t } = useTranslation();
  const { setFieldValue } = React.useContext(PatientRegistrationContext);
  const [searchingRelatedPerson, setSearchingRelatedPersonName] = useState(
    !relationship.relatedPersonName ? true : false,
  );

  const handleRelationshipTypeChange = (event) => {
    const { target } = event;
    const field = target.name;
    const value = target.options[target.selectedIndex].value;
    setFieldValue(field, value);
  };

  const handleSuggestionSelected = (field: string, selectedSuggestion: string) => {
    setFieldValue(field, selectedSuggestion);
  };

  const searchPerson = async (query: string) => {
    const abortController = new AbortController();
    const searchResults = await fetchPerson(query, abortController);
    return searchResults.data.results;
  };

  const toggleSearchingRelatedPerson = () =>
    setSearchingRelatedPersonName((searchingRelatedPerson) => !searchingRelatedPerson);

  const deleteRelationship = () =>
    relationship.action === 'UPDATE'
      ? setFieldValue(`relationships[${index}]`, {
          ...relationship,
          action: 'DELETE',
        } as FormValues['relationships'][0])
      : remove(index);

  return (
    <div className={styles.relationship}>
      <div className={styles.searchBox}>
        <div className={styles.relationshipHeader}>
          <h4 className={styles.productiveHeading}>
            {relationship?.relationshipType ?? t('relationshipPlaceholder', 'Relationship')}
          </h4>
          <OverflowMenu>
            <OverflowMenuItem
              onClick={deleteRelationship}
              itemText={t('deleteRelationshipOverflowItemText', 'Delete Relationship')}
              isDelete
            />
          </OverflowMenu>
        </div>
        <div>
          {!searchingRelatedPerson ? (
            <Input
              labelText={t('relativeFullNameLabelText', 'Full name')}
              id={`relatedPersonFullName${index}`}
              name={`relationships[${index}].relatedPersonName`}
              onFocusCapture={toggleSearchingRelatedPerson}
              light
            />
          ) : (
            <Autosuggest
              name={`relationships[${index}].relatedPersonUuid`}
              labelText={t('relativeFullNameLabelText', 'Full name')}
              placeholder={t('relativeNamePlaceholder', 'Firstname Familyname')}
              defaultValue={relationship.relatedPersonName}
              onSuggestionSelected={handleSuggestionSelected}
              getSearchResults={searchPerson}
              getDisplayValue={(item) => item.display}
              getFieldValue={(item) => item.uuid}
              autoFocus
            />
          )}
        </div>
      </div>
      <div className={`${styles.selectRelationshipType}`} style={{ marginBottom: '1rem' }}>
        <Select
          light={true}
          id="select"
          value={relationship?.relationship ?? 'placeholder-item'}
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
            <SelectItem text={type.display} value={`${type.uuid}/${type.direction}`} key={type.display} />
          ))}
        </Select>
      </div>
    </div>
  );
};
