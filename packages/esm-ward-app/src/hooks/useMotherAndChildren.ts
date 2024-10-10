import { makeUrl, restBaseUrl, useOpenmrsFetchAll } from '@openmrs/esm-framework';
import { type MotherAndChild } from '../types';

export interface MothersAndChildrenSearchCriteria {
  mothers?: Array<string>;
  children?: Array<string>;
  requireMotherHasActiveVisit?: boolean;
  requireChildHasActiveVisit?: boolean;
  requireChildBornDuringMothersActiveVisit?: boolean;
}

export function useMotherAndChildren(
  criteria: MothersAndChildrenSearchCriteria,
  fetch: boolean = true,
  rep: string = null,
) {
  const url = makeUrlUrl(`${restBaseUrl}/emrapi/maternal/mothersAndChildren`);
  const {
    mothers,
    children,
    requireChildBornDuringMothersActiveVisit,
    requireChildHasActiveVisit,
    requireMotherHasActiveVisit,
  } = criteria;

  for (const m of mothers ?? []) {
    url.searchParams.append('mother', m);
  }

  for (const c of children ?? []) {
    url.searchParams.append('child', c);
  }

  url.searchParams.append('requireMotherHasActiveVisit', requireMotherHasActiveVisit?.toString() ?? 'false');
  url.searchParams.append('requireChildHasActiveVisit', requireChildHasActiveVisit?.toString() ?? 'false');
  url.searchParams.append(
    'requireChildBornDuringMothersActiveVisit',
    requireChildBornDuringMothersActiveVisit?.toString() ?? 'false',
  );
  rep && url.searchParams.append('v', rep);
  return useOpenmrsFetchAll<MotherAndChild>(fetch ? url : null);
}

function makeUrlUrl(path: string) {
  return new URL(makeUrl(path), window.location.toString());
}
