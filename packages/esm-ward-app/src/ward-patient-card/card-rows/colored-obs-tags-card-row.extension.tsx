import { useConfig } from '@openmrs/esm-framework';
import React from 'react';
import { type ColoredObsTagsCardRowConfigObject } from '../../config-schema-extension-colored-obs-tags';
import { type WardPatientCardType } from '../../types';
import WardPatientCodedObsTags from '../row-elements/ward-patient-coded-obs-tags';

const ColoredObsTagsCardRowExtension: WardPatientCardType = ({ patient, visit }) => {
  const config = useConfig<ColoredObsTagsCardRowConfigObject>();

  return <WardPatientCodedObsTags config={config} patient={patient} visit={visit} />;
};

export default ColoredObsTagsCardRowExtension;
