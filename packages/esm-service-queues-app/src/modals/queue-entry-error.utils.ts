import { DUPLICATE_QUEUE_ENTRY_ERROR_CODE, QUEUE_ENTRY_ALREADY_ENDED_ERROR } from '../constants';

export function getErrorMessage(error: unknown): string {
  const err = error as {
    responseBody?: {
      error?: {
        rawMessage?: string;
        translatedMessage?: string;
        message?: string;
      };
    };
    message?: string;
  };

  const message =
    err?.responseBody?.error?.rawMessage ||
    err?.responseBody?.error?.translatedMessage ||
    err?.responseBody?.error?.message ||
    err?.message ||
    '';

  // The cast above describes the shape the REST API documents, not one anything guarantees: a
  // rejected promise carries whatever it was rejected with. Callers put this straight into a
  // snackbar subtitle, where a non-string is a React render crash, and call `.includes()` on it.
  return typeof message === 'string' ? message : '';
}

// Note: Detection relies on matching a substring from the backend's IllegalStateException
// message ("Cannot transition a queue entry that has already ended") because the REST
// response does not include a structured error code for this case — unlike duplicate
// entry errors which use a bracketed code. If the backend message changes, this will
// silently fall through to the generic error handler, which is an acceptable degradation.
// See: https://github.com/openmrs/openmrs-module-queue/blob/1a82392a444d/api/src/main/java/org/openmrs/module/queue/api/impl/QueueEntryServiceImpl.java#L117
export function isAlreadyEndedQueueEntryError(error: unknown): boolean {
  return getErrorMessage(error).includes(QUEUE_ENTRY_ALREADY_ENDED_ERROR);
}

export function isDuplicateQueueEntryError(error: unknown): boolean {
  return getErrorMessage(error).includes(DUPLICATE_QUEUE_ENTRY_ERROR_CODE);
}
