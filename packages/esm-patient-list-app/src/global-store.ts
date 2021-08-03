import { createGlobalStore, getGlobalStore } from '@openmrs/esm-framework';

/**
 * Data passed to `onPatientAdded` handlers in the global offline patient list handlers store.
 */
interface OnPatientAddedData {
  /**
   * The UUID of the user to whose offline patient list the patient was added.
   */
  userUuid: string;
  /**
   * The UUID of the patient that was just added to the user's offline patient list.
   */
  patientUuid: string;
}

/**
 * Defines the handler function which is invoked when a patient is added to a user's
 * offline patient list.
 */
type OnPatientAddedHandler = (data: OnPatientAddedData) => void;

/**
 * The shape of the global offline patient list handlers store.
 */
interface OfflinePatientListHandlersState {
  /**
   * The registered handlers which are invoked when a patient is added to a user's offline patient list.
   */
  onPatientAdded: Array<OnPatientAddedHandler>;
}

const offlinePatientListHandlersStoreName = 'offline-patient-list-handlers';
const initialOfflinePatientListHandlerStoreState: OfflinePatientListHandlersState = {
  onPatientAdded: [],
};

/**
 * To be invoked during MF setup.
 * Creates the global offline patient list handlers store.
 */
export function setupOfflinePatientListHandlersStore() {
  createGlobalStore(offlinePatientListHandlersStoreName, initialOfflinePatientListHandlerStoreState);
}

function getOfflinePatientListHandlersStore() {
  return getGlobalStore(offlinePatientListHandlersStoreName, initialOfflinePatientListHandlerStoreState);
}

/**
 *
 * @param data Notification data about the patient that was just added to the user's offline patient list.
 */
export function notifyOnPatientAdded(data: OnPatientAddedData) {
  for (const handler of getOfflinePatientListHandlersStore().getState().onPatientAdded) {
    handler(data);
  }
}

/**
 * Registers the given `onPatientAdded` handler in the global offline patient list handlers store.
 * @param handler The `onPatientAdded` handler to be registered.
 */
export function registerOnPatientAddedHandler(handler: OnPatientAddedHandler) {
  const store = getOfflinePatientListHandlersStore();
  const state = store.getState();
  store.setState({
    onPatientAdded: [...state.onPatientAdded, handler],
  });
}
