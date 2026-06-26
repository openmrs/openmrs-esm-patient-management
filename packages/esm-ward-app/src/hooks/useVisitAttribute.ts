import { restBaseUrl, useOpenmrsFetchAll } from '@openmrs/esm-framework';

export interface VisitAttribute {
  uuid: string;
  display?: string;
  value: boolean | string | number;
  attributeType: {
    uuid: string;
    display?: string;
  };
}

// prettier-ignore
const visitAttributeCustomRepresentation =
  'custom:(uuid,value,attributeType:(uuid,display))';

/**
 * Fetches the attribute of a given type for a given visit.
 *
 * The default visit representation used by the ward admission/request hooks does not include
 * attribute values, so this hook queries the visit's attribute subresource directly and returns the
 * single attribute matching `attributeTypeUuid` (or `undefined` if the visit has no such attribute).
 *
 * @param visitUuid the visit whose attributes to fetch. When falsy, no request is made.
 * @param attributeTypeUuid the visit attribute type to look for.
 */
export function useVisitAttribute(visitUuid: string, attributeTypeUuid: string) {
  const apiUrl = visitUuid
    ? `${restBaseUrl}/visit/${visitUuid}/attribute?v=${visitAttributeCustomRepresentation}`
    : null;

  const { data, ...rest } = useOpenmrsFetchAll<VisitAttribute>(apiUrl);

  const attribute = data?.find((attr) => attr.attributeType?.uuid === attributeTypeUuid);

  return { attribute, value: attribute?.value, ...rest };
}
