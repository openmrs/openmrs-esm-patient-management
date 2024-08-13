import { Type } from '@openmrs/esm-framework';

export const coloredObsTagsCardRowConfigSchema = {
  conceptUuid: {
    _type: Type.UUID,
    _description: 'Required. Identifies the concept to use to identify the desired observations.',
    // Problem list
    _default: '1284AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
  summaryLabel: {
    _type: Type.String,
    _description: `Optional. The custom label or i18n key to the translated label to display for the summary tag. The summary tag shows the count of the number of answers that are present but not configured to show as their own tags. If not provided, defaults to the name of the concept.`,
    _default: null,
  },
  summaryLabelI18nModule: {
    _type: Type.String,
    _description: 'Optional. The custom module to use for translation of the summary label',
    _default: null,
  },
  summaryLabelColor: {
    _type: Type.String,
    _description:
      'The color of the summary tag. See https://react.carbondesignsystem.com/?path=/docs/components-tag--overview for a list of supported colors',
    _default: null,
  },
  tags: {
    _type: Type.Array,
    _description: `An array specifying concept sets and color. Observations with coded values that are members of the specified concept sets will be displayed as their own tags with the specified color. Any observation with coded values not belonging to any concept sets specified will be summarized as a count in the summary tag. If a concept set is listed multiple times, the first matching applied-to rule takes precedence.`,
    _default: [],
    _elements: {
      color: {
        _type: Type.String,
        _description:
          'Color of the tag. See https://react.carbondesignsystem.com/?path=/docs/components-tag--overview for a list of supported colors.',
      },
      appliedToConceptSets: {
        _type: Type.Array,
        _description: `The concept sets which the color applies to. Observations with coded values that are members of the specified concept sets will be displayed as their own tag with the specified color. If an observation's coded value belongs to multiple concept sets, the first matching applied-to rule takes precedence.`,
        _elements: {
          _type: Type.UUID,
        },
      },
    },
  },
};

export interface ColoredObsTagsCardRowConfigObject {
  /**
   * Required. Identifies the concept to use to identify the desired observations.
   */
  conceptUuid: string;

  /**
   * Optional. The custom label or i18n key to the translated label to display for the summary tag. The summary tag
   * shows the count of the number of answers that are present but not configured to show as their own tags. If not
   * provided, defaults to the name of the concept.
   */
  summaryLabel?: string;
  /**
   * Optional. The custom module to use for translation of the summary label
   */
  summaryLabelI18nModule?: string;

  /**
   * The color of the summary tag.
   * See https://react.carbondesignsystem.com/?path=/docs/components-tag--overview for a list of supported colors
   */
  summaryLabelColor?: string;

  /**
   * An array specifying concept sets and color. Observations with coded values that are members of the specified concept sets
   * will be displayed as their own tags with the specified color. Any observation with coded values not belonging to
   * any concept sets specified will be summarized as a count in the summary tag. If a concept set is listed multiple times,
   * the first matching applied-to rule takes precedence.
   */
  tags: Array<TagConfigObject>;
}

export interface TagConfigObject {
  /**
   * Color of the tag. See https://react.carbondesignsystem.com/?path=/docs/components-tag--overview for a list of supported colors.
   */
  color: string;

  /**
   * The concept sets which the color applies to. Observations with coded values that are members of the specified concept sets
   * will be displayed as their own tag with the specified color.
   * If an observation's coded value belongs to multiple concept sets, the first matching applied-to rule takes precedence.
   */
  appliedToConceptSets: Array<string>;
}
