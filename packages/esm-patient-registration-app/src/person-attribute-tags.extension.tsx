import React from 'react';
import { Tag, Toggletip, ToggletipButton, ToggletipContent } from '@carbon/react';
import { type FetchResponse, openmrsFetch, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import useSWR from 'swr';
import type { RegistrationConfig, FieldDefinition } from './config-schema';
import type { PersonAttributeResponse } from './patient-registration/patient-registration.types';
import { useTranslation } from 'react-i18next';

interface PersonAttributeTagsProps {
  patientUuid: string;
}

const PersonAttributeTags: React.FC<PersonAttributeTagsProps> = ({ patientUuid }) => {
  const { fieldDefinitions } = useConfig<RegistrationConfig>();
  const { data: attributesData } = usePersonAttributes(patientUuid);
  const { t } = useTranslation();

  const bannerPersonAttributes: Array<FieldDefinition> =
    fieldDefinitions
      ?.filter((field) => field.type === 'person attribute' && field.displayInPatientBanner)
      .sort((a, b) => (a.orderOfDisplayInPatientBanner ?? 100) - (b.orderOfDisplayInPatientBanner ?? 100)) ?? [];

  if (!bannerPersonAttributes.length || !attributesData?.length) {
    return null;
  }

  return (
    <div>
      {bannerPersonAttributes.map((field) => {
        const matchingAttribute = attributesData.find((attr) => attr.attributeType?.uuid === field.uuid);

        if (!matchingAttribute) {
          return null;
        }

        const value =
          typeof matchingAttribute.value === 'object' ? matchingAttribute.value?.display : matchingAttribute.value;

        if (!value) {
          return null;
        }

        const label = t(field.label) || matchingAttribute.attributeType?.display;

        return (
          <Toggletip key={field.id}>
            <ToggletipButton>
              <Tag>{value}</Tag>
            </ToggletipButton>
            <ToggletipContent>{`${label}: ${value}`}</ToggletipContent>
          </Toggletip>
        );
      })}
    </div>
  );
};

function usePersonAttributes(personUuid?: string | null) {
  const shouldFetch = !!personUuid;
  const { data, isLoading, error } = useSWR<FetchResponse<{ results: Array<PersonAttributeResponse> }>, Error>(
    shouldFetch
      ? `${restBaseUrl}/person/${personUuid}/attribute?v=custom:(uuid,display,attributeType:(uuid,display,format),value)`
      : null,
    openmrsFetch,
  );

  return {
    data: data?.data?.results,
    isLoading,
    error,
  };
}

export default PersonAttributeTags;
