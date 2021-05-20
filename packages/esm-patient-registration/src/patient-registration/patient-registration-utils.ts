import { navigate } from '@openmrs/esm-framework';
import * as Yup from 'yup';
import { AddressValidationSchemaType } from './patient-registration-types';

export function parseAddressTemplateXml(addressTemplate: string) {
  const templateXmlDoc = new DOMParser().parseFromString(addressTemplate, 'text/xml');
  const nameMappings = templateXmlDoc.querySelector('nameMappings').querySelectorAll('property');
  const validationSchemaObjs: AddressValidationSchemaType[] = Array.prototype.map.call(
    nameMappings,
    (nameMapping: Element) => {
      const field = nameMapping.getAttribute('name');
      const label = nameMapping.getAttribute('value');
      const regex = findElementValueInXmlDoc(field, 'elementRegex', templateXmlDoc);
      const regexFormat = findElementValueInXmlDoc(field, 'elementRegexFormats', templateXmlDoc);

      return {
        name: field,
        label,
        regex: regex || '.*',
        regexFormat: regexFormat || '',
      };
    },
  );

  const addressValidationSchema = Yup.object(
    validationSchemaObjs.reduce((final, current) => {
      final[current.name] = Yup.string().matches(current.regex, current.regexFormat);
      return final;
    }, {}),
  );

  const addressFieldValues: Array<{ name: string; defaultValue: string }> = Array.prototype.map.call(
    nameMappings,
    (nameMapping: Element) => {
      const name = nameMapping.getAttribute('name');
      const defaultValue = findElementValueInXmlDoc(name, 'elementDefaults', templateXmlDoc) ?? '';
      return { name, defaultValue };
    },
  );

  return {
    addressFieldValues,
    addressValidationSchema,
  };
}

function findElementValueInXmlDoc(fieldName: string, elementSelector: string, doc: XMLDocument) {
  return doc.querySelector(elementSelector)?.querySelector(`[name=${fieldName}]`)?.getAttribute('value') ?? null;
}

export function scrollIntoView(viewId: string) {
  document.getElementById(viewId).scrollIntoView({
    behavior: 'smooth',
    block: 'center',
    inline: 'center',
  });
}

export function cancelRegistration() {
  navigate({ to: `${window.spaBase}/home` });
}
