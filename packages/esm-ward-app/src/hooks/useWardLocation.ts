import { type Location, useLocations, useSession } from '@openmrs/esm-framework';
import { useParams } from 'react-router-dom';
import useLocation from './useLocation';

export default function useWardLocation(): {
  location: Location;
  isLoadingLocation: boolean;
  errorFetchingLocation: Error;
  invalidLocation: boolean;
} {
  const { locationUuid: locationUuidFromUrl } = useParams();
  const { sessionLocation } = useSession();
  const {
    data: locationResponse,
    isLoading: isLoadingLocation,
    error: errorFetchingLocation,
  } = useLocation(locationUuidFromUrl ? locationUuidFromUrl : null);
  const invalidLocation = locationUuidFromUrl && errorFetchingLocation;

  return {
    location: locationUuidFromUrl ? locationResponse?.data : sessionLocation,
    isLoadingLocation,
    errorFetchingLocation,
    invalidLocation,
  };
}
