import React, { useContext, useEffect, useState } from 'react';
import sectionStyles from '../section.scss';
import styles from './relationships.scss';
import { Button, Select, SelectItem, OverflowMenu, OverflowMenuItem } from 'carbon-components-react';
import { FieldArray, useField } from 'formik';
import { useTranslation } from 'react-i18next';
import { Autosuggest } from '../../input/custom-input/autosuggest/autosuggest.component';
import { PatientRegistrationContext } from '../../patient-registration-context';
import { ResourcesContext } from '../../../offline.resources';
import { fetchPerson } from '../../patient-registration.resource';
import { PatientUuid } from '@openmrs/esm-framework';
import { Input } from '../../input/basic-input/input/input.component';
import { FormValues } from '../../patient-registration-types';
import { parse } from '@babel/core';

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
              ? relationships.map((relationship, index) => (
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
                ))
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
  relationship: { relatedPerson: string; relationship: string; relationshipType?: string };
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

  return (
    <div className={styles.relationship}>
      <div className={styles.searchBox}>
        <div className={styles.relationshipHeader}>
          <h4 className={styles.productiveHeading02}>
            {relationship?.relationshipType ?? t('relationshipPlaceholder', 'Relationship')}
          </h4>
          <OverflowMenu>
            <OverflowMenuItem itemText="Stop app" />
            <OverflowMenuItem itemText="Restart app" />
            <OverflowMenuItem itemText="Rename app" />
            <OverflowMenuItem itemText="Edit routes and access" requireTitle />
            <OverflowMenuItem hasDivider isDelete itemText="Delete app" />
          </OverflowMenu>
        </div>
        <Autosuggest
          name={`relationships[${index}].relatedPerson`}
          labelText={t('relativeFullNameLabelText', 'Full name')}
          placeholder={t('relativeNamePlaceholder', 'Firstname Familyname')}
          defaultValue={relationship.relatedPerson}
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
          defaultValue={relationship?.relationship ?? 'placeholder-item'}
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
      <div className={styles.actions}>
        <Button kind="ghost" onClick={() => remove(index)}>
          {t('deleteRelationshipButtonText', 'Delete Relationship')}
        </Button>
      </div>
    </div>
  );
};
