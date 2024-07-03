import { useEffect, useState } from 'react';
import { type Concept, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type Order } from '@openmrs/esm-patient-common-lib';
import { type Encounter } from '../types';

const encounterRepresentation =
  'custom:(uuid,encounterDatetime,encounterType,location:(uuid,name),' +
  'patient:(uuid,display),encounterProviders:(uuid,provider:(uuid,name)),' +
  'obs:(uuid,obsDatetime,voided,groupMembers,formFieldNamespace,formFieldPath,order:(uuid,display),concept:(uuid,name:(uuid,name)),' +
  'value:(uuid,display,name:(uuid,name),names:(uuid,conceptNameType,name))))';

const conceptRepresentation =
  'custom:(uuid,display,name,datatype,set,answers,hiNormal,hiAbsolute,hiCritical,lowNormal,lowAbsolute,lowCritical,units,' +
  'setMembers:(uuid,display,answers,datatype,hiNormal,hiAbsolute,hiCritical,lowNormal,lowAbsolute,lowCritical,units))';

export function useTestOrderCount(testOrders: Order[]) {
  const [countPending, setCountPending] = useState(0);

  const fetchOrderData = async (order: Order) => {
    const conceptKey = `${restBaseUrl}/concept/${order.concept.uuid}?v=${conceptRepresentation}`;
    const encounterKey = `${restBaseUrl}/encounter/${order.encounter.uuid}?v=${encounterRepresentation}`;

    const concept = await openmrsFetch<Concept>(conceptKey);
    const encounter = await openmrsFetch<Encounter>(encounterKey);

    return { concept, encounter };
  };

  useEffect(() => {
    testOrders.forEach(async (order) => {
      if (order.orderType['javaClassName'] === 'org.openmrs.TestOrder') {
        const { concept, encounter } = await fetchOrderData(order);

        if (concept && encounter) {
          const conceptData = concept.data;
          const encounterData = encounter.data;

          const testResultObs = encounterData?.obs?.find((obs) => obs.concept.uuid === conceptData.uuid);

          if (conceptData.setMembers.length > 0) {
            const noResultCount = conceptData.setMembers.filter(
              (memberConcept) => !testResultObs?.groupMembers?.find((obs) => obs.concept.uuid === memberConcept.uuid),
            ).length;
            setCountPending((prevState) => (prevState += noResultCount));
          } else if (conceptData.setMembers.length === 0) {
            if (!testResultObs?.value['display']) {
              setCountPending((prevState) => (prevState += 1));
            }
          }
        }
      }
    });
  }, [testOrders]);

  return countPending;
}
