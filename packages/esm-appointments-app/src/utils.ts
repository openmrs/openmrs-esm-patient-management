import { LayoutType } from '@openmrs/esm-framework';

export function isDesktop(layout: LayoutType) {
  return layout === 'desktop';
}
