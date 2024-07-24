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

/**
 * Custom hook to count orders of type TestOrder that lack associated observations.
 *
 * This hook takes an array of orders and counts how many of them do not have observations recorded.
 * It fetches the necessary concept and encounter data for each order to determine if observations are missing.
 *
 * @param {Order[]} orders - An array of order objects. Each order contains information about the order, including concept and encounter UUIDs.
 * @returns {count: number, isLoading: boolean } - The count of orders without observations, and a loading state.
 *
 * @example
 * const orders = [
 *   { concept: { uuid: 'concept-uuid-1' }, encounter: { uuid: 'encounter-uuid-1' }, ... },
 *   { concept: { uuid: 'concept-uuid-2' }, encounter: { uuid: 'encounter-uuid-2' }, ... },
 * ];
 *
 * const {count: unobservedCount, isLoading } = useCountTestOrdersWithoutObs(testOrders);
 * // unobservedCount would be the number of test orders without associated observations.
 */

export function useCountTestOrdersWithoutObs(orders: Order[]): { count: number; isLoading: boolean } {
  const [countPending, setCountPending] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchOrderData = async (order: Order) => {
      const conceptKey = `${restBaseUrl}/concept/${order.concept.uuid}?v=${conceptRepresentation}`;
      const encounterKey = `${restBaseUrl}/encounter/${order.encounter.uuid}?v=${encounterRepresentation}`;

      const [concept, encounter] = await Promise.all([
        openmrsFetch<Concept>(conceptKey),
        openmrsFetch<Encounter>(encounterKey),
      ]);

      return { concept, encounter };
    };

    const countPendingOrders = async () => {
      setIsLoading(true);
      try {
        const pendingCounts = await Promise.all(
          orders.map(async (order) => {
            if (order.orderType['javaClassName'] === 'org.openmrs.TestOrder') {
              const { concept, encounter } = await fetchOrderData(order);

              if (concept && encounter) {
                const conceptData = concept.data;
                const encounterData = encounter.data;

                const testResultObs = encounterData?.obs?.find((obs) => obs.concept.uuid === conceptData.uuid);

                if (conceptData.setMembers.length > 0) {
                  return conceptData.setMembers.filter(
                    (memberConcept: { uuid: string }) =>
                      !testResultObs?.groupMembers?.find((obs) => obs.concept.uuid === memberConcept.uuid),
                  ).length;
                } else if (conceptData.setMembers.length === 0 && !testResultObs?.value['display']) {
                  return 1;
                }
              }
            }
            return 0;
          }),
        );

        // Sum up all the counts
        const totalPendingCount = pendingCounts.reduce((total, count) => total + count, 0);
        setCountPending(totalPendingCount);
      } catch (error) {
        console.error('Error fetching order data:', error);
        setCountPending(0);
      } finally {
        setIsLoading(false);
      }
    };

    countPendingOrders();
  }, [orders]);

  return { count: countPending, isLoading };
}
