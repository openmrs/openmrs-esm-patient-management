import { type Location, useSession } from '@openmrs/esm-framework';
import { useParams } from 'react-router-dom';
import useLocation from './useLocation';

const locationRepWithTags = 'custom:(display,uuid,tags:(uuid,display,name))';

export default function useWardLocation(): {
  location: Location;
  isLoadingLocation: boolean;
  errorFetchingLocation: Error | undefined;
  invalidLocation: boolean;
} {
  const { locationUuid: locationUuidFromUrl } = useParams();
  const { sessionLocation } = useSession();
  const locationUuid = locationUuidFromUrl ?? sessionLocation?.uuid;
  const {
    data: locationResponse,
    isLoading: isLoadingLocation,
    error: errorFetchingLocation,
  } = useLocation(locationUuid ?? null, locationRepWithTags);
  const invalidLocation = locationUuidFromUrl && errorFetchingLocation;

  return {
    location: locationResponse?.data,
    isLoadingLocation,
    errorFetchingLocation,
    invalidLocation,
  };
}
